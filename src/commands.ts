import { App, Notice, TFile, getAllTags, normalizePath } from "obsidian";
import type A4pImagePlugin from "./main";
import type { ManifestEntry } from "./types";
import { isImageExt } from "./filename";
import { UnusedInput, buildReportMarkdown, classifyUnused, hasReportTag } from "./unused";
import { TrashCandidate, TrashSelectModal } from "./trash-modal";

export async function runRetryCommand(plugin: A4pImagePlugin): Promise<void> {
  if (!plugin.r2.isConfigured()) {
    new Notice("R2 설정이 완료되지 않았습니다. 설정에서 R2 정보를 먼저 입력하세요.");
    return;
  }
  const result = await plugin.uploader.retryPending();
  if (result.retried === 0) {
    new Notice("재시도할 실패·대기 업로드가 없습니다.");
    return;
  }
  let msg = `재시도 완료 — 성공 ${result.succeeded}/${result.retried}`;
  if (result.failed.length > 0) {
    msg += `, 실패 ${result.failed.length}건 (콘솔 참고)`;
    console.error("[a4p-image] 재시도 실패:\n" + result.failed.join("\n"));
  }
  new Notice(msg, 8000);
}

/**
 * 미사용 리포트 노트인가 — 리포트는 이미지 위키링크·URL을 포함하므로
 * 사용처 스캔에서 제외하지 않으면 모든 미사용 이미지가 "사용 중"으로 오판된다 (자기참조).
 */
export function isReportNote(app: App, path: string): boolean {
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof TFile)) return false;
  const cache = app.metadataCache.getFileCache(file);
  return !!cache && hasReportTag(getAllTags(cache));
}

/** 이 이미지를 사용 중인 노트 검색 — 위키링크(로컬 백업) + 클라우드 URL 본문 검색 */
export async function findImageUsages(app: App, entry: ManifestEntry): Promise<string[]> {
  const usages = new Set<string>();
  if (entry.localPath) {
    for (const [mdPath, links] of Object.entries(app.metadataCache.resolvedLinks)) {
      if (links[entry.localPath] && !isReportNote(app, mdPath)) usages.add(mdPath);
    }
  }
  if (entry.url) {
    for (const md of app.vault.getMarkdownFiles()) {
      if (usages.has(md.path) || isReportNote(app, md.path)) continue;
      const content = await app.vault.cachedRead(md);
      if (content.includes(entry.url)) usages.add(md.path);
    }
  }
  return [...usages];
}

/** 캔버스(.canvas) JSON에서 참조하는 파일 경로 수집 — resolvedLinks에 안 잡히는 사용처 보호 */
async function collectCanvasTargets(app: App): Promise<Set<string>> {
  const targets = new Set<string>();
  const canvases = app.vault.getFiles().filter((f) => f.extension === "canvas");
  for (const canvas of canvases) {
    try {
      const data = JSON.parse(await app.vault.cachedRead(canvas)) as {
        nodes?: Array<{ type?: string; file?: string }>;
      };
      for (const node of data.nodes ?? []) {
        if (node.file) targets.add(node.file);
      }
    } catch {
      // 파싱 실패한 캔버스는 건너뜀 — 보호가 줄어들 뿐 삭제는 어차피 사용자 선택·승인 후
    }
  }
  return targets;
}

/** 미사용 판정 입력 수집 — 볼트 이미지·첨부, 위키링크(+캔버스) 참조 집합, md 본문에 살아 있는 URL 집합 */
export async function collectUnusedInput(plugin: A4pImagePlugin): Promise<UnusedInput> {
  const { app } = plugin;
  const entries = plugin.manifestStore.all();

  const images = app.vault
    .getFiles()
    .filter((f) => isImageExt(f.extension, plugin.settings.imageExtensions))
    .map((f) => ({ path: f.path, size: f.stat.size }));

  const attachmentExts = plugin.settings.includeAttachments
    ? plugin.settings.attachmentExtensions.map((e) => e.toLowerCase())
    : [];
  const attachments = app.vault
    .getFiles()
    .filter(
      (f) =>
        attachmentExts.includes(f.extension.toLowerCase()) &&
        !isImageExt(f.extension, plugin.settings.imageExtensions),
    )
    .map((f) => ({ path: f.path, size: f.stat.size }));

  const resolvedTargets = new Set<string>();
  for (const [mdPath, links] of Object.entries(app.metadataCache.resolvedLinks)) {
    if (isReportNote(app, mdPath)) continue; // 리포트 자신은 사용처가 아님
    for (const target of Object.keys(links)) resolvedTargets.add(target);
  }
  for (const target of await collectCanvasTargets(app)) resolvedTargets.add(target);

  const urlsInVault = new Set<string>();
  const urls = entries.map((e) => e.url).filter(Boolean);
  if (urls.length > 0) {
    const base = plugin.settings.r2.publicBaseUrl.replace(/\/+$/g, "");
    const mdFiles = app.vault.getMarkdownFiles();
    for (const md of mdFiles) {
      if (isReportNote(app, md.path)) continue; // 리포트 자신은 사용처가 아님
      const content = await app.vault.cachedRead(md);
      if (base && !content.includes(base)) continue; // 빠른 사전 필터
      for (const url of urls) {
        if (!urlsInVault.has(url) && content.includes(url)) urlsInVault.add(url);
      }
    }
  }

  return { images, attachments, resolvedTargets, entries, urlsInVault };
}

export async function runUnusedReportCommand(plugin: A4pImagePlugin): Promise<void> {
  const notice = new Notice("미사용 이미지를 분석하는 중…", 0);
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    const markdown = buildReportMarkdown(report, new Date());

    const folder = plugin.settings.reportFolder.trim();
    if (folder && !plugin.app.vault.getAbstractFileByPath(normalizePath(folder))) {
      await plugin.app.vault.createFolder(normalizePath(folder));
    }
    const stamp = new Date();
    const name = `미사용 이미지·첨부 리포트 ${stamp.toISOString().slice(0, 10)} ${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const path = normalizePath(folder ? `${folder}/${name}.md` : `${name}.md`);
    const file = await plugin.app.vault.create(path, markdown);

    notice.hide();
    const total =
      report.fullyUnused.length +
      report.orphanedBackups.length +
      report.cloudOrphans.length +
      report.unusedAttachments.length;
    new Notice(`리포트 생성 완료 — 미사용 후보 ${total}개 (${path})`, 8000);
    await plugin.app.workspace.getLeaf(false).openFile(file as TFile);
  } catch (e) {
    notice.hide();
    new Notice(`리포트 생성 실패: ${e instanceof Error ? e.message : String(e)}`, 8000);
  }
}

export async function runTrashUnusedCommand(plugin: A4pImagePlugin): Promise<void> {
  const notice = new Notice("미사용 이미지를 분석하는 중…", 0);
  let candidates: TrashCandidate[];
  let skippedCloudOrphans = 0;
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    const r2Ok = plugin.r2.isConfigured();
    candidates = [
      ...report.fullyUnused.map((img) => ({
        entry: null,
        path: img.path,
        size: img.size,
        reason: "완전 미사용 — 로컬만 휴지통 이동",
        kind: "fully-unused" as const,
      })),
      ...report.orphanedBackups
        .filter((e) => e.localPath)
        .map((e) => ({
          entry: e,
          path: e.localPath!,
          size: e.size,
          reason:
            r2Ok && e.status === "uploaded"
              ? "URL이 노트에서 사라진 백업 — 로컬 이동 + 서버 영구 삭제"
              : "URL이 노트에서 사라진 백업 — 로컬만 이동",
          kind: "orphaned-backup" as const,
        })),
      // R2에만 남은 고아 객체 — R2 설정이 있어야 삭제 가능
      ...(r2Ok
        ? report.cloudOrphans.map((e) => ({
            entry: e,
            path: e.r2Key,
            size: e.size,
            reason: "서버에만 남은 고아 객체 — R2에서 영구 삭제",
            kind: "cloud-orphan" as const,
          }))
        : []),
      // 이미지 외 첨부 — 항상 로컬 .trash/ 이동만 (서버·매니페스트와 무관)
      ...report.unusedAttachments.map((a) => ({
        entry: null,
        path: a.path,
        size: a.size,
        reason: "노트에 연결되지 않은 첨부 — 로컬만 휴지통 이동",
        kind: "unused-attachment" as const,
      })),
    ];
    if (!r2Ok) skippedCloudOrphans = report.cloudOrphans.length;
  } finally {
    notice.hide();
  }
  if (skippedCloudOrphans > 0) {
    new Notice(`R2 설정이 없어 서버 고아 객체 ${skippedCloudOrphans}개는 목록에서 제외했습니다.`, 8000);
  }
  if (candidates.length === 0) {
    new Notice("미사용 이미지·첨부 파일이 없습니다.");
    return;
  }
  new TrashSelectModal(plugin.app, plugin, candidates).open();
}

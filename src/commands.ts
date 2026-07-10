import { Notice, TFile, normalizePath } from "obsidian";
import type A4pImagePlugin from "./main";
import { isImageExt } from "./filename";
import { UnusedInput, buildReportMarkdown, classifyUnused } from "./unused";
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

/** 미사용 판정 입력 수집 — 볼트 이미지, 위키링크 참조 집합, md 본문에 살아 있는 URL 집합 */
export async function collectUnusedInput(plugin: A4pImagePlugin): Promise<UnusedInput> {
  const { app } = plugin;
  const entries = plugin.manifestStore.all();

  const images = app.vault
    .getFiles()
    .filter((f) => isImageExt(f.extension, plugin.settings.imageExtensions))
    .map((f) => ({ path: f.path, size: f.stat.size }));

  const resolvedTargets = new Set<string>();
  for (const links of Object.values(app.metadataCache.resolvedLinks)) {
    for (const target of Object.keys(links)) resolvedTargets.add(target);
  }

  const urlsInVault = new Set<string>();
  const urls = entries.map((e) => e.url).filter(Boolean);
  if (urls.length > 0) {
    const base = plugin.settings.r2.publicBaseUrl.replace(/\/+$/g, "");
    const mdFiles = app.vault.getMarkdownFiles();
    for (const md of mdFiles) {
      const content = await app.vault.cachedRead(md);
      if (base && !content.includes(base)) continue; // 빠른 사전 필터
      for (const url of urls) {
        if (!urlsInVault.has(url) && content.includes(url)) urlsInVault.add(url);
      }
    }
  }

  return { images, resolvedTargets, entries, urlsInVault };
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
    const name = `미사용 이미지 리포트 ${stamp.toISOString().slice(0, 10)} ${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const path = normalizePath(folder ? `${folder}/${name}.md` : `${name}.md`);
    const file = await plugin.app.vault.create(path, markdown);

    notice.hide();
    const total = report.fullyUnused.length + report.orphanedBackups.length + report.cloudOrphans.length;
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
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    candidates = [
      ...report.fullyUnused.map((img) => ({
        path: img.path,
        size: img.size,
        reason: "완전 미사용",
      })),
      ...report.orphanedBackups
        .filter((e) => e.localPath)
        .map((e) => ({
          path: e.localPath!,
          size: e.size,
          reason: "URL이 노트에서 사라진 백업 (클라우드에는 유지됨)",
        })),
    ];
  } finally {
    notice.hide();
  }
  if (candidates.length === 0) {
    new Notice("미사용 이미지가 없습니다.");
    return;
  }
  new TrashSelectModal(plugin.app, plugin, candidates).open();
}

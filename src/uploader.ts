import { Notice, TFile, TFolder, normalizePath } from "obsidian";
import type A4pImagePlugin from "./main";
import type { EntryOrigin, ManifestEntry, UploadOutcome } from "./types";
import {
  extForMime,
  extOf,
  makeImageBaseName,
  makeNamedBaseName,
  makeR2Key,
  mimeForExt,
  nextNoteImageName,
  randSuffix,
  stemOf,
} from "./filename";
import { sha256Hex } from "./r2/sigv4";
import { compressImage } from "./compress";

export interface ProcessInput {
  /** 원본 파일명 (drop/eagle 등 이름이 있을 때) — 없으면 타임스탬프 이름 생성 */
  name?: string;
  mime: string;
  /** 삽입 대상 노트 경로 (첨부 위치 결정·재시도 치환용) */
  sourceNotePath: string | null;
  origin: EntryOrigin;
}

/**
 * 단일 업로드 파이프라인: 로컬 저장(항상 먼저 — 유실 0) → R2 업로드 → 매니페스트 기록.
 * paste/drop/일괄 변환/Eagle 삽입이 전부 이 클래스를 경유한다.
 */
export class Uploader {
  /** 업로드 성공 직후 호출되는 훅 (Eagle 등록 등 부가 기능 — 실패해도 결과에 영향 없음) */
  onUploaded: ((entry: ManifestEntry) => void | Promise<void>) | null = null;

  constructor(private plugin: A4pImagePlugin) {}

  /** 새 바이너리(클립보드·드롭·Eagle 복사) 처리 */
  async process(buf: ArrayBuffer, input: ProcessInput): Promise<UploadOutcome> {
    const { manifestStore } = this.plugin;
    const hash = await sha256Hex(buf);

    const existing = manifestStore.byHash(hash);
    if (existing && existing.status === "uploaded") {
      return { ok: true, url: existing.url, stem: stemOf(fileNameOf(existing)), entryId: existing.id, reused: true };
    }

    // 압축·재인코딩 (EXIF 제거 포함) — 실패 시 원본 사용. hash는 원본 기준이라 dedup은 설정과 무관.
    let workBuf = buf;
    let workMime = input.mime;
    const cs = this.plugin.settings.compress;
    if (cs.enabled) {
      const compressed = await compressImage(buf, workMime, cs);
      if (compressed) {
        workBuf = compressed.buf;
        workMime = compressed.mime;
      }
    }

    const now = new Date();
    const extFromName = input.name ? extOf(input.name) : "";
    const ext = extForMime(workMime) ?? (extFromName || "png");

    let filename: string;
    if (input.name) {
      // drop/Eagle — 원본 이름 stem 보존
      filename = `${makeNamedBaseName(input.name, randSuffix())}.${ext}`;
    } else if (this.plugin.settings.namingScheme === "note" && input.sourceNotePath) {
      filename = await this.noteBasedFilename(input.sourceNotePath, ext);
    } else {
      filename = `${makeImageBaseName(now, randSuffix())}.${ext}`;
    }

    let localPath: string | null = null;
    if (this.plugin.settings.localBackup) {
      try {
        localPath = await this.saveToVault(filename, workBuf, input.sourceNotePath);
      } catch (e) {
        // 로컬 저장 실패는 업로드를 막지 않는다 — 클라우드로 계속 진행
        console.error("[a4p-image] 로컬 백업 저장 실패", e);
        new Notice(`이미지 로컬 백업 저장 실패: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // 로컬 저장 시 충돌 회피로 이름이 바뀌었을 수 있음 — 실제 저장된 이름을 R2 키에도 사용
    const finalName = localPath ? (localPath.split("/").pop() ?? filename) : filename;

    const entry: ManifestEntry = {
      id: `${stemOf(finalName)}-${randSuffix()}`,
      localPath,
      r2Key: makeR2Key(this.plugin.settings.r2.keyPrefix, now, finalName),
      url: "",
      hash,
      size: workBuf.byteLength,
      mime: workMime || mimeForExt(ext),
      createdAt: now.getTime(),
      uploadedAt: null,
      status: "pending",
      sourceNote: input.sourceNotePath,
      origin: input.origin,
      eagleId: null,
    };
    entry.url = this.plugin.r2.publicUrl(entry.r2Key);
    manifestStore.add(entry);

    return this.uploadEntry(entry, workBuf);
  }

  /** 볼트에 이미 존재하는 이미지 파일(일괄 변환) 처리 — 파일이 그대로 로컬 백업이 됨 */
  async processExisting(file: TFile, origin: EntryOrigin = "convert"): Promise<UploadOutcome> {
    const { manifestStore } = this.plugin;
    const buf = await this.plugin.app.vault.readBinary(file);
    const hash = await sha256Hex(buf);

    const existing = manifestStore.byHash(hash);
    if (existing && existing.status === "uploaded") {
      return { ok: true, url: existing.url, stem: stemOf(file.name), entryId: existing.id, reused: true };
    }

    const registered = manifestStore.byLocalPath(file.path);
    const now = new Date();
    let entry: ManifestEntry;
    if (registered && registered.status !== "uploaded") {
      entry = registered;
    } else {
      entry = {
        id: `${stemOf(file.name)}-${randSuffix()}`,
        localPath: file.path,
        r2Key: makeR2Key(this.plugin.settings.r2.keyPrefix, now, file.name),
        url: "",
        hash,
        size: buf.byteLength,
        mime: mimeForExt(file.extension),
        createdAt: now.getTime(),
        uploadedAt: null,
        status: "pending",
        sourceNote: null,
        origin,
        eagleId: null,
      };
      entry.url = this.plugin.r2.publicUrl(entry.r2Key);
      manifestStore.add(entry);
    }

    return this.uploadEntry(entry, buf);
  }

  private async uploadEntry(entry: ManifestEntry, buf: ArrayBuffer): Promise<UploadOutcome> {
    const { manifestStore } = this.plugin;
    try {
      await this.plugin.r2.putObject(entry.r2Key, buf, entry.mime);
      manifestStore.update(entry.id, { status: "uploaded", uploadedAt: Date.now() });
      if (this.onUploaded) {
        try {
          await this.onUploaded(manifestStore.get(entry.id) ?? entry);
        } catch (e) {
          console.error("[a4p-image] onUploaded 훅 실패", e);
        }
      }
      return { ok: true, url: entry.url, stem: stemOf(fileNameOf(entry)), entryId: entry.id, reused: false };
    } catch (e) {
      manifestStore.update(entry.id, { status: "failed" });
      return {
        ok: false,
        localPath: entry.localPath,
        entryId: entry.id,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  /** `{노트제목}_{n}.{ext}` — 대상 첨부 폴더를 스캔해 최대 번호 +1 */
  private async noteBasedFilename(sourceNotePath: string, ext: string): Promise<string> {
    const noteName = sourceNotePath.split("/").pop() ?? sourceNotePath;
    const title = noteName.replace(/\.md$/i, "");
    const folderPath = await this.attachmentFolderFor(`probe.${ext}`, sourceNotePath);

    const { vault } = this.plugin.app;
    const folder = folderPath ? vault.getAbstractFileByPath(folderPath) : vault.getRoot();
    const existingNames: string[] = [];
    if (folder instanceof TFolder) {
      for (const child of folder.children) {
        if (child instanceof TFile) existingNames.push(child.name);
      }
    }
    return nextNoteImageName(title, existingNames, ext);
  }

  /** 이미지가 저장될 첨부 폴더 경로 — 오버라이드 설정 우선, 없으면 볼트 첨부 설정 */
  private async attachmentFolderFor(sampleName: string, sourceNotePath: string | null): Promise<string> {
    const override = this.plugin.settings.attachmentSubfolder;
    if (override) return normalizePath(override);
    const probe = await this.plugin.app.fileManager.getAvailablePathForAttachment(sampleName, sourceNotePath ?? "");
    const i = probe.lastIndexOf("/");
    return i >= 0 ? probe.slice(0, i) : "";
  }

  private async saveToVault(filename: string, buf: ArrayBuffer, sourceNotePath: string | null): Promise<string> {
    const { app } = this.plugin;
    const override = this.plugin.settings.attachmentSubfolder;
    let path: string;
    if (override) {
      const folder = normalizePath(override);
      if (!app.vault.getAbstractFileByPath(folder)) {
        await app.vault.createFolder(folder);
      }
      path = await uniqueBinaryPath(this.plugin, `${folder}/${filename}`);
    } else {
      path = await app.fileManager.getAvailablePathForAttachment(filename, sourceNotePath ?? "");
    }
    await app.vault.createBinary(path, buf);
    return path;
  }

  /** pending/failed 항목 재업로드 + 노트의 로컬 임베드를 URL로 치환 */
  async retryPending(): Promise<{ retried: number; succeeded: number; failed: string[] }> {
    const { manifestStore, app } = this.plugin;
    const targets = manifestStore.all().filter((e) => e.status !== "uploaded");
    const failed: string[] = [];
    let succeeded = 0;

    if (targets.length === 0) return { retried: 0, succeeded: 0, failed };

    const notice = new Notice(`업로드 재시도 중… 0/${targets.length}`, 0);
    try {
      let done = 0;
      for (const entry of targets) {
        done++;
        notice.setMessage(`업로드 재시도 중… ${done}/${targets.length}`);
        if (!entry.localPath) {
          failed.push(`${entry.id}: 로컬 파일이 없어 재시도할 수 없습니다.`);
          continue;
        }
        const file = app.vault.getAbstractFileByPath(entry.localPath);
        if (!(file instanceof TFile)) {
          failed.push(`${entry.id}: 로컬 파일(${entry.localPath})을 찾을 수 없습니다.`);
          continue;
        }
        const buf = await app.vault.readBinary(file);
        const outcome = await this.uploadEntry(entry, buf);
        if (outcome.ok) {
          succeeded++;
          await this.replaceLocalEmbedsWithUrl(manifestStore.get(entry.id) ?? entry);
        } else {
          failed.push(`${entry.id}: ${outcome.error}`);
        }
      }
    } finally {
      notice.hide();
    }
    return { retried: targets.length, succeeded, failed };
  }

  /** 이 entry의 로컬 파일을 가리키는 모든 임베드를 클라우드 URL로 치환 */
  async replaceLocalEmbedsWithUrl(entry: ManifestEntry): Promise<number> {
    const { app } = this.plugin;
    if (!entry.localPath || !entry.url) return 0;
    const localPath = entry.localPath;
    const stem = stemOf(fileNameOf(entry));

    // sourceNote를 먼저, 그다음 resolvedLinks로 참조하는 모든 노트
    const notePaths = new Set<string>();
    if (entry.sourceNote) notePaths.add(entry.sourceNote);
    const resolved = app.metadataCache.resolvedLinks;
    for (const [mdPath, links] of Object.entries(resolved)) {
      if (links[localPath]) notePaths.add(mdPath);
    }

    let replacedCount = 0;
    for (const mdPath of notePaths) {
      const md = app.vault.getAbstractFileByPath(mdPath);
      if (!(md instanceof TFile)) continue;
      const cache = app.metadataCache.getFileCache(md);
      const embeds = cache?.embeds ?? [];
      const originals: string[] = [];
      for (const embed of embeds) {
        const dest = app.metadataCache.getFirstLinkpathDest(embed.link, mdPath);
        if (dest?.path === localPath) originals.push(embed.original);
      }
      if (originals.length === 0) continue;
      await app.vault.process(md, (content) => {
        let next = content;
        for (const original of originals) {
          if (next.includes(original)) {
            next = next.split(original).join(`![${stem}](${entry.url})`);
            replacedCount++;
          }
        }
        return next;
      });
    }
    return replacedCount;
  }
}

function fileNameOf(entry: ManifestEntry): string {
  if (entry.localPath) {
    const i = entry.localPath.lastIndexOf("/");
    return i >= 0 ? entry.localPath.slice(i + 1) : entry.localPath;
  }
  const i = entry.r2Key.lastIndexOf("/");
  return i >= 0 ? entry.r2Key.slice(i + 1) : entry.r2Key;
}

async function uniqueBinaryPath(plugin: A4pImagePlugin, basePath: string): Promise<string> {
  const { app } = plugin;
  const normalized = normalizePath(basePath);
  if (!app.vault.getAbstractFileByPath(normalized)) return normalized;
  const dot = normalized.lastIndexOf(".");
  const stem = dot > 0 ? normalized.slice(0, dot) : normalized;
  const ext = dot > 0 ? normalized.slice(dot) : "";
  for (let i = 2; i < 100; i++) {
    const cand = `${stem} (${i})${ext}`;
    if (!app.vault.getAbstractFileByPath(cand)) return cand;
  }
  throw new Error("동일 파일명으로 중복이 너무 많습니다.");
}

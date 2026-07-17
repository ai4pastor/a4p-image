/**
 * 업로드 인덱스(매니페스트) 저장소. data.json(설정)과 분리된 index.json에 기록한다.
 * obsidian 의존 없이 IO 인터페이스만 받아 vitest로 직접 테스트 가능.
 * vault rename/delete 이벤트는 main.ts가 handleRename/handleDelete로 연결한다.
 */
import type { ManifestData, ManifestEntry } from "./types";

export interface ManifestIO {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
}

const SAVE_DEBOUNCE_MS = 500;

export class ManifestStore {
  private data: ManifestData = { version: 1, entries: {} };
  private hashIndex = new Map<string, string>();
  private localPathIndex = new Map<string, string>();
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private dirty = false;

  constructor(private io: ManifestIO) {}

  async load(): Promise<void> {
    let raw: string | null = null;
    try {
      raw = await this.io.read();
    } catch {
      raw = null;
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<ManifestData>;
        if (parsed && typeof parsed === "object" && parsed.entries) {
          this.data = { version: 1, entries: parsed.entries as Record<string, ManifestEntry> };
        }
      } catch {
        // 손상된 매니페스트 — 초기화하되 기존 파일은 저장 시점에 덮어씀
        this.data = { version: 1, entries: {} };
      }
    }
    this.rebuildIndexes();
  }

  private rebuildIndexes(): void {
    this.hashIndex.clear();
    this.localPathIndex.clear();
    for (const entry of Object.values(this.data.entries)) {
      if (entry.hash) this.hashIndex.set(entry.hash, entry.id);
      if (entry.localPath) this.localPathIndex.set(entry.localPath, entry.id);
    }
  }

  all(): ManifestEntry[] {
    return Object.values(this.data.entries);
  }

  get(id: string): ManifestEntry | null {
    return this.data.entries[id] ?? null;
  }

  byHash(hash: string): ManifestEntry | null {
    const id = this.hashIndex.get(hash);
    return id ? this.data.entries[id] ?? null : null;
  }

  byLocalPath(path: string): ManifestEntry | null {
    const id = this.localPathIndex.get(path);
    return id ? this.data.entries[id] ?? null : null;
  }

  byUrl(url: string): ManifestEntry | null {
    for (const entry of Object.values(this.data.entries)) {
      if (entry.url === url) return entry;
    }
    return null;
  }

  add(entry: ManifestEntry): void {
    this.data.entries[entry.id] = entry;
    if (entry.hash) this.hashIndex.set(entry.hash, entry.id);
    if (entry.localPath) this.localPathIndex.set(entry.localPath, entry.id);
    this.scheduleSave();
  }

  update(id: string, patch: Partial<ManifestEntry>): void {
    const entry = this.data.entries[id];
    if (!entry) return;
    if (patch.localPath !== undefined && entry.localPath) {
      this.localPathIndex.delete(entry.localPath);
    }
    Object.assign(entry, patch);
    if (entry.localPath) this.localPathIndex.set(entry.localPath, entry.id);
    if (entry.hash) this.hashIndex.set(entry.hash, entry.id);
    this.scheduleSave();
  }

  /** 엔트리 완전 제거 — 삭제 흐름(R2 삭제 + 로컬 휴지통 이동) 완료 후에만 호출 */
  remove(id: string): void {
    const entry = this.data.entries[id];
    if (!entry) return;
    delete this.data.entries[id];
    if (entry.hash && this.hashIndex.get(entry.hash) === id) this.hashIndex.delete(entry.hash);
    if (entry.localPath && this.localPathIndex.get(entry.localPath) === id) {
      this.localPathIndex.delete(entry.localPath);
    }
    this.scheduleSave();
  }

  /** vault rename 이벤트 → 로컬 백업 경로 추적 (paste-image-rename 등 외부 rename 방어) */
  handleRename(oldPath: string, newPath: string): void {
    const entry = this.byLocalPath(oldPath);
    if (!entry) return;
    this.update(entry.id, { localPath: newPath });
  }

  /** vault delete 이벤트 → 로컬 백업 소실 표기 (entry 자체는 보존 — 클라우드에 남아 있음) */
  handleDelete(path: string): void {
    const entry = this.byLocalPath(path);
    if (!entry) return;
    this.update(entry.id, { localPath: null });
  }

  private scheduleSave(): void {
    this.dirty = true;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      void this.flush();
    }, SAVE_DEBOUNCE_MS);
  }

  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (!this.dirty) return;
    this.dirty = false;
    try {
      await this.io.write(JSON.stringify(this.data, null, 2));
    } catch {
      this.dirty = true; // 다음 변경 때 재시도
    }
  }
}

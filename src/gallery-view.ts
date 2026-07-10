import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import type A4pImagePlugin from "./main";
import type { EntryStatus, ManifestEntry } from "./types";
import { formatBytes } from "./convert";
import { stemOf } from "./filename";

export const VIEW_TYPE_A4P_IMAGE_GALLERY = "a4p-image-gallery-view";

const DEBOUNCE_MS = 150;

export class GalleryView extends ItemView {
  private plugin: A4pImagePlugin;
  private gridEl: HTMLDivElement | null = null;
  private countEl: HTMLSpanElement | null = null;
  private query = "";
  private statusFilter: "all" | EntryStatus = "all";
  private debounceTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: A4pImagePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_A4P_IMAGE_GALLERY;
  }

  getDisplayText(): string {
    return "A4P 이미지 갤러리";
  }

  getIcon(): string {
    return "image";
  }

  async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();

    const toolbar = root.createDiv({ cls: "a4p-image-gallery-toolbar" });
    const input = toolbar.createEl("input", { type: "text", placeholder: "파일명·노트 검색" });
    input.addEventListener("input", () => {
      if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        this.query = input.value.trim().toLowerCase();
        this.renderGrid();
      }, DEBOUNCE_MS);
    });

    const statusSelect = toolbar.createEl("select");
    for (const [value, label] of [
      ["all", "전체"],
      ["uploaded", "업로드됨"],
      ["pending", "대기"],
      ["failed", "실패"],
    ] as const) {
      const opt = statusSelect.createEl("option", { text: label });
      opt.value = value;
    }
    statusSelect.addEventListener("change", () => {
      this.statusFilter = statusSelect.value as "all" | EntryStatus;
      this.renderGrid();
    });

    const refreshBtn = toolbar.createEl("button", { text: "새로고침" });
    refreshBtn.addEventListener("click", () => this.renderGrid());

    this.countEl = toolbar.createSpan({ cls: "a4p-image-gallery-count" });
    this.gridEl = root.createDiv({ cls: "a4p-image-gallery-grid" });
    this.renderGrid();
  }

  async onClose(): Promise<void> {
    if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
  }

  private entryName(entry: ManifestEntry): string {
    const path = entry.localPath ?? entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }

  private renderGrid(): void {
    if (!this.gridEl) return;
    this.gridEl.empty();

    let entries = this.plugin.manifestStore.all().sort((a, b) => b.createdAt - a.createdAt);
    if (this.statusFilter !== "all") entries = entries.filter((e) => e.status === this.statusFilter);
    if (this.query) {
      entries = entries.filter((e) => {
        const haystack = `${this.entryName(e)} ${e.sourceNote ?? ""}`.toLowerCase();
        return haystack.includes(this.query);
      });
    }

    this.countEl?.setText(`${entries.length}개`);
    if (entries.length === 0) {
      this.gridEl.createEl("p", { text: "표시할 이미지가 없습니다.", cls: "a4p-image-gallery-meta" });
      return;
    }

    for (const entry of entries) {
      this.renderCard(this.gridEl, entry);
    }
  }

  private renderCard(parent: HTMLElement, entry: ManifestEntry): void {
    const name = this.entryName(entry);
    const card = parent.createDiv({ cls: "a4p-image-gallery-card" });

    const img = card.createEl("img", { cls: "a4p-image-gallery-thumb" });
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;

    const meta = card.createDiv({ cls: "a4p-image-gallery-meta" });
    if (entry.status !== "uploaded") {
      meta.createSpan({ cls: `a4p-image-gallery-badge ${entry.status}`, text: entry.status === "failed" ? "실패" : "대기" });
    }
    meta.createSpan({ text: `${name} · ${formatBytes(entry.size)}` });
    meta.title = `${name}\n${entry.localPath ?? "(로컬 백업 없음)"}\n${entry.url}`;

    const actions = card.createDiv({ cls: "a4p-image-gallery-actions" });

    const copyBtn = actions.createEl("button", { text: "URL" });
    copyBtn.title = "클라우드 URL 복사";
    copyBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      void navigator.clipboard.writeText(entry.url);
      new Notice("URL을 복사했습니다.");
    });

    if (entry.sourceNote) {
      const noteBtn = actions.createEl("button", { text: "노트" });
      noteBtn.title = `원본 노트 열기: ${entry.sourceNote}`;
      noteBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        void this.app.workspace.openLinkText(entry.sourceNote!, "", false);
      });
    }

    card.addEventListener("click", () => this.insertEntry(entry));
  }

  private insertEntry(entry: ManifestEntry): void {
    const editor = this.app.workspace.activeEditor?.editor;
    if (!editor) {
      new Notice("이미지를 삽입할 활성 에디터가 없습니다. 노트를 먼저 여세요.");
      return;
    }
    if (entry.status !== "uploaded") {
      new Notice("아직 업로드되지 않은 이미지입니다. '실패한 업로드 재시도'를 먼저 실행하세요.");
      return;
    }
    editor.replaceSelection(`![${stemOf(this.entryName(entry))}](${entry.url})`);
  }
}

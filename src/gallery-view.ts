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
  private statsEl: HTMLDivElement | null = null;
  private query = "";
  private statusFilter: "all" | EntryStatus = "all";
  private dateFilter: "all" | "7" | "30" = "all";
  private groupByNote = false;
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

    const dateSelect = toolbar.createEl("select");
    for (const [value, label] of [
      ["all", "전체 기간"],
      ["7", "최근 7일"],
      ["30", "최근 30일"],
    ] as const) {
      const opt = dateSelect.createEl("option", { text: label });
      opt.value = value;
    }
    dateSelect.addEventListener("change", () => {
      this.dateFilter = dateSelect.value as "all" | "7" | "30";
      this.renderGrid();
    });

    const groupBtn = toolbar.createEl("button", { text: "노트별" });
    groupBtn.title = "노트별 그룹 보기 전환";
    groupBtn.addEventListener("click", () => {
      this.groupByNote = !this.groupByNote;
      groupBtn.toggleClass("mod-cta", this.groupByNote);
      this.renderGrid();
    });

    const refreshBtn = toolbar.createEl("button", { text: "새로고침" });
    refreshBtn.addEventListener("click", () => this.renderGrid());

    this.countEl = toolbar.createSpan({ cls: "a4p-image-gallery-count" });
    this.statsEl = root.createDiv({ cls: "a4p-image-gallery-stats" });
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

    const allEntries = this.plugin.manifestStore.all();
    let entries = [...allEntries].sort((a, b) => b.createdAt - a.createdAt);
    if (this.statusFilter !== "all") entries = entries.filter((e) => e.status === this.statusFilter);
    if (this.dateFilter !== "all") {
      const cutoff = Date.now() - parseInt(this.dateFilter, 10) * 24 * 60 * 60 * 1000;
      entries = entries.filter((e) => e.createdAt >= cutoff);
    }
    if (this.query) {
      entries = entries.filter((e) => {
        const haystack = `${this.entryName(e)} ${e.sourceNote ?? ""}`.toLowerCase();
        return haystack.includes(this.query);
      });
    }

    const filteredSize = entries.reduce((sum, e) => sum + e.size, 0);
    this.countEl?.setText(`${entries.length}개 · ${formatBytes(filteredSize)}`);

    // R2 사용량 추정 — 업로드 성공분의 합 (무료 계층 10GB 기준)
    const uploadedSize = allEntries.filter((e) => e.status === "uploaded").reduce((sum, e) => sum + e.size, 0);
    const pctOfFree = ((uploadedSize / (10 * 1024 * 1024 * 1024)) * 100).toFixed(2);
    this.statsEl?.setText(`R2 사용량 추정: ${formatBytes(uploadedSize)} (무료 10GB의 ${pctOfFree}%)`);

    if (entries.length === 0) {
      this.gridEl.createEl("p", { text: "표시할 이미지가 없습니다.", cls: "a4p-image-gallery-meta" });
      return;
    }

    if (this.groupByNote) {
      const groups = new Map<string, ManifestEntry[]>();
      for (const entry of entries) {
        const key = entry.sourceNote ?? "(노트 미지정)";
        const list = groups.get(key) ?? [];
        list.push(entry);
        groups.set(key, list);
      }
      for (const [note, groupEntries] of groups) {
        this.gridEl.createDiv({ cls: "a4p-image-gallery-group", text: `${note} (${groupEntries.length})` });
        const groupGrid = this.gridEl.createDiv({ cls: "a4p-image-gallery-grid-inner" });
        for (const entry of groupEntries) this.renderCard(groupGrid, entry);
      }
    } else {
      for (const entry of entries) {
        this.renderCard(this.gridEl, entry);
      }
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

    const usageBtn = actions.createEl("button", { text: "사용처" });
    usageBtn.title = "이 이미지를 사용 중인 노트 찾기 (볼트 전체 검색)";
    usageBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      usageBtn.disabled = true;
      void this.findUsages(entry).finally(() => {
        usageBtn.disabled = false;
      });
    });

    card.addEventListener("click", () => this.insertEntry(entry));
  }

  /** URL(클라우드 링크) + 위키링크(로컬 백업) 사용처를 볼트 전체에서 검색 */
  private async findUsages(entry: ManifestEntry): Promise<void> {
    const usages = new Set<string>();

    if (entry.localPath) {
      for (const [mdPath, links] of Object.entries(this.app.metadataCache.resolvedLinks)) {
        if (links[entry.localPath]) usages.add(mdPath);
      }
    }
    if (entry.url) {
      for (const md of this.app.vault.getMarkdownFiles()) {
        if (usages.has(md.path)) continue;
        const content = await this.app.vault.cachedRead(md);
        if (content.includes(entry.url)) usages.add(md.path);
      }
    }

    if (usages.size === 0) {
      new Notice("이 이미지를 사용하는 노트가 없습니다.");
      return;
    }
    const list = [...usages];
    const preview = list.slice(0, 5).join("\n");
    const more = list.length > 5 ? `\n외 ${list.length - 5}개` : "";
    new Notice(`사용 중인 노트 ${list.length}개:\n${preview}${more}`, 10000);
    if (list.length === 1) {
      void this.app.workspace.openLinkText(list[0], "", false);
    }
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

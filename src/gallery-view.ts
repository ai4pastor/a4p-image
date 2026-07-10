import { ItemView, Notice, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import type A4pImagePlugin from "./main";
import type { EntryStatus, ManifestEntry } from "./types";
import { formatBytes } from "./convert";
import { stemOf } from "./filename";
import { insertAtEditor } from "./insert";
import { ImagePreviewModal } from "./preview-modal";

export const VIEW_TYPE_A4P_IMAGE_GALLERY = "a4p-image-gallery-view";

const DEBOUNCE_MS = 150;

export class GalleryView extends ItemView {
  private plugin: A4pImagePlugin;
  private gridEl: HTMLDivElement | null = null;
  private statsEl: HTMLDivElement | null = null;
  private query = "";
  private statusFilter: "all" | EntryStatus = "all";
  private dateFilter: "all" | "7" | "30" = "all";
  private groupByNote = false;
  private debounceTimer: number | null = null;
  /** entryId → 이 이미지를 실제 사용 중인 노트 경로들 (노트별 보기용, 새로고침 시 재스캔) */
  private usageMap: Map<string, string[]> | null = null;
  private usageScanning = false;

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
    root.addClass("a4p-img-panel");

    // ── 검색줄: 입력 + 새로고침 ──
    const searchRow = root.createDiv({ cls: "a4p-img-search-row" });
    const input = searchRow.createEl("input", {
      type: "text",
      placeholder: "파일명·노트 검색…",
      cls: "a4p-img-search-input",
    });
    input.addEventListener("input", () => {
      if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        this.query = input.value.trim().toLowerCase();
        this.renderGrid();
      }, DEBOUNCE_MS);
    });

    const refreshBtn = searchRow.createEl("button", { cls: "a4p-img-icon-btn" });
    refreshBtn.title = "새로고침 (노트별 사용처 재스캔 포함)";
    setIcon(refreshBtn, "refresh-cw");
    refreshBtn.addEventListener("click", () => {
      this.usageMap = null;
      this.renderGrid();
    });

    // ── 필터줄: 칩 스타일 ──
    const filterRow = root.createDiv({ cls: "a4p-img-filter-row" });

    const statusSelect = filterRow.createEl("select", { cls: "dropdown a4p-img-select" });
    for (const [value, label] of [
      ["all", "전체 상태"],
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

    const dateSelect = filterRow.createEl("select", { cls: "dropdown a4p-img-select" });
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

    const groupBtn = filterRow.createEl("button", { cls: "a4p-img-chip" });
    setIcon(groupBtn.createSpan({ cls: "a4p-img-chip-icon" }), "folder-tree");
    groupBtn.createSpan({ text: "노트별" });
    groupBtn.title = "노트별 그룹 보기 전환";
    groupBtn.addEventListener("click", () => {
      this.groupByNote = !this.groupByNote;
      groupBtn.toggleClass("is-active", this.groupByNote);
      this.renderGrid();
    });

    this.statsEl = root.createDiv({ cls: "a4p-img-stats" });
    const scroller = root.createDiv({ cls: "a4p-img-scroller" });
    this.gridEl = scroller.createDiv({ cls: "a4p-img-grid" });
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

    // 통계: 필터 결과 + R2 사용량 추정 (업로드 성공분 합, 무료 10GB 기준)
    const filteredSize = entries.reduce((sum, e) => sum + e.size, 0);
    const uploadedSize = allEntries.filter((e) => e.status === "uploaded").reduce((sum, e) => sum + e.size, 0);
    const pctOfFree = ((uploadedSize / (10 * 1024 * 1024 * 1024)) * 100).toFixed(2);
    if (this.statsEl) {
      this.statsEl.empty();
      this.statsEl.createSpan({ cls: "a4p-img-stats-strong", text: `${entries.length}개 · ${formatBytes(filteredSize)}` });
      this.statsEl.createSpan({ text: ` — R2 사용량 ${formatBytes(uploadedSize)} (10GB의 ${pctOfFree}%)` });
    }

    if (entries.length === 0) {
      const empty = this.gridEl.createDiv({ cls: "a4p-img-empty" });
      setIcon(empty.createDiv({ cls: "a4p-img-empty-icon" }), "image-off");
      empty.createDiv({ text: "표시할 이미지가 없습니다." });
      return;
    }

    if (this.groupByNote) {
      this.renderGroupedByUsage(entries);
    } else {
      for (const entry of entries) {
        this.renderCard(this.gridEl, entry);
      }
    }
  }

  /**
   * 노트별 보기 — sourceNote(최초 삽입 노트)가 아니라 실제 사용처 기준.
   * 한 이미지가 여러 노트에 쓰이면 각 그룹에 모두 표시된다.
   */
  private renderGroupedByUsage(entries: ManifestEntry[]): void {
    if (!this.gridEl) return;

    if (!this.usageMap) {
      if (!this.usageScanning) {
        this.usageScanning = true;
        void this.computeUsageMap().then((map) => {
          this.usageMap = map;
          this.usageScanning = false;
          this.renderGrid();
        });
      }
      const loading = this.gridEl.createDiv({ cls: "a4p-img-empty" });
      setIcon(loading.createDiv({ cls: "a4p-img-empty-icon" }), "loader-2");
      loading.createDiv({ text: "노트별 사용처를 스캔하는 중…" });
      return;
    }

    const groups = new Map<string, ManifestEntry[]>();
    for (const entry of entries) {
      const notes = this.usageMap.get(entry.id) ?? [];
      const keys = notes.length > 0 ? notes : ["(사용된 노트 없음)"];
      for (const key of keys) {
        const list = groups.get(key) ?? [];
        list.push(entry);
        groups.set(key, list);
      }
    }

    for (const [note, groupEntries] of groups) {
      const header = this.gridEl.createDiv({ cls: "a4p-img-group" });
      setIcon(header.createSpan({ cls: "a4p-img-group-icon" }), "file-text");
      header.createSpan({ text: noteBasename(note) });
      header.createSpan({ cls: "a4p-img-group-count", text: String(groupEntries.length) });
      header.title = note;
      const groupGrid = this.gridEl.createDiv({ cls: "a4p-img-grid-inner" });
      for (const entry of groupEntries) this.renderCard(groupGrid, entry);
    }
  }

  /** 전 볼트 1회 스캔으로 entryId → 사용 노트 목록 구축 */
  private async computeUsageMap(): Promise<Map<string, string[]>> {
    const entries = this.plugin.manifestStore.all();
    const map = new Map<string, Set<string>>();
    const push = (id: string, notePath: string) => {
      const set = map.get(id) ?? new Set<string>();
      set.add(notePath);
      map.set(id, set);
    };

    // 1) 위키링크(로컬 백업 임베드) — resolvedLinks라 파일 읽기 없이 즉시
    const byLocal = new Map<string, ManifestEntry>();
    for (const e of entries) {
      if (e.localPath) byLocal.set(e.localPath, e);
    }
    for (const [mdPath, links] of Object.entries(this.app.metadataCache.resolvedLinks)) {
      for (const target of Object.keys(links)) {
        const e = byLocal.get(target);
        if (e) push(e.id, mdPath);
      }
    }

    // 2) 클라우드 URL — origin 프리필터로 무관한 노트(성경 노트 등)는 빠르게 건너뜀
    const withUrl = entries.filter((e) => e.url);
    const origins = [
      ...new Set(withUrl.map((e) => e.url.match(/^https?:\/\/[^/]+/)?.[0]).filter((o): o is string => !!o)),
    ];
    if (withUrl.length > 0 && origins.length > 0) {
      for (const md of this.app.vault.getMarkdownFiles()) {
        const content = await this.app.vault.cachedRead(md);
        if (!origins.some((o) => content.includes(o))) continue;
        for (const e of withUrl) {
          if (content.includes(e.url)) push(e.id, md.path);
        }
      }
    }

    return new Map([...map.entries()].map(([id, set]) => [id, [...set]]));
  }

  private renderCard(parent: HTMLElement, entry: ManifestEntry): void {
    const name = this.entryName(entry);
    const card = parent.createDiv({ cls: "a4p-img-card" });

    const thumbWrap = card.createDiv({ cls: "a4p-img-thumbwrap" });
    const img = thumbWrap.createEl("img", { cls: "a4p-img-thumb" });
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;

    if (entry.status !== "uploaded") {
      thumbWrap.createDiv({
        cls: `a4p-img-badge ${entry.status}`,
        text: entry.status === "failed" ? "실패" : "대기",
      });
    }

    // 호버 시 나타나는 빠른 액션 (삽입 / URL 복사)
    const quick = thumbWrap.createDiv({ cls: "a4p-img-quick" });
    const insertBtn = quick.createEl("button", { cls: "a4p-img-quick-btn" });
    insertBtn.title = "에디터에 삽입";
    setIcon(insertBtn, "plus");
    insertBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      if (entry.status !== "uploaded") {
        new Notice("아직 업로드되지 않은 이미지입니다.");
        return;
      }
      insertAtEditor(this.app, `![${stemOf(name)}](${entry.url})`);
    });
    const copyBtn = quick.createEl("button", { cls: "a4p-img-quick-btn" });
    copyBtn.title = "URL 복사";
    setIcon(copyBtn, "copy");
    copyBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      void navigator.clipboard.writeText(entry.url);
      new Notice("URL을 복사했습니다.");
    });

    const meta = card.createDiv({ cls: "a4p-img-card-meta" });
    meta.createDiv({ cls: "a4p-img-card-name", text: name });
    meta.createDiv({ cls: "a4p-img-card-sub", text: formatBytes(entry.size) });
    meta.title = `${name}\n${entry.localPath ?? "(로컬 백업 없음)"}\n${entry.url}`;

    card.addEventListener("click", () => {
      new ImagePreviewModal(this.app, this.plugin, entry).open();
    });
  }
}

function noteBasename(path: string): string {
  const name = path.split("/").pop() ?? path;
  return name.replace(/\.md$/i, "");
}

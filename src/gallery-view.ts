import { AbstractInputSuggest, App, ItemView, Notice, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import type A4pImagePlugin from "./main";
import type { EntryStatus, ManifestEntry } from "./types";
import { formatBytes } from "./convert";
import { stemOf } from "./filename";
import { insertAtEditor } from "./insert";
import { ImagePreviewModal, STATUS_LABEL } from "./preview-modal";
import { isReportNote } from "./commands";
import { DeleteImageModal } from "./delete-modal";

export const VIEW_TYPE_A4P_IMAGE_GALLERY = "a4p-image-gallery-view";

const DEBOUNCE_MS = 150;

type ViewMode = "grid" | "masonry" | "list";
type SortOrder = "new" | "old" | "size" | "name";

const THUMB_PX_MIN = 80;
const THUMB_PX_MAX = 200;
const THUMB_PX_DEFAULT = 118;

/** 뷰 표시 설정 — 기기별 기억 (볼트 데이터가 아니라 localStorage) */
const LS_PREFIX = "a4p-image:gallery:";
function loadPref<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = window.localStorage.getItem(LS_PREFIX + key);
    return allowed.includes(v as T) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
function loadNumPref(key: string, fallback: number, min: number, max: number): number {
  try {
    const n = parseInt(window.localStorage.getItem(LS_PREFIX + key) ?? "", 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  } catch {
    return fallback;
  }
}
function savePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(LS_PREFIX + key, value);
  } catch {
    /* localStorage 불가 환경이면 그냥 세션 한정 */
  }
}

export class GalleryView extends ItemView {
  private plugin: A4pImagePlugin;
  private panelEl: HTMLElement | null = null;
  private gridEl: HTMLDivElement | null = null;
  private statsEl: HTMLDivElement | null = null;
  private countEl: HTMLElement | null = null;
  private query = "";
  private statusFilter: "all" | EntryStatus = "all";
  private dateFilter: "all" | "7" | "30" = "all";
  private groupByNote = false;
  private viewMode: ViewMode = loadPref("mode", "grid", ["grid", "masonry", "list"] as const);
  private thumbPx: number = loadNumPref("px", THUMB_PX_DEFAULT, THUMB_PX_MIN, THUMB_PX_MAX);
  private sortOrder: SortOrder = loadPref("sort", "new", ["new", "old", "size", "name"] as const);
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
    return "A4P Image 갤러리";
  }

  getIcon(): string {
    return "image";
  }

  async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("a4p-img-panel");
    this.panelEl = root;
    this.applyThumbPx();

    // ── 갤러리 헤더: 타이틀 + 총 개수 + 새로고침 ──
    const header = root.createDiv({ cls: "a4p-img-header" });
    setIcon(header.createSpan({ cls: "a4p-img-header-icon" }), "images");
    header.createSpan({ cls: "a4p-img-header-title", text: "이미지 갤러리" });
    this.countEl = header.createSpan({ cls: "a4p-img-header-count" });
    const refreshBtn = header.createEl("button", { cls: "a4p-img-icon-btn a4p-img-header-refresh" });
    refreshBtn.title = "새로고침 (노트별 사용처 재스캔 포함)";
    setIcon(refreshBtn, "refresh-cw");
    refreshBtn.addEventListener("click", () => {
      this.usageMap = null;
      this.renderGrid();
    });

    // ── 툴바 블록: 검색 + 필터 + 보기 옵션을 하나의 카드로 묶음 ──
    const toolbar = root.createDiv({ cls: "a4p-img-toolbar" });

    // ── 검색줄: 아이콘 + 입력(자동완성) + 지우기 + 새로고침 ──
    const searchRow = toolbar.createDiv({ cls: "a4p-img-search-row" });
    const inputWrap = searchRow.createDiv({ cls: "a4p-img-input-wrap" });
    setIcon(inputWrap.createSpan({ cls: "a4p-img-input-icon" }), "search");
    const input = inputWrap.createEl("input", {
      type: "text",
      placeholder: "파일명·노트 검색…",
      cls: "a4p-img-search-input",
    });
    const clearBtn = inputWrap.createSpan({ cls: "a4p-img-input-clear" });
    setIcon(clearBtn, "x");

    const applyQuery = (value: string) => {
      this.query = value.trim().toLowerCase();
      inputWrap.toggleClass("has-value", value.length > 0);
      this.renderGrid();
    };
    input.addEventListener("input", () => {
      inputWrap.toggleClass("has-value", input.value.length > 0);
      if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => applyQuery(input.value), DEBOUNCE_MS);
    });
    clearBtn.addEventListener("click", () => {
      input.value = "";
      applyQuery("");
      input.focus();
    });
    new GallerySuggest(this.app, this.plugin, input, (picked) => applyQuery(picked));

    // ── 필터: 세그먼트 컨트롤 (상태 / 기간) — 행마다 라벨로 블록 구분 ──
    const statusRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    statusRow.createSpan({ cls: "a4p-img-filter-label", text: "상태" });
    this.buildSegmented(
      statusRow,
      [
        ["all", "전체", "layers"],
        ["uploaded", "업로드", "cloud-upload"],
        ["pending", "대기", "clock"],
        ["failed", "실패", "alert-triangle"],
      ] as const,
      this.statusFilter,
      (v) => {
        this.statusFilter = v;
        this.renderGrid();
      },
    );

    const dateRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    dateRow.createSpan({ cls: "a4p-img-filter-label", text: "기간" });
    this.buildSegmented(
      dateRow,
      [
        ["all", "전체 기간", "infinity"],
        ["7", "7일", "calendar-days"],
        ["30", "30일", "calendar-range"],
      ] as const,
      this.dateFilter,
      (v) => {
        this.dateFilter = v;
        this.renderGrid();
      },
    );

    const groupBtn = dateRow.createEl("button", { cls: "a4p-img-chip" });
    setIcon(groupBtn.createSpan({ cls: "a4p-img-chip-icon" }), "folder-tree");
    groupBtn.createSpan({ text: "노트별" });
    groupBtn.title = "노트별 그룹 보기 전환";
    groupBtn.addEventListener("click", () => {
      this.groupByNote = !this.groupByNote;
      groupBtn.toggleClass("is-active", this.groupByNote);
      this.renderGrid();
    });

    // ── 보기 옵션: 뷰 모드 / 썸네일 크기 / 정렬 ──
    const viewRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    viewRow.createSpan({ cls: "a4p-img-filter-label", text: "보기" });
    this.buildIconSeg(
      viewRow,
      [
        ["grid", "layout-grid", "격자 보기"],
        ["masonry", "layout-dashboard", "모자이크 보기 (원본 비율)"],
        ["list", "list", "목록 보기"],
      ] as const,
      this.viewMode,
      (v) => {
        this.viewMode = v;
        savePref("mode", v);
        syncZoomDisabled();
        this.renderGrid();
      },
    );
    // 썸네일 크기 — 줌 슬라이더 (격자·모자이크에 적용)
    const zoom = viewRow.createDiv({ cls: "a4p-img-zoom" });
    zoom.title = "썸네일 크기";
    setIcon(zoom.createSpan({ cls: "a4p-img-zoom-icon" }), "zoom-out");
    const zoomSlider = zoom.createEl("input", { type: "range", cls: "a4p-img-zoom-slider" });
    zoomSlider.min = String(THUMB_PX_MIN);
    zoomSlider.max = String(THUMB_PX_MAX);
    zoomSlider.step = "4";
    zoomSlider.value = String(this.thumbPx);
    setIcon(zoom.createSpan({ cls: "a4p-img-zoom-icon" }), "zoom-in");
    zoomSlider.addEventListener("input", () => {
      this.thumbPx = parseInt(zoomSlider.value, 10);
      savePref("px", zoomSlider.value);
      this.applyThumbPx();
    });
    // 목록 보기에선 썸네일 크기가 의미 없으므로 흐리게
    const syncZoomDisabled = () => zoom.toggleClass("is-disabled", this.viewMode === "list");
    syncZoomDisabled();
    const sortSel = viewRow.createEl("select", { cls: "dropdown a4p-img-sort" });
    const SORT_LABEL: Record<SortOrder, string> = {
      new: "최신순",
      old: "오래된순",
      size: "용량 큰순",
      name: "이름순",
    };
    for (const [value, label] of Object.entries(SORT_LABEL)) {
      sortSel.createEl("option", { text: label, value });
    }
    sortSel.value = this.sortOrder;
    sortSel.addEventListener("change", () => {
      this.sortOrder = sortSel.value as SortOrder;
      savePref("sort", this.sortOrder);
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

  /** 외부(삭제 흐름 등)에서 호출하는 전체 갱신 — 사용처 맵도 재스캔 */
  refresh(): void {
    this.usageMap = null;
    this.renderGrid();
  }

  /** iOS 스타일 세그먼트 컨트롤 — [값, 라벨, lucide 아이콘], 활성 시 data-seg로 상태색 강조 */
  private buildSegmented<T extends string>(
    parent: HTMLElement,
    options: ReadonlyArray<readonly [T, string, string]>,
    initial: T,
    onChange: (value: T) => void,
  ): void {
    const box = parent.createDiv({ cls: "a4p-img-seg" });
    const buttons: HTMLButtonElement[] = [];
    for (const [value, label, icon] of options) {
      const btn = box.createEl("button", { cls: "a4p-img-seg-btn" });
      btn.dataset.seg = value;
      setIcon(btn.createSpan({ cls: "a4p-img-seg-icon" }), icon);
      btn.createSpan({ text: label });
      if (value === initial) btn.addClass("is-active");
      btn.addEventListener("click", () => {
        for (const b of buttons) b.removeClass("is-active");
        btn.addClass("is-active");
        onChange(value);
      });
      buttons.push(btn);
    }
  }

  /** 아이콘 전용 미니 세그먼트 — 뷰 모드·썸네일 크기 토글 */
  private buildIconSeg<T extends string>(
    parent: HTMLElement,
    options: ReadonlyArray<readonly [T, string, string]>,
    initial: T,
    onChange: (value: T) => void,
  ): void {
    const box = parent.createDiv({ cls: "a4p-img-seg a4p-img-seg--icons" });
    const buttons: HTMLButtonElement[] = [];
    for (const [value, icon, tooltip] of options) {
      const btn = box.createEl("button", { cls: "a4p-img-seg-btn a4p-img-seg-btn--icon" });
      btn.title = tooltip;
      btn.setAttribute("aria-label", tooltip);
      setIcon(btn.createSpan({ cls: "a4p-img-seg-icon" }), icon);
      if (value === initial) btn.addClass("is-active");
      btn.addEventListener("click", () => {
        for (const b of buttons) b.removeClass("is-active");
        btn.addClass("is-active");
        onChange(value);
      });
      buttons.push(btn);
    }
  }

  private applyThumbPx(): void {
    this.panelEl?.style.setProperty("--a4p-thumb-min", `${this.thumbPx}px`);
  }

  private entryName(entry: ManifestEntry): string {
    const path = entry.localPath ?? entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }

  /** 카드·목록 공용 빠른 액션 정의 (삽입 / URL 복사 / 삭제) */
  private entryActions(
    entry: ManifestEntry,
  ): Array<{ icon: string; title: string; danger?: boolean; onClick: () => void }> {
    const name = this.entryName(entry);
    return [
      {
        icon: "plus",
        title: "에디터에 삽입",
        onClick: () => {
          if (entry.status !== "uploaded") {
            new Notice("아직 업로드되지 않은 이미지입니다.");
            return;
          }
          insertAtEditor(this.app, `![${stemOf(name)}](${entry.url})`);
        },
      },
      {
        icon: "copy",
        title: "URL 복사",
        onClick: () => {
          void navigator.clipboard.writeText(entry.url);
          new Notice("URL을 복사했습니다.");
        },
      },
      {
        icon: "trash-2",
        title: "삭제… (서버 포함, 이중 확인)",
        danger: true,
        onClick: () => {
          new DeleteImageModal(this.app, this.plugin, entry).open();
        },
      },
    ];
  }

  private renderGrid(): void {
    if (!this.gridEl) return;
    this.gridEl.empty();
    // 그룹 모드에선 바깥 컨테이너는 세로 스택, 각 그룹 안 컨테이너가 뷰 모드를 가짐
    this.gridEl.className = this.groupByNote
      ? "a4p-img-grid is-grouped"
      : `a4p-img-grid mode-${this.viewMode}`;

    const compare: Record<SortOrder, (a: ManifestEntry, b: ManifestEntry) => number> = {
      new: (a, b) => b.createdAt - a.createdAt,
      old: (a, b) => a.createdAt - b.createdAt,
      size: (a, b) => b.size - a.size,
      name: (a, b) => this.entryName(a).localeCompare(this.entryName(b), "ko"),
    };
    const allEntries = this.plugin.manifestStore.all();
    this.countEl?.setText(String(allEntries.length));
    let entries = [...allEntries].sort(compare[this.sortOrder]);
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
      const usage = this.statsEl.createSpan({ cls: "a4p-img-stats-usage" });
      setIcon(usage.createSpan({ cls: "a4p-img-stats-usage-icon" }), "cloud");
      usage.createSpan({ text: `R2 ${formatBytes(uploadedSize)} · 10GB의 ${pctOfFree}%` });
      const bar = this.statsEl.createDiv({ cls: "a4p-img-stats-bar" });
      const fill = bar.createDiv({ cls: "a4p-img-stats-bar-fill" });
      fill.style.width = `${Math.min(100, parseFloat(pctOfFree))}%`;
    }

    if (entries.length === 0) {
      const empty = this.gridEl.createDiv({ cls: "a4p-img-empty" });
      setIcon(empty.createDiv({ cls: "a4p-img-empty-icon" }), "image-off");
      empty.createDiv({ cls: "a4p-img-empty-title", text: "표시할 이미지가 없습니다" });
      empty.createDiv({ cls: "a4p-img-empty-sub", text: "필터를 바꾸거나 노트에 이미지를 붙여넣어 보세요." });
      return;
    }

    if (this.groupByNote) {
      this.renderGroupedByUsage(entries);
    } else {
      for (const entry of entries) {
        this.renderEntry(this.gridEl, entry);
      }
    }
  }

  private renderEntry(parent: HTMLElement, entry: ManifestEntry): void {
    if (this.viewMode === "list") this.renderListRow(parent, entry);
    else this.renderCard(parent, entry);
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
      const loading = this.gridEl.createDiv({ cls: "a4p-img-empty is-loading" });
      setIcon(loading.createDiv({ cls: "a4p-img-empty-icon" }), "loader-2");
      loading.createDiv({ cls: "a4p-img-empty-title", text: "노트별 사용처를 스캔하는 중…" });
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
      const isRealNote = note !== "(사용된 노트 없음)";
      const header = this.gridEl.createDiv({ cls: "a4p-img-group" });
      setIcon(
        header.createSpan({ cls: "a4p-img-group-icon" }),
        isRealNote ? "file-text" : "unlink",
      );
      header.createSpan({ cls: "a4p-img-group-name", text: noteBasename(note) });
      header.createSpan({ cls: "a4p-img-group-count", text: `${groupEntries.length}장` });
      header.title = isRealNote ? `${note} — 클릭하면 노트를 엽니다` : note;
      if (isRealNote) {
        header.addClass("is-clickable");
        header.addEventListener("click", () => {
          void this.app.workspace.openLinkText(note, "", false);
        });
      }
      const groupGrid = this.gridEl.createDiv({ cls: `a4p-img-grid-inner mode-${this.viewMode}` });
      for (const entry of groupEntries) this.renderEntry(groupGrid, entry);
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
      if (isReportNote(this.app, mdPath)) continue; // 미사용 리포트는 사용처가 아님 (자기참조 방지)
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
        if (isReportNote(this.app, md.path)) continue;
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
    card.title = `${name}\n${entry.localPath ?? "(로컬 백업 없음)"}\n${entry.url}`;

    const thumbWrap = card.createDiv({ cls: "a4p-img-thumbwrap" });
    const img = thumbWrap.createEl("img", { cls: "a4p-img-thumb" });
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    // 로드 완료 시 부드럽게 페이드인, 실패 시 아이콘 폴백 (클라우드 온리 + 오프라인 등)
    if (img.complete && img.naturalWidth > 0) {
      thumbWrap.addClass("is-loaded");
    } else {
      img.addEventListener("load", () => thumbWrap.addClass("is-loaded"));
      img.addEventListener("error", () => {
        thumbWrap.addClass("is-broken");
        setIcon(thumbWrap.createSpan({ cls: "a4p-img-thumb-broken" }), "image-off");
      });
    }

    if (entry.status !== "uploaded") {
      card.addClass(`is-${entry.status}`);
      const badge = thumbWrap.createDiv({ cls: `a4p-img-badge ${entry.status}` });
      setIcon(badge, entry.status === "failed" ? "alert-triangle" : "clock");
      badge.title = entry.status === "failed" ? "업로드 실패 — '실패한 업로드 재시도' 명령으로 복구" : "업로드 대기 중";
    }

    // 호버 시 나타나는 빠른 액션 (삽입 / URL 복사 / 삭제)
    const quick = thumbWrap.createDiv({ cls: "a4p-img-quick" });
    for (const action of this.entryActions(entry)) {
      const btn = quick.createEl("button", {
        cls: `a4p-img-quick-btn${action.danger ? " a4p-img-quick-btn--danger" : ""}`,
      });
      btn.title = action.title;
      setIcon(btn, action.icon);
      btn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        action.onClick();
      });
    }

    const overlay = thumbWrap.createDiv({ cls: "a4p-img-card-overlay" });
    overlay.createDiv({ cls: "a4p-img-card-name", text: name });
    overlay.createDiv({ cls: "a4p-img-card-sub", text: formatBytes(entry.size) });

    card.addEventListener("click", () => {
      new ImagePreviewModal(this.app, this.plugin, entry).open();
    });
  }

  /** 목록 보기 — 썸네일 + 파일명 + 원본 노트 + 메타 + 상태 필 + 액션 */
  private renderListRow(parent: HTMLElement, entry: ManifestEntry): void {
    const name = this.entryName(entry);
    const row = parent.createDiv({ cls: "a4p-img-listrow" });
    if (entry.status !== "uploaded") row.addClass(`is-${entry.status}`);

    const thumb = row.createDiv({ cls: "a4p-img-listrow-thumb" });
    const img = thumb.createEl("img");
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    img.addEventListener("error", () => {
      thumb.empty();
      setIcon(thumb.createSpan({ cls: "a4p-img-thumb-broken" }), "image-off");
    });

    const info = row.createDiv({ cls: "a4p-img-listrow-info" });
    info.createDiv({ cls: "a4p-img-listrow-name", text: name });
    const sub = info.createDiv({ cls: "a4p-img-listrow-sub" });
    const date = new Date(entry.createdAt).toLocaleDateString("ko-KR", { dateStyle: "medium" });
    sub.createSpan({ text: `${formatBytes(entry.size)} · ${date}` });
    if (entry.sourceNote) {
      sub.createSpan({ text: " · " });
      const link = sub.createEl("a", { cls: "a4p-img-listrow-note", text: noteBasename(entry.sourceNote) });
      link.title = entry.sourceNote;
      link.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        void this.app.workspace.openLinkText(entry.sourceNote!, "", false);
      });
    }

    row.createSpan({
      cls: `a4p-img-status-pill ${entry.status}`,
      text: STATUS_LABEL[entry.status] ?? entry.status,
    });

    const actions = row.createDiv({ cls: "a4p-img-listrow-actions" });
    for (const action of this.entryActions(entry)) {
      const btn = actions.createEl("button", {
        cls: `a4p-img-listrow-btn${action.danger ? " a4p-img-listrow-btn--danger" : ""}`,
      });
      btn.title = action.title;
      setIcon(btn, action.icon);
      btn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        action.onClick();
      });
    }

    row.addEventListener("click", () => {
      new ImagePreviewModal(this.app, this.plugin, entry).open();
    });
  }
}

function noteBasename(path: string): string {
  const name = path.split("/").pop() ?? path;
  return name.replace(/\.md$/i, "");
}

/** 검색 자동완성 항목: 매니페스트의 이미지 파일명 + 원본 노트명 */
interface GallerySuggestion {
  kind: "file" | "note";
  label: string;
}

class GallerySuggest extends AbstractInputSuggest<GallerySuggestion> {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    inputEl: HTMLInputElement,
    private onPick: (label: string) => void,
  ) {
    super(app, inputEl);
  }

  protected getSuggestions(query: string): GallerySuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const seen = new Set<string>();
    const files: GallerySuggestion[] = [];
    const notes: GallerySuggestion[] = [];
    for (const entry of this.plugin.manifestStore.all()) {
      const path = entry.localPath ?? entry.r2Key;
      const i = path.lastIndexOf("/");
      const name = i >= 0 ? path.slice(i + 1) : path;
      if (name.toLowerCase().includes(q) && !seen.has(`f:${name}`)) {
        seen.add(`f:${name}`);
        files.push({ kind: "file", label: name });
      }
      if (entry.sourceNote) {
        const base = noteBasename(entry.sourceNote);
        if (base.toLowerCase().includes(q) && !seen.has(`n:${base}`)) {
          seen.add(`n:${base}`);
          notes.push({ kind: "note", label: base });
        }
      }
    }
    // 접두 일치를 부분 일치보다 앞에
    const rank = (s: GallerySuggestion) => (s.label.toLowerCase().startsWith(q) ? 0 : 1);
    return [...files, ...notes].sort((a, b) => rank(a) - rank(b)).slice(0, 8);
  }

  renderSuggestion(value: GallerySuggestion, el: HTMLElement): void {
    el.addClass("a4p-img-suggest-item");
    setIcon(el.createSpan({ cls: "a4p-img-suggest-icon" }), value.kind === "file" ? "image" : "file-text");
    el.createSpan({ cls: "a4p-img-suggest-label", text: value.label });
    el.createSpan({ cls: "a4p-img-suggest-kind", text: value.kind === "file" ? "이미지" : "노트" });
  }

  selectSuggestion(value: GallerySuggestion): void {
    this.setValue(value.label);
    this.onPick(value.label);
    this.close();
  }
}

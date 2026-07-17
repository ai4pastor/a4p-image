import { App, Modal, Notice, setIcon } from "obsidian";
import type A4pImagePlugin from "./main";
import { formatBytes } from "./convert";
import { DeleteItem, buildDeletePlan, PlannedDelete } from "./delete-plan";
import { executeDeletePlan } from "./delete";
import { attachmentIconFor, renderThumb, ThumbSource } from "./thumb";

/** 미사용 판정 분류 — unused.ts의 A/B/C/D 리포트 분류와 1:1 대응 */
export type TrashCandidateKind = "fully-unused" | "orphaned-backup" | "cloud-orphan" | "unused-attachment";

export type TrashCandidate = DeleteItem & { kind: TrashCandidateKind };

/** 후보 식별 키 — 엔트리가 있으면 id, 없으면 경로 */
function keyOf(item: DeleteItem): string {
  return item.entry?.id ?? item.path;
}

function nameOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

function extOf(path: string): string {
  const name = nameOf(path);
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1) : "";
}

function thumbSourceOf(cand: DeleteItem & { kind?: TrashCandidateKind }): ThumbSource {
  const localPath = cand.entry ? cand.entry.localPath : cand.path;
  const source: ThumbSource = {
    localPath,
    url: cand.entry?.url ?? null,
    name: nameOf(cand.path),
    size: cand.size,
  };
  if (cand.kind === "unused-attachment") source.icon = attachmentIconFor(extOf(cand.path));
  return source;
}

function dateStr(ms: number | null | undefined): string | null {
  if (!ms) return null;
  return new Date(ms).toLocaleDateString("ko-KR", { dateStyle: "medium" });
}

interface SectionSpec {
  kind: TrashCandidateKind;
  title: string;
  /** 왜 미사용으로 판정됐는지 */
  desc: string;
  /** 정리 시 무슨 일이 일어나는지 */
  treat: (r2Ok: boolean) => string;
}

const SECTIONS: SectionSpec[] = [
  {
    kind: "fully-unused",
    title: "완전 미사용 로컬 이미지",
    desc: "어떤 노트도 이 파일을 참조하지 않고, 클라우드 업로드 기록도 없습니다.",
    treat: () => "정리 시 로컬 파일만 볼트 .trash/로 이동합니다 — 언제든 복구할 수 있습니다.",
  },
  {
    kind: "orphaned-backup",
    title: "노트에서 URL이 사라진 백업",
    desc: "R2에 업로드됐지만 이제 어떤 노트에도 해당 URL이 남아 있지 않습니다 (노트에서 이미지를 지운 흔적).",
    treat: (r2Ok) =>
      r2Ok
        ? "정리 시 서버(R2) 원본은 영구 삭제되고(복구 불가), 로컬 백업은 .trash/로 이동합니다(복구 가능)."
        : "R2 설정이 없어 정리 시 로컬 백업만 .trash/로 이동합니다 (서버 객체·갤러리 기록 유지).",
  },
  {
    kind: "cloud-orphan",
    title: "서버에만 남은 고아 객체",
    desc: "로컬 백업이 없고, 어떤 노트에서도 URL을 쓰지 않는 클라우드 객체입니다.",
    treat: () => "정리 시 R2 서버에서 영구 삭제됩니다 — 복구할 수 없습니다.",
  },
  {
    kind: "unused-attachment",
    title: "노트에 연결되지 않은 첨부 파일",
    desc: "어떤 노트도 링크·임베드하지 않는 이미지 외 첨부(PDF·오디오 등)입니다. 캔버스에서 쓰는 파일은 제외했습니다.",
    treat: () => "정리 시 로컬 파일만 볼트 .trash/로 이동합니다 — 언제든 복구할 수 있습니다. (서버·갤러리와 무관)",
  },
];

/**
 * 미사용 이미지 통합 정리 — 절대 원칙:
 * 자동 삭제 없음, 사용자가 체크박스로 직접 선택 + 최종 확인 후에만 실행.
 * 로컬 파일은 vault.trash(file, false)로 볼트 .trash/ 이동(복구 가능),
 * 업로드된 항목은 R2 서버 객체도 영구 삭제(이중 확인에서 명시 경고).
 */
export class TrashSelectModal extends Modal {
  private selected = new Set<string>();
  private proceedBtn: HTMLButtonElement | null = null;

  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private candidates: TrashCandidate[],
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("a4p-image-trash-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "미사용 이미지·첨부 정리" });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-lead",
      text: `미사용으로 판정된 항목 ${this.candidates.length}개입니다. 썸네일을 클릭하면 크게 볼 수 있고, ▾를 펼치면 판정 근거와 처리 내용을 확인할 수 있습니다.`,
    });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-warning",
      text: "선택한 항목만 정리되며, 실행 전 최종 확인을 한 번 더 거칩니다. 서버(R2) 삭제가 포함된 항목은 붉은 띠로 표시됩니다.",
    });

    const r2Ok = this.plugin.r2.isConfigured();
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list a4p-image-trash-list" });

    const allCheckboxes: HTMLInputElement[] = [];
    const globalRow = listEl.createDiv({ cls: "a4p-image-trash-selectall" });
    const globalCb = globalRow.createEl("input", { type: "checkbox" });
    globalRow.createSpan({ text: "모두 선택" });
    globalCb.addEventListener("change", () => {
      for (const cb of allCheckboxes) {
        cb.checked = globalCb.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });

    for (const spec of SECTIONS) {
      const group = this.candidates.filter((c) => c.kind === spec.kind);
      if (group.length === 0) continue;
      this.renderSection(listEl, spec, group, r2Ok, allCheckboxes);
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    this.proceedBtn = buttons.createEl("button", { text: "선택 항목 정리…", cls: "mod-warning" });
    this.proceedBtn.addEventListener("click", () => {
      if (this.selected.size === 0) {
        new Notice("선택된 항목이 없습니다.");
        return;
      }
      const picked = this.candidates.filter((c) => this.selected.has(keyOf(c)));
      this.close();
      new TrashConfirmModal(this.app, this.plugin, picked).open();
    });
  }

  private updateProceedLabel(): void {
    if (!this.proceedBtn) return;
    this.proceedBtn.setText(
      this.selected.size > 0 ? `선택 항목 정리 (${this.selected.size}개)…` : "선택 항목 정리…",
    );
  }

  private renderSection(
    parent: HTMLElement,
    spec: SectionSpec,
    group: TrashCandidate[],
    r2Ok: boolean,
    allCheckboxes: HTMLInputElement[],
  ): void {
    const section = parent.createDiv({ cls: "a4p-image-trash-section" });

    const header = section.createDiv({ cls: "a4p-image-trash-section-head" });
    const sectionCb = header.createEl("input", { type: "checkbox" });
    sectionCb.title = "이 분류 모두 선택";
    header.createSpan({ cls: "a4p-image-trash-section-title", text: spec.title });
    header.createSpan({ cls: "a4p-image-trash-count", text: String(group.length) });

    section.createDiv({ cls: "a4p-image-trash-section-desc", text: spec.desc });
    section.createDiv({ cls: "a4p-image-trash-section-treat", text: spec.treat(r2Ok) });

    const sectionCheckboxes: HTMLInputElement[] = [];
    sectionCb.addEventListener("change", () => {
      for (const cb of sectionCheckboxes) {
        cb.checked = sectionCb.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });

    for (const cand of group) {
      const cb = this.renderItem(section, cand, r2Ok);
      sectionCheckboxes.push(cb);
      allCheckboxes.push(cb);
    }
  }

  /** 항목 카드 — [체크박스][썸네일][이름·메타][배지][▾], 펼치면 판정 근거 + 처리 상세 */
  private renderItem(parent: HTMLElement, cand: TrashCandidate, r2Ok: boolean): HTMLInputElement {
    const serverDelete = r2Ok && cand.entry?.status === "uploaded" && !!cand.entry.r2Key;
    const item = parent.createDiv({
      cls: `a4p-image-trash-item ${serverDelete ? "is-server" : "is-local"}`,
    });

    const row = item.createDiv({ cls: "a4p-image-trash-row" });
    const cb = row.createEl("input", { type: "checkbox" });
    cb.addEventListener("change", () => {
      if (cb.checked) this.selected.add(keyOf(cand));
      else this.selected.delete(keyOf(cand));
      item.toggleClass("is-selected", cb.checked);
      this.updateProceedLabel();
    });
    cb.addEventListener("click", (evt) => evt.stopPropagation());

    renderThumb(this.app, row, thumbSourceOf(cand));

    const info = row.createDiv({ cls: "a4p-image-trash-info" });
    info.createDiv({ cls: "a4p-image-trash-name", text: nameOf(cand.path) });
    const metaParts = [formatBytes(cand.size)];
    const uploaded = dateStr(cand.entry?.uploadedAt);
    if (uploaded) metaParts.push(`업로드 ${uploaded}`);
    info.createDiv({ cls: "a4p-image-trash-meta", text: metaParts.join(" · ") });

    if (serverDelete) {
      row.createSpan({ cls: "a4p-image-badge-server", text: "서버 삭제" });
    }

    const toggleBtn = row.createEl("button", { cls: "a4p-image-trash-toggle" });
    toggleBtn.title = "판정 근거·처리 내용 보기";
    setIcon(toggleBtn, "chevron-down");

    const detail = item.createDiv({ cls: "a4p-image-trash-detail" });
    this.renderDetail(detail, cand, serverDelete);

    toggleBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      item.toggleClass("is-open", !item.hasClass("is-open"));
    });
    row.addEventListener("click", () => {
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    });

    return cb;
  }

  private detailRow(parent: HTMLElement, icon: string, text: string): HTMLElement {
    const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
    setIcon(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), icon);
    row.createSpan({ text });
    return row;
  }

  private renderDetail(parent: HTMLElement, cand: TrashCandidate, serverDelete: boolean): void {
    parent.createDiv({ cls: "a4p-image-trash-detail-title", text: "깨진 연결" });
    if (cand.kind === "fully-unused" || cand.kind === "unused-attachment") {
      this.detailRow(
        parent,
        "unlink",
        cand.kind === "unused-attachment"
          ? "링크·임베드하는 노트 없음 (캔버스 사용처도 없음)"
          : "참조하는 노트 없음 — 위키링크 0개 · 업로드 기록 없음",
      );
      this.detailRow(parent, "file-question", `전체 경로: ${cand.path}`);
      if (cand.kind === "unused-attachment") {
        const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
        setIcon(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), "external-link");
        const link = row.createEl("a", { text: "파일 열어서 확인", cls: "a4p-image-trash-detail-link" });
        link.addEventListener("click", (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.close();
          void this.app.workspace.openLinkText(cand.path, "", false);
        });
      }
    } else {
      this.detailRow(
        parent,
        "unlink",
        cand.kind === "cloud-orphan"
          ? "로컬 백업 없음 · 이 URL을 쓰는 노트 없음"
          : "이 이미지의 URL을 쓰는 노트 없음 (위키링크 참조도 없음)",
      );
      const sourceNote = cand.entry?.sourceNote;
      if (sourceNote) {
        const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
        setIcon(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), "file-text");
        row.createSpan({ text: "원래 삽입된 노트: " });
        if (this.app.vault.getAbstractFileByPath(sourceNote)) {
          const link = row.createEl("a", { text: sourceNote, cls: "a4p-image-trash-detail-link" });
          link.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.close();
            void this.app.workspace.openLinkText(sourceNote, "", false);
          });
        } else {
          row.createSpan({ cls: "a4p-image-trash-detail-muted", text: `${sourceNote} (삭제됨)` });
        }
      }
      if (cand.entry?.url) {
        this.detailRow(parent, "link", cand.entry.url);
      }
    }

    parent.createDiv({ cls: "a4p-image-trash-detail-title", text: "처리 방법" });
    if (cand.kind === "fully-unused") {
      this.detailRow(parent, "trash-2", "정리 시: 로컬 파일을 볼트 .trash/로 이동 (언제든 복구 가능)");
      this.detailRow(parent, "lightbulb", "계속 쓰려면: 노트에 ![[파일명]]으로 임베드하면 '사용 중'으로 보호됩니다");
    } else if (cand.kind === "unused-attachment") {
      this.detailRow(parent, "trash-2", "정리 시: 로컬 파일을 볼트 .trash/로 이동 (언제든 복구 가능) — 서버 업로드와 무관");
      this.detailRow(parent, "lightbulb", "계속 쓰려면: 노트에 [[파일명]] 링크 또는 ![[파일명]] 임베드를 추가하면 '사용 중'으로 보호됩니다");
    } else if (cand.kind === "orphaned-backup") {
      if (serverDelete) {
        this.detailRow(parent, "trash-2", "정리 시: 서버(R2) 원본 영구 삭제(복구 불가) + 로컬 백업 .trash/ 이동(복구 가능) + 갤러리 기록 제거");
      } else {
        this.detailRow(parent, "trash-2", "정리 시: 로컬 백업만 .trash/로 이동 (서버 객체·갤러리 기록 유지)");
      }
      this.detailRow(parent, "lightbulb", "계속 쓰려면: 갤러리에서 이 이미지를 노트에 삽입하세요 — URL이 노트에 있으면 '사용 중'으로 보호됩니다");
    } else {
      this.detailRow(parent, "trash-2", "정리 시: R2 서버에서 영구 삭제 (복구 불가) + 갤러리 기록 제거");
      this.detailRow(parent, "lightbulb", "계속 쓰려면: 갤러리에서 이 이미지를 노트에 삽입하세요 — 삽입 후에는 미사용 후보에서 빠집니다");
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** 이중 승인 — 실행 직전 수행 내역(로컬 이동/서버 영구 삭제)을 그룹별로 다시 보여주고 최종 확인 */
class TrashConfirmModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private items: DeleteItem[],
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("a4p-image-trash-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "최종 확인" });

    const plan = buildDeletePlan(this.items, this.plugin.r2.isConfigured());

    const localOnly = plan.items.filter((p) => p.trashLocal && !p.deleteR2);
    const withServer = plan.items.filter((p) => p.deleteR2);

    const renderGroup = (title: string, cls: string, group: PlannedDelete[]) => {
      if (group.length === 0) return;
      contentEl.createEl("p", { cls, text: title });
      const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
      for (const p of group) {
        const row = listEl.createDiv({ cls: "a4p-image-trash-confirm-row" });
        renderThumb(this.app, row, thumbSourceOf(p.item), { small: true });
        row.createSpan({ cls: "a4p-image-trash-confirm-name", text: nameOf(p.item.path) });
        row.createSpan({ cls: "a4p-image-trash-meta", text: formatBytes(p.item.size) });
      }
    };
    renderGroup(`볼트 .trash/ 이동 ${localOnly.length}개 (복구 가능)`, "", localOnly);
    renderGroup(
      `⚠️ 서버(R2)에 올라가 있는 이미지 영구 삭제 ${withServer.length}개 (복구 불가)` +
        (withServer.some((p) => p.trashLocal) ? " — 로컬 백업은 .trash/로 이동" : ""),
      "a4p-image-trash-warning",
      withServer,
    );
    if (plan.items.some((p) => p.localOnlyFallback)) {
      contentEl.createEl("p", {
        text: "일부 항목은 R2 설정이 없어 로컬 이동만 수행됩니다 (서버 객체·갤러리 기록 유지).",
      });
    }
    if (plan.blocked.length > 0) {
      contentEl.createEl("p", {
        cls: "a4p-image-trash-warning",
        text: `제외 ${plan.blocked.length}개: ${plan.blocked[0].reason}`,
      });
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", {
      text: `${plan.items.length}개 정리 실행`,
      cls: "mod-warning",
    });
    confirmBtn.disabled = plan.items.length === 0;
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      void executeDeletePlan(this.plugin, plan).then(() => this.close());
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

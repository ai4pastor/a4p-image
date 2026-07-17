import { App, Modal, Notice, Platform, TFile, setIcon } from "obsidian";
import type A4pImagePlugin from "./main";
import type { ManifestEntry } from "./types";
import { formatBytes } from "./convert";
import { stemOf } from "./filename";
import { insertAtEditor } from "./insert";
import { findImageUsages } from "./commands";
import { DeleteImageModal } from "./delete-modal";

export const STATUS_LABEL: Record<string, string> = {
  uploaded: "업로드됨",
  pending: "대기 중",
  failed: "실패",
};

/** 갤러리에서 이미지 클릭 시 뜨는 큰 미리보기 + 액션 모달 */
export class ImagePreviewModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private entry: ManifestEntry,
  ) {
    super(app);
  }

  private entryName(): string {
    const path = this.entry.localPath ?? this.entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }

  onOpen(): void {
    this.modalEl.addClass("a4p-img-preview-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("a4p-img-preview");
    const entry = this.entry;
    const name = this.entryName();

    // ── 히어로 이미지 (풀블리드) ──
    const imgWrap = contentEl.createDiv({ cls: "a4p-img-preview-imgwrap" });
    const img = imgWrap.createEl("img");
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;

    // ── 본문: 메타 + 액션 + 사용처 ──
    const body = contentEl.createDiv({ cls: "a4p-img-preview-body" });
    body.createDiv({ cls: "a4p-img-preview-name", text: name });

    const subEl = body.createDiv({ cls: "a4p-img-preview-sub" });
    const dateStr = new Date(entry.createdAt).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const renderSub = (dims?: string) => {
      subEl.empty();
      const parts = [formatBytes(entry.size)];
      if (dims) parts.push(dims);
      parts.push(dateStr);
      subEl.createSpan({ text: parts.join(" · ") });
      subEl.createSpan({
        cls: `a4p-img-status-pill ${entry.status}`,
        text: STATUS_LABEL[entry.status] ?? entry.status,
      });
    };
    renderSub();
    img.addEventListener("load", () => {
      if (img.naturalWidth) renderSub(`${img.naturalWidth}×${img.naturalHeight}`);
    });

    if (entry.sourceNote) {
      const noteRow = body.createDiv({ cls: "a4p-img-preview-row" });
      setIcon(noteRow.createSpan({ cls: "a4p-img-preview-row-icon" }), "file-text");
      const noteLink = noteRow.createEl("a", { text: entry.sourceNote, cls: "a4p-img-preview-link" });
      noteLink.addEventListener("click", (evt) => {
        evt.preventDefault();
        this.close();
        void this.app.workspace.openLinkText(entry.sourceNote!, "", false);
      });
    }

    if (entry.status === "uploaded") {
      const urlRow = body.createDiv({ cls: "a4p-img-preview-row" });
      setIcon(urlRow.createSpan({ cls: "a4p-img-preview-row-icon" }), "link");
      urlRow.createSpan({ cls: "a4p-img-preview-url", text: entry.url });
    }

    // ── 액션 버튼: CTA 1개 + 고스트 ──
    const actions = body.createDiv({ cls: "a4p-img-preview-actions" });

    this.actionButton(actions, "plus", "에디터에 삽입", { cta: true }, () => {
      if (entry.status !== "uploaded") {
        new Notice("아직 업로드되지 않은 이미지입니다. '실패한 업로드 재시도'를 먼저 실행하세요.");
        return;
      }
      if (insertAtEditor(this.app, `![${stemOf(name)}](${entry.url})`)) this.close();
    });

    this.actionButton(actions, "copy", "URL 복사", {}, () => {
      void navigator.clipboard.writeText(entry.url);
      new Notice("URL을 복사했습니다.");
    });

    if (entry.sourceNote) {
      this.actionButton(actions, "file-text", "노트 열기", {}, () => {
        this.close();
        void this.app.workspace.openLinkText(entry.sourceNote!, "", false);
      });
    }

    if (entry.status === "uploaded" && Platform.isDesktopApp) {
      this.actionButton(actions, "external-link", "브라우저에서 열기", {}, () => {
        window.open(entry.url);
      });
    }

    this.actionButton(actions, "trash-2", "삭제…", { danger: true }, () => {
      this.close();
      new DeleteImageModal(this.app, this.plugin, entry).open();
    });

    this.actionButton(actions, "search", "사용처 검색", {}, async (btn) => {
      btn.disabled = true;
      setIcon(btn.querySelector(".a4p-img-btn-icon") as HTMLElement, "loader-2");
      try {
        const usages = await findImageUsages(this.app, this.entry);
        this.renderUsages(body, usages);
      } finally {
        btn.disabled = false;
        setIcon(btn.querySelector(".a4p-img-btn-icon") as HTMLElement, "search");
      }
    });
  }

  private actionButton(
    parent: HTMLElement,
    icon: string,
    label: string,
    opts: { cta?: boolean; iconOnly?: boolean; danger?: boolean },
    onClick: (btn: HTMLButtonElement) => void | Promise<void>,
  ): void {
    const btn = parent.createEl("button", { cls: "a4p-img-btn" });
    if (opts.cta) btn.addClass("mod-cta");
    if (opts.danger) btn.addClass("a4p-img-btn--danger");
    if (opts.iconOnly) {
      btn.addClass("a4p-img-btn--icon");
      btn.title = label;
      btn.setAttribute("aria-label", label);
    }
    setIcon(btn.createSpan({ cls: "a4p-img-btn-icon" }), icon);
    if (!opts.iconOnly) btn.createSpan({ text: label });
    btn.addEventListener("click", () => void onClick(btn));
  }

  private renderUsages(parent: HTMLElement, usages: string[]): void {
    parent.querySelector(".a4p-img-preview-usages")?.remove();
    const box = parent.createDiv({ cls: "a4p-img-preview-usages" });
    if (usages.length === 0) {
      box.createDiv({ cls: "a4p-img-preview-sub", text: "이 이미지를 사용하는 노트가 없습니다." });
      return;
    }
    box.createDiv({ cls: "a4p-img-preview-usages-title", text: `사용 중인 노트 ${usages.length}개` });
    for (const path of usages) {
      const row = box.createDiv({ cls: "a4p-img-preview-row" });
      setIcon(row.createSpan({ cls: "a4p-img-preview-row-icon" }), "file-text");
      const link = row.createEl("a", { text: path, cls: "a4p-img-preview-link" });
      link.addEventListener("click", (evt) => {
        evt.preventDefault();
        this.close();
        void this.app.workspace.openLinkText(path, "", false);
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

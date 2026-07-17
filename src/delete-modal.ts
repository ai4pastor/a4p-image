import { App, Modal, Notice, setIcon } from "obsidian";
import type A4pImagePlugin from "./main";
import type { ManifestEntry } from "./types";
import { formatBytes } from "./convert";
import { findImageUsages } from "./commands";
import { DeleteItem, buildDeletePlan } from "./delete-plan";
import { executeDeletePlan } from "./delete";
import { renderThumb } from "./thumb";

/**
 * 갤러리 개별 이미지 삭제 — 이중 확인:
 * 1차(DeleteImageModal): 사용처 자동 스캔, 사용 중이면 링크 파손 강한 경고
 * 2차(DeleteImageFinalModal): 수행 내역(서버 영구 삭제·로컬 .trash/ 이동·기록 제거) 최종 확인
 */
export class DeleteImageModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private entry: ManifestEntry,
    private onDeleted?: () => void,
  ) {
    super(app);
  }

  private entryName(): string {
    const path = this.entry.localPath ?? this.entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "이미지 삭제" });
    const head = contentEl.createDiv({ cls: "a4p-image-trash-confirm-row" });
    renderThumb(this.app, head, {
      localPath: this.entry.localPath,
      url: this.entry.url ?? null,
      name: this.entryName(),
      size: this.entry.size,
    });
    head.createSpan({ cls: "a4p-image-trash-confirm-name", text: this.entryName() });
    head.createSpan({ cls: "a4p-image-trash-meta", text: formatBytes(this.entry.size) });
    contentEl.createEl("p", { text: "삭제하기 전에 사용처를 확인합니다." });

    const warnSlot = contentEl.createDiv();
    const usageBox = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    const loading = usageBox.createDiv({ cls: "a4p-image-plan-item" });
    setIcon(loading.createSpan(), "loader-2");
    loading.createSpan({ text: " 사용 중인 노트를 스캔하는 중…" });

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const nextBtn = buttons.createEl("button", { text: "삭제 계속…", cls: "mod-warning" });
    nextBtn.disabled = true;

    void findImageUsages(this.app, this.entry).then((usages) => {
      usageBox.empty();
      if (usages.length === 0) {
        usageBox.createDiv({
          cls: "a4p-image-plan-item",
          text: "이 이미지를 사용하는 노트가 없습니다.",
        });
      } else {
        warnSlot.createEl("p", {
          cls: "a4p-image-trash-warning",
          text: `⚠️ 이 이미지를 사용하는 노트 ${usages.length}개의 링크가 깨집니다!`,
        });
        for (const path of usages) {
          usageBox.createDiv({ cls: "a4p-image-plan-item", text: path });
        }
      }
      nextBtn.disabled = false;
      nextBtn.addEventListener("click", () => {
        this.close();
        new DeleteImageFinalModal(this.app, this.plugin, this.entry, usages.length, this.onDeleted).open();
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

class DeleteImageFinalModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private entry: ManifestEntry,
    private usageCount: number,
    private onDeleted?: () => void,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    const item: DeleteItem = {
      entry: this.entry,
      path: this.entry.localPath ?? this.entry.r2Key,
      size: this.entry.size,
      reason: "갤러리에서 삭제",
    };
    const plan = buildDeletePlan([item], this.plugin.r2.isConfigured());

    if (plan.blocked.length > 0) {
      contentEl.createEl("h3", { text: "삭제할 수 없습니다" });
      contentEl.createEl("p", { text: plan.blocked[0].reason });
      contentEl.createEl("p", { text: "설정에서 R2 정보를 입력한 뒤 다시 시도하세요." });
      const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
      const closeBtn = buttons.createEl("button", { text: "닫기" });
      closeBtn.addEventListener("click", () => this.close());
      return;
    }

    contentEl.createEl("h3", { text: "최종 확인 — 정말 삭제할까요?" });
    const planned = plan.items[0];
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    if (planned.deleteR2) {
      const row = listEl.createDiv({ cls: "a4p-image-plan-item a4p-image-danger" });
      row.setText("서버(R2)에 올라가 있는 이미지가 영구 삭제됩니다 — 복구할 수 없습니다.");
    }
    if (planned.localOnlyFallback) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "R2 설정이 없어 서버 객체는 남습니다 — 로컬 백업만 이동하고 갤러리 기록은 유지됩니다.",
      });
    }
    if (planned.trashLocal) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "로컬 백업은 볼트 .trash/ 폴더로 이동합니다 (복구 가능).",
      });
    }
    if (planned.removeEntry) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "갤러리(매니페스트) 기록이 제거됩니다.",
      });
    }
    if (this.usageCount > 0) {
      contentEl.createEl("p", {
        cls: "a4p-image-trash-warning",
        text: `⚠️ 노트 ${this.usageCount}개에서 이 이미지 링크가 깨집니다.`,
      });
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", { text: "삭제 실행", cls: "mod-warning" });
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      void executeDeletePlan(this.plugin, plan).then((result) => {
        this.close();
        if (result.failures.length === 0) this.onDeleted?.();
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

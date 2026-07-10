import { App, Modal, Notice, TFile } from "obsidian";
import type A4pImagePlugin from "./main";
import { formatBytes } from "./convert";

export interface TrashCandidate {
  path: string;
  size: number;
  reason: string;
}

/**
 * 미사용 이미지 휴지통 이동 — 절대 원칙:
 * 자동 삭제 없음, 사용자가 체크박스로 직접 선택 + 최종 확인 후에만
 * vault.trash(file, false)로 볼트 .trash/ 폴더에 이동한다 (영구 삭제 아님, 복구 가능).
 */
export class TrashSelectModal extends Modal {
  private selected = new Set<string>();

  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private candidates: TrashCandidate[],
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "미사용 이미지 휴지통 이동" });
    contentEl.createEl("p", {
      text: `미사용으로 판정된 이미지 ${this.candidates.length}개입니다. 이동할 항목을 직접 선택하세요.`,
    });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-warning",
      text: "선택한 파일은 삭제되지 않고 볼트의 .trash/ 폴더로 이동합니다 (복구 가능).",
    });

    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });

    const selectAll = listEl.createDiv({ cls: "a4p-image-plan-item" });
    const allCheckbox = selectAll.createEl("input", { type: "checkbox" });
    selectAll.createSpan({ text: "모두 선택" });
    const itemCheckboxes: HTMLInputElement[] = [];
    allCheckbox.addEventListener("change", () => {
      for (const cb of itemCheckboxes) {
        cb.checked = allCheckbox.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });

    for (const cand of this.candidates) {
      const item = listEl.createDiv({ cls: "a4p-image-plan-item" });
      const cb = item.createEl("input", { type: "checkbox" });
      itemCheckboxes.push(cb);
      item.createSpan({ text: `${cand.path} (${formatBytes(cand.size)})` });
      item.createSpan({ cls: "dedup", text: cand.reason });
      cb.addEventListener("change", () => {
        if (cb.checked) this.selected.add(cand.path);
        else this.selected.delete(cand.path);
      });
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const moveBtn = buttons.createEl("button", { text: "선택 항목 휴지통 이동…", cls: "mod-warning" });
    moveBtn.addEventListener("click", () => {
      if (this.selected.size === 0) {
        new Notice("선택된 항목이 없습니다.");
        return;
      }
      this.close();
      new TrashConfirmModal(this.app, this.plugin, [...this.selected]).open();
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** 이중 승인 — 이동 직전 대상 경로를 다시 보여주고 최종 확인 */
class TrashConfirmModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private paths: string[],
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "최종 확인" });
    contentEl.createEl("p", { text: `다음 ${this.paths.length}개 파일을 볼트 .trash/ 폴더로 이동합니다:` });
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const p of this.paths) {
      listEl.createDiv({ cls: "a4p-image-plan-item", text: p });
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", { text: `${this.paths.length}개 이동 실행`, cls: "mod-warning" });
    confirmBtn.addEventListener("click", () => {
      this.close();
      void this.execute();
    });
  }

  private async execute(): Promise<void> {
    let moved = 0;
    const failures: string[] = [];
    for (const path of this.paths) {
      const file = this.plugin.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile)) {
        failures.push(`${path}: 파일을 찾을 수 없습니다.`);
        continue;
      }
      try {
        // system=false → 볼트 내부 .trash/ 폴더로 이동 (영구 삭제 아님)
        await this.plugin.app.vault.trash(file, false);
        moved++;
      } catch (e) {
        failures.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    let msg = `${moved}개 파일을 .trash/로 이동했습니다.`;
    if (failures.length > 0) {
      msg += ` 실패 ${failures.length}건 (콘솔 참고).`;
      console.error("[a4p-image] 휴지통 이동 실패:\n" + failures.join("\n"));
    }
    new Notice(msg, 8000);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

import { App, Modal, Notice, Setting, TFile } from "obsidian";
import type A4pImagePlugin from "./main";
import { normalizeBase, replaceUrlPrefix } from "./migrate";

/**
 * 이미지 주소 일괄 변경 — r2.dev → 커스텀 도메인 전환, 잘못 입력한 base URL 복구용.
 * 스캔(dry-run)으로 대상 노트·건수를 확인한 뒤에만 실행할 수 있다.
 */
export class MigrateUrlModal extends Modal {
  private oldBase: string;
  private newBase: string;
  private scanResult: { files: TFile[]; occurrences: number } | null = null;
  private statusEl!: HTMLElement;
  private runBtn!: HTMLButtonElement;

  constructor(
    app: App,
    private plugin: A4pImagePlugin,
  ) {
    super(app);
    this.newBase = normalizeBase(plugin.settings.r2.publicBaseUrl);
    // 매니페스트에서 현재 설정과 다른 base를 발견하면 옛 주소 기본값으로 제안
    this.oldBase = this.suggestOldBase();
  }

  private suggestOldBase(): string {
    const current = normalizeBase(this.plugin.settings.r2.publicBaseUrl);
    for (const entry of this.plugin.manifestStore.all()) {
      const m = entry.url.match(/^(https?:\/\/[^/]+)/);
      if (m && m[1] !== current) return m[1];
    }
    return "";
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "이미지 주소 일괄 변경" });
    contentEl.createEl("p", {
      cls: "a4p-image-settings-status-line",
      text:
        "볼트 전체 노트에서 '옛 주소'로 시작하는 링크를 '새 주소'로 바꿉니다. " +
        "커스텀 도메인 전환이나 잘못 입력된 주소 복구에 사용하세요. 먼저 스캔으로 대상을 확인해야 실행할 수 있습니다.",
    });

    new Setting(contentEl)
      .setName("옛 주소 (base URL)")
      .addText((text) =>
        text
          .setPlaceholder("https://pub-xxxx.r2.dev")
          .setValue(this.oldBase)
          .onChange((v) => {
            this.oldBase = v;
            this.invalidateScan();
          }),
      );

    new Setting(contentEl)
      .setName("새 주소 (base URL)")
      .addText((text) =>
        text
          .setPlaceholder("https://img.example.com")
          .setValue(this.newBase)
          .onChange((v) => {
            this.newBase = v;
            this.invalidateScan();
          }),
      );

    this.statusEl = contentEl.createDiv({ cls: "a4p-image-settings-status" });

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const scanBtn = buttons.createEl("button", { text: "스캔 (dry-run)", cls: "mod-cta" });
    scanBtn.addEventListener("click", () => void this.scan());
    this.runBtn = buttons.createEl("button", { text: "치환 실행" });
    this.runBtn.disabled = true;
    this.runBtn.addEventListener("click", () => void this.execute());
  }

  private invalidateScan(): void {
    this.scanResult = null;
    this.runBtn.disabled = true;
    this.statusEl.empty();
  }

  private validate(): string | null {
    const from = normalizeBase(this.oldBase);
    const to = normalizeBase(this.newBase);
    if (!from.startsWith("http")) return "옛 주소는 http(s)://로 시작해야 합니다.";
    if (!to.startsWith("http")) return "새 주소는 http(s)://로 시작해야 합니다.";
    if (from === to) return "옛 주소와 새 주소가 같습니다.";
    return null;
  }

  private async scan(): Promise<void> {
    const error = this.validate();
    if (error) {
      new Notice(error);
      return;
    }
    this.statusEl.empty();
    this.statusEl.createEl("p", { text: "스캔 중…", cls: "a4p-image-settings-status-line" });

    const from = normalizeBase(this.oldBase);
    const files: TFile[] = [];
    let occurrences = 0;
    for (const md of this.app.vault.getMarkdownFiles()) {
      const content = await this.app.vault.cachedRead(md);
      const count = content.split(`${from}/`).length - 1;
      if (count > 0) {
        files.push(md);
        occurrences += count;
      }
    }
    this.scanResult = { files, occurrences };

    this.statusEl.empty();
    if (files.length === 0) {
      this.statusEl.createEl("p", {
        text: "옛 주소를 사용하는 노트가 없습니다.",
        cls: "a4p-image-settings-status-line",
      });
      this.runBtn.disabled = true;
      return;
    }
    this.statusEl.createEl("p", {
      text: `노트 ${files.length}개에서 링크 ${occurrences}건이 발견되었습니다. 아래 목록을 확인 후 실행하세요.`,
      cls: "a4p-image-settings-status-line",
    });
    const listEl = this.statusEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const f of files) listEl.createDiv({ cls: "a4p-image-plan-item", text: f.path });
    this.runBtn.disabled = false;
  }

  private async execute(): Promise<void> {
    if (!this.scanResult) return;
    const from = normalizeBase(this.oldBase);
    const to = normalizeBase(this.newBase);

    let replaced = 0;
    for (const md of this.scanResult.files) {
      await this.app.vault.process(md, (content) => {
        const result = replaceUrlPrefix(content, from, to);
        replaced += result.count;
        return result.content;
      });
    }

    // 매니페스트의 URL도 함께 갱신
    let manifestFixed = 0;
    for (const entry of this.plugin.manifestStore.all()) {
      if (entry.url.startsWith(`${from}/`)) {
        this.plugin.manifestStore.update(entry.id, { url: `${to}/${entry.url.slice(from.length + 1)}` });
        manifestFixed++;
      }
    }

    this.close();
    new Notice(
      `주소 변경 완료 — 노트 ${this.scanResult.files.length}개에서 링크 ${replaced}건, 매니페스트 ${manifestFixed}건 갱신.`,
      8000,
    );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

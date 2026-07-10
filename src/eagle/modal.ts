import { App, Editor, FuzzySuggestModal, Notice, TFile } from "obsidian";
import type A4pImagePlugin from "../main";
import { EagleClient, EagleItem } from "./client";
import { formatBytes } from "../convert";
import { mimeForExt } from "../filename";

/**
 * Eagle 라이브러리 검색 → 선택한 이미지를 표준 업로드 파이프라인(로컬 백업 + R2)에 태워 URL 삽입.
 * 데스크톱 전용 (localhost API + 절대 경로 파일 읽기).
 */
export class EagleSearchModal extends FuzzySuggestModal<EagleItem> {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private editor: Editor,
    private sourceNote: TFile | null,
    private items: EagleItem[],
    private libraryPath: string,
  ) {
    super(app);
    this.setPlaceholder("Eagle 이미지 검색 (이름·태그·메모)");
  }

  static async open(plugin: A4pImagePlugin, editor: Editor, sourceNote: TFile | null): Promise<void> {
    const client = plugin.eagle;
    if (!(await client.isAvailable())) {
      new Notice("Eagle 앱이 실행 중이 아닙니다. Eagle을 먼저 실행하세요.");
      return;
    }
    const [items, libraryPath] = await Promise.all([client.searchImages(), client.libraryPath()]);
    if (!libraryPath) {
      new Notice("Eagle 라이브러리 경로를 가져오지 못했습니다.");
      return;
    }
    if (items.length === 0) {
      new Notice("Eagle 라이브러리에 이미지가 없습니다.");
      return;
    }
    new EagleSearchModal(plugin.app, plugin, editor, sourceNote, items, libraryPath).open();
  }

  getItems(): EagleItem[] {
    return this.items;
  }

  getItemText(item: EagleItem): string {
    return [item.name, ...(item.tags ?? []), item.annotation ?? ""].join(" ");
  }

  renderSuggestion(match: { item: EagleItem }, el: HTMLElement): void {
    const item = match.item;
    el.empty();
    const row = el.createDiv({ cls: "a4p-image-eagle-suggestion" });
    const img = row.createEl("img", { cls: "a4p-image-eagle-thumb" });
    void this.plugin.eagle.thumbnailPath(item.id).then((thumb) => {
      if (thumb) img.src = `file://${encodeURI(thumb.replace(/\\/g, "/"))}`;
    });
    const textEl = row.createDiv();
    textEl.createDiv({ text: `${item.name}.${item.ext}` });
    const metaParts = [formatBytes(item.size ?? 0)];
    if (item.width && item.height) metaParts.push(`${item.width}×${item.height}`);
    if (item.tags?.length) metaParts.push(item.tags.slice(0, 5).join(", "));
    textEl.createDiv({ cls: "a4p-image-eagle-meta", text: metaParts.join(" · ") });
  }

  onChooseItem(item: EagleItem): void {
    void this.insertItem(item);
  }

  private async insertItem(item: EagleItem): Promise<void> {
    const filePath = this.plugin.eagle.itemFilePath(this.libraryPath, item);
    const buf = readLocalFile(filePath);
    if (!buf) {
      new Notice(`Eagle 원본 파일을 읽지 못했습니다: ${filePath}`);
      return;
    }

    const notice = new Notice(`Eagle 이미지 업로드 중: ${item.name}…`, 0);
    try {
      const outcome = await this.plugin.uploader.process(buf, {
        name: `${item.name}.${item.ext}`,
        mime: mimeForExt(item.ext),
        sourceNotePath: this.sourceNote?.path ?? null,
        origin: "eagle",
      });
      notice.hide();
      if (outcome.ok) {
        this.editor.replaceSelection(`![${outcome.stem}](${outcome.url})`);
        const entry = this.plugin.manifestStore.get(outcome.entryId);
        if (entry && !entry.eagleId) this.plugin.manifestStore.update(entry.id, { eagleId: item.id });
      } else if (outcome.localPath && this.plugin.settings.fallbackToLocalEmbed) {
        this.editor.replaceSelection(`![[${outcome.localPath}]]`);
        new Notice(`업로드 실패 — 로컬로 임베드했습니다. (${outcome.error})`, 8000);
      } else {
        new Notice(`업로드 실패: ${outcome.error}`, 8000);
      }
    } catch (e) {
      notice.hide();
      new Notice(`Eagle 이미지 처리 실패: ${e instanceof Error ? e.message : String(e)}`, 8000);
    }
  }
}

/** 데스크톱에서만 동작 — Electron의 node fs로 볼트 밖 절대 경로 파일을 읽는다 */
function readLocalFile(absPath: string): ArrayBuffer | null {
  try {
    const req = (window as unknown as { require?: (m: string) => unknown }).require;
    if (!req) return null;
    const fs = req("fs") as typeof import("fs");
    const buf = fs.readFileSync(absPath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}

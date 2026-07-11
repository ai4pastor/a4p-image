import { Editor, MarkdownFileInfo, MarkdownView, Notice, TFile } from "obsidian";
import type A4pImagePlugin from "./main";

/**
 * cmds-eagle 패턴: 동기 게이트로 처리 여부 판단 → preventDefault → 비동기 처리.
 * 이미지가 아니거나 텍스트가 섞여 있으면 네이티브 동작에 양보한다.
 */
export function registerPasteHandlers(plugin: A4pImagePlugin): void {
  let warnedNotConfigured = false;

  const gate = (files: File[], hasText: boolean): boolean => {
    if (files.length === 0) return false;
    if (!files.every((f) => f.type.startsWith("image/"))) return false;
    // 텍스트+이미지 혼합(Word 복사 등)은 네이티브에 양보 — 텍스트 유실 방지
    if (hasText) return false;
    if (!plugin.r2.isConfigured()) {
      if (!warnedNotConfigured) {
        warnedNotConfigured = true;
        new Notice("A4P Image: R2 설정이 없어 기본 붙여넣기로 처리합니다. 설정에서 R2 정보를 입력하세요.");
      }
      return false;
    }
    return true;
  };

  plugin.registerEvent(
    plugin.app.workspace.on("editor-paste", (evt, editor, info) => {
      if (evt.defaultPrevented) return;
      const data = evt.clipboardData;
      if (!data) return;
      const files = Array.from(data.files);
      if (!gate(files, !!data.getData("text/plain"))) return;
      evt.preventDefault();
      void handleImages(plugin, files, editor, info, "paste");
    }),
  );

  plugin.registerEvent(
    plugin.app.workspace.on("editor-drop", (evt, editor, info) => {
      if (evt.defaultPrevented) return;
      const data = evt.dataTransfer;
      if (!data) return;
      const files = Array.from(data.files);
      if (!gate(files, false)) return;
      evt.preventDefault();
      void handleImages(plugin, files, editor, info, "drop");
    }),
  );
}

async function handleImages(
  plugin: A4pImagePlugin,
  files: File[],
  editor: Editor,
  info: MarkdownView | MarkdownFileInfo,
  origin: "paste" | "drop",
): Promise<void> {
  const sourceNote = info.file ?? plugin.app.workspace.getActiveFile();

  for (const file of files) {
    const displayName = file.name || "이미지";
    const placeholder = `![업로드 중 ${displayName}…](a4pimg://${Math.random().toString(36).slice(2, 10)})`;
    editor.replaceSelection(placeholder);

    let finalText: string;
    try {
      const buf = await file.arrayBuffer();
      const outcome = await plugin.uploader.process(buf, {
        name: origin === "drop" && file.name ? file.name : undefined,
        mime: file.type,
        sourceNotePath: sourceNote?.path ?? null,
        origin,
      });

      if (outcome.ok) {
        finalText = `![${outcome.stem}](${outcome.url})`;
        if (outcome.reused) new Notice("이미 업로드된 이미지 — 기존 URL을 재사용했습니다.");
      } else if (outcome.localPath && plugin.settings.fallbackToLocalEmbed) {
        finalText = `![[${outcome.localPath}]]`;
        new Notice(
          `업로드 실패 — 로컬로 임베드했습니다. 나중에 '실패한 업로드 재시도'를 실행하세요.\n(${outcome.error})`,
          8000,
        );
      } else {
        finalText = "";
        new Notice(`이미지 업로드 실패: ${outcome.error}`, 8000);
      }
    } catch (e) {
      finalText = "";
      new Notice(`이미지 처리 실패: ${e instanceof Error ? e.message : String(e)}`, 8000);
    }

    await replacePlaceholder(plugin, editor, sourceNote, placeholder, finalText);
  }
}

async function replacePlaceholder(
  plugin: A4pImagePlugin,
  editor: Editor,
  sourceNote: TFile | null,
  placeholder: string,
  replacement: string,
): Promise<void> {
  // 1차: 에디터 안에서 오프셋 기반 치환 (커서 이동·추가 입력에도 안전)
  const content = editor.getValue();
  const index = content.indexOf(placeholder);
  if (index >= 0) {
    const from = editor.offsetToPos(index);
    const to = editor.offsetToPos(index + placeholder.length);
    editor.replaceRange(replacement, from, to);
    return;
  }
  // 2차: 사용자가 다른 노트로 이동한 경우 — 파일에서 직접 치환
  if (sourceNote) {
    await plugin.app.vault.process(sourceNote, (text) =>
      text.includes(placeholder) ? text.split(placeholder).join(replacement) : text,
    );
  }
}

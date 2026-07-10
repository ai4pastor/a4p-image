import { App, MarkdownView, Notice, Plugin } from "obsidian";

/**
 * a4p-readwise-search의 삽입 패턴: 마지막으로 활성이었던 마크다운 뷰를 기억해서
 * 갤러리(사이드 패널)에 포커스가 있어도 본문 에디터에 삽입할 수 있게 한다.
 */
let lastMarkdownView: MarkdownView | null = null;

export function registerEditorTracker(plugin: Plugin): void {
  const app = plugin.app;
  const seed = app.workspace.getActiveViewOfType(MarkdownView);
  if (seed) lastMarkdownView = seed;
  plugin.registerEvent(
    app.workspace.on("active-leaf-change", (leaf) => {
      if (leaf && leaf.view instanceof MarkdownView) {
        lastMarkdownView = leaf.view;
      }
    }),
  );
}

function findTargetMarkdownView(app: App): MarkdownView | null {
  const leaves = app.workspace.getLeavesOfType("markdown");
  if (lastMarkdownView) {
    const stillOpen = leaves.some((l) => l.view === lastMarkdownView);
    if (stillOpen) return lastMarkdownView;
    lastMarkdownView = null;
  }
  const active = app.workspace.getActiveViewOfType(MarkdownView);
  if (active) return active;
  for (const leaf of leaves) {
    if (leaf.view instanceof MarkdownView) return leaf.view;
  }
  return null;
}

/** 마지막 활성 에디터의 커서 위치에 텍스트 삽입 — 대상이 없으면 false */
export function insertAtEditor(app: App, text: string): boolean {
  const view = findTargetMarkdownView(app);
  if (!view) {
    new Notice("이미지를 삽입할 마크다운 노트를 먼저 열어주세요.");
    return false;
  }
  const editor = view.editor;
  editor.replaceRange(text, editor.getCursor());
  new Notice(`${view.file?.basename ?? "노트"}에 삽입했습니다.`);
  return true;
}

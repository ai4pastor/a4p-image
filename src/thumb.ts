import { App, Modal, TFile, setIcon } from "obsidian";
import { formatBytes } from "./convert";

export interface ThumbSource {
  /** 볼트 상대 경로 — 로컬 백업이 있으면 이걸 우선 사용 */
  localPath: string | null;
  /** R2 공개 URL — 로컬이 없을 때 폴백 */
  url: string | null;
  name: string;
  size: number;
  /** 지정하면 이미지 로드 없이 이 lucide 아이콘만 표시 (이미지 외 첨부용, 확대 없음) */
  icon?: string;
}

/** 이미지 외 첨부의 확장자별 lucide 아이콘 */
export function attachmentIconFor(ext: string): string {
  const e = ext.toLowerCase();
  if (["mp3", "m4a", "wav", "ogg", "flac"].includes(e)) return "file-audio";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(e)) return "file-video";
  if (["zip", "7z", "rar", "gz"].includes(e)) return "file-archive";
  if (["xls", "xlsx", "csv"].includes(e)) return "file-spreadsheet";
  if (["pdf", "doc", "docx", "ppt", "pptx", "hwp", "hwpx", "epub"].includes(e)) return "file-text";
  return "paperclip";
}

/** 로컬 백업 → 리소스 경로, 없으면 클라우드 URL, 둘 다 없으면 null */
export function resolveImageSrc(app: App, localPath: string | null, url: string | null): string | null {
  if (localPath) {
    const file = app.vault.getAbstractFileByPath(localPath);
    if (file instanceof TFile) return app.vault.getResourcePath(file);
  }
  return url || null;
}

/**
 * 공용 썸네일 — 삭제 확인 계열 모달에서 이미지가 눈으로 확인되도록.
 * 클릭하면 경량 확대 모달(ImageZoomModal)이 위에 뜨고, 아래 모달의 선택 상태는 유지된다.
 * 로드 실패·소스 없음이면 image-off 플레이스홀더.
 */
export function renderThumb(
  app: App,
  parent: HTMLElement,
  source: ThumbSource,
  opts: { small?: boolean } = {},
): HTMLElement {
  const wrap = parent.createDiv({
    cls: `a4p-image-trash-thumb${opts.small ? " a4p-image-trash-thumb--sm" : ""}`,
  });
  if (source.icon) {
    setIcon(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), source.icon);
    return wrap;
  }
  const src = resolveImageSrc(app, source.localPath, source.url);
  if (!src) {
    setIcon(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    wrap.title = "미리보기를 표시할 수 없습니다";
    return wrap;
  }
  const img = wrap.createEl("img");
  img.src = src;
  img.alt = source.name;
  img.addEventListener("error", () => {
    wrap.empty();
    setIcon(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    wrap.title = "이미지를 불러오지 못했습니다";
  });
  wrap.addClass("is-zoomable");
  wrap.title = "클릭하면 크게 봅니다";
  wrap.addEventListener("click", (evt) => {
    evt.stopPropagation();
    new ImageZoomModal(app, source).open();
  });
  return wrap;
}

/** 확대 전용 경량 모달 — 액션 없음, 이미지 + 파일명 + 크기만 (선택 모달 위에 스택) */
export class ImageZoomModal extends Modal {
  constructor(
    app: App,
    private source: ThumbSource,
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("a4p-img-preview-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("a4p-img-preview");

    const imgWrap = contentEl.createDiv({ cls: "a4p-img-preview-imgwrap" });
    const src = resolveImageSrc(this.app, this.source.localPath, this.source.url);
    if (src) {
      const img = imgWrap.createEl("img");
      img.src = src;
      img.alt = this.source.name;
    } else {
      setIcon(imgWrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    }

    const body = contentEl.createDiv({ cls: "a4p-img-preview-body" });
    body.createDiv({ cls: "a4p-img-preview-name", text: this.source.name });
    body.createDiv({ cls: "a4p-img-preview-sub", text: formatBytes(this.source.size) });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

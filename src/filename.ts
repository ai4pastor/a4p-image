/** 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상) */
import { awsUriEncode } from "./r2/sigv4";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/avif": "avif",
};

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  avif: "image/avif",
};

export function extForMime(mime: string): string | null {
  return MIME_TO_EXT[mime.toLowerCase()] ?? null;
}

export function mimeForExt(ext: string): string {
  return EXT_TO_MIME[ext.toLowerCase()] ?? "application/octet-stream";
}

export function isImageExt(ext: string, allowed: string[]): boolean {
  return allowed.includes(ext.toLowerCase());
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|#^[\]]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function stemOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i > 0 ? filename.slice(0, i) : filename;
}

export function extOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

export function randSuffix(len = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `img-YYYYMMDD-HHmmss-rand4` — 붙여넣기 이미지 기본 이름 */
export function makeImageBaseName(date: Date, rand: string): string {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `img-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}

/** drop/convert처럼 원본 이름이 있을 때 — stem 보존 + 충돌 방지 접미 */
export function makeNamedBaseName(originalName: string, rand: string): string {
  const stem = sanitizeFilename(stemOf(originalName));
  return stem ? `${stem}-${rand}` : `img-${rand}`;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 노트 제목 기반 이름: `{제목}_{n}.{ext}` — n은 기존 파일들의 최대 번호 +1.
 * existingNames에는 대상 폴더의 파일명(경로 제외)들을 넘긴다.
 */
export function nextNoteImageName(noteTitle: string, existingNames: string[], ext: string): string {
  const title = sanitizeFilename(noteTitle) || "img";
  const re = new RegExp(`^${escapeRegExp(title)}_(\\d+)\\.`);
  let max = 0;
  for (const name of existingNames) {
    const m = name.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${title}_${max + 1}.${ext}`;
}

/** R2 키: `{prefix}/{YYYY}/{MM}/{filename}` — prefix 비면 날짜부터 */
export function makeR2Key(prefix: string, date: Date, filename: string): string {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const parts = cleanPrefix ? [cleanPrefix, String(y), m, filename] : [String(y), m, filename];
  return parts.join("/");
}

/**
 * 공개 URL: base 끝 슬래시 정규화 + 키 인코딩.
 * 괄호·공백까지 인코딩해야 마크다운 `![alt](url)` 문법이 깨지지 않는다 (AWS 규칙과 동일).
 */
export function publicUrlFor(publicBaseUrl: string, key: string): string {
  const base = publicBaseUrl.replace(/\/+$/g, "");
  return `${base}/${awsUriEncode(key, false)}`;
}

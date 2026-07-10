/**
 * 업로드 전 이미지 최적화 — 캔버스 재인코딩으로 리사이즈·WebP 변환.
 * 재인코딩 과정에서 EXIF(GPS 위치·기기 정보 등)가 자연히 제거되어
 * 공개 URL로 올라가는 이미지의 개인정보 노출을 막는다.
 * 웹 표준 API(createImageBitmap/canvas)만 사용 — 모바일 호환.
 */

export interface CompressSettings {
  enabled: boolean;
  /** 최대 폭(px) — 이보다 크면 비율 유지 축소. 0 = 제한 없음 */
  maxWidth: number;
  /** 0.5~1.0 — WebP/JPEG 인코딩 품질 */
  quality: number;
  convertToWebp: boolean;
}

/** svg(벡터)·gif(애니메이션 소실)는 재인코딩 대상에서 제외 */
const COMPRESSIBLE = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/avif"]);

export function isCompressible(mime: string): boolean {
  return COMPRESSIBLE.has(mime.toLowerCase());
}

export interface CompressResult {
  buf: ArrayBuffer;
  mime: string;
}

/** 압축 결과가 원본보다 크거나 실패하면 null (원본 사용) */
export async function compressImage(
  buf: ArrayBuffer,
  mime: string,
  opts: CompressSettings,
): Promise<CompressResult | null> {
  if (!isCompressible(mime)) return null;
  try {
    const blob = new Blob([buf], { type: mime });
    const bitmap = await createImageBitmap(blob);
    const scale = opts.maxWidth > 0 && bitmap.width > opts.maxWidth ? opts.maxWidth / bitmap.width : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // WebP 변환 끔 + PNG 원본이면 PNG 유지(무손실), 그 외는 품질 적용
    const targetMime = opts.convertToWebp ? "image/webp" : mime === "image/png" ? "image/png" : "image/jpeg";
    const quality = targetMime === "image/png" ? undefined : clampQuality(opts.quality);
    const outBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetMime, quality));
    if (!outBlob) return null;

    const outBuf = await outBlob.arrayBuffer();
    // 리사이즈 없이 용량만 커졌다면(이미 최적화된 이미지) 원본 유지
    if (scale === 1 && outBuf.byteLength >= buf.byteLength) return null;
    return { buf: outBuf, mime: targetMime };
  } catch (e) {
    console.error("[a4p-image] 이미지 압축 실패 — 원본을 사용합니다", e);
    return null;
  }
}

export function clampQuality(q: number): number {
  if (!Number.isFinite(q)) return 0.85;
  return Math.min(1, Math.max(0.5, q));
}

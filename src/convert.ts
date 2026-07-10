/** 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상) */
import { stemOf } from "./filename";

export interface EmbedRef {
  notePath: string;
  /** 노트 원문에 등장하는 임베드 텍스트 그대로 (예: `![[img.png|300]]`) */
  original: string;
  /** 임베드가 가리키는 볼트 상대 이미지 경로 */
  imagePath: string;
  /** `![[img.png|300]]`의 "300" 같은 표시 텍스트(크기·캡션) — 변환 후에도 보존 */
  alt?: string;
}

export interface ConvertPlan {
  /** 노트 경로 → 그 노트의 변환 대상 목록 */
  byNote: Map<string, EmbedRef[]>;
  /** 대상 이미지 경로(중복 제거) */
  imagePaths: string[];
  totalEmbeds: number;
}

export function buildConvertPlan(refs: EmbedRef[]): ConvertPlan {
  const byNote = new Map<string, EmbedRef[]>();
  const imageSet = new Set<string>();
  for (const ref of refs) {
    const list = byNote.get(ref.notePath) ?? [];
    list.push(ref);
    byNote.set(ref.notePath, list);
    imageSet.add(ref.imagePath);
  }
  return { byNote, imagePaths: [...imageSet], totalEmbeds: refs.length };
}

export function markdownImageText(filename: string, url: string, alt?: string): string {
  return `![${alt ?? stemOf(filename)}](${url})`;
}

/**
 * 노트 본문에서 original 텍스트들을 치환. 같은 임베드가 여러 번 등장해도 전부 치환된다.
 * 업로드에 성공한 이미지의 임베드만 replacements에 들어와야 한다 (이미지 단위 원자성).
 */
export function applyReplacements(
  content: string,
  replacements: Array<{ original: string; replacement: string }>,
): { content: string; count: number } {
  let next = content;
  let count = 0;
  for (const { original, replacement } of replacements) {
    if (!original || original === replacement) continue;
    if (next.includes(original)) {
      const parts = next.split(original);
      count += parts.length - 1;
      next = parts.join(replacement);
    }
  }
  return { content: next, count };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

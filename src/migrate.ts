/** 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상) */

export function normalizeBase(url: string): string {
  return url.trim().replace(/\/+$/g, "");
}

/**
 * oldBase로 시작하는 URL의 앞부분을 newBase로 교체.
 * `oldBase + "/"` 단위로 치환해 유사 도메인(pub-x.r2.dev.evil.com 등)의 오치환을 막는다.
 */
export function replaceUrlPrefix(
  content: string,
  oldBase: string,
  newBase: string,
): { content: string; count: number } {
  const from = normalizeBase(oldBase);
  const to = normalizeBase(newBase);
  if (!from || !to || from === to) return { content, count: 0 };
  const parts = content.split(`${from}/`);
  return { content: parts.join(`${to}/`), count: parts.length - 1 };
}

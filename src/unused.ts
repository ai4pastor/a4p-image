/** 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상) */
import type { ManifestEntry } from "./types";
import { formatBytes } from "./convert";

export interface UnusedInput {
  /** 볼트 안의 모든 이미지 파일 경로 (크기 포함) */
  images: Array<{ path: string; size: number }>;
  /** metadataCache.resolvedLinks 에서 하나 이상의 노트가 참조하는 대상 경로 집합 */
  resolvedTargets: Set<string>;
  entries: ManifestEntry[];
  /** 볼트 md 본문 어딘가에 등장하는 매니페스트 URL 집합 */
  urlsInVault: Set<string>;
}

export interface UnusedReport {
  /** (A) 완전 미사용 — 어떤 노트도 참조하지 않고 매니페스트에도 없는 로컬 이미지 */
  fullyUnused: Array<{ path: string; size: number }>;
  /** (B) 로컬 백업인데 노트에서 클라우드 URL이 사라진 것 (로컬 참조도 없음) */
  orphanedBackups: ManifestEntry[];
  /** (C) 로컬 백업이 없고 URL도 볼트에 없는 R2 고아 객체 (정보 제공용) */
  cloudOrphans: ManifestEntry[];
}

export function classifyUnused(input: UnusedInput): UnusedReport {
  const entryByLocalPath = new Map<string, ManifestEntry>();
  for (const e of input.entries) {
    if (e.localPath) entryByLocalPath.set(e.localPath, e);
  }

  const fullyUnused: Array<{ path: string; size: number }> = [];
  const orphanedBackups: ManifestEntry[] = [];

  for (const img of input.images) {
    if (input.resolvedTargets.has(img.path)) continue; // 노트가 직접 임베드 중
    const entry = entryByLocalPath.get(img.path);
    if (entry) {
      // 백업 파일 — 클라우드 URL이 볼트 어딘가에 살아 있으면 "사용 중"으로 보호
      if (!input.urlsInVault.has(entry.url)) orphanedBackups.push(entry);
    } else {
      fullyUnused.push(img);
    }
  }

  const cloudOrphans = input.entries.filter(
    (e) =>
      e.status === "uploaded" &&
      !e.localPath &&
      !input.urlsInVault.has(e.url),
  );

  return { fullyUnused, orphanedBackups, cloudOrphans };
}

export function buildReportMarkdown(report: UnusedReport, now: Date): string {
  const dateStr = now.toISOString().slice(0, 10);
  const lines: string[] = [
    "---",
    "tags:",
    "  - a4p-image-report",
    "---",
    "",
    `# 미사용 이미지 리포트 (${dateStr})`,
    "",
    "> [!info] 이 리포트는 정보 제공용입니다. 어떤 파일도 자동으로 삭제·이동되지 않습니다.",
    "> 정리하려면 명령 팔레트에서 **A4P Image: 미사용 이미지 휴지통 이동**을 실행해 직접 선택·승인하세요.",
    "",
  ];

  lines.push(`## A. 완전 미사용 로컬 이미지 (${report.fullyUnused.length}개)`);
  lines.push("", "어떤 노트도 참조하지 않고, 업로드 기록도 없는 이미지입니다.", "");
  if (report.fullyUnused.length > 0) {
    lines.push("| 파일 | 크기 |", "| --- | --- |");
    for (const img of report.fullyUnused) {
      lines.push(`| [[${img.path}]] | ${formatBytes(img.size)} |`);
    }
  } else {
    lines.push("_없음_");
  }
  lines.push("");

  lines.push(`## B. 노트에서 URL이 사라진 로컬 백업 (${report.orphanedBackups.length}개)`);
  lines.push(
    "",
    "클라우드에 업로드했지만 이제 어떤 노트에도 해당 URL이 없는 백업 파일입니다. 노트에서 이미지를 지웠다면 정리 대상일 수 있습니다.",
    "",
  );
  if (report.orphanedBackups.length > 0) {
    lines.push("| 파일 | 크기 | 업로드일 | URL |", "| --- | --- | --- | --- |");
    for (const e of report.orphanedBackups) {
      const uploaded = e.uploadedAt ? new Date(e.uploadedAt).toISOString().slice(0, 10) : "-";
      lines.push(`| [[${e.localPath}]] | ${formatBytes(e.size)} | ${uploaded} | ${e.url} |`);
    }
  } else {
    lines.push("_없음_");
  }
  lines.push("");

  lines.push(`## C. R2에만 남은 고아 객체 (${report.cloudOrphans.length}개)`);
  lines.push(
    "",
    "로컬 백업이 없고 어떤 노트에서도 URL을 쓰지 않는 클라우드 객체입니다. 이 플러그인은 R2 객체를 삭제하지 않으므로, 필요하면 Cloudflare 대시보드에서 직접 정리하세요.",
    "",
  );
  if (report.cloudOrphans.length > 0) {
    lines.push("| 키 | 크기 | 업로드일 | URL |", "| --- | --- | --- | --- |");
    for (const e of report.cloudOrphans) {
      const uploaded = e.uploadedAt ? new Date(e.uploadedAt).toISOString().slice(0, 10) : "-";
      lines.push(`| \`${e.r2Key}\` | ${formatBytes(e.size)} | ${uploaded} | ${e.url} |`);
    }
  } else {
    lines.push("_없음_");
  }
  lines.push("");

  return lines.join("\n");
}

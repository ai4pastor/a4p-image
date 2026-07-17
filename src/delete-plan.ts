/** 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상) */
import type { ManifestEntry } from "./types";

/** 삭제 후보 한 건 — entry가 null이면 매니페스트에 없는 완전 미사용 로컬 파일 */
export interface DeleteItem {
  entry: ManifestEntry | null;
  /** 표시·로컬 조회용 경로 — localPath 또는 (로컬이 없으면) r2Key */
  path: string;
  size: number;
  reason: string;
}

export interface PlannedDelete {
  item: DeleteItem;
  /** R2 서버 객체 영구 삭제 여부 */
  deleteR2: boolean;
  /** 로컬 파일 볼트 .trash/ 이동 여부 (영구 삭제 아님) */
  trashLocal: boolean;
  /** 매니페스트 엔트리 제거 여부 */
  removeEntry: boolean;
  /** R2 미설정으로 서버 삭제가 로컬 이동만으로 축소됨 — 엔트리는 유지 (r2Key 기록 보존) */
  localOnlyFallback?: boolean;
}

export interface DeletePlan {
  items: PlannedDelete[];
  /** 실행 불가 항목 — 예: R2 미설정인데 서버 삭제가 필요한 경우 */
  blocked: Array<{ item: DeleteItem; reason: string }>;
  r2Count: number;
  localCount: number;
}

/**
 * 삭제 계획 수립 — 실제 실행(R2 DELETE·vault.trash·manifest.remove)은 delete.ts가 담당.
 * 규칙:
 * - uploaded + r2Key → R2 삭제. 단 R2 미설정이면:
 *   로컬 백업이 있으면 로컬 이동만으로 축소(엔트리 유지 — r2Key 기록 보존),
 *   로컬도 없으면 blocked (할 수 있는 일이 없음)
 * - pending/failed → R2 단계 없이 로컬 + 매니페스트만
 * - 로컬 경로가 있으면 볼트 .trash/ 이동, 엔트리가 있으면 매니페스트 제거
 */
export function buildDeletePlan(items: DeleteItem[], r2Configured: boolean): DeletePlan {
  const planned: PlannedDelete[] = [];
  const blocked: DeletePlan["blocked"] = [];

  for (const item of items) {
    const entry = item.entry;
    const needsR2 = !!entry && entry.status === "uploaded" && !!entry.r2Key;
    const localPath = entry ? entry.localPath : item.path;
    if (needsR2 && !r2Configured) {
      if (localPath) {
        planned.push({ item, deleteR2: false, trashLocal: true, removeEntry: false, localOnlyFallback: true });
      } else {
        blocked.push({ item, reason: "R2 설정이 없어 서버 객체를 삭제할 수 없습니다." });
      }
      continue;
    }
    planned.push({
      item,
      deleteR2: needsR2,
      trashLocal: !!localPath,
      removeEntry: !!entry,
    });
  }

  return {
    items: planned,
    blocked,
    r2Count: planned.filter((p) => p.deleteR2).length,
    localCount: planned.filter((p) => p.trashLocal).length,
  };
}

/** 항목의 로컬 파일 경로 — 없으면 null */
export function localPathOf(planned: PlannedDelete): string | null {
  return planned.item.entry ? planned.item.entry.localPath : planned.item.path;
}

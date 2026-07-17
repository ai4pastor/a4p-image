/**
 * 삭제 계획 실행기 — 항목별 순서: R2 삭제 → 로컬 .trash/ 이동 → 매니페스트 제거.
 * r2Key의 유일한 기록이 매니페스트이므로 R2 삭제가 실패하면 해당 항목을 중단하고
 * 엔트리를 보존한다 (다음 실행 때 다시 후보로 등장 → 재시도 가능).
 * 절대 원칙: 로컬 파일은 vault.trash(file, false)만 사용 — 영구 삭제 금지.
 */
import { Notice, TFile } from "obsidian";
import type A4pImagePlugin from "./main";
import { DeletePlan, localPathOf } from "./delete-plan";

export interface DeleteFailure {
  path: string;
  stage: "r2" | "local";
  error: string;
}

export interface DeleteResult {
  done: number;
  failures: DeleteFailure[];
}

export async function executeDeletePlan(plugin: A4pImagePlugin, plan: DeletePlan): Promise<DeleteResult> {
  const failures: DeleteFailure[] = [];
  let done = 0;

  for (const planned of plan.items) {
    const entry = planned.item.entry;

    if (planned.deleteR2 && entry) {
      // 방어 가드: 동일 r2Key를 공유하는 다른 엔트리가 있으면 서버 객체는 남긴다
      const shared = plugin.manifestStore
        .all()
        .some((e) => e.id !== entry.id && e.r2Key === entry.r2Key);
      if (!shared) {
        try {
          await plugin.r2.deleteObject(entry.r2Key);
        } catch (e) {
          failures.push({
            path: planned.item.path,
            stage: "r2",
            error: e instanceof Error ? e.message : String(e),
          });
          continue; // 로컬·매니페스트 보존 → 재시도 가능
        }
      }
    }

    if (planned.trashLocal) {
      const localPath = localPathOf(planned);
      const file = localPath ? plugin.app.vault.getAbstractFileByPath(localPath) : null;
      if (file instanceof TFile) {
        try {
          await plugin.app.vault.trash(file, false); // 볼트 .trash/ — 복구 가능
        } catch (e) {
          failures.push({
            path: planned.item.path,
            stage: "local",
            error: e instanceof Error ? e.message : String(e),
          });
          // 로컬 이동 실패해도 계속 — 남은 파일은 이후 "완전 미사용"으로 재분류됨
        }
      }
    }

    if (planned.removeEntry && entry) {
      plugin.manifestStore.remove(entry.id);
    }
    done++;
  }

  await plugin.manifestStore.flush();
  plugin.refreshGalleryViews();

  let msg = `${done}개 항목 정리 완료`;
  if (plan.r2Count > 0) msg += ` (서버 삭제 ${plan.r2Count}개 포함)`;
  msg += ".";
  if (failures.length > 0) {
    msg += ` 실패 ${failures.length}건 (콘솔 참고).`;
    console.error(
      "[a4p-image] 삭제 실패:\n" + failures.map((f) => `${f.path} [${f.stage}]: ${f.error}`).join("\n"),
    );
  }
  new Notice(msg, 8000);
  return { done, failures };
}

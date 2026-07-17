import { describe, expect, it } from "vitest";
import { DeleteItem, buildDeletePlan, localPathOf } from "../src/delete-plan";
import type { ManifestEntry } from "../src/types";

function makeEntry(overrides: Partial<ManifestEntry> = {}): ManifestEntry {
  return {
    id: "e1",
    localPath: "attach/backup.png",
    r2Key: "obsidian/2026/07/backup.png",
    url: "https://pub-x.r2.dev/obsidian/2026/07/backup.png",
    hash: "h1",
    size: 1000,
    mime: "image/png",
    createdAt: 1,
    uploadedAt: 2,
    status: "uploaded",
    sourceNote: null,
    origin: "paste",
    eagleId: null,
    ...overrides,
  };
}

function item(entry: ManifestEntry | null, path?: string): DeleteItem {
  return { entry, path: path ?? entry?.localPath ?? entry?.r2Key ?? "", size: 1000, reason: "테스트" };
}

describe("buildDeletePlan", () => {
  it("uploaded 엔트리 — R2 삭제 + 로컬 이동 + 매니페스트 제거", () => {
    const plan = buildDeletePlan([item(makeEntry())], true);
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0]).toMatchObject({ deleteR2: true, trashLocal: true, removeEntry: true });
    expect(plan.r2Count).toBe(1);
    expect(plan.localCount).toBe(1);
    expect(plan.blocked).toHaveLength(0);
  });

  it("cloudOrphan (localPath null) — R2 삭제 + 매니페스트 제거, 로컬 이동 없음", () => {
    const orphan = makeEntry({ localPath: null });
    const plan = buildDeletePlan([item(orphan, orphan.r2Key)], true);
    expect(plan.items[0]).toMatchObject({ deleteR2: true, trashLocal: false, removeEntry: true });
    expect(localPathOf(plan.items[0])).toBeNull();
  });

  it("pending/failed 엔트리 — R2 단계 없이 로컬 + 매니페스트만", () => {
    const plan = buildDeletePlan(
      [item(makeEntry({ status: "pending" })), item(makeEntry({ id: "e2", status: "failed" }))],
      true,
    );
    expect(plan.items.every((p) => !p.deleteR2)).toBe(true);
    expect(plan.items.every((p) => p.trashLocal && p.removeEntry)).toBe(true);
    expect(plan.r2Count).toBe(0);
  });

  it("매니페스트 없는 완전 미사용 로컬 파일 — 로컬 이동만", () => {
    const plan = buildDeletePlan([item(null, "attach/random.png")], true);
    expect(plan.items[0]).toMatchObject({ deleteR2: false, trashLocal: true, removeEntry: false });
    expect(localPathOf(plan.items[0])).toBe("attach/random.png");
  });

  it("R2 미설정 + 로컬 백업 있음 — 로컬 이동만으로 축소, 엔트리 유지 (r2Key 기록 보존)", () => {
    const plan = buildDeletePlan([item(makeEntry())], false);
    expect(plan.blocked).toHaveLength(0);
    expect(plan.items[0]).toMatchObject({
      deleteR2: false,
      trashLocal: true,
      removeEntry: false,
      localOnlyFallback: true,
    });
    expect(plan.r2Count).toBe(0);
  });

  it("R2 미설정 + 로컬도 없음(cloudOrphan) — blocked", () => {
    const orphan = makeEntry({ localPath: null });
    const plan = buildDeletePlan([item(orphan, orphan.r2Key), item(null, "attach/random.png")], false);
    expect(plan.blocked).toHaveLength(1);
    expect(plan.blocked[0].reason).toContain("R2 설정");
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].item.path).toBe("attach/random.png");
  });

  it("R2 미설정이어도 pending/failed는 blocked가 아님", () => {
    const plan = buildDeletePlan([item(makeEntry({ status: "failed" }))], false);
    expect(plan.blocked).toHaveLength(0);
    expect(plan.items[0]).toMatchObject({ deleteR2: false, trashLocal: true, removeEntry: true });
  });
});

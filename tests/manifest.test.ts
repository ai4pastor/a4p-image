import { describe, expect, it } from "vitest";
import { ManifestIO, ManifestStore } from "../src/manifest";
import type { ManifestEntry } from "../src/types";

function memoryIO(initial: string | null = null): ManifestIO & { content: string | null } {
  const io = {
    content: initial,
    read: async () => io.content,
    write: async (c: string) => {
      io.content = c;
    },
  };
  return io;
}

function makeEntry(overrides: Partial<ManifestEntry> = {}): ManifestEntry {
  return {
    id: "img-20260710-143022-a1b2",
    localPath: "900. Settings/905. Attached file/img-20260710-143022-a1b2.png",
    r2Key: "obsidian/2026/07/img-20260710-143022-a1b2.png",
    url: "https://pub-x.r2.dev/obsidian/2026/07/img-20260710-143022-a1b2.png",
    hash: "abc123",
    size: 1000,
    mime: "image/png",
    createdAt: 1770000000000,
    uploadedAt: 1770000000001,
    status: "uploaded",
    sourceNote: "300. Sermons/test.md",
    origin: "paste",
    eagleId: null,
    ...overrides,
  };
}

describe("ManifestStore", () => {
  it("add 후 hash·localPath 인덱스로 조회", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    const entry = makeEntry();
    store.add(entry);
    expect(store.byHash("abc123")?.id).toBe(entry.id);
    expect(store.byLocalPath(entry.localPath!)?.id).toBe(entry.id);
    expect(store.get(entry.id)?.url).toBe(entry.url);
  });

  it("flush → 새 스토어 load로 왕복 유지", async () => {
    const io = memoryIO();
    const store = new ManifestStore(io);
    await store.load();
    store.add(makeEntry());
    await store.flush();
    expect(io.content).toContain("img-20260710-143022-a1b2");

    const store2 = new ManifestStore(io);
    await store2.load();
    expect(store2.all()).toHaveLength(1);
    expect(store2.byHash("abc123")).not.toBeNull();
  });

  it("handleRename — 로컬 경로 변경 추적 (paste-image-rename 방어)", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    const entry = makeEntry();
    store.add(entry);

    const oldPath = entry.localPath!;
    store.handleRename(oldPath, "attach/renamed.png");
    expect(store.byLocalPath(oldPath)).toBeNull();
    expect(store.byLocalPath("attach/renamed.png")?.id).toBe(entry.id);
    expect(store.get(entry.id)?.localPath).toBe("attach/renamed.png");
  });

  it("handleDelete — entry는 보존, localPath만 null", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    const entry = makeEntry();
    store.add(entry);

    store.handleDelete(entry.localPath!);
    expect(store.get(entry.id)).not.toBeNull();
    expect(store.get(entry.id)?.localPath).toBeNull();
    expect(store.byLocalPath(entry.localPath!)).toBeNull();
  });

  it("무관한 rename/delete는 무시", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    store.add(makeEntry());
    store.handleRename("other/file.png", "other/new.png");
    store.handleDelete("other/file.png");
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0].localPath).toBe(makeEntry().localPath);
  });

  it("update — 상태 전환과 인덱스 갱신", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    const entry = makeEntry({ status: "pending", uploadedAt: null });
    store.add(entry);
    store.update(entry.id, { status: "uploaded", uploadedAt: 123 });
    expect(store.get(entry.id)?.status).toBe("uploaded");
    expect(store.get(entry.id)?.uploadedAt).toBe(123);
  });

  it("remove — 엔트리와 인덱스를 함께 제거", async () => {
    const io = memoryIO();
    const store = new ManifestStore(io);
    await store.load();
    const entry = makeEntry();
    store.add(entry);

    store.remove(entry.id);
    expect(store.get(entry.id)).toBeNull();
    expect(store.byHash(entry.hash)).toBeNull();
    expect(store.byLocalPath(entry.localPath!)).toBeNull();
    expect(store.all()).toHaveLength(0);

    await store.flush();
    expect(io.content).not.toContain(entry.id);
  });

  it("remove — 없는 id는 no-op", async () => {
    const store = new ManifestStore(memoryIO());
    await store.load();
    store.add(makeEntry());
    store.remove("img-does-not-exist");
    expect(store.all()).toHaveLength(1);
  });

  it("손상된 JSON은 빈 매니페스트로 초기화", async () => {
    const store = new ManifestStore(memoryIO("{invalid json"));
    await store.load();
    expect(store.all()).toHaveLength(0);
  });
});

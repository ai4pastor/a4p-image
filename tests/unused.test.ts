import { describe, expect, it } from "vitest";
import { REPORT_TAG, buildReportMarkdown, classifyUnused, hasReportTag } from "../src/unused";
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

describe("classifyUnused", () => {
  it("URL이 볼트에 살아 있는 백업은 미사용으로 오판하지 않는다 (핵심 보호)", () => {
    const entry = makeEntry();
    const report = classifyUnused({
      images: [{ path: "attach/backup.png", size: 1000 }],
      attachments: [],
      resolvedTargets: new Set(),
      entries: [entry],
      urlsInVault: new Set([entry.url]),
    });
    expect(report.fullyUnused).toHaveLength(0);
    expect(report.orphanedBackups).toHaveLength(0);
    expect(report.cloudOrphans).toHaveLength(0);
  });

  it("URL이 사라진 백업은 orphanedBackups로 분류", () => {
    const entry = makeEntry();
    const report = classifyUnused({
      images: [{ path: "attach/backup.png", size: 1000 }],
      attachments: [],
      resolvedTargets: new Set(),
      entries: [entry],
      urlsInVault: new Set(),
    });
    expect(report.orphanedBackups.map((e) => e.id)).toEqual(["e1"]);
    expect(report.fullyUnused).toHaveLength(0);
  });

  it("위키링크로 참조 중인 이미지는 사용 중", () => {
    const report = classifyUnused({
      images: [{ path: "attach/used.png", size: 10 }],
      attachments: [],
      resolvedTargets: new Set(["attach/used.png"]),
      entries: [],
      urlsInVault: new Set(),
    });
    expect(report.fullyUnused).toHaveLength(0);
  });

  it("매니페스트에 없고 참조도 없는 이미지는 fullyUnused", () => {
    const report = classifyUnused({
      images: [{ path: "attach/random.png", size: 10 }],
      attachments: [],
      resolvedTargets: new Set(),
      entries: [],
      urlsInVault: new Set(),
    });
    expect(report.fullyUnused.map((i) => i.path)).toEqual(["attach/random.png"]);
  });

  it("로컬 백업이 사라지고 URL도 안 쓰이는 업로드 항목은 cloudOrphans", () => {
    const orphan = makeEntry({ id: "e2", localPath: null });
    const pendingNoLocal = makeEntry({ id: "e3", localPath: null, status: "pending" });
    const report = classifyUnused({
      images: [],
      attachments: [],
      resolvedTargets: new Set(),
      entries: [orphan, pendingNoLocal],
      urlsInVault: new Set(),
    });
    expect(report.cloudOrphans.map((e) => e.id)).toEqual(["e2"]); // pending은 제외
  });

  it("로컬 백업이 폴백 임베드로 직접 참조되는 경우도 사용 중", () => {
    const entry = makeEntry({ status: "failed" });
    const report = classifyUnused({
      images: [{ path: "attach/backup.png", size: 1000 }],
      attachments: [],
      resolvedTargets: new Set(["attach/backup.png"]),
      entries: [entry],
      urlsInVault: new Set(),
    });
    expect(report.orphanedBackups).toHaveLength(0);
    expect(report.fullyUnused).toHaveLength(0);
  });

  it("어떤 노트도 참조하지 않는 첨부만 unusedAttachments로 분류", () => {
    const report = classifyUnused({
      images: [],
      attachments: [
        { path: "attach/설교자료.pdf", size: 5000 },
        { path: "attach/찬양.mp3", size: 9000 },
      ],
      resolvedTargets: new Set(["attach/찬양.mp3"]), // 노트(또는 캔버스)가 참조 중
      entries: [],
      urlsInVault: new Set(),
    });
    expect(report.unusedAttachments.map((a) => a.path)).toEqual(["attach/설교자료.pdf"]);
  });

  it("첨부는 이미지 분류(fullyUnused)와 섞이지 않는다", () => {
    const report = classifyUnused({
      images: [{ path: "attach/img.png", size: 10 }],
      attachments: [{ path: "attach/doc.pdf", size: 20 }],
      resolvedTargets: new Set(),
      entries: [],
      urlsInVault: new Set(),
    });
    expect(report.fullyUnused.map((i) => i.path)).toEqual(["attach/img.png"]);
    expect(report.unusedAttachments.map((a) => a.path)).toEqual(["attach/doc.pdf"]);
  });
});

describe("hasReportTag", () => {
  it("리포트 태그를 # 접두어 유무와 무관하게 인식", () => {
    expect(hasReportTag([REPORT_TAG])).toBe(true);
    expect(hasReportTag([`#${REPORT_TAG}`])).toBe(true);
    expect(hasReportTag(["#other", `#${REPORT_TAG}`])).toBe(true);
  });

  it("무관한 태그·빈 목록·null은 false", () => {
    expect(hasReportTag(["#sermon", "image"])).toBe(false);
    expect(hasReportTag([])).toBe(false);
    expect(hasReportTag(null)).toBe(false);
    expect(hasReportTag(undefined)).toBe(false);
  });
});

describe("buildReportMarkdown", () => {
  it("4개 섹션과 안전 안내가 포함된다", () => {
    const md = buildReportMarkdown(
      {
        fullyUnused: [{ path: "attach/a.png", size: 2048 }],
        orphanedBackups: [makeEntry()],
        cloudOrphans: [makeEntry({ id: "e9", localPath: null })],
        unusedAttachments: [{ path: "attach/자료.pdf", size: 4096 }],
      },
      new Date("2026-07-10T12:00:00Z"),
    );
    expect(md).toContain("# 미사용 이미지·첨부 리포트 (2026-07-10)");
    expect(md).toContain("## A. 완전 미사용 로컬 이미지 (1개)");
    expect(md).toContain("## B. 노트에서 URL이 사라진 로컬 백업 (1개)");
    expect(md).toContain("## C. R2에만 남은 고아 객체 (1개)");
    expect(md).toContain("## D. 노트에 연결되지 않은 첨부 파일 (1개)");
    expect(md).toContain("자동으로 삭제·이동되지 않습니다");
    expect(md).toContain("[[attach/a.png]]");
    expect(md).toContain("[[attach/자료.pdf]]");
    expect(md).toContain("2.0 KB");
  });
});

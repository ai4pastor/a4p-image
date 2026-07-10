import { describe, expect, it } from "vitest";
import {
  extForMime,
  extOf,
  isImageExt,
  makeImageBaseName,
  makeNamedBaseName,
  makeR2Key,
  mimeForExt,
  publicUrlFor,
  randSuffix,
  sanitizeFilename,
  stemOf,
} from "../src/filename";

describe("mime ↔ ext", () => {
  it("주요 이미지 MIME 매핑", () => {
    expect(extForMime("image/png")).toBe("png");
    expect(extForMime("image/jpeg")).toBe("jpg");
    expect(extForMime("IMAGE/WEBP")).toBe("webp");
    expect(extForMime("application/pdf")).toBeNull();
  });

  it("확장자 → MIME (미지원은 octet-stream)", () => {
    expect(mimeForExt("PNG")).toBe("image/png");
    expect(mimeForExt("jpeg")).toBe("image/jpeg");
    expect(mimeForExt("xyz")).toBe("application/octet-stream");
  });

  it("isImageExt는 대소문자 무시", () => {
    expect(isImageExt("PNG", ["png", "jpg"])).toBe(true);
    expect(isImageExt("pdf", ["png", "jpg"])).toBe(false);
  });
});

describe("sanitizeFilename", () => {
  it("금지 문자·위키링크 문자를 -로 치환", () => {
    expect(sanitizeFilename('a/b:c*d?e"f<g>h|i')).toBe("a-b-c-d-e-f-g-h-i");
    expect(sanitizeFilename("img[1]#tag^x")).toBe("img-1-tag-x");
  });

  it("공백 정규화와 길이 제한", () => {
    expect(sanitizeFilename("  a   b  ")).toBe("a b");
    expect(sanitizeFilename("x".repeat(200)).length).toBe(120);
  });
});

describe("이름 생성", () => {
  const date = new Date(2026, 6, 10, 14, 30, 22); // 로컬 2026-07-10 14:30:22

  it("makeImageBaseName — img-YYYYMMDD-HHmmss-rand", () => {
    expect(makeImageBaseName(date, "a1b2")).toBe("img-20260710-143022-a1b2");
  });

  it("makeNamedBaseName — stem 보존 + 접미", () => {
    expect(makeNamedBaseName("Screenshot 2026.png", "x9z8")).toBe("Screenshot 2026-x9z8");
    expect(makeNamedBaseName("???.png", "x9z8")).toBe("--x9z8");
  });

  it("randSuffix 길이·문자셋", () => {
    const s = randSuffix(6);
    expect(s).toMatch(/^[a-z0-9]{6}$/);
  });

  it("stemOf / extOf", () => {
    expect(stemOf("img.test.png")).toBe("img.test");
    expect(extOf("img.test.PNG")).toBe("png");
    expect(extOf("noext")).toBe("");
  });
});

describe("R2 키·공개 URL", () => {
  const date = new Date(2026, 6, 10);

  it("makeR2Key — prefix/연/월/파일명", () => {
    expect(makeR2Key("obsidian", date, "a.png")).toBe("obsidian/2026/07/a.png");
    expect(makeR2Key("/nested/prefix/", date, "a.png")).toBe("nested/prefix/2026/07/a.png");
    expect(makeR2Key("", date, "a.png")).toBe("2026/07/a.png");
  });

  it("publicUrlFor — base 슬래시 정규화 + 세그먼트 인코딩", () => {
    expect(publicUrlFor("https://pub-x.r2.dev/", "obsidian/2026/07/a b.png")).toBe(
      "https://pub-x.r2.dev/obsidian/2026/07/a%20b.png",
    );
    expect(publicUrlFor("https://img.example.com", "2026/07/한글.png")).toBe(
      "https://img.example.com/2026/07/%ED%95%9C%EA%B8%80.png",
    );
  });

  it("publicUrlFor — 괄호도 인코딩해 마크다운 링크가 깨지지 않는다", () => {
    expect(publicUrlFor("https://pub-x.r2.dev", "2026/07/img (2).png")).toBe(
      "https://pub-x.r2.dev/2026/07/img%20%282%29.png",
    );
  });
});

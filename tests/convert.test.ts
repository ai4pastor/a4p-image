import { describe, expect, it } from "vitest";
import { applyReplacements, buildConvertPlan, formatBytes, markdownImageText } from "../src/convert";

describe("buildConvertPlan", () => {
  it("노트별 그룹핑과 이미지 중복 제거", () => {
    const plan = buildConvertPlan([
      { notePath: "a.md", original: "![[img1.png]]", imagePath: "attach/img1.png" },
      { notePath: "a.md", original: "![[img2.png]]", imagePath: "attach/img2.png" },
      { notePath: "b.md", original: "![[img1.png]]", imagePath: "attach/img1.png" },
    ]);
    expect(plan.byNote.size).toBe(2);
    expect(plan.byNote.get("a.md")).toHaveLength(2);
    expect(plan.imagePaths.sort()).toEqual(["attach/img1.png", "attach/img2.png"]);
    expect(plan.totalEmbeds).toBe(3);
  });
});

describe("applyReplacements", () => {
  it("여러 임베드 치환 + 개수 집계", () => {
    const content = "앞 ![[img1.png]] 중간 ![[img2.png]] 끝";
    const result = applyReplacements(content, [
      { original: "![[img1.png]]", replacement: "![img1](https://x/img1.png)" },
      { original: "![[img2.png]]", replacement: "![img2](https://x/img2.png)" },
    ]);
    expect(result.content).toBe("앞 ![img1](https://x/img1.png) 중간 ![img2](https://x/img2.png) 끝");
    expect(result.count).toBe(2);
  });

  it("같은 임베드가 여러 번 등장해도 전부 치환", () => {
    const content = "![[a.png]] 본문 ![[a.png]]";
    const result = applyReplacements(content, [{ original: "![[a.png]]", replacement: "X" }]);
    expect(result.content).toBe("X 본문 X");
    expect(result.count).toBe(2);
  });

  it("마크다운 스타일 임베드 원문도 문자열 그대로 치환", () => {
    const content = "본문 ![alt](attach/some%20image.png) 끝";
    const result = applyReplacements(content, [
      { original: "![alt](attach/some%20image.png)", replacement: "![alt](https://x/y.png)" },
    ]);
    expect(result.content).toBe("본문 ![alt](https://x/y.png) 끝");
  });

  it("없는 original·동일 치환은 건너뜀", () => {
    const result = applyReplacements("본문", [
      { original: "![[none.png]]", replacement: "X" },
      { original: "본", replacement: "본" },
    ]);
    expect(result.content).toBe("본문");
    expect(result.count).toBe(0);
  });
});

describe("markdownImageText / formatBytes", () => {
  it("stem을 alt로 사용", () => {
    expect(markdownImageText("img-20260710.png", "https://x/a.png")).toBe("![img-20260710](https://x/a.png)");
  });

  it("alt(크기·캡션)가 있으면 보존 — ![[img|300]] → ![300](url)", () => {
    expect(markdownImageText("img.png", "https://x/a.png", "300")).toBe("![300](https://x/a.png)");
  });

  it("바이트 표기", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

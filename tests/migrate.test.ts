import { describe, expect, it } from "vitest";
import { normalizeBase, replaceUrlPrefix } from "../src/migrate";

describe("normalizeBase", () => {
  it("공백·끝 슬래시 제거", () => {
    expect(normalizeBase(" https://pub-x.r2.dev/ ")).toBe("https://pub-x.r2.dev");
    expect(normalizeBase("https://img.example.com///")).toBe("https://img.example.com");
  });
});

describe("replaceUrlPrefix", () => {
  const OLD = "https://pub-x.r2.dev";
  const NEW = "https://img.example.com";

  it("옛 주소로 시작하는 링크만 치환", () => {
    const content = `![a](${OLD}/2026/07/a.png)\n![b](https://other.com/b.png)`;
    const result = replaceUrlPrefix(content, OLD, NEW);
    expect(result.content).toBe(`![a](${NEW}/2026/07/a.png)\n![b](https://other.com/b.png)`);
    expect(result.count).toBe(1);
  });

  it("여러 건 치환 + 개수 집계", () => {
    const content = `${OLD}/a.png ${OLD}/b.png ${OLD}/c.png`;
    const result = replaceUrlPrefix(content, OLD, NEW);
    expect(result.count).toBe(3);
    expect(result.content).not.toContain(OLD);
  });

  it("유사 도메인은 치환하지 않음 (경계 보호)", () => {
    const content = `https://pub-x.r2.dev.evil.com/a.png`;
    const result = replaceUrlPrefix(content, OLD, NEW);
    expect(result.content).toBe(content);
    expect(result.count).toBe(0);
  });

  it("끝 슬래시가 달라도 동일하게 동작", () => {
    const result = replaceUrlPrefix(`![a](${OLD}/a.png)`, `${OLD}/`, `${NEW}/`);
    expect(result.content).toBe(`![a](${NEW}/a.png)`);
  });

  it("같은 주소·빈 주소는 무시", () => {
    expect(replaceUrlPrefix("x", OLD, OLD).count).toBe(0);
    expect(replaceUrlPrefix("x", "", NEW).count).toBe(0);
  });
});

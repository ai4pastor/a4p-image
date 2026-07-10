import { describe, expect, it } from "vitest";
import { awsUriEncode, sha256Hex, signRequest } from "../src/r2/sigv4";

// AWS 공식 문서의 SigV4 예제 (Authenticating Requests: Using the Authorization Header)
// https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
const ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

describe("sha256Hex", () => {
  it("빈 문자열의 SHA-256", async () => {
    expect(await sha256Hex("")).toBe(EMPTY_SHA256);
  });

  it("문자열과 동일 내용 바이너리가 같은 해시", async () => {
    const text = "Welcome to Amazon S3.";
    const bytes = new TextEncoder().encode(text);
    expect(await sha256Hex(bytes)).toBe(await sha256Hex(text));
  });
});

describe("awsUriEncode", () => {
  it("unreserved 문자는 유지, 나머지는 대문자 percent-encoding", () => {
    expect(awsUriEncode("test$file.text", false)).toBe("test%24file.text");
    expect(awsUriEncode("a b", false)).toBe("a%20b");
    expect(awsUriEncode("A-Z_a-z.0~9", false)).toBe("A-Z_a-z.0~9");
  });

  it("encodeSlash 여부", () => {
    expect(awsUriEncode("a/b", false)).toBe("a/b");
    expect(awsUriEncode("a/b", true)).toBe("a%2Fb");
  });

  it("한글은 UTF-8 바이트 단위로 인코딩", () => {
    expect(awsUriEncode("가", true)).toBe("%EA%B0%80");
  });
});

describe("signRequest — AWS 공식 예제 벡터", () => {
  it("S3 GET object 예제 서명 재현", async () => {
    const result = await signRequest({
      method: "GET",
      host: "examplebucket.s3.amazonaws.com",
      path: "/test.txt",
      headers: { host: "examplebucket.s3.amazonaws.com", range: "bytes=0-9" },
      payloadHash: EMPTY_SHA256,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
      region: "us-east-1",
      service: "s3",
      date: new Date("2013-05-24T00:00:00Z"),
    });
    expect(result.signature).toBe("f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41");
    expect(result.headers["Authorization"]).toContain(
      "Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request",
    );
    expect(result.headers["Authorization"]).toContain("SignedHeaders=host;range;x-amz-content-sha256;x-amz-date");
  });

  it("S3 PUT object 예제 서명 재현 (키에 특수문자 $ 포함)", async () => {
    const payloadHash = await sha256Hex("Welcome to Amazon S3.");
    expect(payloadHash).toBe("44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034a8b803f8b072");

    const result = await signRequest({
      method: "PUT",
      host: "examplebucket.s3.amazonaws.com",
      path: "/test$file.text",
      headers: {
        host: "examplebucket.s3.amazonaws.com",
        date: "Fri, 24 May 2013 00:00:00 GMT",
        "x-amz-storage-class": "REDUCED_REDUNDANCY",
      },
      payloadHash,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
      region: "us-east-1",
      service: "s3",
      date: new Date("2013-05-24T00:00:00Z"),
    });
    expect(result.signature).toBe("98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd");
  });

  it("x-amz-date·x-amz-content-sha256 헤더가 결과에 포함된다", async () => {
    const result = await signRequest({
      method: "PUT",
      host: "acc.r2.cloudflarestorage.com",
      path: "/bucket/obsidian/2026/07/img.png",
      headers: { host: "acc.r2.cloudflarestorage.com", "content-type": "image/png" },
      payloadHash: EMPTY_SHA256,
      accessKeyId: "key",
      secretAccessKey: "secret",
      region: "auto",
      service: "s3",
      date: new Date("2026-07-10T12:00:00Z"),
    });
    expect(result.headers["x-amz-date"]).toBe("20260710T120000Z");
    expect(result.headers["x-amz-content-sha256"]).toBe(EMPTY_SHA256);
    expect(result.headers["content-type"]).toBe("image/png");
    expect(result.canonicalRequest.split("\n")[1]).toBe("/bucket/obsidian/2026/07/img.png");
  });
});

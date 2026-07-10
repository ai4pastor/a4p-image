import { requestUrl } from "obsidian";
import type { R2Config } from "../types";
import { publicUrlFor } from "../filename";
import { awsUriEncode, sha256Hex, signRequest } from "./sigv4";

/** Cloudflare R2 (S3 호환 API) 클라이언트. 모든 요청은 requestUrl(CORS 우회) 경유. */
export class R2Client {
  constructor(private getConfig: () => R2Config) {}

  /** 누락된 필수 설정 필드명 목록 — 비어 있으면 사용 가능 */
  missingFields(): string[] {
    const c = this.getConfig();
    const missing: string[] = [];
    if (!c.accountId.trim()) missing.push("Account ID");
    if (!c.accessKeyId.trim()) missing.push("Access Key ID");
    if (!c.secretAccessKey.trim()) missing.push("Secret Access Key");
    if (!c.bucket.trim()) missing.push("버킷 이름");
    if (!c.publicBaseUrl.trim()) missing.push("공개 base URL");
    return missing;
  }

  isConfigured(): boolean {
    return this.missingFields().length === 0;
  }

  publicUrl(key: string): string {
    return publicUrlFor(this.getConfig().publicBaseUrl, key);
  }

  private host(): string {
    return `${this.getConfig().accountId.trim()}.r2.cloudflarestorage.com`;
  }

  private async signedRequest(
    method: "PUT" | "DELETE" | "HEAD",
    key: string,
    body?: ArrayBuffer,
    contentType?: string,
  ): Promise<{ status: number; text: string }> {
    const c = this.getConfig();
    const host = this.host();
    const path = `/${c.bucket.trim()}/${key}`;
    const payloadHash = body ? await sha256Hex(body) : await sha256Hex("");

    const extraHeaders: Record<string, string> = {};
    if (contentType) extraHeaders["content-type"] = contentType;

    const signed = await signRequest({
      method,
      host,
      path,
      headers: { ...extraHeaders, host },
      payloadHash,
      accessKeyId: c.accessKeyId.trim(),
      secretAccessKey: c.secretAccessKey.trim(),
      region: "auto",
      service: "s3",
      date: new Date(),
    });

    // host는 전송 계층이 자동으로 붙이므로 요청 헤더에서는 제외 (서명에는 포함됨)
    const { host: _h, ...sendHeaders } = signed.headers;

    // 요청 URL 인코딩은 반드시 canonical URI와 동일한 AWS 규칙을 써야 서명이 일치한다
    const url = `https://${host}${awsUriEncode(path, false)}`;

    const res = await requestUrl({
      url,
      method,
      headers: sendHeaders,
      body,
      throw: false,
    });
    return { status: res.status, text: res.status >= 300 ? res.text ?? "" : "" };
  }

  async putObject(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
    const res = await this.signedRequest("PUT", key, body, contentType);
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`R2 업로드 실패 (HTTP ${res.status})${summarizeS3Error(res.text)}`);
    }
  }

  async deleteObject(key: string): Promise<void> {
    const res = await this.signedRequest("DELETE", key);
    // S3 DELETE는 존재하지 않는 키에도 204를 반환
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`R2 삭제 실패 (HTTP ${res.status})${summarizeS3Error(res.text)}`);
    }
  }

  /** 테스트 객체 PUT → DELETE 왕복으로 자격증명·버킷 검증 */
  async testConnection(): Promise<{ ok: boolean; message: string }> {
    const missing = this.missingFields();
    if (missing.length > 0) {
      return { ok: false, message: `설정 누락: ${missing.join(", ")}` };
    }
    const c = this.getConfig();
    const prefix = c.keyPrefix.replace(/^\/+|\/+$/g, "");
    const testKey = `${prefix ? prefix + "/" : ""}.a4p-connection-test`;
    try {
      const body = new TextEncoder().encode("a4p-image connection test").buffer as ArrayBuffer;
      await this.putObject(testKey, body, "text/plain");
      await this.deleteObject(testKey);
      return { ok: true, message: "연결 성공 — 업로드·삭제 권한이 확인되었습니다." };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

function summarizeS3Error(xml: string): string {
  if (!xml) return "";
  const code = xml.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const msg = xml.match(/<Message>([^<]+)<\/Message>/)?.[1];
  if (!code && !msg) return "";
  return ` — ${[code, msg].filter(Boolean).join(": ")}`;
}

/**
 * 순수 모듈 — obsidian import 금지 (vitest 직접 실행 대상)
 *
 * AWS Signature Version 4 서명. crypto.subtle(Web Crypto)만 사용해
 * Electron 렌더러·모바일 WebView 모두에서 동작한다.
 * R2의 S3 호환 API는 region "auto", service "s3"로 서명한다.
 */

export interface SignInput {
  method: string;
  host: string;
  /** 인코딩 전 경로 (예: `/bucket/prefix/2026/07/img.png`) */
  path: string;
  query?: Record<string, string>;
  /** 서명에 포함할 추가 헤더 (host, x-amz-date는 자동 포함) */
  headers?: Record<string, string>;
  /** SHA-256 hex of body ("UNSIGNED-PAYLOAD" 허용) */
  payloadHash: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  date: Date;
}

export interface SignOutput {
  /** 요청에 실어 보낼 헤더 (Authorization, x-amz-date, x-amz-content-sha256 + 입력 헤더) */
  headers: Record<string, string>;
  /** 디버깅·테스트용 중간 산출물 */
  canonicalRequest: string;
  stringToSign: string;
  signature: string;
}

const encoder = new TextEncoder();

export async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes =
    typeof data === "string" ? encoder.encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const keyBytes = key instanceof Uint8Array ? key : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

/** AWS 규칙 percent-encoding: unreserved(A-Za-z0-9-._~) 외 전부 인코딩 */
export function awsUriEncode(value: string, encodeSlash: boolean): string {
  let out = "";
  for (const ch of value) {
    if (/[A-Za-z0-9\-._~]/.test(ch) || (ch === "/" && !encodeSlash)) {
      out += ch;
    } else {
      const bytes = encoder.encode(ch);
      for (const b of bytes) out += "%" + b.toString(16).toUpperCase().padStart(2, "0");
    }
  }
  return out;
}

function amzTimestamp(date: Date): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

export async function signRequest(input: SignInput): Promise<SignOutput> {
  const { amzDate, dateStamp } = amzTimestamp(input.date);

  const headers: Record<string, string> = {
    ...(input.headers ?? {}),
    host: input.host,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": input.payloadHash,
  };

  const sortedHeaderNames = Object.keys(headers)
    .map((h) => h.toLowerCase())
    .sort();
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lowerHeaders[k.toLowerCase()] = v.trim().replace(/\s+/g, " ");
  const canonicalHeaders = sortedHeaderNames.map((h) => `${h}:${lowerHeaders[h]}\n`).join("");
  const signedHeaders = sortedHeaderNames.join(";");

  const canonicalUri = awsUriEncode(input.path, false) || "/";
  const canonicalQuery = Object.entries(input.query ?? {})
    .map(([k, v]) => [awsUriEncode(k, true), awsUriEncode(v, true)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    input.payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  let key: ArrayBuffer | Uint8Array = encoder.encode(`AWS4${input.secretAccessKey}`);
  for (const part of [dateStamp, input.region, input.service, "aws4_request"]) {
    key = await hmac(key, part);
  }
  const signature = toHex(new Uint8Array(await hmac(key, stringToSign)));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const outHeaders: Record<string, string> = { ...(input.headers ?? {}) };
  outHeaders["x-amz-date"] = amzDate;
  outHeaders["x-amz-content-sha256"] = input.payloadHash;
  outHeaders["Authorization"] = authorization;

  return { headers: outHeaders, canonicalRequest, stringToSign, signature };
}

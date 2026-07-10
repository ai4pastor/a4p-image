export type EntryStatus = "uploaded" | "pending" | "failed";
export type EntryOrigin = "paste" | "drop" | "convert" | "eagle";

export interface ManifestEntry {
  id: string;
  /** 볼트 상대 경로의 로컬 백업 파일 — 삭제·미백업이면 null */
  localPath: string | null;
  r2Key: string;
  url: string;
  /** 내용 SHA-256 hex — 동일 이미지 재업로드 방지 키 */
  hash: string;
  size: number;
  mime: string;
  createdAt: number;
  uploadedAt: number | null;
  status: EntryStatus;
  /** 최초 삽입 노트 경로 — 재시도 치환·갤러리 이동용 */
  sourceNote: string | null;
  origin: EntryOrigin;
  eagleId: string | null;
}

export interface ManifestData {
  version: 1;
  entries: Record<string, ManifestEntry>;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
  keyPrefix: string;
}

export type UploadOutcome =
  | { ok: true; url: string; stem: string; entryId: string; reused: boolean }
  | { ok: false; localPath: string | null; entryId: string | null; error: string };

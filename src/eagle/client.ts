import { requestUrl } from "obsidian";

export interface EagleItem {
  id: string;
  name: string;
  ext: string;
  size: number;
  tags: string[];
  annotation?: string;
  width?: number;
  height?: number;
}

interface EagleResponse<T> {
  status: string;
  data: T;
}

/** Eagle 로컬 REST API 클라이언트 (기본 http://localhost:41595) — 데스크톱 전용 */
export class EagleClient {
  constructor(private getBaseUrl: () => string) {}

  private base(): string {
    return this.getBaseUrl().replace(/\/+$/g, "");
  }

  private async get<T>(endpoint: string): Promise<T | null> {
    try {
      const res = await requestUrl({ url: `${this.base()}${endpoint}`, method: "GET", throw: false });
      if (res.status !== 200) return null;
      const body = res.json as EagleResponse<T>;
      return body.status === "success" ? body.data : null;
    } catch {
      return null;
    }
  }

  private async post<T>(endpoint: string, payload: unknown): Promise<T | null> {
    try {
      const res = await requestUrl({
        url: `${this.base()}${endpoint}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        throw: false,
      });
      if (res.status !== 200) return null;
      const body = res.json as EagleResponse<T>;
      return body.status === "success" ? body.data : null;
    } catch {
      return null;
    }
  }

  /** Eagle 실행 여부 — 짧은 타임아웃, 실패 시 조용히 false */
  async isAvailable(timeoutMs = 1500): Promise<boolean> {
    const probe = this.get<unknown>("/api/application/info").then((d) => d !== null);
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs));
    return Promise.race([probe, timeout]);
  }

  async searchImages(limit = 200): Promise<EagleItem[]> {
    const data = await this.get<EagleItem[]>(`/api/item/list?limit=${limit}&orderBy=-CREATEDATE`);
    if (!data) return [];
    const imageExts = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);
    return data.filter((item) => imageExts.has((item.ext ?? "").toLowerCase()));
  }

  /** 라이브러리 루트 절대 경로 — 원본 파일 위치 재구성에 사용 */
  async libraryPath(): Promise<string | null> {
    const data = await this.get<{ library?: { path?: string }; path?: string }>("/api/library/info");
    return data?.library?.path ?? data?.path ?? null;
  }

  /** 원본 파일 절대 경로: {library}/images/{id}.info/{name}.{ext} */
  itemFilePath(libraryPath: string, item: EagleItem): string {
    return `${libraryPath}/images/${item.id}.info/${item.name}.${item.ext}`;
  }

  /** 썸네일 절대 경로 (없으면 null) */
  async thumbnailPath(id: string): Promise<string | null> {
    return this.get<string>(`/api/item/thumbnail?id=${encodeURIComponent(id)}`);
  }

  /** 로컬 파일을 Eagle 라이브러리에 등록 — 성공 시 true */
  async addFromPath(absPath: string, name: string, folderId?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { path: absPath, name };
    if (folderId) payload.folderId = folderId;
    const data = await this.post<unknown>("/api/item/addFromPath", payload);
    return data !== null;
  }
}

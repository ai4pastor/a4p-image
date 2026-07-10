import { FileSystemAdapter, Notice, Platform, Plugin, TFile, normalizePath } from "obsidian";
import { A4pImageSettingTab, A4pImageSettings, DEFAULT_SETTINGS } from "./settings";
import { ManifestIO, ManifestStore } from "./manifest";
import { R2Client } from "./r2/client";
import { Uploader } from "./uploader";
import { registerPasteHandlers } from "./paste-handler";
import { openConvertModal } from "./convert-modal";
import { GalleryView, VIEW_TYPE_A4P_IMAGE_GALLERY } from "./gallery-view";
import { runRetryCommand, runTrashUnusedCommand, runUnusedReportCommand } from "./commands";
import { MigrateUrlModal } from "./migrate-modal";
import { registerEditorTracker } from "./insert";
import { EagleClient } from "./eagle/client";
import { EagleSearchModal } from "./eagle/modal";

interface PersistedState {
  settings: A4pImageSettings;
}

export default class A4pImagePlugin extends Plugin {
  settings!: A4pImageSettings;
  manifestStore!: ManifestStore;
  r2!: R2Client;
  uploader!: Uploader;
  eagle!: EagleClient;

  async onload() {
    await this.loadState();

    this.r2 = new R2Client(() => this.settings.r2);
    this.manifestStore = new ManifestStore(this.createManifestIO());
    await this.manifestStore.load();
    this.uploader = new Uploader(this);
    this.eagle = new EagleClient(() => this.settings.eagle.apiUrl);

    if (Platform.isDesktopApp) {
      this.uploader.onUploaded = async (entry) => {
        const { enabled, registerOnUpload, folderId } = this.settings.eagle;
        if (!enabled || !registerOnUpload || !entry.localPath) return;
        if (!(await this.eagle.isAvailable())) return; // Eagle 미실행 — 조용히 스킵
        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) return;
        const absPath = adapter.getFullPath(entry.localPath);
        const name = entry.localPath.split("/").pop() ?? entry.localPath;
        await this.eagle.addFromPath(absPath, name, folderId || undefined);
      };
    }

    this.addSettingTab(new A4pImageSettingTab(this.app, this));
    registerPasteHandlers(this);
    registerEditorTracker(this); // 갤러리(사이드 패널)에서도 본문 에디터에 삽입할 수 있게 추적

    // 로컬 백업 경로 추적 — 외부 플러그인(paste-image-rename 등)의 rename에도 매핑 유지
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) this.manifestStore.handleRename(oldPath, file.path);
      }),
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof TFile) this.manifestStore.handleDelete(file.path);
      }),
    );

    this.registerView(VIEW_TYPE_A4P_IMAGE_GALLERY, (leaf) => new GalleryView(leaf, this));
    this.addRibbonIcon("image", "A4P 이미지 갤러리", () => {
      void this.activateGalleryView();
    });

    this.addCommand({
      id: "open-gallery",
      name: "이미지 갤러리 열기",
      callback: () => void this.activateGalleryView(),
    });

    this.addCommand({
      id: "retry-failed-uploads",
      name: "실패한 업로드 재시도",
      callback: () => void runRetryCommand(this),
    });

    this.addCommand({
      id: "convert-current-note",
      name: "현재 노트의 로컬 이미지 → 클라우드 변환",
      editorCallback: (_editor, ctx) => {
        const file = ctx.file;
        if (!file) {
          new Notice("활성 노트가 없습니다.");
          return;
        }
        void openConvertModal(this, [file], `현재 노트: ${file.basename}`);
      },
    });

    this.addCommand({
      id: "convert-vault",
      name: "볼트 전체의 로컬 이미지 → 클라우드 변환",
      callback: () => {
        void openConvertModal(this, this.app.vault.getMarkdownFiles(), "볼트 전체");
      },
    });

    this.addCommand({
      id: "migrate-base-url",
      name: "이미지 주소 일괄 변경 (도메인 전환·주소 복구)",
      callback: () => new MigrateUrlModal(this.app, this).open(),
    });

    this.addCommand({
      id: "unused-report",
      name: "미사용 이미지 리포트 생성",
      callback: () => void runUnusedReportCommand(this),
    });

    this.addCommand({
      id: "trash-unused",
      name: "미사용 이미지 휴지통 이동 (선택·승인 필요)",
      callback: () => void runTrashUnusedCommand(this),
    });

    if (Platform.isDesktopApp) {
      this.addCommand({
        id: "eagle-search-insert",
        name: "Eagle에서 이미지 검색·삽입",
        editorCheckCallback: (checking, editor, ctx) => {
          if (!this.settings.eagle.enabled) return false;
          if (checking) return true;
          void EagleSearchModal.open(this, editor, ctx.file ?? null);
          return true;
        },
      });
    }
  }

  onunload() {
    void this.manifestStore.flush();
  }

  async activateGalleryView(): Promise<void> {
    const { workspace } = this.app;
    let leaf: import("obsidian").WorkspaceLeaf | null =
      workspace.getLeavesOfType(VIEW_TYPE_A4P_IMAGE_GALLERY)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: VIEW_TYPE_A4P_IMAGE_GALLERY, active: true });
    }
    void workspace.revealLeaf(leaf);
  }

  private createManifestIO(): ManifestIO {
    const indexPath = normalizePath(`${this.manifest.dir}/index.json`);
    const adapter = this.app.vault.adapter;
    return {
      read: async () => {
        if (!(await adapter.exists(indexPath))) return null;
        return adapter.read(indexPath);
      },
      write: (content) => adapter.write(indexPath, content),
    };
  }

  async loadState() {
    const raw = ((await this.loadData()) ?? {}) as Partial<PersistedState>;
    const saved = raw.settings ?? ({} as Partial<A4pImageSettings>);
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      r2: { ...DEFAULT_SETTINGS.r2, ...(saved.r2 ?? {}) },
      compress: { ...DEFAULT_SETTINGS.compress, ...(saved.compress ?? {}) },
      eagle: { ...DEFAULT_SETTINGS.eagle, ...(saved.eagle ?? {}) },
    };
  }

  async persist() {
    const payload: PersistedState = { settings: this.settings };
    await this.saveData(payload);
  }
}

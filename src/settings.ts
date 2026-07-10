import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import type A4pImagePlugin from "./main";

export interface A4pImageSettings {
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    /** 예: https://pub-xxxx.r2.dev 또는 커스텀 도메인 */
    publicBaseUrl: string;
    keyPrefix: string;
  };
  /** false = 클라우드 온리 (볼트에 백업을 남기지 않음) */
  localBackup: boolean;
  /** "" = 볼트 첨부 설정(getAvailablePathForAttachment)을 그대로 따름 */
  attachmentSubfolder: string;
  /** 업로드 실패 시 ![[로컬]] 임베드로 폴백 */
  fallbackToLocalEmbed: boolean;
  imageExtensions: string[];
  /** 미사용 이미지 리포트 노트를 만들 폴더 ("" = 볼트 루트) */
  reportFolder: string;
  eagle: {
    enabled: boolean;
    apiUrl: string;
    registerOnUpload: boolean;
    folderId: string;
  };
}

export const DEFAULT_SETTINGS: A4pImageSettings = {
  r2: {
    accountId: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    publicBaseUrl: "",
    keyPrefix: "obsidian",
  },
  localBackup: true,
  attachmentSubfolder: "",
  fallbackToLocalEmbed: true,
  imageExtensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"],
  reportFolder: "",
  eagle: {
    enabled: false,
    apiUrl: "http://localhost:41595",
    registerOnUpload: false,
    folderId: "",
  },
};

export class A4pImageSettingTab extends PluginSettingTab {
  plugin: A4pImagePlugin;

  constructor(app: App, plugin: A4pImagePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Cloudflare R2").setHeading();

    const r2Desc = containerEl.createEl("p", { cls: "a4p-image-settings-status-line" });
    r2Desc.setText(
      "Cloudflare 대시보드에서 R2 버킷 생성 → Public access(r2.dev 또는 커스텀 도메인) 활성화 → " +
        "API Token(Object Read & Write)을 만들어 아래에 입력하세요. 자세한 절차는 README 참고.",
    );

    new Setting(containerEl)
      .setName("Account ID")
      .setDesc("Cloudflare 대시보드 우측(또는 R2 개요)에 표시되는 계정 ID입니다.")
      .addText((text) =>
        text.setValue(this.plugin.settings.r2.accountId).onChange(async (value) => {
          this.plugin.settings.r2.accountId = value.trim();
          await this.plugin.persist();
        }),
      );

    new Setting(containerEl)
      .setName("Access Key ID")
      .setDesc("R2 API Token의 Access Key ID입니다.")
      .addText((text) =>
        text.setValue(this.plugin.settings.r2.accessKeyId).onChange(async (value) => {
          this.plugin.settings.r2.accessKeyId = value.trim();
          await this.plugin.persist();
        }),
      );

    new Setting(containerEl)
      .setName("Secret Access Key")
      .setDesc("R2 API Token의 Secret입니다. 이 값은 볼트의 플러그인 data.json에 저장되니 볼트를 공개 저장소에 올리지 마세요.")
      .addText((text) => {
        text.inputEl.type = "password";
        text.setValue(this.plugin.settings.r2.secretAccessKey).onChange(async (value) => {
          this.plugin.settings.r2.secretAccessKey = value.trim();
          await this.plugin.persist();
        });
      });

    new Setting(containerEl)
      .setName("버킷 이름")
      .setDesc("업로드할 R2 버킷 이름 (예: obsidian-images)")
      .addText((text) =>
        text.setValue(this.plugin.settings.r2.bucket).onChange(async (value) => {
          this.plugin.settings.r2.bucket = value.trim();
          await this.plugin.persist();
        }),
      );

    new Setting(containerEl)
      .setName("공개 base URL")
      .setDesc("버킷의 공개 접근 URL (예: https://pub-xxxx.r2.dev 또는 https://img.example.com). 노트에 삽입되는 링크의 앞부분이 됩니다.")
      .addText((text) =>
        text
          .setPlaceholder("https://pub-xxxx.r2.dev")
          .setValue(this.plugin.settings.r2.publicBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.r2.publicBaseUrl = value.trim();
            await this.plugin.persist();
          }),
      );

    let statusEl: HTMLElement;

    new Setting(containerEl)
      .setName("키 접두사")
      .setDesc("R2 안에서 객체 키 앞에 붙는 폴더 경로입니다. 키는 {접두사}/{연도}/{월}/{파일명} 형태가 됩니다.")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.r2.keyPrefix)
          .setValue(this.plugin.settings.r2.keyPrefix)
          .onChange(async (value) => {
            this.plugin.settings.r2.keyPrefix = value.trim();
            await this.plugin.persist();
          }),
      )
      .addButton((btn) =>
        btn
          .setButtonText("연결 테스트")
          .setCta()
          .onClick(async () => {
            btn.setDisabled(true);
            statusEl.empty();
            statusEl.createEl("p", { text: "테스트 객체를 업로드하는 중…", cls: "a4p-image-settings-status-line" });
            const result = await this.plugin.r2.testConnection();
            btn.setDisabled(false);
            statusEl.empty();
            statusEl.createEl("p", {
              text: result.ok ? `✅ ${result.message}` : `❌ ${result.message}`,
              cls: "a4p-image-settings-status-line",
            });
          }),
      );

    statusEl = containerEl.createDiv({ cls: "a4p-image-settings-status" });

    new Setting(containerEl).setName("동작").setHeading();

    new Setting(containerEl)
      .setName("로컬 백업 유지")
      .setDesc(
        "켜면 업로드한 이미지를 볼트 첨부 폴더에도 저장합니다 (권장 — 클라우드 장애·서비스 종료에도 안전). " +
          "끄면 노트에 URL만 남고 볼트에는 파일이 저장되지 않습니다.",
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.localBackup).onChange(async (value) => {
          this.plugin.settings.localBackup = value;
          await this.plugin.persist();
        }),
      );

    new Setting(containerEl)
      .setName("첨부 폴더 오버라이드")
      .setDesc("비우면 옵시디언의 첨부 파일 설정 위치를 그대로 따릅니다. 지정하면 그 폴더(볼트 루트 기준)에 저장합니다.")
      .addText((text) =>
        text
          .setPlaceholder("예: 900. Settings/905. Attached file")
          .setValue(this.plugin.settings.attachmentSubfolder)
          .onChange(async (value) => {
            this.plugin.settings.attachmentSubfolder = value.trim();
            await this.plugin.persist();
          }),
      );

    new Setting(containerEl)
      .setName("업로드 실패 시 로컬 임베드 폴백")
      .setDesc("오프라인 등으로 업로드가 실패하면 노트에 ![[로컬 파일]]을 대신 삽입하고, 나중에 '실패한 업로드 재시도' 명령으로 복구합니다.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.fallbackToLocalEmbed).onChange(async (value) => {
          this.plugin.settings.fallbackToLocalEmbed = value;
          await this.plugin.persist();
        }),
      );

    new Setting(containerEl)
      .setName("리포트 폴더")
      .setDesc("미사용 이미지 리포트 노트를 만들 폴더입니다. 비우면 볼트 루트에 만듭니다.")
      .addText((text) =>
        text.setValue(this.plugin.settings.reportFolder).onChange(async (value) => {
          this.plugin.settings.reportFolder = value.trim();
          await this.plugin.persist();
        }),
      );

    if (Platform.isDesktopApp) {
      new Setting(containerEl).setName("Eagle 연동 (데스크톱 전용)").setHeading();

      new Setting(containerEl)
        .setName("Eagle 연동 사용")
        .setDesc("Eagle 앱이 실행 중일 때 검색·등록 기능을 사용합니다. Eagle이 없으면 조용히 비활성화됩니다.")
        .addToggle((toggle) =>
          toggle.setValue(this.plugin.settings.eagle.enabled).onChange(async (value) => {
            this.plugin.settings.eagle.enabled = value;
            await this.plugin.persist();
            this.display();
          }),
        );

      if (this.plugin.settings.eagle.enabled) {
        new Setting(containerEl)
          .setName("Eagle API 주소")
          .setDesc("Eagle 로컬 API 주소입니다. 기본값을 바꿀 일은 거의 없습니다.")
          .addText((text) =>
            text
              .setPlaceholder(DEFAULT_SETTINGS.eagle.apiUrl)
              .setValue(this.plugin.settings.eagle.apiUrl)
              .onChange(async (value) => {
                this.plugin.settings.eagle.apiUrl = value.trim() || DEFAULT_SETTINGS.eagle.apiUrl;
                await this.plugin.persist();
              }),
          );

        new Setting(containerEl)
          .setName("업로드 시 Eagle에도 등록")
          .setDesc("이미지를 R2에 업로드할 때 로컬 백업 파일을 Eagle 라이브러리에도 추가합니다 (로컬 백업이 켜져 있어야 함).")
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.eagle.registerOnUpload).onChange(async (value) => {
              this.plugin.settings.eagle.registerOnUpload = value;
              await this.plugin.persist();
            }),
          );

        new Setting(containerEl)
          .setName("Eagle 폴더 ID")
          .setDesc("등록할 Eagle 폴더 ID (선택). 비우면 라이브러리 루트(미분류)에 추가됩니다.")
          .addText((text) =>
            text.setValue(this.plugin.settings.eagle.folderId).onChange(async (value) => {
              this.plugin.settings.eagle.folderId = value.trim();
              await this.plugin.persist();
            }),
          );
      }
    }
  }
}

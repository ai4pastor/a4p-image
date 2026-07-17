var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => A4pImagePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian17 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  r2: {
    accountId: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    publicBaseUrl: "",
    keyPrefix: "obsidian"
  },
  namingScheme: "note",
  compress: {
    enabled: true,
    maxWidth: 1920,
    quality: 0.85,
    convertToWebp: true
  },
  localBackup: true,
  attachmentSubfolder: "",
  fallbackToLocalEmbed: true,
  imageExtensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"],
  reportFolder: "",
  includeAttachments: true,
  attachmentExtensions: [
    "pdf",
    "mp3",
    "m4a",
    "wav",
    "ogg",
    "mp4",
    "mov",
    "webm",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "hwp",
    "hwpx",
    "zip"
  ],
  eagle: {
    enabled: false,
    apiUrl: "http://localhost:41595",
    registerOnUpload: false,
    folderId: ""
  }
};
var A4pImageSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Cloudflare R2").setHeading();
    const r2Desc = containerEl.createEl("p", { cls: "a4p-image-settings-status-line" });
    r2Desc.setText(
      "Cloudflare \uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C R2 \uBC84\uD0B7 \uC0DD\uC131 \u2192 Public access(r2.dev \uB610\uB294 \uCEE4\uC2A4\uD140 \uB3C4\uBA54\uC778) \uD65C\uC131\uD654 \u2192 API Token(Object Read & Write)\uC744 \uB9CC\uB4E4\uC5B4 \uC544\uB798\uC5D0 \uC785\uB825\uD558\uC138\uC694. \uC790\uC138\uD55C \uC808\uCC28\uB294 README \uCC38\uACE0."
    );
    new import_obsidian.Setting(containerEl).setName("Account ID").setDesc("Cloudflare \uB300\uC2DC\uBCF4\uB4DC \uC6B0\uCE21(\uB610\uB294 R2 \uAC1C\uC694)\uC5D0 \uD45C\uC2DC\uB418\uB294 \uACC4\uC815 ID\uC785\uB2C8\uB2E4.").addText(
      (text) => text.setValue(this.plugin.settings.r2.accountId).onChange(async (value) => {
        this.plugin.settings.r2.accountId = value.trim();
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Access Key ID").setDesc("R2 API Token\uC758 Access Key ID\uC785\uB2C8\uB2E4.").addText(
      (text) => text.setValue(this.plugin.settings.r2.accessKeyId).onChange(async (value) => {
        this.plugin.settings.r2.accessKeyId = value.trim();
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Secret Access Key").setDesc("R2 API Token\uC758 Secret\uC785\uB2C8\uB2E4. \uC774 \uAC12\uC740 \uBCFC\uD2B8\uC758 \uD50C\uB7EC\uADF8\uC778 data.json\uC5D0 \uC800\uC7A5\uB418\uB2C8 \uBCFC\uD2B8\uB97C \uACF5\uAC1C \uC800\uC7A5\uC18C\uC5D0 \uC62C\uB9AC\uC9C0 \uB9C8\uC138\uC694.").addText((text) => {
      text.inputEl.type = "password";
      text.setValue(this.plugin.settings.r2.secretAccessKey).onChange(async (value) => {
        this.plugin.settings.r2.secretAccessKey = value.trim();
        await this.plugin.persist();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\uBC84\uD0B7 \uC774\uB984").setDesc("\uC5C5\uB85C\uB4DC\uD560 R2 \uBC84\uD0B7 \uC774\uB984 (\uC608: obsidian-images)").addText(
      (text) => text.setValue(this.plugin.settings.r2.bucket).onChange(async (value) => {
        this.plugin.settings.r2.bucket = value.trim();
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\uACF5\uAC1C base URL").setDesc("\uBC84\uD0B7\uC758 \uACF5\uAC1C \uC811\uADFC URL (\uC608: https://pub-xxxx.r2.dev \uB610\uB294 https://img.example.com). \uB178\uD2B8\uC5D0 \uC0BD\uC785\uB418\uB294 \uB9C1\uD06C\uC758 \uC55E\uBD80\uBD84\uC774 \uB429\uB2C8\uB2E4.").addText(
      (text) => text.setPlaceholder("https://pub-xxxx.r2.dev").setValue(this.plugin.settings.r2.publicBaseUrl).onChange(async (value) => {
        this.plugin.settings.r2.publicBaseUrl = value.trim();
        await this.plugin.persist();
      })
    );
    let statusEl;
    new import_obsidian.Setting(containerEl).setName("\uD0A4 \uC811\uB450\uC0AC").setDesc("R2 \uC548\uC5D0\uC11C \uAC1D\uCCB4 \uD0A4 \uC55E\uC5D0 \uBD99\uB294 \uD3F4\uB354 \uACBD\uB85C\uC785\uB2C8\uB2E4. \uD0A4\uB294 {\uC811\uB450\uC0AC}/{\uC5F0\uB3C4}/{\uC6D4}/{\uD30C\uC77C\uBA85} \uD615\uD0DC\uAC00 \uB429\uB2C8\uB2E4.").addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.r2.keyPrefix).setValue(this.plugin.settings.r2.keyPrefix).onChange(async (value) => {
        this.plugin.settings.r2.keyPrefix = value.trim();
        await this.plugin.persist();
      })
    ).addButton(
      (btn) => btn.setButtonText("\uC5F0\uACB0 \uD14C\uC2A4\uD2B8").setCta().onClick(async () => {
        btn.setDisabled(true);
        statusEl.empty();
        statusEl.createEl("p", { text: "\uD14C\uC2A4\uD2B8 \uAC1D\uCCB4\uB97C \uC5C5\uB85C\uB4DC\uD558\uB294 \uC911\u2026", cls: "a4p-image-settings-status-line" });
        const result = await this.plugin.r2.testConnection();
        btn.setDisabled(false);
        statusEl.empty();
        statusEl.createEl("p", {
          text: result.ok ? `\u2705 ${result.message}` : `\u274C ${result.message}`,
          cls: "a4p-image-settings-status-line"
        });
      })
    );
    statusEl = containerEl.createDiv({ cls: "a4p-image-settings-status" });
    new import_obsidian.Setting(containerEl).setName("\uB3D9\uC791").setHeading();
    new import_obsidian.Setting(containerEl).setName("\uBD99\uC5EC\uB123\uAE30 \uD30C\uC77C\uBA85 \uADDC\uCE59").setDesc(
      "\uB178\uD2B8 \uC81C\uBAA9: \uD65C\uC131 \uB178\uD2B8 \uC81C\uBAA9 \uB4A4\uC5D0 \uBC88\uD638\uB97C \uBD99\uC785\uB2C8\uB2E4 (\uC608: \uC635\uC2DC\uB514\uC5B8_1.png, \uC635\uC2DC\uB514\uC5B8_2.png). \uD0C0\uC784\uC2A4\uD0EC\uD504: img-\uB0A0\uC9DC-\uC2DC\uAC04 \uD615\uC2DD. \uB85C\uCEEC \uD30C\uC77C\uBA85\uACFC \uC5C5\uB85C\uB4DC \uD30C\uC77C\uBA85\uC774 \uB3D9\uC77C\uD558\uAC8C \uC801\uC6A9\uB418\uBA70, \uB4DC\uB86D\uD55C \uD30C\uC77C\uC740 \uC6D0\uBCF8 \uC774\uB984\uC744 \uC720\uC9C0\uD569\uB2C8\uB2E4."
    ).addDropdown((drop) => {
      drop.addOption("note", "\uB178\uD2B8 \uC81C\uBAA9_\uBC88\uD638");
      drop.addOption("timestamp", "\uD0C0\uC784\uC2A4\uD0EC\uD504");
      drop.setValue(this.plugin.settings.namingScheme).onChange(async (value) => {
        this.plugin.settings.namingScheme = value;
        await this.plugin.persist();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\uB85C\uCEEC \uBC31\uC5C5 \uC720\uC9C0").setDesc(
      "\uCF1C\uBA74 \uC5C5\uB85C\uB4DC\uD55C \uC774\uBBF8\uC9C0\uB97C \uBCFC\uD2B8 \uCCA8\uBD80 \uD3F4\uB354\uC5D0\uB3C4 \uC800\uC7A5\uD569\uB2C8\uB2E4 (\uAD8C\uC7A5 \u2014 \uD074\uB77C\uC6B0\uB4DC \uC7A5\uC560\xB7\uC11C\uBE44\uC2A4 \uC885\uB8CC\uC5D0\uB3C4 \uC548\uC804). \uB044\uBA74 \uB178\uD2B8\uC5D0 URL\uB9CC \uB0A8\uACE0 \uBCFC\uD2B8\uC5D0\uB294 \uD30C\uC77C\uC774 \uC800\uC7A5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.localBackup).onChange(async (value) => {
        this.plugin.settings.localBackup = value;
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\uCCA8\uBD80 \uD3F4\uB354 \uC624\uBC84\uB77C\uC774\uB4DC").setDesc("\uBE44\uC6B0\uBA74 \uC635\uC2DC\uB514\uC5B8\uC758 \uCCA8\uBD80 \uD30C\uC77C \uC124\uC815 \uC704\uCE58\uB97C \uADF8\uB300\uB85C \uB530\uB985\uB2C8\uB2E4. \uC9C0\uC815\uD558\uBA74 \uADF8 \uD3F4\uB354(\uBCFC\uD2B8 \uB8E8\uD2B8 \uAE30\uC900)\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.").addText(
      (text) => text.setPlaceholder("\uC608: 900. Settings/905. Attached file").setValue(this.plugin.settings.attachmentSubfolder).onChange(async (value) => {
        this.plugin.settings.attachmentSubfolder = value.trim();
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\uC774\uBBF8\uC9C0 \uCD5C\uC801\uD654").setHeading();
    new import_obsidian.Setting(containerEl).setName("\uC5C5\uB85C\uB4DC \uC804 \uC555\uCD95").setDesc(
      "\uBD99\uC5EC\uB123\uB294 \uC774\uBBF8\uC9C0\uB97C \uB9AC\uC0AC\uC774\uC988\xB7\uC7AC\uC778\uCF54\uB529\uD574 \uC6A9\uB7C9\uC744 \uD06C\uAC8C \uC904\uC774\uACE0, EXIF(GPS \uC704\uCE58\xB7\uAE30\uAE30 \uC815\uBCF4)\uB97C \uC81C\uAC70\uD569\uB2C8\uB2E4. svg\xB7gif\uB294 \uC81C\uC678\uB418\uBA70, \uC77C\uAD04 \uBCC0\uD658(\uAE30\uC874 \uD30C\uC77C)\uC5D0\uB294 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.compress.enabled).onChange(async (value) => {
        this.plugin.settings.compress.enabled = value;
        await this.plugin.persist();
        this.display();
      })
    );
    if (this.plugin.settings.compress.enabled) {
      new import_obsidian.Setting(containerEl).setName("WebP\uB85C \uBCC0\uD658").setDesc("PNG/JPEG\uB97C WebP\uB85C \uBCC0\uD658\uD569\uB2C8\uB2E4 (\uBCF4\uD1B5 \uC6A9\uB7C9 70~90% \uC808\uAC10). \uB044\uBA74 \uC6D0\uBCF8 \uD615\uC2DD\uC744 \uC720\uC9C0\uD55C \uCC44 \uB9AC\uC0AC\uC774\uC988\xB7\uC7AC\uC778\uCF54\uB529\uB9CC \uD569\uB2C8\uB2E4.").addToggle(
        (toggle) => toggle.setValue(this.plugin.settings.compress.convertToWebp).onChange(async (value) => {
          this.plugin.settings.compress.convertToWebp = value;
          await this.plugin.persist();
        })
      );
      new import_obsidian.Setting(containerEl).setName("\uCD5C\uB300 \uD3ED (px)").setDesc("\uC774\uBCF4\uB2E4 \uB113\uC740 \uC774\uBBF8\uC9C0\uB294 \uBE44\uC728\uC744 \uC720\uC9C0\uD558\uBA70 \uCD95\uC18C\uD569\uB2C8\uB2E4. 0\uC774\uBA74 \uC81C\uD55C \uC5C6\uC74C. \uAE30\uBCF8 1920.").addText(
        (text) => text.setPlaceholder("1920").setValue(String(this.plugin.settings.compress.maxWidth)).onChange(async (value) => {
          const n = parseInt(value, 10);
          this.plugin.settings.compress.maxWidth = Number.isFinite(n) && n >= 0 ? n : 1920;
          await this.plugin.persist();
        })
      );
      new import_obsidian.Setting(containerEl).setName("\uC778\uCF54\uB529 \uD488\uC9C8").setDesc("WebP/JPEG \uD488\uC9C8 (50~100%). \uAE30\uBCF8 85% \u2014 \uD654\uBA74\uC6A9\uC73C\uB85C\uB294 \uCC28\uC774\uAC00 \uAC70\uC758 \uBCF4\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.").addSlider(
        (slider) => slider.setLimits(50, 100, 5).setValue(Math.round(this.plugin.settings.compress.quality * 100)).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.compress.quality = value / 100;
          await this.plugin.persist();
        })
      );
    }
    new import_obsidian.Setting(containerEl).setName("\uC5C5\uB85C\uB4DC \uC2E4\uD328 \uC2DC \uB85C\uCEEC \uC784\uBCA0\uB4DC \uD3F4\uBC31").setDesc("\uC624\uD504\uB77C\uC778 \uB4F1\uC73C\uB85C \uC5C5\uB85C\uB4DC\uAC00 \uC2E4\uD328\uD558\uBA74 \uB178\uD2B8\uC5D0 ![[\uB85C\uCEEC \uD30C\uC77C]]\uC744 \uB300\uC2E0 \uC0BD\uC785\uD558\uACE0, \uB098\uC911\uC5D0 '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4' \uBA85\uB839\uC73C\uB85C \uBCF5\uAD6C\uD569\uB2C8\uB2E4.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.fallbackToLocalEmbed).onChange(async (value) => {
        this.plugin.settings.fallbackToLocalEmbed = value;
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\uB9AC\uD3EC\uD2B8 \uD3F4\uB354").setDesc("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uB9AC\uD3EC\uD2B8 \uB178\uD2B8\uB97C \uB9CC\uB4E4 \uD3F4\uB354\uC785\uB2C8\uB2E4. \uBE44\uC6B0\uBA74 \uBCFC\uD2B8 \uB8E8\uD2B8\uC5D0 \uB9CC\uB4ED\uB2C8\uB2E4.").addText(
      (text) => text.setValue(this.plugin.settings.reportFolder).onChange(async (value) => {
        this.plugin.settings.reportFolder = value.trim();
        await this.plugin.persist();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\uBBF8\uC0AC\uC6A9 \uCCA8\uBD80 \uD30C\uC77C \uC815\uB9AC").setHeading();
    new import_obsidian.Setting(containerEl).setName("\uCCA8\uBD80 \uD30C\uC77C\uB3C4 \uBD84\uC11D\uC5D0 \uD3EC\uD568").setDesc(
      "\uBBF8\uC0AC\uC6A9 \uB9AC\uD3EC\uD2B8\xB7\uC815\uB9AC\uC5D0\uC11C \uC774\uBBF8\uC9C0 \uC678 \uCCA8\uBD80 \uD30C\uC77C(PDF\xB7\uC624\uB514\uC624 \uB4F1)\uB3C4 \uD568\uAED8 \uBD84\uC11D\uD569\uB2C8\uB2E4. \uC5B4\uB5A4 \uB178\uD2B8\uB3C4 \uB9C1\uD06C\xB7\uC784\uBCA0\uB4DC\uD558\uC9C0 \uC54A\uB294 \uD30C\uC77C\uB9CC \uD6C4\uBCF4\uC5D0 \uC624\uB974\uBA70, \uCE94\uBC84\uC2A4\uC5D0\uC11C \uC4F0\uB294 \uD30C\uC77C\uC740 \uBCF4\uD638\uB429\uB2C8\uB2E4. \uC815\uB9AC\uB294 \uD56D\uC0C1 \uBCFC\uD2B8 .trash/ \uC774\uB3D9(\uBCF5\uAD6C \uAC00\uB2A5)\uBFD0\uC785\uB2C8\uB2E4."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeAttachments).onChange(async (value) => {
        this.plugin.settings.includeAttachments = value;
        await this.plugin.persist();
        this.display();
      })
    );
    if (this.plugin.settings.includeAttachments) {
      new import_obsidian.Setting(containerEl).setName("\uCCA8\uBD80\uB85C \uAC04\uC8FC\uD560 \uD655\uC7A5\uC790").setDesc(
        "\uC27C\uD45C\uB85C \uAD6C\uBD84\uD569\uB2C8\uB2E4. \uC5EC\uAE30 \uB098\uC5F4\uB41C \uD655\uC7A5\uC790\uB9CC \uBD84\uC11D \uB300\uC0C1\uC774 \uB429\uB2C8\uB2E4 \u2014 \uB178\uD2B8(md)\xB7\uCE94\uBC84\uC2A4\xB7\uC124\uC815 \uD30C\uC77C \uB4F1\uC740 \uBAA9\uB85D\uC5D0 \uB123\uC9C0 \uB9C8\uC138\uC694."
      ).addTextArea(
        (text) => text.setPlaceholder(DEFAULT_SETTINGS.attachmentExtensions.join(", ")).setValue(this.plugin.settings.attachmentExtensions.join(", ")).onChange(async (value) => {
          this.plugin.settings.attachmentExtensions = value.split(",").map((s) => s.trim().toLowerCase().replace(/^\./, "")).filter((s) => s.length > 0 && s !== "md" && s !== "canvas");
          await this.plugin.persist();
        })
      );
    }
    if (import_obsidian.Platform.isDesktopApp) {
      new import_obsidian.Setting(containerEl).setName("Eagle \uC5F0\uB3D9 (\uB370\uC2A4\uD06C\uD1B1 \uC804\uC6A9)").setHeading();
      new import_obsidian.Setting(containerEl).setName("Eagle \uC5F0\uB3D9 \uC0AC\uC6A9").setDesc("Eagle \uC571\uC774 \uC2E4\uD589 \uC911\uC77C \uB54C \uAC80\uC0C9\xB7\uB4F1\uB85D \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4. Eagle\uC774 \uC5C6\uC73C\uBA74 \uC870\uC6A9\uD788 \uBE44\uD65C\uC131\uD654\uB429\uB2C8\uB2E4.").addToggle(
        (toggle) => toggle.setValue(this.plugin.settings.eagle.enabled).onChange(async (value) => {
          this.plugin.settings.eagle.enabled = value;
          await this.plugin.persist();
          this.display();
        })
      );
      if (this.plugin.settings.eagle.enabled) {
        new import_obsidian.Setting(containerEl).setName("Eagle API \uC8FC\uC18C").setDesc("Eagle \uB85C\uCEEC API \uC8FC\uC18C\uC785\uB2C8\uB2E4. \uAE30\uBCF8\uAC12\uC744 \uBC14\uAFC0 \uC77C\uC740 \uAC70\uC758 \uC5C6\uC2B5\uB2C8\uB2E4.").addText(
          (text) => text.setPlaceholder(DEFAULT_SETTINGS.eagle.apiUrl).setValue(this.plugin.settings.eagle.apiUrl).onChange(async (value) => {
            this.plugin.settings.eagle.apiUrl = value.trim() || DEFAULT_SETTINGS.eagle.apiUrl;
            await this.plugin.persist();
          })
        );
        new import_obsidian.Setting(containerEl).setName("\uC5C5\uB85C\uB4DC \uC2DC Eagle\uC5D0\uB3C4 \uB4F1\uB85D").setDesc("\uC774\uBBF8\uC9C0\uB97C R2\uC5D0 \uC5C5\uB85C\uB4DC\uD560 \uB54C \uB85C\uCEEC \uBC31\uC5C5 \uD30C\uC77C\uC744 Eagle \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0\uB3C4 \uCD94\uAC00\uD569\uB2C8\uB2E4 (\uB85C\uCEEC \uBC31\uC5C5\uC774 \uCF1C\uC838 \uC788\uC5B4\uC57C \uD568).").addToggle(
          (toggle) => toggle.setValue(this.plugin.settings.eagle.registerOnUpload).onChange(async (value) => {
            this.plugin.settings.eagle.registerOnUpload = value;
            await this.plugin.persist();
          })
        );
        new import_obsidian.Setting(containerEl).setName("Eagle \uD3F4\uB354 ID").setDesc("\uB4F1\uB85D\uD560 Eagle \uD3F4\uB354 ID (\uC120\uD0DD). \uBE44\uC6B0\uBA74 \uB77C\uC774\uBE0C\uB7EC\uB9AC \uB8E8\uD2B8(\uBBF8\uBD84\uB958)\uC5D0 \uCD94\uAC00\uB429\uB2C8\uB2E4.").addText(
          (text) => text.setValue(this.plugin.settings.eagle.folderId).onChange(async (value) => {
            this.plugin.settings.eagle.folderId = value.trim();
            await this.plugin.persist();
          })
        );
      }
    }
  }
};

// src/manifest.ts
var SAVE_DEBOUNCE_MS = 500;
var ManifestStore = class {
  constructor(io) {
    this.io = io;
    this.data = { version: 1, entries: {} };
    this.hashIndex = /* @__PURE__ */ new Map();
    this.localPathIndex = /* @__PURE__ */ new Map();
    this.saveTimer = null;
    this.dirty = false;
  }
  async load() {
    let raw = null;
    try {
      raw = await this.io.read();
    } catch (e) {
      raw = null;
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.entries) {
          this.data = { version: 1, entries: parsed.entries };
        }
      } catch (e) {
        this.data = { version: 1, entries: {} };
      }
    }
    this.rebuildIndexes();
  }
  rebuildIndexes() {
    this.hashIndex.clear();
    this.localPathIndex.clear();
    for (const entry of Object.values(this.data.entries)) {
      if (entry.hash)
        this.hashIndex.set(entry.hash, entry.id);
      if (entry.localPath)
        this.localPathIndex.set(entry.localPath, entry.id);
    }
  }
  all() {
    return Object.values(this.data.entries);
  }
  get(id) {
    var _a;
    return (_a = this.data.entries[id]) != null ? _a : null;
  }
  byHash(hash) {
    var _a;
    const id = this.hashIndex.get(hash);
    return id ? (_a = this.data.entries[id]) != null ? _a : null : null;
  }
  byLocalPath(path) {
    var _a;
    const id = this.localPathIndex.get(path);
    return id ? (_a = this.data.entries[id]) != null ? _a : null : null;
  }
  byUrl(url) {
    for (const entry of Object.values(this.data.entries)) {
      if (entry.url === url)
        return entry;
    }
    return null;
  }
  add(entry) {
    this.data.entries[entry.id] = entry;
    if (entry.hash)
      this.hashIndex.set(entry.hash, entry.id);
    if (entry.localPath)
      this.localPathIndex.set(entry.localPath, entry.id);
    this.scheduleSave();
  }
  update(id, patch) {
    const entry = this.data.entries[id];
    if (!entry)
      return;
    if (patch.localPath !== void 0 && entry.localPath) {
      this.localPathIndex.delete(entry.localPath);
    }
    Object.assign(entry, patch);
    if (entry.localPath)
      this.localPathIndex.set(entry.localPath, entry.id);
    if (entry.hash)
      this.hashIndex.set(entry.hash, entry.id);
    this.scheduleSave();
  }
  /** 엔트리 완전 제거 — 삭제 흐름(R2 삭제 + 로컬 휴지통 이동) 완료 후에만 호출 */
  remove(id) {
    const entry = this.data.entries[id];
    if (!entry)
      return;
    delete this.data.entries[id];
    if (entry.hash && this.hashIndex.get(entry.hash) === id)
      this.hashIndex.delete(entry.hash);
    if (entry.localPath && this.localPathIndex.get(entry.localPath) === id) {
      this.localPathIndex.delete(entry.localPath);
    }
    this.scheduleSave();
  }
  /** vault rename 이벤트 → 로컬 백업 경로 추적 (paste-image-rename 등 외부 rename 방어) */
  handleRename(oldPath, newPath) {
    const entry = this.byLocalPath(oldPath);
    if (!entry)
      return;
    this.update(entry.id, { localPath: newPath });
  }
  /** vault delete 이벤트 → 로컬 백업 소실 표기 (entry 자체는 보존 — 클라우드에 남아 있음) */
  handleDelete(path) {
    const entry = this.byLocalPath(path);
    if (!entry)
      return;
    this.update(entry.id, { localPath: null });
  }
  scheduleSave() {
    this.dirty = true;
    if (this.saveTimer)
      clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      void this.flush();
    }, SAVE_DEBOUNCE_MS);
  }
  async flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (!this.dirty)
      return;
    this.dirty = false;
    try {
      await this.io.write(JSON.stringify(this.data, null, 2));
    } catch (e) {
      this.dirty = true;
    }
  }
};

// src/r2/client.ts
var import_obsidian2 = require("obsidian");

// src/r2/sigv4.ts
var encoder = new TextEncoder();
async function sha256Hex(data) {
  const bytes = typeof data === "string" ? encoder.encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
}
function toHex(bytes) {
  let out = "";
  for (const b of bytes)
    out += b.toString(16).padStart(2, "0");
  return out;
}
async function hmac(key, data) {
  const keyBytes = key instanceof Uint8Array ? key : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}
function awsUriEncode(value, encodeSlash) {
  let out = "";
  for (const ch of value) {
    if (/[A-Za-z0-9\-._~]/.test(ch) || ch === "/" && !encodeSlash) {
      out += ch;
    } else {
      const bytes = encoder.encode(ch);
      for (const b of bytes)
        out += "%" + b.toString(16).toUpperCase().padStart(2, "0");
    }
  }
  return out;
}
function amzTimestamp(date) {
  const iso = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}
async function signRequest(input) {
  var _a, _b, _c;
  const { amzDate, dateStamp } = amzTimestamp(input.date);
  const headers = {
    ...(_a = input.headers) != null ? _a : {},
    host: input.host,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": input.payloadHash
  };
  const sortedHeaderNames = Object.keys(headers).map((h) => h.toLowerCase()).sort();
  const lowerHeaders = {};
  for (const [k, v] of Object.entries(headers))
    lowerHeaders[k.toLowerCase()] = v.trim().replace(/\s+/g, " ");
  const canonicalHeaders = sortedHeaderNames.map((h) => `${h}:${lowerHeaders[h]}
`).join("");
  const signedHeaders = sortedHeaderNames.join(";");
  const canonicalUri = awsUriEncode(input.path, false) || "/";
  const canonicalQuery = Object.entries((_b = input.query) != null ? _b : {}).map(([k, v]) => [awsUriEncode(k, true), awsUriEncode(v, true)]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${k}=${v}`).join("&");
  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    input.payloadHash
  ].join("\n");
  const scope = `${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");
  let key = encoder.encode(`AWS4${input.secretAccessKey}`);
  for (const part of [dateStamp, input.region, input.service, "aws4_request"]) {
    key = await hmac(key, part);
  }
  const signature = toHex(new Uint8Array(await hmac(key, stringToSign)));
  const authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const outHeaders = { ...(_c = input.headers) != null ? _c : {} };
  outHeaders["x-amz-date"] = amzDate;
  outHeaders["x-amz-content-sha256"] = input.payloadHash;
  outHeaders["Authorization"] = authorization;
  return { headers: outHeaders, canonicalRequest, stringToSign, signature };
}

// src/filename.ts
var MIME_TO_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/avif": "avif"
};
var EXT_TO_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  avif: "image/avif"
};
function extForMime(mime) {
  var _a;
  return (_a = MIME_TO_EXT[mime.toLowerCase()]) != null ? _a : null;
}
function mimeForExt(ext) {
  var _a;
  return (_a = EXT_TO_MIME[ext.toLowerCase()]) != null ? _a : "application/octet-stream";
}
function isImageExt(ext, allowed) {
  return allowed.includes(ext.toLowerCase());
}
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|#^[\]]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 120);
}
function stemOf(filename) {
  const i = filename.lastIndexOf(".");
  return i > 0 ? filename.slice(0, i) : filename;
}
function extOf(filename) {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}
function randSuffix(len = 4) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function makeImageBaseName(date, rand) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `img-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}
function makeNamedBaseName(originalName, rand) {
  const stem = sanitizeFilename(stemOf(originalName));
  return stem ? `${stem}-${rand}` : `img-${rand}`;
}
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function nextNoteImageName(noteTitle, existingNames, ext) {
  const title = sanitizeFilename(noteTitle) || "img";
  const re = new RegExp(`^${escapeRegExp(title)}_(\\d+)\\.`);
  let max = 0;
  for (const name of existingNames) {
    const m = name.match(re);
    if (m)
      max = Math.max(max, parseInt(m[1], 10));
  }
  return `${title}_${max + 1}.${ext}`;
}
function makeR2Key(prefix, date, filename) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const parts = cleanPrefix ? [cleanPrefix, String(y), m, filename] : [String(y), m, filename];
  return parts.join("/");
}
function publicUrlFor(publicBaseUrl, key) {
  const base = publicBaseUrl.replace(/\/+$/g, "");
  return `${base}/${awsUriEncode(key, false)}`;
}

// src/r2/client.ts
var R2Client = class {
  constructor(getConfig) {
    this.getConfig = getConfig;
  }
  /** 누락된 필수 설정 필드명 목록 — 비어 있으면 사용 가능 */
  missingFields() {
    const c = this.getConfig();
    const missing = [];
    if (!c.accountId.trim())
      missing.push("Account ID");
    if (!c.accessKeyId.trim())
      missing.push("Access Key ID");
    if (!c.secretAccessKey.trim())
      missing.push("Secret Access Key");
    if (!c.bucket.trim())
      missing.push("\uBC84\uD0B7 \uC774\uB984");
    if (!c.publicBaseUrl.trim())
      missing.push("\uACF5\uAC1C base URL");
    return missing;
  }
  isConfigured() {
    return this.missingFields().length === 0;
  }
  publicUrl(key) {
    return publicUrlFor(this.getConfig().publicBaseUrl, key);
  }
  host() {
    return `${this.getConfig().accountId.trim()}.r2.cloudflarestorage.com`;
  }
  async signedRequest(method, key, body, contentType) {
    var _a;
    const c = this.getConfig();
    const host = this.host();
    const path = `/${c.bucket.trim()}/${key}`;
    const payloadHash = body ? await sha256Hex(body) : await sha256Hex("");
    const extraHeaders = {};
    if (contentType)
      extraHeaders["content-type"] = contentType;
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
      date: /* @__PURE__ */ new Date()
    });
    const { host: _h, ...sendHeaders } = signed.headers;
    const url = `https://${host}${awsUriEncode(path, false)}`;
    const res = await (0, import_obsidian2.requestUrl)({
      url,
      method,
      headers: sendHeaders,
      body,
      throw: false
    });
    return { status: res.status, text: res.status >= 300 ? (_a = res.text) != null ? _a : "" : "" };
  }
  async putObject(key, body, contentType) {
    const res = await this.signedRequest("PUT", key, body, contentType);
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`R2 \uC5C5\uB85C\uB4DC \uC2E4\uD328 (HTTP ${res.status})${summarizeS3Error(res.text)}`);
    }
  }
  async deleteObject(key) {
    const res = await this.signedRequest("DELETE", key);
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`R2 \uC0AD\uC81C \uC2E4\uD328 (HTTP ${res.status})${summarizeS3Error(res.text)}`);
    }
  }
  /** 테스트 객체 PUT → DELETE 왕복으로 자격증명·버킷 검증 */
  async testConnection() {
    const missing = this.missingFields();
    if (missing.length > 0) {
      return { ok: false, message: `\uC124\uC815 \uB204\uB77D: ${missing.join(", ")}` };
    }
    const c = this.getConfig();
    const prefix = c.keyPrefix.replace(/^\/+|\/+$/g, "");
    const testKey = `${prefix ? prefix + "/" : ""}.a4p-connection-test`;
    try {
      const body = new TextEncoder().encode("a4p-image connection test").buffer;
      await this.putObject(testKey, body, "text/plain");
      await this.deleteObject(testKey);
      return { ok: true, message: "\uC5F0\uACB0 \uC131\uACF5 \u2014 \uC5C5\uB85C\uB4DC\xB7\uC0AD\uC81C \uAD8C\uD55C\uC774 \uD655\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4." };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
};
function summarizeS3Error(xml) {
  var _a, _b;
  if (!xml)
    return "";
  const code = (_a = xml.match(/<Code>([^<]+)<\/Code>/)) == null ? void 0 : _a[1];
  const msg = (_b = xml.match(/<Message>([^<]+)<\/Message>/)) == null ? void 0 : _b[1];
  if (!code && !msg)
    return "";
  return ` \u2014 ${[code, msg].filter(Boolean).join(": ")}`;
}

// src/uploader.ts
var import_obsidian3 = require("obsidian");

// src/compress.ts
var COMPRESSIBLE = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/avif"]);
function isCompressible(mime) {
  return COMPRESSIBLE.has(mime.toLowerCase());
}
async function compressImage(buf, mime, opts) {
  if (!isCompressible(mime))
    return null;
  try {
    const blob = new Blob([buf], { type: mime });
    const bitmap = await createImageBitmap(blob);
    const scale = opts.maxWidth > 0 && bitmap.width > opts.maxWidth ? opts.maxWidth / bitmap.width : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const targetMime = opts.convertToWebp ? "image/webp" : mime === "image/png" ? "image/png" : "image/jpeg";
    const quality = targetMime === "image/png" ? void 0 : clampQuality(opts.quality);
    const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, targetMime, quality));
    if (!outBlob)
      return null;
    const outBuf = await outBlob.arrayBuffer();
    if (scale === 1 && outBuf.byteLength >= buf.byteLength)
      return null;
    return { buf: outBuf, mime: targetMime };
  } catch (e) {
    console.error("[a4p-image] \uC774\uBBF8\uC9C0 \uC555\uCD95 \uC2E4\uD328 \u2014 \uC6D0\uBCF8\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4", e);
    return null;
  }
}
function clampQuality(q) {
  if (!Number.isFinite(q))
    return 0.85;
  return Math.min(1, Math.max(0.5, q));
}

// src/uploader.ts
var Uploader = class {
  constructor(plugin) {
    this.plugin = plugin;
    /** 업로드 성공 직후 호출되는 훅 (Eagle 등록 등 부가 기능 — 실패해도 결과에 영향 없음) */
    this.onUploaded = null;
  }
  /** 새 바이너리(클립보드·드롭·Eagle 복사) 처리 */
  async process(buf, input) {
    var _a, _b;
    const { manifestStore } = this.plugin;
    const hash = await sha256Hex(buf);
    const existing = manifestStore.byHash(hash);
    if (existing && existing.status === "uploaded") {
      return { ok: true, url: existing.url, stem: stemOf(fileNameOf(existing)), entryId: existing.id, reused: true };
    }
    let workBuf = buf;
    let workMime = input.mime;
    const cs = this.plugin.settings.compress;
    if (cs.enabled) {
      const compressed = await compressImage(buf, workMime, cs);
      if (compressed) {
        workBuf = compressed.buf;
        workMime = compressed.mime;
      }
    }
    const now = /* @__PURE__ */ new Date();
    const extFromName = input.name ? extOf(input.name) : "";
    const ext = (_a = extForMime(workMime)) != null ? _a : extFromName || "png";
    let filename;
    if (input.name) {
      filename = `${makeNamedBaseName(input.name, randSuffix())}.${ext}`;
    } else if (this.plugin.settings.namingScheme === "note" && input.sourceNotePath) {
      filename = await this.noteBasedFilename(input.sourceNotePath, ext);
    } else {
      filename = `${makeImageBaseName(now, randSuffix())}.${ext}`;
    }
    let localPath = null;
    if (this.plugin.settings.localBackup) {
      try {
        localPath = await this.saveToVault(filename, workBuf, input.sourceNotePath);
      } catch (e) {
        console.error("[a4p-image] \uB85C\uCEEC \uBC31\uC5C5 \uC800\uC7A5 \uC2E4\uD328", e);
        new import_obsidian3.Notice(`\uC774\uBBF8\uC9C0 \uB85C\uCEEC \uBC31\uC5C5 \uC800\uC7A5 \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    const finalName = localPath ? (_b = localPath.split("/").pop()) != null ? _b : filename : filename;
    const entry = {
      id: `${stemOf(finalName)}-${randSuffix()}`,
      localPath,
      r2Key: makeR2Key(this.plugin.settings.r2.keyPrefix, now, finalName),
      url: "",
      hash,
      size: workBuf.byteLength,
      mime: workMime || mimeForExt(ext),
      createdAt: now.getTime(),
      uploadedAt: null,
      status: "pending",
      sourceNote: input.sourceNotePath,
      origin: input.origin,
      eagleId: null
    };
    entry.url = this.plugin.r2.publicUrl(entry.r2Key);
    manifestStore.add(entry);
    return this.uploadEntry(entry, workBuf);
  }
  /** 볼트에 이미 존재하는 이미지 파일(일괄 변환) 처리 — 파일이 그대로 로컬 백업이 됨 */
  async processExisting(file, origin = "convert") {
    const { manifestStore } = this.plugin;
    const buf = await this.plugin.app.vault.readBinary(file);
    const hash = await sha256Hex(buf);
    const existing = manifestStore.byHash(hash);
    if (existing && existing.status === "uploaded") {
      return { ok: true, url: existing.url, stem: stemOf(file.name), entryId: existing.id, reused: true };
    }
    const registered = manifestStore.byLocalPath(file.path);
    const now = /* @__PURE__ */ new Date();
    let entry;
    if (registered && registered.status !== "uploaded") {
      entry = registered;
    } else {
      entry = {
        id: `${stemOf(file.name)}-${randSuffix()}`,
        localPath: file.path,
        r2Key: makeR2Key(this.plugin.settings.r2.keyPrefix, now, file.name),
        url: "",
        hash,
        size: buf.byteLength,
        mime: mimeForExt(file.extension),
        createdAt: now.getTime(),
        uploadedAt: null,
        status: "pending",
        sourceNote: null,
        origin,
        eagleId: null
      };
      entry.url = this.plugin.r2.publicUrl(entry.r2Key);
      manifestStore.add(entry);
    }
    return this.uploadEntry(entry, buf);
  }
  async uploadEntry(entry, buf) {
    var _a;
    const { manifestStore } = this.plugin;
    try {
      await this.plugin.r2.putObject(entry.r2Key, buf, entry.mime);
      manifestStore.update(entry.id, { status: "uploaded", uploadedAt: Date.now() });
      if (this.onUploaded) {
        try {
          await this.onUploaded((_a = manifestStore.get(entry.id)) != null ? _a : entry);
        } catch (e) {
          console.error("[a4p-image] onUploaded \uD6C5 \uC2E4\uD328", e);
        }
      }
      return { ok: true, url: entry.url, stem: stemOf(fileNameOf(entry)), entryId: entry.id, reused: false };
    } catch (e) {
      manifestStore.update(entry.id, { status: "failed" });
      return {
        ok: false,
        localPath: entry.localPath,
        entryId: entry.id,
        error: e instanceof Error ? e.message : String(e)
      };
    }
  }
  /** `{노트제목}_{n}.{ext}` — 대상 첨부 폴더를 스캔해 최대 번호 +1 */
  async noteBasedFilename(sourceNotePath, ext) {
    var _a;
    const noteName = (_a = sourceNotePath.split("/").pop()) != null ? _a : sourceNotePath;
    const title = noteName.replace(/\.md$/i, "");
    const folderPath = await this.attachmentFolderFor(`probe.${ext}`, sourceNotePath);
    const { vault } = this.plugin.app;
    const folder = folderPath ? vault.getAbstractFileByPath(folderPath) : vault.getRoot();
    const existingNames = [];
    if (folder instanceof import_obsidian3.TFolder) {
      for (const child of folder.children) {
        if (child instanceof import_obsidian3.TFile)
          existingNames.push(child.name);
      }
    }
    return nextNoteImageName(title, existingNames, ext);
  }
  /** 이미지가 저장될 첨부 폴더 경로 — 오버라이드 설정 우선, 없으면 볼트 첨부 설정 */
  async attachmentFolderFor(sampleName, sourceNotePath) {
    const override = this.plugin.settings.attachmentSubfolder;
    if (override)
      return (0, import_obsidian3.normalizePath)(override);
    const probe = await this.plugin.app.fileManager.getAvailablePathForAttachment(sampleName, sourceNotePath != null ? sourceNotePath : "");
    const i = probe.lastIndexOf("/");
    return i >= 0 ? probe.slice(0, i) : "";
  }
  async saveToVault(filename, buf, sourceNotePath) {
    const { app } = this.plugin;
    const override = this.plugin.settings.attachmentSubfolder;
    let path;
    if (override) {
      const folder = (0, import_obsidian3.normalizePath)(override);
      if (!app.vault.getAbstractFileByPath(folder)) {
        await app.vault.createFolder(folder);
      }
      path = await uniqueBinaryPath(this.plugin, `${folder}/${filename}`);
    } else {
      path = await app.fileManager.getAvailablePathForAttachment(filename, sourceNotePath != null ? sourceNotePath : "");
    }
    await app.vault.createBinary(path, buf);
    return path;
  }
  /** pending/failed 항목 재업로드 + 노트의 로컬 임베드를 URL로 치환 */
  async retryPending() {
    var _a;
    const { manifestStore, app } = this.plugin;
    const targets = manifestStore.all().filter((e) => e.status !== "uploaded");
    const failed = [];
    let succeeded = 0;
    if (targets.length === 0)
      return { retried: 0, succeeded: 0, failed };
    const notice = new import_obsidian3.Notice(`\uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4 \uC911\u2026 0/${targets.length}`, 0);
    try {
      let done = 0;
      for (const entry of targets) {
        done++;
        notice.setMessage(`\uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4 \uC911\u2026 ${done}/${targets.length}`);
        if (!entry.localPath) {
          failed.push(`${entry.id}: \uB85C\uCEEC \uD30C\uC77C\uC774 \uC5C6\uC5B4 \uC7AC\uC2DC\uB3C4\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
          continue;
        }
        const file = app.vault.getAbstractFileByPath(entry.localPath);
        if (!(file instanceof import_obsidian3.TFile)) {
          failed.push(`${entry.id}: \uB85C\uCEEC \uD30C\uC77C(${entry.localPath})\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
          continue;
        }
        const buf = await app.vault.readBinary(file);
        const outcome = await this.uploadEntry(entry, buf);
        if (outcome.ok) {
          succeeded++;
          await this.replaceLocalEmbedsWithUrl((_a = manifestStore.get(entry.id)) != null ? _a : entry);
        } else {
          failed.push(`${entry.id}: ${outcome.error}`);
        }
      }
    } finally {
      notice.hide();
    }
    return { retried: targets.length, succeeded, failed };
  }
  /** 이 entry의 로컬 파일을 가리키는 모든 임베드를 클라우드 URL로 치환 */
  async replaceLocalEmbedsWithUrl(entry) {
    var _a;
    const { app } = this.plugin;
    if (!entry.localPath || !entry.url)
      return 0;
    const localPath = entry.localPath;
    const stem = stemOf(fileNameOf(entry));
    const notePaths = /* @__PURE__ */ new Set();
    if (entry.sourceNote)
      notePaths.add(entry.sourceNote);
    const resolved = app.metadataCache.resolvedLinks;
    for (const [mdPath, links] of Object.entries(resolved)) {
      if (links[localPath])
        notePaths.add(mdPath);
    }
    let replacedCount = 0;
    for (const mdPath of notePaths) {
      const md = app.vault.getAbstractFileByPath(mdPath);
      if (!(md instanceof import_obsidian3.TFile))
        continue;
      const cache = app.metadataCache.getFileCache(md);
      const embeds = (_a = cache == null ? void 0 : cache.embeds) != null ? _a : [];
      const originals = [];
      for (const embed of embeds) {
        const dest = app.metadataCache.getFirstLinkpathDest(embed.link, mdPath);
        if ((dest == null ? void 0 : dest.path) === localPath)
          originals.push(embed.original);
      }
      if (originals.length === 0)
        continue;
      await app.vault.process(md, (content) => {
        let next = content;
        for (const original of originals) {
          if (next.includes(original)) {
            next = next.split(original).join(`![${stem}](${entry.url})`);
            replacedCount++;
          }
        }
        return next;
      });
    }
    return replacedCount;
  }
};
function fileNameOf(entry) {
  if (entry.localPath) {
    const i2 = entry.localPath.lastIndexOf("/");
    return i2 >= 0 ? entry.localPath.slice(i2 + 1) : entry.localPath;
  }
  const i = entry.r2Key.lastIndexOf("/");
  return i >= 0 ? entry.r2Key.slice(i + 1) : entry.r2Key;
}
async function uniqueBinaryPath(plugin, basePath) {
  const { app } = plugin;
  const normalized = (0, import_obsidian3.normalizePath)(basePath);
  if (!app.vault.getAbstractFileByPath(normalized))
    return normalized;
  const dot = normalized.lastIndexOf(".");
  const stem = dot > 0 ? normalized.slice(0, dot) : normalized;
  const ext = dot > 0 ? normalized.slice(dot) : "";
  for (let i = 2; i < 100; i++) {
    const cand = `${stem} (${i})${ext}`;
    if (!app.vault.getAbstractFileByPath(cand))
      return cand;
  }
  throw new Error("\uB3D9\uC77C \uD30C\uC77C\uBA85\uC73C\uB85C \uC911\uBCF5\uC774 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4.");
}

// src/paste-handler.ts
var import_obsidian4 = require("obsidian");
function registerPasteHandlers(plugin) {
  let warnedNotConfigured = false;
  const gate = (files, hasText) => {
    if (files.length === 0)
      return false;
    if (!files.every((f) => f.type.startsWith("image/")))
      return false;
    if (hasText)
      return false;
    if (!plugin.r2.isConfigured()) {
      if (!warnedNotConfigured) {
        warnedNotConfigured = true;
        new import_obsidian4.Notice("A4P Image: R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uAE30\uBCF8 \uBD99\uC5EC\uB123\uAE30\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694.");
      }
      return false;
    }
    return true;
  };
  plugin.registerEvent(
    plugin.app.workspace.on("editor-paste", (evt, editor, info) => {
      if (evt.defaultPrevented)
        return;
      const data = evt.clipboardData;
      if (!data)
        return;
      const files = Array.from(data.files);
      if (!gate(files, !!data.getData("text/plain")))
        return;
      evt.preventDefault();
      void handleImages(plugin, files, editor, info, "paste");
    })
  );
  plugin.registerEvent(
    plugin.app.workspace.on("editor-drop", (evt, editor, info) => {
      if (evt.defaultPrevented)
        return;
      const data = evt.dataTransfer;
      if (!data)
        return;
      const files = Array.from(data.files);
      if (!gate(files, false))
        return;
      evt.preventDefault();
      void handleImages(plugin, files, editor, info, "drop");
    })
  );
}
async function handleImages(plugin, files, editor, info, origin) {
  var _a, _b;
  const sourceNote = (_a = info.file) != null ? _a : plugin.app.workspace.getActiveFile();
  for (const file of files) {
    const displayName = file.name || "\uC774\uBBF8\uC9C0";
    const placeholder = `![\uC5C5\uB85C\uB4DC \uC911 ${displayName}\u2026](a4pimg://${Math.random().toString(36).slice(2, 10)})`;
    editor.replaceSelection(placeholder);
    let finalText;
    try {
      const buf = await file.arrayBuffer();
      const outcome = await plugin.uploader.process(buf, {
        name: origin === "drop" && file.name ? file.name : void 0,
        mime: file.type,
        sourceNotePath: (_b = sourceNote == null ? void 0 : sourceNote.path) != null ? _b : null,
        origin
      });
      if (outcome.ok) {
        finalText = `![${outcome.stem}](${outcome.url})`;
        if (outcome.reused)
          new import_obsidian4.Notice("\uC774\uBBF8 \uC5C5\uB85C\uB4DC\uB41C \uC774\uBBF8\uC9C0 \u2014 \uAE30\uC874 URL\uC744 \uC7AC\uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.");
      } else if (outcome.localPath && plugin.settings.fallbackToLocalEmbed) {
        finalText = `![[${outcome.localPath}]]`;
        new import_obsidian4.Notice(
          `\uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 \uB85C\uCEEC\uB85C \uC784\uBCA0\uB4DC\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4'\uB97C \uC2E4\uD589\uD558\uC138\uC694.
(${outcome.error})`,
          8e3
        );
      } else {
        finalText = "";
        new import_obsidian4.Notice(`\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC \uC2E4\uD328: ${outcome.error}`, 8e3);
      }
    } catch (e) {
      finalText = "";
      new import_obsidian4.Notice(`\uC774\uBBF8\uC9C0 \uCC98\uB9AC \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`, 8e3);
    }
    await replacePlaceholder(plugin, editor, sourceNote, placeholder, finalText);
  }
}
async function replacePlaceholder(plugin, editor, sourceNote, placeholder, replacement) {
  const content = editor.getValue();
  const index = content.indexOf(placeholder);
  if (index >= 0) {
    const from = editor.offsetToPos(index);
    const to = editor.offsetToPos(index + placeholder.length);
    editor.replaceRange(replacement, from, to);
    return;
  }
  if (sourceNote) {
    await plugin.app.vault.process(
      sourceNote,
      (text) => text.includes(placeholder) ? text.split(placeholder).join(replacement) : text
    );
  }
}

// src/convert-modal.ts
var import_obsidian5 = require("obsidian");

// src/convert.ts
function buildConvertPlan(refs) {
  var _a;
  const byNote = /* @__PURE__ */ new Map();
  const imageSet = /* @__PURE__ */ new Set();
  for (const ref of refs) {
    const list = (_a = byNote.get(ref.notePath)) != null ? _a : [];
    list.push(ref);
    byNote.set(ref.notePath, list);
    imageSet.add(ref.imagePath);
  }
  return { byNote, imagePaths: [...imageSet], totalEmbeds: refs.length };
}
function markdownImageText(filename, url, alt) {
  return `![${alt != null ? alt : stemOf(filename)}](${url})`;
}
function applyReplacements(content, replacements) {
  let next = content;
  let count = 0;
  for (const { original, replacement } of replacements) {
    if (!original || original === replacement)
      continue;
    if (next.includes(original)) {
      const parts = next.split(original);
      count += parts.length - 1;
      next = parts.join(replacement);
    }
  }
  return { content: next, count };
}
function formatBytes(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// src/convert-modal.ts
function scanImageEmbeds(plugin, notes) {
  var _a;
  const { app } = plugin;
  const refs = [];
  const sizes = /* @__PURE__ */ new Map();
  for (const md of notes) {
    const cache = app.metadataCache.getFileCache(md);
    for (const embed of (_a = cache == null ? void 0 : cache.embeds) != null ? _a : []) {
      const dest = app.metadataCache.getFirstLinkpathDest(embed.link, md.path);
      if (!(dest instanceof import_obsidian5.TFile))
        continue;
      if (!isImageExt(dest.extension, plugin.settings.imageExtensions))
        continue;
      const alt = embed.displayText && embed.displayText !== embed.link && embed.displayText !== dest.name ? embed.displayText : void 0;
      refs.push({ notePath: md.path, original: embed.original, imagePath: dest.path, alt });
      sizes.set(dest.path, dest.stat.size);
    }
  }
  return { refs, sizes };
}
async function openConvertModal(plugin, notes, scopeLabel) {
  if (!plugin.r2.isConfigured()) {
    new import_obsidian5.Notice("R2 \uC124\uC815\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.");
    return;
  }
  const { refs, sizes } = scanImageEmbeds(plugin, notes);
  if (refs.length === 0) {
    new import_obsidian5.Notice(`${scopeLabel}\uC5D0 \uBCC0\uD658\uD560 \uB85C\uCEEC \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.`);
    return;
  }
  new ConvertPlanModal(plugin.app, plugin, refs, sizes, scopeLabel).open();
}
var ConvertPlanModal = class extends import_obsidian5.Modal {
  constructor(app, plugin, refs, sizes, scopeLabel) {
    super(app);
    this.plugin = plugin;
    this.refs = refs;
    this.sizes = sizes;
    this.scopeLabel = scopeLabel;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const plan = buildConvertPlan(this.refs);
    const totalSize = plan.imagePaths.reduce((sum, p) => {
      var _a;
      return sum + ((_a = this.sizes.get(p)) != null ? _a : 0);
    }, 0);
    const alreadyUploaded = plan.imagePaths.filter((p) => {
      const entry = this.plugin.manifestStore.byLocalPath(p);
      return (entry == null ? void 0 : entry.status) === "uploaded";
    });
    contentEl.createEl("h3", { text: `\uB85C\uCEEC \uC774\uBBF8\uC9C0 \u2192 \uD074\uB77C\uC6B0\uB4DC \uBCC0\uD658 (${this.scopeLabel})` });
    contentEl.createEl("p", {
      text: `\uB178\uD2B8 ${plan.byNote.size}\uAC1C\uC5D0\uC11C \uC784\uBCA0\uB4DC ${plan.totalEmbeds}\uAC1C, \uC774\uBBF8\uC9C0 ${plan.imagePaths.length}\uAC1C (${formatBytes(totalSize)})\uAC00 \uB300\uC0C1\uC785\uB2C8\uB2E4.` + (alreadyUploaded.length > 0 ? ` \uADF8\uC911 ${alreadyUploaded.length}\uAC1C\uB294 \uC774\uBBF8 \uC5C5\uB85C\uB4DC\uB418\uC5B4 URL\uC744 \uC7AC\uC0AC\uC6A9\uD569\uB2C8\uB2E4.` : "")
    });
    contentEl.createEl("p", {
      text: "\uC6D0\uBCF8 \uB85C\uCEEC \uD30C\uC77C\uC740 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uACE0 \uADF8\uB300\uB85C \uBC31\uC5C5\uC73C\uB85C \uB0A8\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uBAA9\uB85D\uC744 \uD655\uC778\uD55C \uB4A4 \uC2B9\uC778\uD558\uC138\uC694.",
      cls: "a4p-image-settings-status-line"
    });
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const [notePath, noteRefs] of plan.byNote) {
      listEl.createDiv({ cls: "a4p-image-plan-note", text: notePath });
      for (const ref of noteRefs) {
        const item = listEl.createDiv({ cls: "a4p-image-plan-item" });
        item.createSpan({ text: ref.imagePath });
        const entry = this.plugin.manifestStore.byLocalPath(ref.imagePath);
        if ((entry == null ? void 0 : entry.status) === "uploaded")
          item.createSpan({ cls: "dedup", text: "\uC774\uBBF8 \uC5C5\uB85C\uB4DC\uB428 \u2014 URL \uC7AC\uC0AC\uC6A9" });
      }
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const runBtn = buttons.createEl("button", { text: `\uBCC0\uD658 \uC2E4\uD589 (\uC774\uBBF8\uC9C0 ${plan.imagePaths.length}\uAC1C)`, cls: "mod-cta" });
    runBtn.addEventListener("click", () => {
      this.close();
      void executeConvert(this.plugin, this.refs);
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
async function executeConvert(plugin, refs) {
  const { app } = plugin;
  const plan = buildConvertPlan(refs);
  const urlByImage = /* @__PURE__ */ new Map();
  const failures = [];
  const notice = new import_obsidian5.Notice(`\uBCC0\uD658 \uC911\u2026 0/${plan.imagePaths.length}`, 0);
  try {
    let done = 0;
    await mapPool(plan.imagePaths, 3, async (imagePath) => {
      const file = app.vault.getAbstractFileByPath(imagePath);
      if (file instanceof import_obsidian5.TFile) {
        const outcome = await plugin.uploader.processExisting(file);
        if (outcome.ok) {
          urlByImage.set(imagePath, { url: outcome.url, filename: file.name });
        } else {
          failures.push(`${imagePath}: ${outcome.error}`);
        }
      } else {
        failures.push(`${imagePath}: \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
      }
      done++;
      notice.setMessage(`\uBCC0\uD658 \uC911\u2026 ${done}/${plan.imagePaths.length}`);
    });
    let replaced = 0;
    for (const [notePath, noteRefs] of plan.byNote) {
      const md = app.vault.getAbstractFileByPath(notePath);
      if (!(md instanceof import_obsidian5.TFile))
        continue;
      const replacements = noteRefs.filter((r) => urlByImage.has(r.imagePath)).map((r) => {
        const { url, filename } = urlByImage.get(r.imagePath);
        return { original: r.original, replacement: markdownImageText(filename, url, r.alt) };
      });
      if (replacements.length === 0)
        continue;
      await app.vault.process(md, (content) => {
        const result = applyReplacements(content, replacements);
        replaced += result.count;
        return result.content;
      });
    }
    notice.hide();
    const summary = `\uBCC0\uD658 \uC644\uB8CC \u2014 \uC774\uBBF8\uC9C0 ${urlByImage.size}\uAC1C \uC5C5\uB85C\uB4DC, \uC784\uBCA0\uB4DC ${replaced}\uAC1C \uCE58\uD658` + (failures.length > 0 ? `, \uC2E4\uD328 ${failures.length}\uAC74` : "");
    new import_obsidian5.Notice(summary, 8e3);
    if (failures.length > 0) {
      console.error("[a4p-image] \uC77C\uAD04 \uBCC0\uD658 \uC2E4\uD328 \uBAA9\uB85D:\n" + failures.join("\n"));
      new import_obsidian5.Notice("\uC2E4\uD328 \uBAA9\uB85D\uC740 \uAC1C\uBC1C\uC790 \uCF58\uC194\uC5D0 \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4'\uB85C \uB2E4\uC2DC \uC2DC\uB3C4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", 8e3);
    }
  } catch (e) {
    notice.hide();
    new import_obsidian5.Notice(`\uBCC0\uD658 \uC911\uB2E8: ${e instanceof Error ? e.message : String(e)}`, 8e3);
  }
}
async function mapPool(items, limit, fn) {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

// src/gallery-view.ts
var import_obsidian13 = require("obsidian");

// src/insert.ts
var import_obsidian6 = require("obsidian");
var lastMarkdownView = null;
function registerEditorTracker(plugin) {
  const app = plugin.app;
  const seed = app.workspace.getActiveViewOfType(import_obsidian6.MarkdownView);
  if (seed)
    lastMarkdownView = seed;
  plugin.registerEvent(
    app.workspace.on("active-leaf-change", (leaf) => {
      if (leaf && leaf.view instanceof import_obsidian6.MarkdownView) {
        lastMarkdownView = leaf.view;
      }
    })
  );
}
function findTargetMarkdownView(app) {
  const leaves = app.workspace.getLeavesOfType("markdown");
  if (lastMarkdownView) {
    const stillOpen = leaves.some((l) => l.view === lastMarkdownView);
    if (stillOpen)
      return lastMarkdownView;
    lastMarkdownView = null;
  }
  const active = app.workspace.getActiveViewOfType(import_obsidian6.MarkdownView);
  if (active)
    return active;
  for (const leaf of leaves) {
    if (leaf.view instanceof import_obsidian6.MarkdownView)
      return leaf.view;
  }
  return null;
}
function insertAtEditor(app, text) {
  var _a, _b;
  const view = findTargetMarkdownView(app);
  if (!view) {
    new import_obsidian6.Notice("\uC774\uBBF8\uC9C0\uB97C \uC0BD\uC785\uD560 \uB9C8\uD06C\uB2E4\uC6B4 \uB178\uD2B8\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.");
    return false;
  }
  const editor = view.editor;
  editor.replaceRange(text, editor.getCursor());
  new import_obsidian6.Notice(`${(_b = (_a = view.file) == null ? void 0 : _a.basename) != null ? _b : "\uB178\uD2B8"}\uC5D0 \uC0BD\uC785\uD588\uC2B5\uB2C8\uB2E4.`);
  return true;
}

// src/preview-modal.ts
var import_obsidian12 = require("obsidian");

// src/commands.ts
var import_obsidian10 = require("obsidian");

// src/unused.ts
var REPORT_TAG = "a4p-image-report";
function hasReportTag(tags) {
  if (!tags)
    return false;
  return tags.some((t) => t.replace(/^#/, "") === REPORT_TAG);
}
function classifyUnused(input) {
  const entryByLocalPath = /* @__PURE__ */ new Map();
  for (const e of input.entries) {
    if (e.localPath)
      entryByLocalPath.set(e.localPath, e);
  }
  const fullyUnused = [];
  const orphanedBackups = [];
  for (const img of input.images) {
    if (input.resolvedTargets.has(img.path))
      continue;
    const entry = entryByLocalPath.get(img.path);
    if (entry) {
      if (!input.urlsInVault.has(entry.url))
        orphanedBackups.push(entry);
    } else {
      fullyUnused.push(img);
    }
  }
  const cloudOrphans = input.entries.filter(
    (e) => e.status === "uploaded" && !e.localPath && !input.urlsInVault.has(e.url)
  );
  const unusedAttachments = input.attachments.filter(
    (a) => !input.resolvedTargets.has(a.path)
  );
  return { fullyUnused, orphanedBackups, cloudOrphans, unusedAttachments };
}
function buildReportMarkdown(report, now) {
  const dateStr2 = now.toISOString().slice(0, 10);
  const lines = [
    "---",
    "tags:",
    `  - ${REPORT_TAG}`,
    "---",
    "",
    `# \uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uB9AC\uD3EC\uD2B8 (${dateStr2})`,
    "",
    "> [!info] \uC774 \uB9AC\uD3EC\uD2B8\uB294 \uC815\uBCF4 \uC81C\uACF5\uC6A9\uC785\uB2C8\uB2E4. \uC5B4\uB5A4 \uD30C\uC77C\uB3C4 \uC790\uB3D9\uC73C\uB85C \uC0AD\uC81C\xB7\uC774\uB3D9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
    "> \uC815\uB9AC\uD558\uB824\uBA74 \uBA85\uB839 \uD314\uB808\uD2B8\uC5D0\uC11C **A4P Image: \uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uD734\uC9C0\uD1B5 \uC774\uB3D9**\uC744 \uC2E4\uD589\uD574 \uC9C1\uC811 \uC120\uD0DD\xB7\uC2B9\uC778\uD558\uC138\uC694.",
    ""
  ];
  lines.push(`## A. \uC644\uC804 \uBBF8\uC0AC\uC6A9 \uB85C\uCEEC \uC774\uBBF8\uC9C0 (${report.fullyUnused.length}\uAC1C)`);
  lines.push("", "\uC5B4\uB5A4 \uB178\uD2B8\uB3C4 \uCC38\uC870\uD558\uC9C0 \uC54A\uACE0, \uC5C5\uB85C\uB4DC \uAE30\uB85D\uB3C4 \uC5C6\uB294 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4.", "");
  if (report.fullyUnused.length > 0) {
    lines.push("| \uD30C\uC77C | \uD06C\uAE30 |", "| --- | --- |");
    for (const img of report.fullyUnused) {
      lines.push(`| [[${img.path}]] | ${formatBytes(img.size)} |`);
    }
  } else {
    lines.push("_\uC5C6\uC74C_");
  }
  lines.push("");
  lines.push(`## B. \uB178\uD2B8\uC5D0\uC11C URL\uC774 \uC0AC\uB77C\uC9C4 \uB85C\uCEEC \uBC31\uC5C5 (${report.orphanedBackups.length}\uAC1C)`);
  lines.push(
    "",
    "\uD074\uB77C\uC6B0\uB4DC\uC5D0 \uC5C5\uB85C\uB4DC\uD588\uC9C0\uB9CC \uC774\uC81C \uC5B4\uB5A4 \uB178\uD2B8\uC5D0\uB3C4 \uD574\uB2F9 URL\uC774 \uC5C6\uB294 \uBC31\uC5C5 \uD30C\uC77C\uC785\uB2C8\uB2E4. \uB178\uD2B8\uC5D0\uC11C \uC774\uBBF8\uC9C0\uB97C \uC9C0\uC6E0\uB2E4\uBA74 \uC815\uB9AC \uB300\uC0C1\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    ""
  );
  if (report.orphanedBackups.length > 0) {
    lines.push("| \uD30C\uC77C | \uD06C\uAE30 | \uC5C5\uB85C\uB4DC\uC77C | URL |", "| --- | --- | --- | --- |");
    for (const e of report.orphanedBackups) {
      const uploaded = e.uploadedAt ? new Date(e.uploadedAt).toISOString().slice(0, 10) : "-";
      lines.push(`| [[${e.localPath}]] | ${formatBytes(e.size)} | ${uploaded} | ${e.url} |`);
    }
  } else {
    lines.push("_\uC5C6\uC74C_");
  }
  lines.push("");
  lines.push(`## C. R2\uC5D0\uB9CC \uB0A8\uC740 \uACE0\uC544 \uAC1D\uCCB4 (${report.cloudOrphans.length}\uAC1C)`);
  lines.push(
    "",
    "\uB85C\uCEEC \uBC31\uC5C5\uC774 \uC5C6\uACE0 \uC5B4\uB5A4 \uB178\uD2B8\uC5D0\uC11C\uB3C4 URL\uC744 \uC4F0\uC9C0 \uC54A\uB294 \uD074\uB77C\uC6B0\uB4DC \uAC1D\uCCB4\uC785\uB2C8\uB2E4. **\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uD734\uC9C0\uD1B5 \uC774\uB3D9** \uBA85\uB839\uC5D0\uC11C \uC120\uD0DD\xB7\uC774\uC911 \uD655\uC778 \uD6C4 R2\uC5D0\uC11C \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    ""
  );
  if (report.cloudOrphans.length > 0) {
    lines.push("| \uD0A4 | \uD06C\uAE30 | \uC5C5\uB85C\uB4DC\uC77C | URL |", "| --- | --- | --- | --- |");
    for (const e of report.cloudOrphans) {
      const uploaded = e.uploadedAt ? new Date(e.uploadedAt).toISOString().slice(0, 10) : "-";
      lines.push(`| \`${e.r2Key}\` | ${formatBytes(e.size)} | ${uploaded} | ${e.url} |`);
    }
  } else {
    lines.push("_\uC5C6\uC74C_");
  }
  lines.push("");
  lines.push(`## D. \uB178\uD2B8\uC5D0 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC740 \uCCA8\uBD80 \uD30C\uC77C (${report.unusedAttachments.length}\uAC1C)`);
  lines.push(
    "",
    "\uC5B4\uB5A4 \uB178\uD2B8\uB3C4 \uB9C1\uD06C\xB7\uC784\uBCA0\uB4DC\uD558\uC9C0 \uC54A\uB294 \uC774\uBBF8\uC9C0 \uC678 \uCCA8\uBD80 \uD30C\uC77C\uC785\uB2C8\uB2E4 (\uCE94\uBC84\uC2A4\uC5D0\uC11C \uC4F0\uB294 \uD30C\uC77C\uC740 \uC81C\uC678). \uC815\uB9AC \uC2DC \uBCFC\uD2B8 .trash/\uB85C\uB9CC \uC774\uB3D9\uD569\uB2C8\uB2E4.",
    ""
  );
  if (report.unusedAttachments.length > 0) {
    lines.push("| \uD30C\uC77C | \uD06C\uAE30 |", "| --- | --- |");
    for (const a of report.unusedAttachments) {
      lines.push(`| [[${a.path}]] | ${formatBytes(a.size)} |`);
    }
  } else {
    lines.push("_\uC5C6\uC74C_");
  }
  lines.push("");
  return lines.join("\n");
}

// src/trash-modal.ts
var import_obsidian9 = require("obsidian");

// src/delete-plan.ts
function buildDeletePlan(items, r2Configured) {
  const planned = [];
  const blocked = [];
  for (const item of items) {
    const entry = item.entry;
    const needsR2 = !!entry && entry.status === "uploaded" && !!entry.r2Key;
    const localPath = entry ? entry.localPath : item.path;
    if (needsR2 && !r2Configured) {
      if (localPath) {
        planned.push({ item, deleteR2: false, trashLocal: true, removeEntry: false, localOnlyFallback: true });
      } else {
        blocked.push({ item, reason: "R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uC11C\uBC84 \uAC1D\uCCB4\uB97C \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      }
      continue;
    }
    planned.push({
      item,
      deleteR2: needsR2,
      trashLocal: !!localPath,
      removeEntry: !!entry
    });
  }
  return {
    items: planned,
    blocked,
    r2Count: planned.filter((p) => p.deleteR2).length,
    localCount: planned.filter((p) => p.trashLocal).length
  };
}
function localPathOf(planned) {
  return planned.item.entry ? planned.item.entry.localPath : planned.item.path;
}

// src/delete.ts
var import_obsidian7 = require("obsidian");
async function executeDeletePlan(plugin, plan) {
  const failures = [];
  let done = 0;
  for (const planned of plan.items) {
    const entry = planned.item.entry;
    if (planned.deleteR2 && entry) {
      const shared = plugin.manifestStore.all().some((e) => e.id !== entry.id && e.r2Key === entry.r2Key);
      if (!shared) {
        try {
          await plugin.r2.deleteObject(entry.r2Key);
        } catch (e) {
          failures.push({
            path: planned.item.path,
            stage: "r2",
            error: e instanceof Error ? e.message : String(e)
          });
          continue;
        }
      }
    }
    if (planned.trashLocal) {
      const localPath = localPathOf(planned);
      const file = localPath ? plugin.app.vault.getAbstractFileByPath(localPath) : null;
      if (file instanceof import_obsidian7.TFile) {
        try {
          await plugin.app.vault.trash(file, false);
        } catch (e) {
          failures.push({
            path: planned.item.path,
            stage: "local",
            error: e instanceof Error ? e.message : String(e)
          });
        }
      }
    }
    if (planned.removeEntry && entry) {
      plugin.manifestStore.remove(entry.id);
    }
    done++;
  }
  await plugin.manifestStore.flush();
  plugin.refreshGalleryViews();
  let msg = `${done}\uAC1C \uD56D\uBAA9 \uC815\uB9AC \uC644\uB8CC`;
  if (plan.r2Count > 0)
    msg += ` (\uC11C\uBC84 \uC0AD\uC81C ${plan.r2Count}\uAC1C \uD3EC\uD568)`;
  msg += ".";
  if (failures.length > 0) {
    msg += ` \uC2E4\uD328 ${failures.length}\uAC74 (\uCF58\uC194 \uCC38\uACE0).`;
    console.error(
      "[a4p-image] \uC0AD\uC81C \uC2E4\uD328:\n" + failures.map((f) => `${f.path} [${f.stage}]: ${f.error}`).join("\n")
    );
  }
  new import_obsidian7.Notice(msg, 8e3);
  return { done, failures };
}

// src/thumb.ts
var import_obsidian8 = require("obsidian");
function attachmentIconFor(ext) {
  const e = ext.toLowerCase();
  if (["mp3", "m4a", "wav", "ogg", "flac"].includes(e))
    return "file-audio";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(e))
    return "file-video";
  if (["zip", "7z", "rar", "gz"].includes(e))
    return "file-archive";
  if (["xls", "xlsx", "csv"].includes(e))
    return "file-spreadsheet";
  if (["pdf", "doc", "docx", "ppt", "pptx", "hwp", "hwpx", "epub"].includes(e))
    return "file-text";
  return "paperclip";
}
function resolveImageSrc(app, localPath, url) {
  if (localPath) {
    const file = app.vault.getAbstractFileByPath(localPath);
    if (file instanceof import_obsidian8.TFile)
      return app.vault.getResourcePath(file);
  }
  return url || null;
}
function renderThumb(app, parent, source, opts = {}) {
  const wrap = parent.createDiv({
    cls: `a4p-image-trash-thumb${opts.small ? " a4p-image-trash-thumb--sm" : ""}`
  });
  if (source.icon) {
    (0, import_obsidian8.setIcon)(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), source.icon);
    return wrap;
  }
  const src = resolveImageSrc(app, source.localPath, source.url);
  if (!src) {
    (0, import_obsidian8.setIcon)(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    wrap.title = "\uBBF8\uB9AC\uBCF4\uAE30\uB97C \uD45C\uC2DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4";
    return wrap;
  }
  const img = wrap.createEl("img");
  img.src = src;
  img.alt = source.name;
  img.addEventListener("error", () => {
    wrap.empty();
    (0, import_obsidian8.setIcon)(wrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    wrap.title = "\uC774\uBBF8\uC9C0\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4";
  });
  wrap.addClass("is-zoomable");
  wrap.title = "\uD074\uB9AD\uD558\uBA74 \uD06C\uAC8C \uBD05\uB2C8\uB2E4";
  wrap.addEventListener("click", (evt) => {
    evt.stopPropagation();
    new ImageZoomModal(app, source).open();
  });
  return wrap;
}
var ImageZoomModal = class extends import_obsidian8.Modal {
  constructor(app, source) {
    super(app);
    this.source = source;
  }
  onOpen() {
    this.modalEl.addClass("a4p-img-preview-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("a4p-img-preview");
    const imgWrap = contentEl.createDiv({ cls: "a4p-img-preview-imgwrap" });
    const src = resolveImageSrc(this.app, this.source.localPath, this.source.url);
    if (src) {
      const img = imgWrap.createEl("img");
      img.src = src;
      img.alt = this.source.name;
    } else {
      (0, import_obsidian8.setIcon)(imgWrap.createSpan({ cls: "a4p-image-trash-thumb-fallback" }), "image-off");
    }
    const body = contentEl.createDiv({ cls: "a4p-img-preview-body" });
    body.createDiv({ cls: "a4p-img-preview-name", text: this.source.name });
    body.createDiv({ cls: "a4p-img-preview-sub", text: formatBytes(this.source.size) });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/trash-modal.ts
function keyOf(item) {
  var _a, _b;
  return (_b = (_a = item.entry) == null ? void 0 : _a.id) != null ? _b : item.path;
}
function nameOf(path) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}
function extOf2(path) {
  const name = nameOf(path);
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1) : "";
}
function thumbSourceOf(cand) {
  var _a, _b;
  const localPath = cand.entry ? cand.entry.localPath : cand.path;
  const source = {
    localPath,
    url: (_b = (_a = cand.entry) == null ? void 0 : _a.url) != null ? _b : null,
    name: nameOf(cand.path),
    size: cand.size
  };
  if (cand.kind === "unused-attachment")
    source.icon = attachmentIconFor(extOf2(cand.path));
  return source;
}
function dateStr(ms) {
  if (!ms)
    return null;
  return new Date(ms).toLocaleDateString("ko-KR", { dateStyle: "medium" });
}
var SECTIONS = [
  {
    kind: "fully-unused",
    title: "\uC644\uC804 \uBBF8\uC0AC\uC6A9 \uB85C\uCEEC \uC774\uBBF8\uC9C0",
    desc: "\uC5B4\uB5A4 \uB178\uD2B8\uB3C4 \uC774 \uD30C\uC77C\uC744 \uCC38\uC870\uD558\uC9C0 \uC54A\uACE0, \uD074\uB77C\uC6B0\uB4DC \uC5C5\uB85C\uB4DC \uAE30\uB85D\uB3C4 \uC5C6\uC2B5\uB2C8\uB2E4.",
    treat: () => "\uC815\uB9AC \uC2DC \uB85C\uCEEC \uD30C\uC77C\uB9CC \uBCFC\uD2B8 .trash/\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4 \u2014 \uC5B8\uC81C\uB4E0 \uBCF5\uAD6C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
  },
  {
    kind: "orphaned-backup",
    title: "\uB178\uD2B8\uC5D0\uC11C URL\uC774 \uC0AC\uB77C\uC9C4 \uBC31\uC5C5",
    desc: "R2\uC5D0 \uC5C5\uB85C\uB4DC\uB410\uC9C0\uB9CC \uC774\uC81C \uC5B4\uB5A4 \uB178\uD2B8\uC5D0\uB3C4 \uD574\uB2F9 URL\uC774 \uB0A8\uC544 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (\uB178\uD2B8\uC5D0\uC11C \uC774\uBBF8\uC9C0\uB97C \uC9C0\uC6B4 \uD754\uC801).",
    treat: (r2Ok) => r2Ok ? "\uC815\uB9AC \uC2DC \uC11C\uBC84(R2) \uC6D0\uBCF8\uC740 \uC601\uAD6C \uC0AD\uC81C\uB418\uACE0(\uBCF5\uAD6C \uBD88\uAC00), \uB85C\uCEEC \uBC31\uC5C5\uC740 .trash/\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4(\uBCF5\uAD6C \uAC00\uB2A5)." : "R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uC815\uB9AC \uC2DC \uB85C\uCEEC \uBC31\uC5C5\uB9CC .trash/\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4 (\uC11C\uBC84 \uAC1D\uCCB4\xB7\uAC24\uB7EC\uB9AC \uAE30\uB85D \uC720\uC9C0)."
  },
  {
    kind: "cloud-orphan",
    title: "\uC11C\uBC84\uC5D0\uB9CC \uB0A8\uC740 \uACE0\uC544 \uAC1D\uCCB4",
    desc: "\uB85C\uCEEC \uBC31\uC5C5\uC774 \uC5C6\uACE0, \uC5B4\uB5A4 \uB178\uD2B8\uC5D0\uC11C\uB3C4 URL\uC744 \uC4F0\uC9C0 \uC54A\uB294 \uD074\uB77C\uC6B0\uB4DC \uAC1D\uCCB4\uC785\uB2C8\uB2E4.",
    treat: () => "\uC815\uB9AC \uC2DC R2 \uC11C\uBC84\uC5D0\uC11C \uC601\uAD6C \uC0AD\uC81C\uB429\uB2C8\uB2E4 \u2014 \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."
  },
  {
    kind: "unused-attachment",
    title: "\uB178\uD2B8\uC5D0 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC740 \uCCA8\uBD80 \uD30C\uC77C",
    desc: "\uC5B4\uB5A4 \uB178\uD2B8\uB3C4 \uB9C1\uD06C\xB7\uC784\uBCA0\uB4DC\uD558\uC9C0 \uC54A\uB294 \uC774\uBBF8\uC9C0 \uC678 \uCCA8\uBD80(PDF\xB7\uC624\uB514\uC624 \uB4F1)\uC785\uB2C8\uB2E4. \uCE94\uBC84\uC2A4\uC5D0\uC11C \uC4F0\uB294 \uD30C\uC77C\uC740 \uC81C\uC678\uD588\uC2B5\uB2C8\uB2E4.",
    treat: () => "\uC815\uB9AC \uC2DC \uB85C\uCEEC \uD30C\uC77C\uB9CC \uBCFC\uD2B8 .trash/\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4 \u2014 \uC5B8\uC81C\uB4E0 \uBCF5\uAD6C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. (\uC11C\uBC84\xB7\uAC24\uB7EC\uB9AC\uC640 \uBB34\uAD00)"
  }
];
var TrashSelectModal = class extends import_obsidian9.Modal {
  constructor(app, plugin, candidates) {
    super(app);
    this.plugin = plugin;
    this.candidates = candidates;
    this.selected = /* @__PURE__ */ new Set();
    this.proceedBtn = null;
  }
  onOpen() {
    this.modalEl.addClass("a4p-image-trash-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uC815\uB9AC" });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-lead",
      text: `\uBBF8\uC0AC\uC6A9\uC73C\uB85C \uD310\uC815\uB41C \uD56D\uBAA9 ${this.candidates.length}\uAC1C\uC785\uB2C8\uB2E4. \uC378\uB124\uC77C\uC744 \uD074\uB9AD\uD558\uBA74 \uD06C\uAC8C \uBCFC \uC218 \uC788\uACE0, \u25BE\uB97C \uD3BC\uCE58\uBA74 \uD310\uC815 \uADFC\uAC70\uC640 \uCC98\uB9AC \uB0B4\uC6A9\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`
    });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-warning",
      text: "\uC120\uD0DD\uD55C \uD56D\uBAA9\uB9CC \uC815\uB9AC\uB418\uBA70, \uC2E4\uD589 \uC804 \uCD5C\uC885 \uD655\uC778\uC744 \uD55C \uBC88 \uB354 \uAC70\uCE69\uB2C8\uB2E4. \uC11C\uBC84(R2) \uC0AD\uC81C\uAC00 \uD3EC\uD568\uB41C \uD56D\uBAA9\uC740 \uBD89\uC740 \uB760\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4."
    });
    const r2Ok = this.plugin.r2.isConfigured();
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list a4p-image-trash-list" });
    const allCheckboxes = [];
    const globalRow = listEl.createDiv({ cls: "a4p-image-trash-selectall" });
    const globalCb = globalRow.createEl("input", { type: "checkbox" });
    globalRow.createSpan({ text: "\uBAA8\uB450 \uC120\uD0DD" });
    globalCb.addEventListener("change", () => {
      for (const cb of allCheckboxes) {
        cb.checked = globalCb.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });
    for (const spec of SECTIONS) {
      const group = this.candidates.filter((c) => c.kind === spec.kind);
      if (group.length === 0)
        continue;
      this.renderSection(listEl, spec, group, r2Ok, allCheckboxes);
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    this.proceedBtn = buttons.createEl("button", { text: "\uC120\uD0DD \uD56D\uBAA9 \uC815\uB9AC\u2026", cls: "mod-warning" });
    this.proceedBtn.addEventListener("click", () => {
      if (this.selected.size === 0) {
        new import_obsidian9.Notice("\uC120\uD0DD\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const picked = this.candidates.filter((c) => this.selected.has(keyOf(c)));
      this.close();
      new TrashConfirmModal(this.app, this.plugin, picked).open();
    });
  }
  updateProceedLabel() {
    if (!this.proceedBtn)
      return;
    this.proceedBtn.setText(
      this.selected.size > 0 ? `\uC120\uD0DD \uD56D\uBAA9 \uC815\uB9AC (${this.selected.size}\uAC1C)\u2026` : "\uC120\uD0DD \uD56D\uBAA9 \uC815\uB9AC\u2026"
    );
  }
  renderSection(parent, spec, group, r2Ok, allCheckboxes) {
    const section = parent.createDiv({ cls: "a4p-image-trash-section" });
    const header = section.createDiv({ cls: "a4p-image-trash-section-head" });
    const sectionCb = header.createEl("input", { type: "checkbox" });
    sectionCb.title = "\uC774 \uBD84\uB958 \uBAA8\uB450 \uC120\uD0DD";
    header.createSpan({ cls: "a4p-image-trash-section-title", text: spec.title });
    header.createSpan({ cls: "a4p-image-trash-count", text: String(group.length) });
    section.createDiv({ cls: "a4p-image-trash-section-desc", text: spec.desc });
    section.createDiv({ cls: "a4p-image-trash-section-treat", text: spec.treat(r2Ok) });
    const sectionCheckboxes = [];
    sectionCb.addEventListener("change", () => {
      for (const cb of sectionCheckboxes) {
        cb.checked = sectionCb.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });
    for (const cand of group) {
      const cb = this.renderItem(section, cand, r2Ok);
      sectionCheckboxes.push(cb);
      allCheckboxes.push(cb);
    }
  }
  /** 항목 카드 — [체크박스][썸네일][이름·메타][배지][▾], 펼치면 판정 근거 + 처리 상세 */
  renderItem(parent, cand, r2Ok) {
    var _a, _b;
    const serverDelete = r2Ok && ((_a = cand.entry) == null ? void 0 : _a.status) === "uploaded" && !!cand.entry.r2Key;
    const item = parent.createDiv({
      cls: `a4p-image-trash-item ${serverDelete ? "is-server" : "is-local"}`
    });
    const row = item.createDiv({ cls: "a4p-image-trash-row" });
    const cb = row.createEl("input", { type: "checkbox" });
    cb.addEventListener("change", () => {
      if (cb.checked)
        this.selected.add(keyOf(cand));
      else
        this.selected.delete(keyOf(cand));
      item.toggleClass("is-selected", cb.checked);
      this.updateProceedLabel();
    });
    cb.addEventListener("click", (evt) => evt.stopPropagation());
    renderThumb(this.app, row, thumbSourceOf(cand));
    const info = row.createDiv({ cls: "a4p-image-trash-info" });
    info.createDiv({ cls: "a4p-image-trash-name", text: nameOf(cand.path) });
    const metaParts = [formatBytes(cand.size)];
    const uploaded = dateStr((_b = cand.entry) == null ? void 0 : _b.uploadedAt);
    if (uploaded)
      metaParts.push(`\uC5C5\uB85C\uB4DC ${uploaded}`);
    info.createDiv({ cls: "a4p-image-trash-meta", text: metaParts.join(" \xB7 ") });
    if (serverDelete) {
      row.createSpan({ cls: "a4p-image-badge-server", text: "\uC11C\uBC84 \uC0AD\uC81C" });
    }
    const toggleBtn = row.createEl("button", { cls: "a4p-image-trash-toggle" });
    toggleBtn.title = "\uD310\uC815 \uADFC\uAC70\xB7\uCC98\uB9AC \uB0B4\uC6A9 \uBCF4\uAE30";
    (0, import_obsidian9.setIcon)(toggleBtn, "chevron-down");
    const detail = item.createDiv({ cls: "a4p-image-trash-detail" });
    this.renderDetail(detail, cand, serverDelete);
    toggleBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      item.toggleClass("is-open", !item.hasClass("is-open"));
    });
    row.addEventListener("click", () => {
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    });
    return cb;
  }
  detailRow(parent, icon, text) {
    const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
    (0, import_obsidian9.setIcon)(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), icon);
    row.createSpan({ text });
    return row;
  }
  renderDetail(parent, cand, serverDelete) {
    var _a, _b;
    parent.createDiv({ cls: "a4p-image-trash-detail-title", text: "\uAE68\uC9C4 \uC5F0\uACB0" });
    if (cand.kind === "fully-unused" || cand.kind === "unused-attachment") {
      this.detailRow(
        parent,
        "unlink",
        cand.kind === "unused-attachment" ? "\uB9C1\uD06C\xB7\uC784\uBCA0\uB4DC\uD558\uB294 \uB178\uD2B8 \uC5C6\uC74C (\uCE94\uBC84\uC2A4 \uC0AC\uC6A9\uCC98\uB3C4 \uC5C6\uC74C)" : "\uCC38\uC870\uD558\uB294 \uB178\uD2B8 \uC5C6\uC74C \u2014 \uC704\uD0A4\uB9C1\uD06C 0\uAC1C \xB7 \uC5C5\uB85C\uB4DC \uAE30\uB85D \uC5C6\uC74C"
      );
      this.detailRow(parent, "file-question", `\uC804\uCCB4 \uACBD\uB85C: ${cand.path}`);
      if (cand.kind === "unused-attachment") {
        const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
        (0, import_obsidian9.setIcon)(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), "external-link");
        const link = row.createEl("a", { text: "\uD30C\uC77C \uC5F4\uC5B4\uC11C \uD655\uC778", cls: "a4p-image-trash-detail-link" });
        link.addEventListener("click", (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.close();
          void this.app.workspace.openLinkText(cand.path, "", false);
        });
      }
    } else {
      this.detailRow(
        parent,
        "unlink",
        cand.kind === "cloud-orphan" ? "\uB85C\uCEEC \uBC31\uC5C5 \uC5C6\uC74C \xB7 \uC774 URL\uC744 \uC4F0\uB294 \uB178\uD2B8 \uC5C6\uC74C" : "\uC774 \uC774\uBBF8\uC9C0\uC758 URL\uC744 \uC4F0\uB294 \uB178\uD2B8 \uC5C6\uC74C (\uC704\uD0A4\uB9C1\uD06C \uCC38\uC870\uB3C4 \uC5C6\uC74C)"
      );
      const sourceNote = (_a = cand.entry) == null ? void 0 : _a.sourceNote;
      if (sourceNote) {
        const row = parent.createDiv({ cls: "a4p-image-trash-detail-row" });
        (0, import_obsidian9.setIcon)(row.createSpan({ cls: "a4p-image-trash-detail-icon" }), "file-text");
        row.createSpan({ text: "\uC6D0\uB798 \uC0BD\uC785\uB41C \uB178\uD2B8: " });
        if (this.app.vault.getAbstractFileByPath(sourceNote)) {
          const link = row.createEl("a", { text: sourceNote, cls: "a4p-image-trash-detail-link" });
          link.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.close();
            void this.app.workspace.openLinkText(sourceNote, "", false);
          });
        } else {
          row.createSpan({ cls: "a4p-image-trash-detail-muted", text: `${sourceNote} (\uC0AD\uC81C\uB428)` });
        }
      }
      if ((_b = cand.entry) == null ? void 0 : _b.url) {
        this.detailRow(parent, "link", cand.entry.url);
      }
    }
    parent.createDiv({ cls: "a4p-image-trash-detail-title", text: "\uCC98\uB9AC \uBC29\uBC95" });
    if (cand.kind === "fully-unused") {
      this.detailRow(parent, "trash-2", "\uC815\uB9AC \uC2DC: \uB85C\uCEEC \uD30C\uC77C\uC744 \uBCFC\uD2B8 .trash/\uB85C \uC774\uB3D9 (\uC5B8\uC81C\uB4E0 \uBCF5\uAD6C \uAC00\uB2A5)");
      this.detailRow(parent, "lightbulb", "\uACC4\uC18D \uC4F0\uB824\uBA74: \uB178\uD2B8\uC5D0 ![[\uD30C\uC77C\uBA85]]\uC73C\uB85C \uC784\uBCA0\uB4DC\uD558\uBA74 '\uC0AC\uC6A9 \uC911'\uC73C\uB85C \uBCF4\uD638\uB429\uB2C8\uB2E4");
    } else if (cand.kind === "unused-attachment") {
      this.detailRow(parent, "trash-2", "\uC815\uB9AC \uC2DC: \uB85C\uCEEC \uD30C\uC77C\uC744 \uBCFC\uD2B8 .trash/\uB85C \uC774\uB3D9 (\uC5B8\uC81C\uB4E0 \uBCF5\uAD6C \uAC00\uB2A5) \u2014 \uC11C\uBC84 \uC5C5\uB85C\uB4DC\uC640 \uBB34\uAD00");
      this.detailRow(parent, "lightbulb", "\uACC4\uC18D \uC4F0\uB824\uBA74: \uB178\uD2B8\uC5D0 [[\uD30C\uC77C\uBA85]] \uB9C1\uD06C \uB610\uB294 ![[\uD30C\uC77C\uBA85]] \uC784\uBCA0\uB4DC\uB97C \uCD94\uAC00\uD558\uBA74 '\uC0AC\uC6A9 \uC911'\uC73C\uB85C \uBCF4\uD638\uB429\uB2C8\uB2E4");
    } else if (cand.kind === "orphaned-backup") {
      if (serverDelete) {
        this.detailRow(parent, "trash-2", "\uC815\uB9AC \uC2DC: \uC11C\uBC84(R2) \uC6D0\uBCF8 \uC601\uAD6C \uC0AD\uC81C(\uBCF5\uAD6C \uBD88\uAC00) + \uB85C\uCEEC \uBC31\uC5C5 .trash/ \uC774\uB3D9(\uBCF5\uAD6C \uAC00\uB2A5) + \uAC24\uB7EC\uB9AC \uAE30\uB85D \uC81C\uAC70");
      } else {
        this.detailRow(parent, "trash-2", "\uC815\uB9AC \uC2DC: \uB85C\uCEEC \uBC31\uC5C5\uB9CC .trash/\uB85C \uC774\uB3D9 (\uC11C\uBC84 \uAC1D\uCCB4\xB7\uAC24\uB7EC\uB9AC \uAE30\uB85D \uC720\uC9C0)");
      }
      this.detailRow(parent, "lightbulb", "\uACC4\uC18D \uC4F0\uB824\uBA74: \uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC774 \uC774\uBBF8\uC9C0\uB97C \uB178\uD2B8\uC5D0 \uC0BD\uC785\uD558\uC138\uC694 \u2014 URL\uC774 \uB178\uD2B8\uC5D0 \uC788\uC73C\uBA74 '\uC0AC\uC6A9 \uC911'\uC73C\uB85C \uBCF4\uD638\uB429\uB2C8\uB2E4");
    } else {
      this.detailRow(parent, "trash-2", "\uC815\uB9AC \uC2DC: R2 \uC11C\uBC84\uC5D0\uC11C \uC601\uAD6C \uC0AD\uC81C (\uBCF5\uAD6C \uBD88\uAC00) + \uAC24\uB7EC\uB9AC \uAE30\uB85D \uC81C\uAC70");
      this.detailRow(parent, "lightbulb", "\uACC4\uC18D \uC4F0\uB824\uBA74: \uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC774 \uC774\uBBF8\uC9C0\uB97C \uB178\uD2B8\uC5D0 \uC0BD\uC785\uD558\uC138\uC694 \u2014 \uC0BD\uC785 \uD6C4\uC5D0\uB294 \uBBF8\uC0AC\uC6A9 \uD6C4\uBCF4\uC5D0\uC11C \uBE60\uC9D1\uB2C8\uB2E4");
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TrashConfirmModal = class extends import_obsidian9.Modal {
  constructor(app, plugin, items) {
    super(app);
    this.plugin = plugin;
    this.items = items;
  }
  onOpen() {
    this.modalEl.addClass("a4p-image-trash-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uCD5C\uC885 \uD655\uC778" });
    const plan = buildDeletePlan(this.items, this.plugin.r2.isConfigured());
    const localOnly = plan.items.filter((p) => p.trashLocal && !p.deleteR2);
    const withServer = plan.items.filter((p) => p.deleteR2);
    const renderGroup = (title, cls, group) => {
      if (group.length === 0)
        return;
      contentEl.createEl("p", { cls, text: title });
      const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
      for (const p of group) {
        const row = listEl.createDiv({ cls: "a4p-image-trash-confirm-row" });
        renderThumb(this.app, row, thumbSourceOf(p.item), { small: true });
        row.createSpan({ cls: "a4p-image-trash-confirm-name", text: nameOf(p.item.path) });
        row.createSpan({ cls: "a4p-image-trash-meta", text: formatBytes(p.item.size) });
      }
    };
    renderGroup(`\uBCFC\uD2B8 .trash/ \uC774\uB3D9 ${localOnly.length}\uAC1C (\uBCF5\uAD6C \uAC00\uB2A5)`, "", localOnly);
    renderGroup(
      `\u26A0\uFE0F \uC11C\uBC84(R2)\uC5D0 \uC62C\uB77C\uAC00 \uC788\uB294 \uC774\uBBF8\uC9C0 \uC601\uAD6C \uC0AD\uC81C ${withServer.length}\uAC1C (\uBCF5\uAD6C \uBD88\uAC00)` + (withServer.some((p) => p.trashLocal) ? " \u2014 \uB85C\uCEEC \uBC31\uC5C5\uC740 .trash/\uB85C \uC774\uB3D9" : ""),
      "a4p-image-trash-warning",
      withServer
    );
    if (plan.items.some((p) => p.localOnlyFallback)) {
      contentEl.createEl("p", {
        text: "\uC77C\uBD80 \uD56D\uBAA9\uC740 R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uB85C\uCEEC \uC774\uB3D9\uB9CC \uC218\uD589\uB429\uB2C8\uB2E4 (\uC11C\uBC84 \uAC1D\uCCB4\xB7\uAC24\uB7EC\uB9AC \uAE30\uB85D \uC720\uC9C0)."
      });
    }
    if (plan.blocked.length > 0) {
      contentEl.createEl("p", {
        cls: "a4p-image-trash-warning",
        text: `\uC81C\uC678 ${plan.blocked.length}\uAC1C: ${plan.blocked[0].reason}`
      });
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", {
      text: `${plan.items.length}\uAC1C \uC815\uB9AC \uC2E4\uD589`,
      cls: "mod-warning"
    });
    confirmBtn.disabled = plan.items.length === 0;
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      void executeDeletePlan(this.plugin, plan).then(() => this.close());
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/commands.ts
async function runRetryCommand(plugin) {
  if (!plugin.r2.isConfigured()) {
    new import_obsidian10.Notice("R2 \uC124\uC815\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.");
    return;
  }
  const result = await plugin.uploader.retryPending();
  if (result.retried === 0) {
    new import_obsidian10.Notice("\uC7AC\uC2DC\uB3C4\uD560 \uC2E4\uD328\xB7\uB300\uAE30 \uC5C5\uB85C\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  let msg = `\uC7AC\uC2DC\uB3C4 \uC644\uB8CC \u2014 \uC131\uACF5 ${result.succeeded}/${result.retried}`;
  if (result.failed.length > 0) {
    msg += `, \uC2E4\uD328 ${result.failed.length}\uAC74 (\uCF58\uC194 \uCC38\uACE0)`;
    console.error("[a4p-image] \uC7AC\uC2DC\uB3C4 \uC2E4\uD328:\n" + result.failed.join("\n"));
  }
  new import_obsidian10.Notice(msg, 8e3);
}
function isReportNote(app, path) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof import_obsidian10.TFile))
    return false;
  const cache = app.metadataCache.getFileCache(file);
  return !!cache && hasReportTag((0, import_obsidian10.getAllTags)(cache));
}
async function findImageUsages(app, entry) {
  const usages = /* @__PURE__ */ new Set();
  if (entry.localPath) {
    for (const [mdPath, links] of Object.entries(app.metadataCache.resolvedLinks)) {
      if (links[entry.localPath] && !isReportNote(app, mdPath))
        usages.add(mdPath);
    }
  }
  if (entry.url) {
    for (const md of app.vault.getMarkdownFiles()) {
      if (usages.has(md.path) || isReportNote(app, md.path))
        continue;
      const content = await app.vault.cachedRead(md);
      if (content.includes(entry.url))
        usages.add(md.path);
    }
  }
  return [...usages];
}
async function collectCanvasTargets(app) {
  var _a;
  const targets = /* @__PURE__ */ new Set();
  const canvases = app.vault.getFiles().filter((f) => f.extension === "canvas");
  for (const canvas of canvases) {
    try {
      const data = JSON.parse(await app.vault.cachedRead(canvas));
      for (const node of (_a = data.nodes) != null ? _a : []) {
        if (node.file)
          targets.add(node.file);
      }
    } catch (e) {
    }
  }
  return targets;
}
async function collectUnusedInput(plugin) {
  const { app } = plugin;
  const entries = plugin.manifestStore.all();
  const images = app.vault.getFiles().filter((f) => isImageExt(f.extension, plugin.settings.imageExtensions)).map((f) => ({ path: f.path, size: f.stat.size }));
  const attachmentExts = plugin.settings.includeAttachments ? plugin.settings.attachmentExtensions.map((e) => e.toLowerCase()) : [];
  const attachments = app.vault.getFiles().filter(
    (f) => attachmentExts.includes(f.extension.toLowerCase()) && !isImageExt(f.extension, plugin.settings.imageExtensions)
  ).map((f) => ({ path: f.path, size: f.stat.size }));
  const resolvedTargets = /* @__PURE__ */ new Set();
  for (const [mdPath, links] of Object.entries(app.metadataCache.resolvedLinks)) {
    if (isReportNote(app, mdPath))
      continue;
    for (const target of Object.keys(links))
      resolvedTargets.add(target);
  }
  for (const target of await collectCanvasTargets(app))
    resolvedTargets.add(target);
  const urlsInVault = /* @__PURE__ */ new Set();
  const urls = entries.map((e) => e.url).filter(Boolean);
  if (urls.length > 0) {
    const base = plugin.settings.r2.publicBaseUrl.replace(/\/+$/g, "");
    const mdFiles = app.vault.getMarkdownFiles();
    for (const md of mdFiles) {
      if (isReportNote(app, md.path))
        continue;
      const content = await app.vault.cachedRead(md);
      if (base && !content.includes(base))
        continue;
      for (const url of urls) {
        if (!urlsInVault.has(url) && content.includes(url))
          urlsInVault.add(url);
      }
    }
  }
  return { images, attachments, resolvedTargets, entries, urlsInVault };
}
async function runUnusedReportCommand(plugin) {
  const notice = new import_obsidian10.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\uB97C \uBD84\uC11D\uD558\uB294 \uC911\u2026", 0);
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    const markdown = buildReportMarkdown(report, /* @__PURE__ */ new Date());
    const folder = plugin.settings.reportFolder.trim();
    if (folder && !plugin.app.vault.getAbstractFileByPath((0, import_obsidian10.normalizePath)(folder))) {
      await plugin.app.vault.createFolder((0, import_obsidian10.normalizePath)(folder));
    }
    const stamp = /* @__PURE__ */ new Date();
    const name = `\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uB9AC\uD3EC\uD2B8 ${stamp.toISOString().slice(0, 10)} ${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const path = (0, import_obsidian10.normalizePath)(folder ? `${folder}/${name}.md` : `${name}.md`);
    const file = await plugin.app.vault.create(path, markdown);
    notice.hide();
    const total = report.fullyUnused.length + report.orphanedBackups.length + report.cloudOrphans.length + report.unusedAttachments.length;
    new import_obsidian10.Notice(`\uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC644\uB8CC \u2014 \uBBF8\uC0AC\uC6A9 \uD6C4\uBCF4 ${total}\uAC1C (${path})`, 8e3);
    await plugin.app.workspace.getLeaf(false).openFile(file);
  } catch (e) {
    notice.hide();
    new import_obsidian10.Notice(`\uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`, 8e3);
  }
}
async function runTrashUnusedCommand(plugin) {
  const notice = new import_obsidian10.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\uB97C \uBD84\uC11D\uD558\uB294 \uC911\u2026", 0);
  let candidates;
  let skippedCloudOrphans = 0;
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    const r2Ok = plugin.r2.isConfigured();
    candidates = [
      ...report.fullyUnused.map((img) => ({
        entry: null,
        path: img.path,
        size: img.size,
        reason: "\uC644\uC804 \uBBF8\uC0AC\uC6A9 \u2014 \uB85C\uCEEC\uB9CC \uD734\uC9C0\uD1B5 \uC774\uB3D9",
        kind: "fully-unused"
      })),
      ...report.orphanedBackups.filter((e) => e.localPath).map((e) => ({
        entry: e,
        path: e.localPath,
        size: e.size,
        reason: r2Ok && e.status === "uploaded" ? "URL\uC774 \uB178\uD2B8\uC5D0\uC11C \uC0AC\uB77C\uC9C4 \uBC31\uC5C5 \u2014 \uB85C\uCEEC \uC774\uB3D9 + \uC11C\uBC84 \uC601\uAD6C \uC0AD\uC81C" : "URL\uC774 \uB178\uD2B8\uC5D0\uC11C \uC0AC\uB77C\uC9C4 \uBC31\uC5C5 \u2014 \uB85C\uCEEC\uB9CC \uC774\uB3D9",
        kind: "orphaned-backup"
      })),
      // R2에만 남은 고아 객체 — R2 설정이 있어야 삭제 가능
      ...r2Ok ? report.cloudOrphans.map((e) => ({
        entry: e,
        path: e.r2Key,
        size: e.size,
        reason: "\uC11C\uBC84\uC5D0\uB9CC \uB0A8\uC740 \uACE0\uC544 \uAC1D\uCCB4 \u2014 R2\uC5D0\uC11C \uC601\uAD6C \uC0AD\uC81C",
        kind: "cloud-orphan"
      })) : [],
      // 이미지 외 첨부 — 항상 로컬 .trash/ 이동만 (서버·매니페스트와 무관)
      ...report.unusedAttachments.map((a) => ({
        entry: null,
        path: a.path,
        size: a.size,
        reason: "\uB178\uD2B8\uC5D0 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC740 \uCCA8\uBD80 \u2014 \uB85C\uCEEC\uB9CC \uD734\uC9C0\uD1B5 \uC774\uB3D9",
        kind: "unused-attachment"
      }))
    ];
    if (!r2Ok)
      skippedCloudOrphans = report.cloudOrphans.length;
  } finally {
    notice.hide();
  }
  if (skippedCloudOrphans > 0) {
    new import_obsidian10.Notice(`R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uC11C\uBC84 \uACE0\uC544 \uAC1D\uCCB4 ${skippedCloudOrphans}\uAC1C\uB294 \uBAA9\uB85D\uC5D0\uC11C \uC81C\uC678\uD588\uC2B5\uB2C8\uB2E4.`, 8e3);
  }
  if (candidates.length === 0) {
    new import_obsidian10.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  new TrashSelectModal(plugin.app, plugin, candidates).open();
}

// src/delete-modal.ts
var import_obsidian11 = require("obsidian");
var DeleteImageModal = class extends import_obsidian11.Modal {
  constructor(app, plugin, entry, onDeleted) {
    super(app);
    this.plugin = plugin;
    this.entry = entry;
    this.onDeleted = onDeleted;
  }
  entryName() {
    var _a;
    const path = (_a = this.entry.localPath) != null ? _a : this.entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }
  onOpen() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uC774\uBBF8\uC9C0 \uC0AD\uC81C" });
    const head = contentEl.createDiv({ cls: "a4p-image-trash-confirm-row" });
    renderThumb(this.app, head, {
      localPath: this.entry.localPath,
      url: (_a = this.entry.url) != null ? _a : null,
      name: this.entryName(),
      size: this.entry.size
    });
    head.createSpan({ cls: "a4p-image-trash-confirm-name", text: this.entryName() });
    head.createSpan({ cls: "a4p-image-trash-meta", text: formatBytes(this.entry.size) });
    contentEl.createEl("p", { text: "\uC0AD\uC81C\uD558\uAE30 \uC804\uC5D0 \uC0AC\uC6A9\uCC98\uB97C \uD655\uC778\uD569\uB2C8\uB2E4." });
    const warnSlot = contentEl.createDiv();
    const usageBox = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    const loading = usageBox.createDiv({ cls: "a4p-image-plan-item" });
    (0, import_obsidian11.setIcon)(loading.createSpan(), "loader-2");
    loading.createSpan({ text: " \uC0AC\uC6A9 \uC911\uC778 \uB178\uD2B8\uB97C \uC2A4\uCE94\uD558\uB294 \uC911\u2026" });
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const nextBtn = buttons.createEl("button", { text: "\uC0AD\uC81C \uACC4\uC18D\u2026", cls: "mod-warning" });
    nextBtn.disabled = true;
    void findImageUsages(this.app, this.entry).then((usages) => {
      usageBox.empty();
      if (usages.length === 0) {
        usageBox.createDiv({
          cls: "a4p-image-plan-item",
          text: "\uC774 \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD558\uB294 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
        });
      } else {
        warnSlot.createEl("p", {
          cls: "a4p-image-trash-warning",
          text: `\u26A0\uFE0F \uC774 \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD558\uB294 \uB178\uD2B8 ${usages.length}\uAC1C\uC758 \uB9C1\uD06C\uAC00 \uAE68\uC9D1\uB2C8\uB2E4!`
        });
        for (const path of usages) {
          usageBox.createDiv({ cls: "a4p-image-plan-item", text: path });
        }
      }
      nextBtn.disabled = false;
      nextBtn.addEventListener("click", () => {
        this.close();
        new DeleteImageFinalModal(this.app, this.plugin, this.entry, usages.length, this.onDeleted).open();
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DeleteImageFinalModal = class extends import_obsidian11.Modal {
  constructor(app, plugin, entry, usageCount, onDeleted) {
    super(app);
    this.plugin = plugin;
    this.entry = entry;
    this.usageCount = usageCount;
    this.onDeleted = onDeleted;
  }
  onOpen() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    const item = {
      entry: this.entry,
      path: (_a = this.entry.localPath) != null ? _a : this.entry.r2Key,
      size: this.entry.size,
      reason: "\uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC0AD\uC81C"
    };
    const plan = buildDeletePlan([item], this.plugin.r2.isConfigured());
    if (plan.blocked.length > 0) {
      contentEl.createEl("h3", { text: "\uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      contentEl.createEl("p", { text: plan.blocked[0].reason });
      contentEl.createEl("p", { text: "\uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uC785\uB825\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694." });
      const buttons2 = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
      const closeBtn = buttons2.createEl("button", { text: "\uB2EB\uAE30" });
      closeBtn.addEventListener("click", () => this.close());
      return;
    }
    contentEl.createEl("h3", { text: "\uCD5C\uC885 \uD655\uC778 \u2014 \uC815\uB9D0 \uC0AD\uC81C\uD560\uAE4C\uC694?" });
    const planned = plan.items[0];
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    if (planned.deleteR2) {
      const row = listEl.createDiv({ cls: "a4p-image-plan-item a4p-image-danger" });
      row.setText("\uC11C\uBC84(R2)\uC5D0 \uC62C\uB77C\uAC00 \uC788\uB294 \uC774\uBBF8\uC9C0\uAC00 \uC601\uAD6C \uC0AD\uC81C\uB429\uB2C8\uB2E4 \u2014 \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }
    if (planned.localOnlyFallback) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uC11C\uBC84 \uAC1D\uCCB4\uB294 \uB0A8\uC2B5\uB2C8\uB2E4 \u2014 \uB85C\uCEEC \uBC31\uC5C5\uB9CC \uC774\uB3D9\uD558\uACE0 \uAC24\uB7EC\uB9AC \uAE30\uB85D\uC740 \uC720\uC9C0\uB429\uB2C8\uB2E4."
      });
    }
    if (planned.trashLocal) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "\uB85C\uCEEC \uBC31\uC5C5\uC740 \uBCFC\uD2B8 .trash/ \uD3F4\uB354\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4 (\uBCF5\uAD6C \uAC00\uB2A5)."
      });
    }
    if (planned.removeEntry) {
      listEl.createDiv({
        cls: "a4p-image-plan-item",
        text: "\uAC24\uB7EC\uB9AC(\uB9E4\uB2C8\uD398\uC2A4\uD2B8) \uAE30\uB85D\uC774 \uC81C\uAC70\uB429\uB2C8\uB2E4."
      });
    }
    if (this.usageCount > 0) {
      contentEl.createEl("p", {
        cls: "a4p-image-trash-warning",
        text: `\u26A0\uFE0F \uB178\uD2B8 ${this.usageCount}\uAC1C\uC5D0\uC11C \uC774 \uC774\uBBF8\uC9C0 \uB9C1\uD06C\uAC00 \uAE68\uC9D1\uB2C8\uB2E4.`
      });
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", { text: "\uC0AD\uC81C \uC2E4\uD589", cls: "mod-warning" });
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      void executeDeletePlan(this.plugin, plan).then((result) => {
        var _a2;
        this.close();
        if (result.failures.length === 0)
          (_a2 = this.onDeleted) == null ? void 0 : _a2.call(this);
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/preview-modal.ts
var STATUS_LABEL = {
  uploaded: "\uC5C5\uB85C\uB4DC\uB428",
  pending: "\uB300\uAE30 \uC911",
  failed: "\uC2E4\uD328"
};
var ImagePreviewModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, entry) {
    super(app);
    this.plugin = plugin;
    this.entry = entry;
  }
  entryName() {
    var _a;
    const path = (_a = this.entry.localPath) != null ? _a : this.entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }
  onOpen() {
    this.modalEl.addClass("a4p-img-preview-host");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("a4p-img-preview");
    const entry = this.entry;
    const name = this.entryName();
    const imgWrap = contentEl.createDiv({ cls: "a4p-img-preview-imgwrap" });
    const img = imgWrap.createEl("img");
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof import_obsidian12.TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    const body = contentEl.createDiv({ cls: "a4p-img-preview-body" });
    body.createDiv({ cls: "a4p-img-preview-name", text: name });
    const subEl = body.createDiv({ cls: "a4p-img-preview-sub" });
    const dateStr2 = new Date(entry.createdAt).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    const renderSub = (dims) => {
      var _a;
      subEl.empty();
      const parts = [formatBytes(entry.size)];
      if (dims)
        parts.push(dims);
      parts.push(dateStr2);
      subEl.createSpan({ text: parts.join(" \xB7 ") });
      subEl.createSpan({
        cls: `a4p-img-status-pill ${entry.status}`,
        text: (_a = STATUS_LABEL[entry.status]) != null ? _a : entry.status
      });
    };
    renderSub();
    img.addEventListener("load", () => {
      if (img.naturalWidth)
        renderSub(`${img.naturalWidth}\xD7${img.naturalHeight}`);
    });
    if (entry.sourceNote) {
      const noteRow = body.createDiv({ cls: "a4p-img-preview-row" });
      (0, import_obsidian12.setIcon)(noteRow.createSpan({ cls: "a4p-img-preview-row-icon" }), "file-text");
      const noteLink = noteRow.createEl("a", { text: entry.sourceNote, cls: "a4p-img-preview-link" });
      noteLink.addEventListener("click", (evt) => {
        evt.preventDefault();
        this.close();
        void this.app.workspace.openLinkText(entry.sourceNote, "", false);
      });
    }
    if (entry.status === "uploaded") {
      const urlRow = body.createDiv({ cls: "a4p-img-preview-row" });
      (0, import_obsidian12.setIcon)(urlRow.createSpan({ cls: "a4p-img-preview-row-icon" }), "link");
      urlRow.createSpan({ cls: "a4p-img-preview-url", text: entry.url });
    }
    const actions = body.createDiv({ cls: "a4p-img-preview-actions" });
    this.actionButton(actions, "plus", "\uC5D0\uB514\uD130\uC5D0 \uC0BD\uC785", { cta: true }, () => {
      if (entry.status !== "uploaded") {
        new import_obsidian12.Notice("\uC544\uC9C1 \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC740 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4. '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4'\uB97C \uBA3C\uC800 \uC2E4\uD589\uD558\uC138\uC694.");
        return;
      }
      if (insertAtEditor(this.app, `![${stemOf(name)}](${entry.url})`))
        this.close();
    });
    this.actionButton(actions, "copy", "URL \uBCF5\uC0AC", {}, () => {
      void navigator.clipboard.writeText(entry.url);
      new import_obsidian12.Notice("URL\uC744 \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.");
    });
    if (entry.sourceNote) {
      this.actionButton(actions, "file-text", "\uB178\uD2B8 \uC5F4\uAE30", {}, () => {
        this.close();
        void this.app.workspace.openLinkText(entry.sourceNote, "", false);
      });
    }
    if (entry.status === "uploaded" && import_obsidian12.Platform.isDesktopApp) {
      this.actionButton(actions, "external-link", "\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC5F4\uAE30", {}, () => {
        window.open(entry.url);
      });
    }
    this.actionButton(actions, "trash-2", "\uC0AD\uC81C\u2026", { danger: true }, () => {
      this.close();
      new DeleteImageModal(this.app, this.plugin, entry).open();
    });
    this.actionButton(actions, "search", "\uC0AC\uC6A9\uCC98 \uAC80\uC0C9", {}, async (btn) => {
      btn.disabled = true;
      (0, import_obsidian12.setIcon)(btn.querySelector(".a4p-img-btn-icon"), "loader-2");
      try {
        const usages = await findImageUsages(this.app, this.entry);
        this.renderUsages(body, usages);
      } finally {
        btn.disabled = false;
        (0, import_obsidian12.setIcon)(btn.querySelector(".a4p-img-btn-icon"), "search");
      }
    });
  }
  actionButton(parent, icon, label, opts, onClick) {
    const btn = parent.createEl("button", { cls: "a4p-img-btn" });
    if (opts.cta)
      btn.addClass("mod-cta");
    if (opts.danger)
      btn.addClass("a4p-img-btn--danger");
    if (opts.iconOnly) {
      btn.addClass("a4p-img-btn--icon");
      btn.title = label;
      btn.setAttribute("aria-label", label);
    }
    (0, import_obsidian12.setIcon)(btn.createSpan({ cls: "a4p-img-btn-icon" }), icon);
    if (!opts.iconOnly)
      btn.createSpan({ text: label });
    btn.addEventListener("click", () => void onClick(btn));
  }
  renderUsages(parent, usages) {
    var _a;
    (_a = parent.querySelector(".a4p-img-preview-usages")) == null ? void 0 : _a.remove();
    const box = parent.createDiv({ cls: "a4p-img-preview-usages" });
    if (usages.length === 0) {
      box.createDiv({ cls: "a4p-img-preview-sub", text: "\uC774 \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD558\uB294 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    box.createDiv({ cls: "a4p-img-preview-usages-title", text: `\uC0AC\uC6A9 \uC911\uC778 \uB178\uD2B8 ${usages.length}\uAC1C` });
    for (const path of usages) {
      const row = box.createDiv({ cls: "a4p-img-preview-row" });
      (0, import_obsidian12.setIcon)(row.createSpan({ cls: "a4p-img-preview-row-icon" }), "file-text");
      const link = row.createEl("a", { text: path, cls: "a4p-img-preview-link" });
      link.addEventListener("click", (evt) => {
        evt.preventDefault();
        this.close();
        void this.app.workspace.openLinkText(path, "", false);
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/gallery-view.ts
var VIEW_TYPE_A4P_IMAGE_GALLERY = "a4p-image-gallery-view";
var DEBOUNCE_MS = 150;
var THUMB_PX_MIN = 80;
var THUMB_PX_MAX = 200;
var THUMB_PX_DEFAULT = 118;
var LS_PREFIX = "a4p-image:gallery:";
function loadPref(key, fallback, allowed) {
  try {
    const v = window.localStorage.getItem(LS_PREFIX + key);
    return allowed.includes(v) ? v : fallback;
  } catch (e) {
    return fallback;
  }
}
function loadNumPref(key, fallback, min, max) {
  var _a;
  try {
    const n = parseInt((_a = window.localStorage.getItem(LS_PREFIX + key)) != null ? _a : "", 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  } catch (e) {
    return fallback;
  }
}
function savePref(key, value) {
  try {
    window.localStorage.setItem(LS_PREFIX + key, value);
  } catch (e) {
  }
}
var GalleryView = class extends import_obsidian13.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.panelEl = null;
    this.gridEl = null;
    this.statsEl = null;
    this.countEl = null;
    this.query = "";
    this.statusFilter = "all";
    this.dateFilter = "all";
    this.groupByNote = false;
    this.viewMode = loadPref("mode", "grid", ["grid", "masonry", "list"]);
    this.thumbPx = loadNumPref("px", THUMB_PX_DEFAULT, THUMB_PX_MIN, THUMB_PX_MAX);
    this.sortOrder = loadPref("sort", "new", ["new", "old", "size", "name"]);
    this.debounceTimer = null;
    /** entryId → 이 이미지를 실제 사용 중인 노트 경로들 (노트별 보기용, 새로고침 시 재스캔) */
    this.usageMap = null;
    this.usageScanning = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_A4P_IMAGE_GALLERY;
  }
  getDisplayText() {
    return "A4P Image \uAC24\uB7EC\uB9AC";
  }
  getIcon() {
    return "image";
  }
  async onOpen() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("a4p-img-panel");
    this.panelEl = root;
    this.applyThumbPx();
    const header = root.createDiv({ cls: "a4p-img-header" });
    (0, import_obsidian13.setIcon)(header.createSpan({ cls: "a4p-img-header-icon" }), "images");
    header.createSpan({ cls: "a4p-img-header-title", text: "\uC774\uBBF8\uC9C0 \uAC24\uB7EC\uB9AC" });
    this.countEl = header.createSpan({ cls: "a4p-img-header-count" });
    const refreshBtn = header.createEl("button", { cls: "a4p-img-icon-btn a4p-img-header-refresh" });
    refreshBtn.title = "\uC0C8\uB85C\uACE0\uCE68 (\uB178\uD2B8\uBCC4 \uC0AC\uC6A9\uCC98 \uC7AC\uC2A4\uCE94 \uD3EC\uD568)";
    (0, import_obsidian13.setIcon)(refreshBtn, "refresh-cw");
    refreshBtn.addEventListener("click", () => {
      this.usageMap = null;
      this.renderGrid();
    });
    const toolbar = root.createDiv({ cls: "a4p-img-toolbar" });
    const searchRow = toolbar.createDiv({ cls: "a4p-img-search-row" });
    const inputWrap = searchRow.createDiv({ cls: "a4p-img-input-wrap" });
    (0, import_obsidian13.setIcon)(inputWrap.createSpan({ cls: "a4p-img-input-icon" }), "search");
    const input = inputWrap.createEl("input", {
      type: "text",
      placeholder: "\uD30C\uC77C\uBA85\xB7\uB178\uD2B8 \uAC80\uC0C9\u2026",
      cls: "a4p-img-search-input"
    });
    const clearBtn = inputWrap.createSpan({ cls: "a4p-img-input-clear" });
    (0, import_obsidian13.setIcon)(clearBtn, "x");
    const applyQuery = (value) => {
      this.query = value.trim().toLowerCase();
      inputWrap.toggleClass("has-value", value.length > 0);
      this.renderGrid();
    };
    input.addEventListener("input", () => {
      inputWrap.toggleClass("has-value", input.value.length > 0);
      if (this.debounceTimer !== null)
        window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => applyQuery(input.value), DEBOUNCE_MS);
    });
    clearBtn.addEventListener("click", () => {
      input.value = "";
      applyQuery("");
      input.focus();
    });
    new GallerySuggest(this.app, this.plugin, input, (picked) => applyQuery(picked));
    const statusRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    statusRow.createSpan({ cls: "a4p-img-filter-label", text: "\uC0C1\uD0DC" });
    this.buildSegmented(
      statusRow,
      [
        ["all", "\uC804\uCCB4", "layers"],
        ["uploaded", "\uC5C5\uB85C\uB4DC", "cloud-upload"],
        ["pending", "\uB300\uAE30", "clock"],
        ["failed", "\uC2E4\uD328", "alert-triangle"]
      ],
      this.statusFilter,
      (v) => {
        this.statusFilter = v;
        this.renderGrid();
      }
    );
    const dateRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    dateRow.createSpan({ cls: "a4p-img-filter-label", text: "\uAE30\uAC04" });
    this.buildSegmented(
      dateRow,
      [
        ["all", "\uC804\uCCB4 \uAE30\uAC04", "infinity"],
        ["7", "7\uC77C", "calendar-days"],
        ["30", "30\uC77C", "calendar-range"]
      ],
      this.dateFilter,
      (v) => {
        this.dateFilter = v;
        this.renderGrid();
      }
    );
    const groupBtn = dateRow.createEl("button", { cls: "a4p-img-chip" });
    (0, import_obsidian13.setIcon)(groupBtn.createSpan({ cls: "a4p-img-chip-icon" }), "folder-tree");
    groupBtn.createSpan({ text: "\uB178\uD2B8\uBCC4" });
    groupBtn.title = "\uB178\uD2B8\uBCC4 \uADF8\uB8F9 \uBCF4\uAE30 \uC804\uD658";
    groupBtn.addEventListener("click", () => {
      this.groupByNote = !this.groupByNote;
      groupBtn.toggleClass("is-active", this.groupByNote);
      this.renderGrid();
    });
    const viewRow = toolbar.createDiv({ cls: "a4p-img-filter-row" });
    viewRow.createSpan({ cls: "a4p-img-filter-label", text: "\uBCF4\uAE30" });
    this.buildIconSeg(
      viewRow,
      [
        ["grid", "layout-grid", "\uACA9\uC790 \uBCF4\uAE30"],
        ["masonry", "layout-dashboard", "\uBAA8\uC790\uC774\uD06C \uBCF4\uAE30 (\uC6D0\uBCF8 \uBE44\uC728)"],
        ["list", "list", "\uBAA9\uB85D \uBCF4\uAE30"]
      ],
      this.viewMode,
      (v) => {
        this.viewMode = v;
        savePref("mode", v);
        syncZoomDisabled();
        this.renderGrid();
      }
    );
    const zoom = viewRow.createDiv({ cls: "a4p-img-zoom" });
    zoom.title = "\uC378\uB124\uC77C \uD06C\uAE30";
    (0, import_obsidian13.setIcon)(zoom.createSpan({ cls: "a4p-img-zoom-icon" }), "zoom-out");
    const zoomSlider = zoom.createEl("input", { type: "range", cls: "a4p-img-zoom-slider" });
    zoomSlider.min = String(THUMB_PX_MIN);
    zoomSlider.max = String(THUMB_PX_MAX);
    zoomSlider.step = "4";
    zoomSlider.value = String(this.thumbPx);
    (0, import_obsidian13.setIcon)(zoom.createSpan({ cls: "a4p-img-zoom-icon" }), "zoom-in");
    zoomSlider.addEventListener("input", () => {
      this.thumbPx = parseInt(zoomSlider.value, 10);
      savePref("px", zoomSlider.value);
      this.applyThumbPx();
    });
    const syncZoomDisabled = () => zoom.toggleClass("is-disabled", this.viewMode === "list");
    syncZoomDisabled();
    const sortSel = viewRow.createEl("select", { cls: "dropdown a4p-img-sort" });
    const SORT_LABEL = {
      new: "\uCD5C\uC2E0\uC21C",
      old: "\uC624\uB798\uB41C\uC21C",
      size: "\uC6A9\uB7C9 \uD070\uC21C",
      name: "\uC774\uB984\uC21C"
    };
    for (const [value, label] of Object.entries(SORT_LABEL)) {
      sortSel.createEl("option", { text: label, value });
    }
    sortSel.value = this.sortOrder;
    sortSel.addEventListener("change", () => {
      this.sortOrder = sortSel.value;
      savePref("sort", this.sortOrder);
      this.renderGrid();
    });
    this.statsEl = root.createDiv({ cls: "a4p-img-stats" });
    const scroller = root.createDiv({ cls: "a4p-img-scroller" });
    this.gridEl = scroller.createDiv({ cls: "a4p-img-grid" });
    this.renderGrid();
  }
  async onClose() {
    if (this.debounceTimer !== null)
      window.clearTimeout(this.debounceTimer);
  }
  /** 외부(삭제 흐름 등)에서 호출하는 전체 갱신 — 사용처 맵도 재스캔 */
  refresh() {
    this.usageMap = null;
    this.renderGrid();
  }
  /** iOS 스타일 세그먼트 컨트롤 — [값, 라벨, lucide 아이콘], 활성 시 data-seg로 상태색 강조 */
  buildSegmented(parent, options, initial, onChange) {
    const box = parent.createDiv({ cls: "a4p-img-seg" });
    const buttons = [];
    for (const [value, label, icon] of options) {
      const btn = box.createEl("button", { cls: "a4p-img-seg-btn" });
      btn.dataset.seg = value;
      (0, import_obsidian13.setIcon)(btn.createSpan({ cls: "a4p-img-seg-icon" }), icon);
      btn.createSpan({ text: label });
      if (value === initial)
        btn.addClass("is-active");
      btn.addEventListener("click", () => {
        for (const b of buttons)
          b.removeClass("is-active");
        btn.addClass("is-active");
        onChange(value);
      });
      buttons.push(btn);
    }
  }
  /** 아이콘 전용 미니 세그먼트 — 뷰 모드·썸네일 크기 토글 */
  buildIconSeg(parent, options, initial, onChange) {
    const box = parent.createDiv({ cls: "a4p-img-seg a4p-img-seg--icons" });
    const buttons = [];
    for (const [value, icon, tooltip] of options) {
      const btn = box.createEl("button", { cls: "a4p-img-seg-btn a4p-img-seg-btn--icon" });
      btn.title = tooltip;
      btn.setAttribute("aria-label", tooltip);
      (0, import_obsidian13.setIcon)(btn.createSpan({ cls: "a4p-img-seg-icon" }), icon);
      if (value === initial)
        btn.addClass("is-active");
      btn.addEventListener("click", () => {
        for (const b of buttons)
          b.removeClass("is-active");
        btn.addClass("is-active");
        onChange(value);
      });
      buttons.push(btn);
    }
  }
  applyThumbPx() {
    var _a;
    (_a = this.panelEl) == null ? void 0 : _a.style.setProperty("--a4p-thumb-min", `${this.thumbPx}px`);
  }
  entryName(entry) {
    var _a;
    const path = (_a = entry.localPath) != null ? _a : entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }
  /** 카드·목록 공용 빠른 액션 정의 (삽입 / URL 복사 / 삭제) */
  entryActions(entry) {
    const name = this.entryName(entry);
    return [
      {
        icon: "plus",
        title: "\uC5D0\uB514\uD130\uC5D0 \uC0BD\uC785",
        onClick: () => {
          if (entry.status !== "uploaded") {
            new import_obsidian13.Notice("\uC544\uC9C1 \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC740 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4.");
            return;
          }
          insertAtEditor(this.app, `![${stemOf(name)}](${entry.url})`);
        }
      },
      {
        icon: "copy",
        title: "URL \uBCF5\uC0AC",
        onClick: () => {
          void navigator.clipboard.writeText(entry.url);
          new import_obsidian13.Notice("URL\uC744 \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.");
        }
      },
      {
        icon: "trash-2",
        title: "\uC0AD\uC81C\u2026 (\uC11C\uBC84 \uD3EC\uD568, \uC774\uC911 \uD655\uC778)",
        danger: true,
        onClick: () => {
          new DeleteImageModal(this.app, this.plugin, entry).open();
        }
      }
    ];
  }
  renderGrid() {
    var _a;
    if (!this.gridEl)
      return;
    this.gridEl.empty();
    this.gridEl.className = this.groupByNote ? "a4p-img-grid is-grouped" : `a4p-img-grid mode-${this.viewMode}`;
    const compare = {
      new: (a, b) => b.createdAt - a.createdAt,
      old: (a, b) => a.createdAt - b.createdAt,
      size: (a, b) => b.size - a.size,
      name: (a, b) => this.entryName(a).localeCompare(this.entryName(b), "ko")
    };
    const allEntries = this.plugin.manifestStore.all();
    (_a = this.countEl) == null ? void 0 : _a.setText(String(allEntries.length));
    let entries = [...allEntries].sort(compare[this.sortOrder]);
    if (this.statusFilter !== "all")
      entries = entries.filter((e) => e.status === this.statusFilter);
    if (this.dateFilter !== "all") {
      const cutoff = Date.now() - parseInt(this.dateFilter, 10) * 24 * 60 * 60 * 1e3;
      entries = entries.filter((e) => e.createdAt >= cutoff);
    }
    if (this.query) {
      entries = entries.filter((e) => {
        var _a2;
        const haystack = `${this.entryName(e)} ${(_a2 = e.sourceNote) != null ? _a2 : ""}`.toLowerCase();
        return haystack.includes(this.query);
      });
    }
    const filteredSize = entries.reduce((sum, e) => sum + e.size, 0);
    const uploadedSize = allEntries.filter((e) => e.status === "uploaded").reduce((sum, e) => sum + e.size, 0);
    const pctOfFree = (uploadedSize / (10 * 1024 * 1024 * 1024) * 100).toFixed(2);
    if (this.statsEl) {
      this.statsEl.empty();
      this.statsEl.createSpan({ cls: "a4p-img-stats-strong", text: `${entries.length}\uAC1C \xB7 ${formatBytes(filteredSize)}` });
      const usage = this.statsEl.createSpan({ cls: "a4p-img-stats-usage" });
      (0, import_obsidian13.setIcon)(usage.createSpan({ cls: "a4p-img-stats-usage-icon" }), "cloud");
      usage.createSpan({ text: `R2 ${formatBytes(uploadedSize)} \xB7 10GB\uC758 ${pctOfFree}%` });
      const bar = this.statsEl.createDiv({ cls: "a4p-img-stats-bar" });
      const fill = bar.createDiv({ cls: "a4p-img-stats-bar-fill" });
      fill.style.width = `${Math.min(100, parseFloat(pctOfFree))}%`;
    }
    if (entries.length === 0) {
      const empty = this.gridEl.createDiv({ cls: "a4p-img-empty" });
      (0, import_obsidian13.setIcon)(empty.createDiv({ cls: "a4p-img-empty-icon" }), "image-off");
      empty.createDiv({ cls: "a4p-img-empty-title", text: "\uD45C\uC2DC\uD560 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4" });
      empty.createDiv({ cls: "a4p-img-empty-sub", text: "\uD544\uD130\uB97C \uBC14\uAFB8\uAC70\uB098 \uB178\uD2B8\uC5D0 \uC774\uBBF8\uC9C0\uB97C \uBD99\uC5EC\uB123\uC5B4 \uBCF4\uC138\uC694." });
      return;
    }
    if (this.groupByNote) {
      this.renderGroupedByUsage(entries);
    } else {
      for (const entry of entries) {
        this.renderEntry(this.gridEl, entry);
      }
    }
  }
  renderEntry(parent, entry) {
    if (this.viewMode === "list")
      this.renderListRow(parent, entry);
    else
      this.renderCard(parent, entry);
  }
  /**
   * 노트별 보기 — sourceNote(최초 삽입 노트)가 아니라 실제 사용처 기준.
   * 한 이미지가 여러 노트에 쓰이면 각 그룹에 모두 표시된다.
   */
  renderGroupedByUsage(entries) {
    var _a, _b;
    if (!this.gridEl)
      return;
    if (!this.usageMap) {
      if (!this.usageScanning) {
        this.usageScanning = true;
        void this.computeUsageMap().then((map) => {
          this.usageMap = map;
          this.usageScanning = false;
          this.renderGrid();
        });
      }
      const loading = this.gridEl.createDiv({ cls: "a4p-img-empty is-loading" });
      (0, import_obsidian13.setIcon)(loading.createDiv({ cls: "a4p-img-empty-icon" }), "loader-2");
      loading.createDiv({ cls: "a4p-img-empty-title", text: "\uB178\uD2B8\uBCC4 \uC0AC\uC6A9\uCC98\uB97C \uC2A4\uCE94\uD558\uB294 \uC911\u2026" });
      return;
    }
    const groups = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const notes = (_a = this.usageMap.get(entry.id)) != null ? _a : [];
      const keys = notes.length > 0 ? notes : ["(\uC0AC\uC6A9\uB41C \uB178\uD2B8 \uC5C6\uC74C)"];
      for (const key of keys) {
        const list = (_b = groups.get(key)) != null ? _b : [];
        list.push(entry);
        groups.set(key, list);
      }
    }
    for (const [note, groupEntries] of groups) {
      const isRealNote = note !== "(\uC0AC\uC6A9\uB41C \uB178\uD2B8 \uC5C6\uC74C)";
      const header = this.gridEl.createDiv({ cls: "a4p-img-group" });
      (0, import_obsidian13.setIcon)(
        header.createSpan({ cls: "a4p-img-group-icon" }),
        isRealNote ? "file-text" : "unlink"
      );
      header.createSpan({ cls: "a4p-img-group-name", text: noteBasename(note) });
      header.createSpan({ cls: "a4p-img-group-count", text: `${groupEntries.length}\uC7A5` });
      header.title = isRealNote ? `${note} \u2014 \uD074\uB9AD\uD558\uBA74 \uB178\uD2B8\uB97C \uC5FD\uB2C8\uB2E4` : note;
      if (isRealNote) {
        header.addClass("is-clickable");
        header.addEventListener("click", () => {
          void this.app.workspace.openLinkText(note, "", false);
        });
      }
      const groupGrid = this.gridEl.createDiv({ cls: `a4p-img-grid-inner mode-${this.viewMode}` });
      for (const entry of groupEntries)
        this.renderEntry(groupGrid, entry);
    }
  }
  /** 전 볼트 1회 스캔으로 entryId → 사용 노트 목록 구축 */
  async computeUsageMap() {
    const entries = this.plugin.manifestStore.all();
    const map = /* @__PURE__ */ new Map();
    const push = (id, notePath) => {
      var _a;
      const set = (_a = map.get(id)) != null ? _a : /* @__PURE__ */ new Set();
      set.add(notePath);
      map.set(id, set);
    };
    const byLocal = /* @__PURE__ */ new Map();
    for (const e of entries) {
      if (e.localPath)
        byLocal.set(e.localPath, e);
    }
    for (const [mdPath, links] of Object.entries(this.app.metadataCache.resolvedLinks)) {
      if (isReportNote(this.app, mdPath))
        continue;
      for (const target of Object.keys(links)) {
        const e = byLocal.get(target);
        if (e)
          push(e.id, mdPath);
      }
    }
    const withUrl = entries.filter((e) => e.url);
    const origins = [
      ...new Set(withUrl.map((e) => {
        var _a;
        return (_a = e.url.match(/^https?:\/\/[^/]+/)) == null ? void 0 : _a[0];
      }).filter((o) => !!o))
    ];
    if (withUrl.length > 0 && origins.length > 0) {
      for (const md of this.app.vault.getMarkdownFiles()) {
        if (isReportNote(this.app, md.path))
          continue;
        const content = await this.app.vault.cachedRead(md);
        if (!origins.some((o) => content.includes(o)))
          continue;
        for (const e of withUrl) {
          if (content.includes(e.url))
            push(e.id, md.path);
        }
      }
    }
    return new Map([...map.entries()].map(([id, set]) => [id, [...set]]));
  }
  renderCard(parent, entry) {
    var _a;
    const name = this.entryName(entry);
    const card = parent.createDiv({ cls: "a4p-img-card" });
    card.title = `${name}
${(_a = entry.localPath) != null ? _a : "(\uB85C\uCEEC \uBC31\uC5C5 \uC5C6\uC74C)"}
${entry.url}`;
    const thumbWrap = card.createDiv({ cls: "a4p-img-thumbwrap" });
    const img = thumbWrap.createEl("img", { cls: "a4p-img-thumb" });
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof import_obsidian13.TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    if (img.complete && img.naturalWidth > 0) {
      thumbWrap.addClass("is-loaded");
    } else {
      img.addEventListener("load", () => thumbWrap.addClass("is-loaded"));
      img.addEventListener("error", () => {
        thumbWrap.addClass("is-broken");
        (0, import_obsidian13.setIcon)(thumbWrap.createSpan({ cls: "a4p-img-thumb-broken" }), "image-off");
      });
    }
    if (entry.status !== "uploaded") {
      card.addClass(`is-${entry.status}`);
      const badge = thumbWrap.createDiv({ cls: `a4p-img-badge ${entry.status}` });
      (0, import_obsidian13.setIcon)(badge, entry.status === "failed" ? "alert-triangle" : "clock");
      badge.title = entry.status === "failed" ? "\uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4' \uBA85\uB839\uC73C\uB85C \uBCF5\uAD6C" : "\uC5C5\uB85C\uB4DC \uB300\uAE30 \uC911";
    }
    const quick = thumbWrap.createDiv({ cls: "a4p-img-quick" });
    for (const action of this.entryActions(entry)) {
      const btn = quick.createEl("button", {
        cls: `a4p-img-quick-btn${action.danger ? " a4p-img-quick-btn--danger" : ""}`
      });
      btn.title = action.title;
      (0, import_obsidian13.setIcon)(btn, action.icon);
      btn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        action.onClick();
      });
    }
    const overlay = thumbWrap.createDiv({ cls: "a4p-img-card-overlay" });
    overlay.createDiv({ cls: "a4p-img-card-name", text: name });
    overlay.createDiv({ cls: "a4p-img-card-sub", text: formatBytes(entry.size) });
    card.addEventListener("click", () => {
      new ImagePreviewModal(this.app, this.plugin, entry).open();
    });
  }
  /** 목록 보기 — 썸네일 + 파일명 + 원본 노트 + 메타 + 상태 필 + 액션 */
  renderListRow(parent, entry) {
    var _a;
    const name = this.entryName(entry);
    const row = parent.createDiv({ cls: "a4p-img-listrow" });
    if (entry.status !== "uploaded")
      row.addClass(`is-${entry.status}`);
    const thumb = row.createDiv({ cls: "a4p-img-listrow-thumb" });
    const img = thumb.createEl("img");
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof import_obsidian13.TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    img.addEventListener("error", () => {
      thumb.empty();
      (0, import_obsidian13.setIcon)(thumb.createSpan({ cls: "a4p-img-thumb-broken" }), "image-off");
    });
    const info = row.createDiv({ cls: "a4p-img-listrow-info" });
    info.createDiv({ cls: "a4p-img-listrow-name", text: name });
    const sub = info.createDiv({ cls: "a4p-img-listrow-sub" });
    const date = new Date(entry.createdAt).toLocaleDateString("ko-KR", { dateStyle: "medium" });
    sub.createSpan({ text: `${formatBytes(entry.size)} \xB7 ${date}` });
    if (entry.sourceNote) {
      sub.createSpan({ text: " \xB7 " });
      const link = sub.createEl("a", { cls: "a4p-img-listrow-note", text: noteBasename(entry.sourceNote) });
      link.title = entry.sourceNote;
      link.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        void this.app.workspace.openLinkText(entry.sourceNote, "", false);
      });
    }
    row.createSpan({
      cls: `a4p-img-status-pill ${entry.status}`,
      text: (_a = STATUS_LABEL[entry.status]) != null ? _a : entry.status
    });
    const actions = row.createDiv({ cls: "a4p-img-listrow-actions" });
    for (const action of this.entryActions(entry)) {
      const btn = actions.createEl("button", {
        cls: `a4p-img-listrow-btn${action.danger ? " a4p-img-listrow-btn--danger" : ""}`
      });
      btn.title = action.title;
      (0, import_obsidian13.setIcon)(btn, action.icon);
      btn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        action.onClick();
      });
    }
    row.addEventListener("click", () => {
      new ImagePreviewModal(this.app, this.plugin, entry).open();
    });
  }
};
function noteBasename(path) {
  var _a;
  const name = (_a = path.split("/").pop()) != null ? _a : path;
  return name.replace(/\.md$/i, "");
}
var GallerySuggest = class extends import_obsidian13.AbstractInputSuggest {
  constructor(app, plugin, inputEl, onPick) {
    super(app, inputEl);
    this.plugin = plugin;
    this.onPick = onPick;
  }
  getSuggestions(query) {
    var _a;
    const q = query.trim().toLowerCase();
    if (!q)
      return [];
    const seen = /* @__PURE__ */ new Set();
    const files = [];
    const notes = [];
    for (const entry of this.plugin.manifestStore.all()) {
      const path = (_a = entry.localPath) != null ? _a : entry.r2Key;
      const i = path.lastIndexOf("/");
      const name = i >= 0 ? path.slice(i + 1) : path;
      if (name.toLowerCase().includes(q) && !seen.has(`f:${name}`)) {
        seen.add(`f:${name}`);
        files.push({ kind: "file", label: name });
      }
      if (entry.sourceNote) {
        const base = noteBasename(entry.sourceNote);
        if (base.toLowerCase().includes(q) && !seen.has(`n:${base}`)) {
          seen.add(`n:${base}`);
          notes.push({ kind: "note", label: base });
        }
      }
    }
    const rank = (s) => s.label.toLowerCase().startsWith(q) ? 0 : 1;
    return [...files, ...notes].sort((a, b) => rank(a) - rank(b)).slice(0, 8);
  }
  renderSuggestion(value, el) {
    el.addClass("a4p-img-suggest-item");
    (0, import_obsidian13.setIcon)(el.createSpan({ cls: "a4p-img-suggest-icon" }), value.kind === "file" ? "image" : "file-text");
    el.createSpan({ cls: "a4p-img-suggest-label", text: value.label });
    el.createSpan({ cls: "a4p-img-suggest-kind", text: value.kind === "file" ? "\uC774\uBBF8\uC9C0" : "\uB178\uD2B8" });
  }
  selectSuggestion(value) {
    this.setValue(value.label);
    this.onPick(value.label);
    this.close();
  }
};

// src/migrate-modal.ts
var import_obsidian14 = require("obsidian");

// src/migrate.ts
function normalizeBase(url) {
  return url.trim().replace(/\/+$/g, "");
}
function replaceUrlPrefix(content, oldBase, newBase) {
  const from = normalizeBase(oldBase);
  const to = normalizeBase(newBase);
  if (!from || !to || from === to)
    return { content, count: 0 };
  const parts = content.split(`${from}/`);
  return { content: parts.join(`${to}/`), count: parts.length - 1 };
}

// src/migrate-modal.ts
var MigrateUrlModal = class extends import_obsidian14.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.scanResult = null;
    this.newBase = normalizeBase(plugin.settings.r2.publicBaseUrl);
    this.oldBase = this.suggestOldBase();
  }
  suggestOldBase() {
    const current = normalizeBase(this.plugin.settings.r2.publicBaseUrl);
    for (const entry of this.plugin.manifestStore.all()) {
      const m = entry.url.match(/^(https?:\/\/[^/]+)/);
      if (m && m[1] !== current)
        return m[1];
    }
    return "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uC774\uBBF8\uC9C0 \uC8FC\uC18C \uC77C\uAD04 \uBCC0\uACBD" });
    contentEl.createEl("p", {
      cls: "a4p-image-settings-status-line",
      text: "\uBCFC\uD2B8 \uC804\uCCB4 \uB178\uD2B8\uC5D0\uC11C '\uC61B \uC8FC\uC18C'\uB85C \uC2DC\uC791\uD558\uB294 \uB9C1\uD06C\uB97C '\uC0C8 \uC8FC\uC18C'\uB85C \uBC14\uAFC9\uB2C8\uB2E4. \uCEE4\uC2A4\uD140 \uB3C4\uBA54\uC778 \uC804\uD658\uC774\uB098 \uC798\uBABB \uC785\uB825\uB41C \uC8FC\uC18C \uBCF5\uAD6C\uC5D0 \uC0AC\uC6A9\uD558\uC138\uC694. \uBA3C\uC800 \uC2A4\uCE94\uC73C\uB85C \uB300\uC0C1\uC744 \uD655\uC778\uD574\uC57C \uC2E4\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
    new import_obsidian14.Setting(contentEl).setName("\uC61B \uC8FC\uC18C (base URL)").addText(
      (text) => text.setPlaceholder("https://pub-xxxx.r2.dev").setValue(this.oldBase).onChange((v) => {
        this.oldBase = v;
        this.invalidateScan();
      })
    );
    new import_obsidian14.Setting(contentEl).setName("\uC0C8 \uC8FC\uC18C (base URL)").addText(
      (text) => text.setPlaceholder("https://img.example.com").setValue(this.newBase).onChange((v) => {
        this.newBase = v;
        this.invalidateScan();
      })
    );
    this.statusEl = contentEl.createDiv({ cls: "a4p-image-settings-status" });
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const scanBtn = buttons.createEl("button", { text: "\uC2A4\uCE94 (dry-run)", cls: "mod-cta" });
    scanBtn.addEventListener("click", () => void this.scan());
    this.runBtn = buttons.createEl("button", { text: "\uCE58\uD658 \uC2E4\uD589" });
    this.runBtn.disabled = true;
    this.runBtn.addEventListener("click", () => void this.execute());
  }
  invalidateScan() {
    this.scanResult = null;
    this.runBtn.disabled = true;
    this.statusEl.empty();
  }
  validate() {
    const from = normalizeBase(this.oldBase);
    const to = normalizeBase(this.newBase);
    if (!from.startsWith("http"))
      return "\uC61B \uC8FC\uC18C\uB294 http(s)://\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4.";
    if (!to.startsWith("http"))
      return "\uC0C8 \uC8FC\uC18C\uB294 http(s)://\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4.";
    if (from === to)
      return "\uC61B \uC8FC\uC18C\uC640 \uC0C8 \uC8FC\uC18C\uAC00 \uAC19\uC2B5\uB2C8\uB2E4.";
    return null;
  }
  async scan() {
    const error = this.validate();
    if (error) {
      new import_obsidian14.Notice(error);
      return;
    }
    this.statusEl.empty();
    this.statusEl.createEl("p", { text: "\uC2A4\uCE94 \uC911\u2026", cls: "a4p-image-settings-status-line" });
    const from = normalizeBase(this.oldBase);
    const files = [];
    let occurrences = 0;
    for (const md of this.app.vault.getMarkdownFiles()) {
      const content = await this.app.vault.cachedRead(md);
      const count = content.split(`${from}/`).length - 1;
      if (count > 0) {
        files.push(md);
        occurrences += count;
      }
    }
    this.scanResult = { files, occurrences };
    this.statusEl.empty();
    if (files.length === 0) {
      this.statusEl.createEl("p", {
        text: "\uC61B \uC8FC\uC18C\uB97C \uC0AC\uC6A9\uD558\uB294 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
        cls: "a4p-image-settings-status-line"
      });
      this.runBtn.disabled = true;
      return;
    }
    this.statusEl.createEl("p", {
      text: `\uB178\uD2B8 ${files.length}\uAC1C\uC5D0\uC11C \uB9C1\uD06C ${occurrences}\uAC74\uC774 \uBC1C\uACAC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uBAA9\uB85D\uC744 \uD655\uC778 \uD6C4 \uC2E4\uD589\uD558\uC138\uC694.`,
      cls: "a4p-image-settings-status-line"
    });
    const listEl = this.statusEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const f of files)
      listEl.createDiv({ cls: "a4p-image-plan-item", text: f.path });
    this.runBtn.disabled = false;
  }
  async execute() {
    if (!this.scanResult)
      return;
    const from = normalizeBase(this.oldBase);
    const to = normalizeBase(this.newBase);
    let replaced = 0;
    for (const md of this.scanResult.files) {
      await this.app.vault.process(md, (content) => {
        const result = replaceUrlPrefix(content, from, to);
        replaced += result.count;
        return result.content;
      });
    }
    let manifestFixed = 0;
    for (const entry of this.plugin.manifestStore.all()) {
      if (entry.url.startsWith(`${from}/`)) {
        this.plugin.manifestStore.update(entry.id, { url: `${to}/${entry.url.slice(from.length + 1)}` });
        manifestFixed++;
      }
    }
    this.close();
    new import_obsidian14.Notice(
      `\uC8FC\uC18C \uBCC0\uACBD \uC644\uB8CC \u2014 \uB178\uD2B8 ${this.scanResult.files.length}\uAC1C\uC5D0\uC11C \uB9C1\uD06C ${replaced}\uAC74, \uB9E4\uB2C8\uD398\uC2A4\uD2B8 ${manifestFixed}\uAC74 \uAC31\uC2E0.`,
      8e3
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/eagle/client.ts
var import_obsidian15 = require("obsidian");
var EagleClient = class {
  constructor(getBaseUrl) {
    this.getBaseUrl = getBaseUrl;
  }
  base() {
    return this.getBaseUrl().replace(/\/+$/g, "");
  }
  async get(endpoint) {
    try {
      const res = await (0, import_obsidian15.requestUrl)({ url: `${this.base()}${endpoint}`, method: "GET", throw: false });
      if (res.status !== 200)
        return null;
      const body = res.json;
      return body.status === "success" ? body.data : null;
    } catch (e) {
      return null;
    }
  }
  async post(endpoint, payload) {
    try {
      const res = await (0, import_obsidian15.requestUrl)({
        url: `${this.base()}${endpoint}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        throw: false
      });
      if (res.status !== 200)
        return null;
      const body = res.json;
      return body.status === "success" ? body.data : null;
    } catch (e) {
      return null;
    }
  }
  /** Eagle 실행 여부 — 짧은 타임아웃, 실패 시 조용히 false */
  async isAvailable(timeoutMs = 1500) {
    const probe = this.get("/api/application/info").then((d) => d !== null);
    const timeout = new Promise((resolve) => setTimeout(() => resolve(false), timeoutMs));
    return Promise.race([probe, timeout]);
  }
  async searchImages(limit = 200) {
    const data = await this.get(`/api/item/list?limit=${limit}&orderBy=-CREATEDATE`);
    if (!data)
      return [];
    const imageExts = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);
    return data.filter((item) => {
      var _a;
      return imageExts.has(((_a = item.ext) != null ? _a : "").toLowerCase());
    });
  }
  /** 라이브러리 루트 절대 경로 — 원본 파일 위치 재구성에 사용 */
  async libraryPath() {
    var _a, _b, _c;
    const data = await this.get("/api/library/info");
    return (_c = (_b = (_a = data == null ? void 0 : data.library) == null ? void 0 : _a.path) != null ? _b : data == null ? void 0 : data.path) != null ? _c : null;
  }
  /** 원본 파일 절대 경로: {library}/images/{id}.info/{name}.{ext} */
  itemFilePath(libraryPath, item) {
    return `${libraryPath}/images/${item.id}.info/${item.name}.${item.ext}`;
  }
  /** 썸네일 절대 경로 (없으면 null) */
  async thumbnailPath(id) {
    return this.get(`/api/item/thumbnail?id=${encodeURIComponent(id)}`);
  }
  /** 로컬 파일을 Eagle 라이브러리에 등록 — 성공 시 true */
  async addFromPath(absPath, name, folderId) {
    const payload = { path: absPath, name };
    if (folderId)
      payload.folderId = folderId;
    const data = await this.post("/api/item/addFromPath", payload);
    return data !== null;
  }
};

// src/eagle/modal.ts
var import_obsidian16 = require("obsidian");
var EagleSearchModal = class _EagleSearchModal extends import_obsidian16.FuzzySuggestModal {
  constructor(app, plugin, editor, sourceNote, items, libraryPath) {
    super(app);
    this.plugin = plugin;
    this.editor = editor;
    this.sourceNote = sourceNote;
    this.items = items;
    this.libraryPath = libraryPath;
    this.setPlaceholder("Eagle \uC774\uBBF8\uC9C0 \uAC80\uC0C9 (\uC774\uB984\xB7\uD0DC\uADF8\xB7\uBA54\uBAA8)");
  }
  static async open(plugin, editor, sourceNote) {
    const client = plugin.eagle;
    if (!await client.isAvailable()) {
      new import_obsidian16.Notice("Eagle \uC571\uC774 \uC2E4\uD589 \uC911\uC774 \uC544\uB2D9\uB2C8\uB2E4. Eagle\uC744 \uBA3C\uC800 \uC2E4\uD589\uD558\uC138\uC694.");
      return;
    }
    const [items, libraryPath] = await Promise.all([client.searchImages(), client.libraryPath()]);
    if (!libraryPath) {
      new import_obsidian16.Notice("Eagle \uB77C\uC774\uBE0C\uB7EC\uB9AC \uACBD\uB85C\uB97C \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      return;
    }
    if (items.length === 0) {
      new import_obsidian16.Notice("Eagle \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
      return;
    }
    new _EagleSearchModal(plugin.app, plugin, editor, sourceNote, items, libraryPath).open();
  }
  getItems() {
    return this.items;
  }
  getItemText(item) {
    var _a, _b;
    return [item.name, ...(_a = item.tags) != null ? _a : [], (_b = item.annotation) != null ? _b : ""].join(" ");
  }
  renderSuggestion(match, el) {
    var _a, _b;
    const item = match.item;
    el.empty();
    const row = el.createDiv({ cls: "a4p-image-eagle-suggestion" });
    const img = row.createEl("img", { cls: "a4p-image-eagle-thumb" });
    void this.plugin.eagle.thumbnailPath(item.id).then((thumb) => {
      if (thumb)
        img.src = `file://${encodeURI(thumb.replace(/\\/g, "/"))}`;
    });
    const textEl = row.createDiv();
    textEl.createDiv({ text: `${item.name}.${item.ext}` });
    const metaParts = [formatBytes((_a = item.size) != null ? _a : 0)];
    if (item.width && item.height)
      metaParts.push(`${item.width}\xD7${item.height}`);
    if ((_b = item.tags) == null ? void 0 : _b.length)
      metaParts.push(item.tags.slice(0, 5).join(", "));
    textEl.createDiv({ cls: "a4p-image-eagle-meta", text: metaParts.join(" \xB7 ") });
  }
  onChooseItem(item) {
    void this.insertItem(item);
  }
  async insertItem(item) {
    var _a, _b;
    const filePath = this.plugin.eagle.itemFilePath(this.libraryPath, item);
    const buf = readLocalFile(filePath);
    if (!buf) {
      new import_obsidian16.Notice(`Eagle \uC6D0\uBCF8 \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: ${filePath}`);
      return;
    }
    const notice = new import_obsidian16.Notice(`Eagle \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC \uC911: ${item.name}\u2026`, 0);
    try {
      const outcome = await this.plugin.uploader.process(buf, {
        name: `${item.name}.${item.ext}`,
        mime: mimeForExt(item.ext),
        sourceNotePath: (_b = (_a = this.sourceNote) == null ? void 0 : _a.path) != null ? _b : null,
        origin: "eagle"
      });
      notice.hide();
      if (outcome.ok) {
        this.editor.replaceSelection(`![${outcome.stem}](${outcome.url})`);
        const entry = this.plugin.manifestStore.get(outcome.entryId);
        if (entry && !entry.eagleId)
          this.plugin.manifestStore.update(entry.id, { eagleId: item.id });
      } else if (outcome.localPath && this.plugin.settings.fallbackToLocalEmbed) {
        this.editor.replaceSelection(`![[${outcome.localPath}]]`);
        new import_obsidian16.Notice(`\uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 \uB85C\uCEEC\uB85C \uC784\uBCA0\uB4DC\uD588\uC2B5\uB2C8\uB2E4. (${outcome.error})`, 8e3);
      } else {
        new import_obsidian16.Notice(`\uC5C5\uB85C\uB4DC \uC2E4\uD328: ${outcome.error}`, 8e3);
      }
    } catch (e) {
      notice.hide();
      new import_obsidian16.Notice(`Eagle \uC774\uBBF8\uC9C0 \uCC98\uB9AC \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`, 8e3);
    }
  }
};
function readLocalFile(absPath) {
  try {
    const req = window.require;
    if (!req)
      return null;
    const fs = req("fs");
    const buf = fs.readFileSync(absPath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch (e) {
    return null;
  }
}

// src/main.ts
var A4pImagePlugin = class extends import_obsidian17.Plugin {
  async onload() {
    await this.loadState();
    this.r2 = new R2Client(() => this.settings.r2);
    this.manifestStore = new ManifestStore(this.createManifestIO());
    await this.manifestStore.load();
    this.uploader = new Uploader(this);
    this.eagle = new EagleClient(() => this.settings.eagle.apiUrl);
    if (import_obsidian17.Platform.isDesktopApp) {
      this.uploader.onUploaded = async (entry) => {
        var _a;
        const { enabled, registerOnUpload, folderId } = this.settings.eagle;
        if (!enabled || !registerOnUpload || !entry.localPath)
          return;
        if (!await this.eagle.isAvailable())
          return;
        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof import_obsidian17.FileSystemAdapter))
          return;
        const absPath = adapter.getFullPath(entry.localPath);
        const name = (_a = entry.localPath.split("/").pop()) != null ? _a : entry.localPath;
        await this.eagle.addFromPath(absPath, name, folderId || void 0);
      };
    }
    this.addSettingTab(new A4pImageSettingTab(this.app, this));
    registerPasteHandlers(this);
    registerEditorTracker(this);
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian17.TFile)
          this.manifestStore.handleRename(oldPath, file.path);
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian17.TFile)
          this.manifestStore.handleDelete(file.path);
      })
    );
    this.registerView(VIEW_TYPE_A4P_IMAGE_GALLERY, (leaf) => new GalleryView(leaf, this));
    this.addRibbonIcon("image", "A4P Image \uAC24\uB7EC\uB9AC", () => {
      void this.activateGalleryView();
    });
    this.addCommand({
      id: "open-gallery",
      name: "\uC774\uBBF8\uC9C0 \uAC24\uB7EC\uB9AC \uC5F4\uAE30",
      callback: () => void this.activateGalleryView()
    });
    this.addCommand({
      id: "retry-failed-uploads",
      name: "\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4",
      callback: () => void runRetryCommand(this)
    });
    this.addCommand({
      id: "convert-current-note",
      name: "\uD604\uC7AC \uB178\uD2B8\uC758 \uB85C\uCEEC \uC774\uBBF8\uC9C0 \u2192 \uD074\uB77C\uC6B0\uB4DC \uBCC0\uD658",
      editorCallback: (_editor, ctx) => {
        const file = ctx.file;
        if (!file) {
          new import_obsidian17.Notice("\uD65C\uC131 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
          return;
        }
        void openConvertModal(this, [file], `\uD604\uC7AC \uB178\uD2B8: ${file.basename}`);
      }
    });
    this.addCommand({
      id: "convert-vault",
      name: "\uBCFC\uD2B8 \uC804\uCCB4\uC758 \uB85C\uCEEC \uC774\uBBF8\uC9C0 \u2192 \uD074\uB77C\uC6B0\uB4DC \uBCC0\uD658",
      callback: () => {
        void openConvertModal(this, this.app.vault.getMarkdownFiles(), "\uBCFC\uD2B8 \uC804\uCCB4");
      }
    });
    this.addCommand({
      id: "migrate-base-url",
      name: "\uC774\uBBF8\uC9C0 \uC8FC\uC18C \uC77C\uAD04 \uBCC0\uACBD (\uB3C4\uBA54\uC778 \uC804\uD658\xB7\uC8FC\uC18C \uBCF5\uAD6C)",
      callback: () => new MigrateUrlModal(this.app, this).open()
    });
    this.addCommand({
      id: "unused-report",
      name: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uB9AC\uD3EC\uD2B8 \uC0DD\uC131",
      callback: () => void runUnusedReportCommand(this)
    });
    this.addCommand({
      id: "trash-unused",
      name: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\xB7\uCCA8\uBD80 \uD734\uC9C0\uD1B5 \uC774\uB3D9 (\uC120\uD0DD\xB7\uC2B9\uC778 \uD544\uC694)",
      callback: () => void runTrashUnusedCommand(this)
    });
    if (import_obsidian17.Platform.isDesktopApp) {
      this.addCommand({
        id: "eagle-search-insert",
        name: "Eagle\uC5D0\uC11C \uC774\uBBF8\uC9C0 \uAC80\uC0C9\xB7\uC0BD\uC785",
        editorCheckCallback: (checking, editor, ctx) => {
          var _a;
          if (!this.settings.eagle.enabled)
            return false;
          if (checking)
            return true;
          void EagleSearchModal.open(this, editor, (_a = ctx.file) != null ? _a : null);
          return true;
        }
      });
    }
  }
  onunload() {
    void this.manifestStore.flush();
  }
  /** 열려 있는 갤러리 뷰 전체 갱신 — 삭제 등 매니페스트 변경 후 호출 */
  refreshGalleryViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_A4P_IMAGE_GALLERY)) {
      if (leaf.view instanceof GalleryView)
        leaf.view.refresh();
    }
  }
  async activateGalleryView() {
    var _a;
    const { workspace } = this.app;
    let leaf = (_a = workspace.getLeavesOfType(VIEW_TYPE_A4P_IMAGE_GALLERY)[0]) != null ? _a : null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (!leaf)
        return;
      await leaf.setViewState({ type: VIEW_TYPE_A4P_IMAGE_GALLERY, active: true });
    }
    void workspace.revealLeaf(leaf);
  }
  createManifestIO() {
    const indexPath = (0, import_obsidian17.normalizePath)(`${this.manifest.dir}/index.json`);
    const adapter = this.app.vault.adapter;
    return {
      read: async () => {
        if (!await adapter.exists(indexPath))
          return null;
        return adapter.read(indexPath);
      },
      write: (content) => adapter.write(indexPath, content)
    };
  }
  async loadState() {
    var _a, _b, _c, _d, _e;
    const raw = (_a = await this.loadData()) != null ? _a : {};
    const saved = (_b = raw.settings) != null ? _b : {};
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      r2: { ...DEFAULT_SETTINGS.r2, ...(_c = saved.r2) != null ? _c : {} },
      compress: { ...DEFAULT_SETTINGS.compress, ...(_d = saved.compress) != null ? _d : {} },
      eagle: { ...DEFAULT_SETTINGS.eagle, ...(_e = saved.eagle) != null ? _e : {} }
    };
  }
  async persist() {
    const payload = { settings: this.settings };
    await this.saveData(payload);
  }
};

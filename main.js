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
var import_obsidian12 = require("obsidian");

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
    new import_obsidian.Setting(containerEl).setName("\uB9AC\uD3EC\uD2B8 \uD3F4\uB354").setDesc("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uB9AC\uD3EC\uD2B8 \uB178\uD2B8\uB97C \uB9CC\uB4E4 \uD3F4\uB354\uC785\uB2C8\uB2E4. \uBE44\uC6B0\uBA74 \uBCFC\uD2B8 \uB8E8\uD2B8\uC5D0 \uB9CC\uB4ED\uB2C8\uB2E4.").addText(
      (text) => text.setValue(this.plugin.settings.reportFolder).onChange(async (value) => {
        this.plugin.settings.reportFolder = value.trim();
        await this.plugin.persist();
      })
    );
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
        new import_obsidian4.Notice("A4P \uC774\uBBF8\uC9C0: R2 \uC124\uC815\uC774 \uC5C6\uC5B4 \uAE30\uBCF8 \uBD99\uC5EC\uB123\uAE30\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694.");
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
function markdownImageText(filename, url) {
  return `![${stemOf(filename)}](${url})`;
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
      refs.push({ notePath: md.path, original: embed.original, imagePath: dest.path });
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
        return { original: r.original, replacement: markdownImageText(filename, url) };
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
var import_obsidian6 = require("obsidian");
var VIEW_TYPE_A4P_IMAGE_GALLERY = "a4p-image-gallery-view";
var DEBOUNCE_MS = 150;
var GalleryView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.gridEl = null;
    this.countEl = null;
    this.statsEl = null;
    this.query = "";
    this.statusFilter = "all";
    this.dateFilter = "all";
    this.groupByNote = false;
    this.debounceTimer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_A4P_IMAGE_GALLERY;
  }
  getDisplayText() {
    return "A4P \uC774\uBBF8\uC9C0 \uAC24\uB7EC\uB9AC";
  }
  getIcon() {
    return "image";
  }
  async onOpen() {
    const root = this.containerEl.children[1];
    root.empty();
    const toolbar = root.createDiv({ cls: "a4p-image-gallery-toolbar" });
    const input = toolbar.createEl("input", { type: "text", placeholder: "\uD30C\uC77C\uBA85\xB7\uB178\uD2B8 \uAC80\uC0C9" });
    input.addEventListener("input", () => {
      if (this.debounceTimer !== null)
        window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        this.query = input.value.trim().toLowerCase();
        this.renderGrid();
      }, DEBOUNCE_MS);
    });
    const statusSelect = toolbar.createEl("select");
    for (const [value, label] of [
      ["all", "\uC804\uCCB4"],
      ["uploaded", "\uC5C5\uB85C\uB4DC\uB428"],
      ["pending", "\uB300\uAE30"],
      ["failed", "\uC2E4\uD328"]
    ]) {
      const opt = statusSelect.createEl("option", { text: label });
      opt.value = value;
    }
    statusSelect.addEventListener("change", () => {
      this.statusFilter = statusSelect.value;
      this.renderGrid();
    });
    const dateSelect = toolbar.createEl("select");
    for (const [value, label] of [
      ["all", "\uC804\uCCB4 \uAE30\uAC04"],
      ["7", "\uCD5C\uADFC 7\uC77C"],
      ["30", "\uCD5C\uADFC 30\uC77C"]
    ]) {
      const opt = dateSelect.createEl("option", { text: label });
      opt.value = value;
    }
    dateSelect.addEventListener("change", () => {
      this.dateFilter = dateSelect.value;
      this.renderGrid();
    });
    const groupBtn = toolbar.createEl("button", { text: "\uB178\uD2B8\uBCC4" });
    groupBtn.title = "\uB178\uD2B8\uBCC4 \uADF8\uB8F9 \uBCF4\uAE30 \uC804\uD658";
    groupBtn.addEventListener("click", () => {
      this.groupByNote = !this.groupByNote;
      groupBtn.toggleClass("mod-cta", this.groupByNote);
      this.renderGrid();
    });
    const refreshBtn = toolbar.createEl("button", { text: "\uC0C8\uB85C\uACE0\uCE68" });
    refreshBtn.addEventListener("click", () => this.renderGrid());
    this.countEl = toolbar.createSpan({ cls: "a4p-image-gallery-count" });
    this.statsEl = root.createDiv({ cls: "a4p-image-gallery-stats" });
    this.gridEl = root.createDiv({ cls: "a4p-image-gallery-grid" });
    this.renderGrid();
  }
  async onClose() {
    if (this.debounceTimer !== null)
      window.clearTimeout(this.debounceTimer);
  }
  entryName(entry) {
    var _a;
    const path = (_a = entry.localPath) != null ? _a : entry.r2Key;
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(i + 1) : path;
  }
  renderGrid() {
    var _a, _b, _c, _d;
    if (!this.gridEl)
      return;
    this.gridEl.empty();
    const allEntries = this.plugin.manifestStore.all();
    let entries = [...allEntries].sort((a, b) => b.createdAt - a.createdAt);
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
    (_a = this.countEl) == null ? void 0 : _a.setText(`${entries.length}\uAC1C \xB7 ${formatBytes(filteredSize)}`);
    const uploadedSize = allEntries.filter((e) => e.status === "uploaded").reduce((sum, e) => sum + e.size, 0);
    const pctOfFree = (uploadedSize / (10 * 1024 * 1024 * 1024) * 100).toFixed(2);
    (_b = this.statsEl) == null ? void 0 : _b.setText(`R2 \uC0AC\uC6A9\uB7C9 \uCD94\uC815: ${formatBytes(uploadedSize)} (\uBB34\uB8CC 10GB\uC758 ${pctOfFree}%)`);
    if (entries.length === 0) {
      this.gridEl.createEl("p", { text: "\uD45C\uC2DC\uD560 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.", cls: "a4p-image-gallery-meta" });
      return;
    }
    if (this.groupByNote) {
      const groups = /* @__PURE__ */ new Map();
      for (const entry of entries) {
        const key = (_c = entry.sourceNote) != null ? _c : "(\uB178\uD2B8 \uBBF8\uC9C0\uC815)";
        const list = (_d = groups.get(key)) != null ? _d : [];
        list.push(entry);
        groups.set(key, list);
      }
      for (const [note, groupEntries] of groups) {
        this.gridEl.createDiv({ cls: "a4p-image-gallery-group", text: `${note} (${groupEntries.length})` });
        const groupGrid = this.gridEl.createDiv({ cls: "a4p-image-gallery-grid-inner" });
        for (const entry of groupEntries)
          this.renderCard(groupGrid, entry);
      }
    } else {
      for (const entry of entries) {
        this.renderCard(this.gridEl, entry);
      }
    }
  }
  renderCard(parent, entry) {
    var _a;
    const name = this.entryName(entry);
    const card = parent.createDiv({ cls: "a4p-image-gallery-card" });
    const img = card.createEl("img", { cls: "a4p-image-gallery-thumb" });
    img.loading = "lazy";
    const local = entry.localPath ? this.app.vault.getAbstractFileByPath(entry.localPath) : null;
    img.src = local instanceof import_obsidian6.TFile ? this.app.vault.getResourcePath(local) : entry.url;
    img.alt = name;
    const meta = card.createDiv({ cls: "a4p-image-gallery-meta" });
    if (entry.status !== "uploaded") {
      meta.createSpan({ cls: `a4p-image-gallery-badge ${entry.status}`, text: entry.status === "failed" ? "\uC2E4\uD328" : "\uB300\uAE30" });
    }
    meta.createSpan({ text: `${name} \xB7 ${formatBytes(entry.size)}` });
    meta.title = `${name}
${(_a = entry.localPath) != null ? _a : "(\uB85C\uCEEC \uBC31\uC5C5 \uC5C6\uC74C)"}
${entry.url}`;
    const actions = card.createDiv({ cls: "a4p-image-gallery-actions" });
    const copyBtn = actions.createEl("button", { text: "URL" });
    copyBtn.title = "\uD074\uB77C\uC6B0\uB4DC URL \uBCF5\uC0AC";
    copyBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      void navigator.clipboard.writeText(entry.url);
      new import_obsidian6.Notice("URL\uC744 \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.");
    });
    if (entry.sourceNote) {
      const noteBtn = actions.createEl("button", { text: "\uB178\uD2B8" });
      noteBtn.title = `\uC6D0\uBCF8 \uB178\uD2B8 \uC5F4\uAE30: ${entry.sourceNote}`;
      noteBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        void this.app.workspace.openLinkText(entry.sourceNote, "", false);
      });
    }
    const usageBtn = actions.createEl("button", { text: "\uC0AC\uC6A9\uCC98" });
    usageBtn.title = "\uC774 \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9 \uC911\uC778 \uB178\uD2B8 \uCC3E\uAE30 (\uBCFC\uD2B8 \uC804\uCCB4 \uAC80\uC0C9)";
    usageBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      usageBtn.disabled = true;
      void this.findUsages(entry).finally(() => {
        usageBtn.disabled = false;
      });
    });
    card.addEventListener("click", () => this.insertEntry(entry));
  }
  /** URL(클라우드 링크) + 위키링크(로컬 백업) 사용처를 볼트 전체에서 검색 */
  async findUsages(entry) {
    const usages = /* @__PURE__ */ new Set();
    if (entry.localPath) {
      for (const [mdPath, links] of Object.entries(this.app.metadataCache.resolvedLinks)) {
        if (links[entry.localPath])
          usages.add(mdPath);
      }
    }
    if (entry.url) {
      for (const md of this.app.vault.getMarkdownFiles()) {
        if (usages.has(md.path))
          continue;
        const content = await this.app.vault.cachedRead(md);
        if (content.includes(entry.url))
          usages.add(md.path);
      }
    }
    if (usages.size === 0) {
      new import_obsidian6.Notice("\uC774 \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD558\uB294 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
      return;
    }
    const list = [...usages];
    const preview = list.slice(0, 5).join("\n");
    const more = list.length > 5 ? `
\uC678 ${list.length - 5}\uAC1C` : "";
    new import_obsidian6.Notice(`\uC0AC\uC6A9 \uC911\uC778 \uB178\uD2B8 ${list.length}\uAC1C:
${preview}${more}`, 1e4);
    if (list.length === 1) {
      void this.app.workspace.openLinkText(list[0], "", false);
    }
  }
  insertEntry(entry) {
    var _a;
    const editor = (_a = this.app.workspace.activeEditor) == null ? void 0 : _a.editor;
    if (!editor) {
      new import_obsidian6.Notice("\uC774\uBBF8\uC9C0\uB97C \uC0BD\uC785\uD560 \uD65C\uC131 \uC5D0\uB514\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB178\uD2B8\uB97C \uBA3C\uC800 \uC5EC\uC138\uC694.");
      return;
    }
    if (entry.status !== "uploaded") {
      new import_obsidian6.Notice("\uC544\uC9C1 \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC740 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4. '\uC2E4\uD328\uD55C \uC5C5\uB85C\uB4DC \uC7AC\uC2DC\uB3C4'\uB97C \uBA3C\uC800 \uC2E4\uD589\uD558\uC138\uC694.");
      return;
    }
    editor.replaceSelection(`![${stemOf(this.entryName(entry))}](${entry.url})`);
  }
};

// src/commands.ts
var import_obsidian8 = require("obsidian");

// src/unused.ts
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
  return { fullyUnused, orphanedBackups, cloudOrphans };
}
function buildReportMarkdown(report, now) {
  const dateStr = now.toISOString().slice(0, 10);
  const lines = [
    "---",
    "tags:",
    "  - a4p-image-report",
    "---",
    "",
    `# \uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uB9AC\uD3EC\uD2B8 (${dateStr})`,
    "",
    "> [!info] \uC774 \uB9AC\uD3EC\uD2B8\uB294 \uC815\uBCF4 \uC81C\uACF5\uC6A9\uC785\uB2C8\uB2E4. \uC5B4\uB5A4 \uD30C\uC77C\uB3C4 \uC790\uB3D9\uC73C\uB85C \uC0AD\uC81C\xB7\uC774\uB3D9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
    "> \uC815\uB9AC\uD558\uB824\uBA74 \uBA85\uB839 \uD314\uB808\uD2B8\uC5D0\uC11C **A4P \uC774\uBBF8\uC9C0: \uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uD734\uC9C0\uD1B5 \uC774\uB3D9**\uC744 \uC2E4\uD589\uD574 \uC9C1\uC811 \uC120\uD0DD\xB7\uC2B9\uC778\uD558\uC138\uC694.",
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
    "\uB85C\uCEEC \uBC31\uC5C5\uC774 \uC5C6\uACE0 \uC5B4\uB5A4 \uB178\uD2B8\uC5D0\uC11C\uB3C4 URL\uC744 \uC4F0\uC9C0 \uC54A\uB294 \uD074\uB77C\uC6B0\uB4DC \uAC1D\uCCB4\uC785\uB2C8\uB2E4. \uC774 \uD50C\uB7EC\uADF8\uC778\uC740 R2 \uAC1D\uCCB4\uB97C \uC0AD\uC81C\uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C, \uD544\uC694\uD558\uBA74 Cloudflare \uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C \uC9C1\uC811 \uC815\uB9AC\uD558\uC138\uC694.",
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
  return lines.join("\n");
}

// src/trash-modal.ts
var import_obsidian7 = require("obsidian");
var TrashSelectModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, candidates) {
    super(app);
    this.plugin = plugin;
    this.candidates = candidates;
    this.selected = /* @__PURE__ */ new Set();
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uD734\uC9C0\uD1B5 \uC774\uB3D9" });
    contentEl.createEl("p", {
      text: `\uBBF8\uC0AC\uC6A9\uC73C\uB85C \uD310\uC815\uB41C \uC774\uBBF8\uC9C0 ${this.candidates.length}\uAC1C\uC785\uB2C8\uB2E4. \uC774\uB3D9\uD560 \uD56D\uBAA9\uC744 \uC9C1\uC811 \uC120\uD0DD\uD558\uC138\uC694.`
    });
    contentEl.createEl("p", {
      cls: "a4p-image-trash-warning",
      text: "\uC120\uD0DD\uD55C \uD30C\uC77C\uC740 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uACE0 \uBCFC\uD2B8\uC758 .trash/ \uD3F4\uB354\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4 (\uBCF5\uAD6C \uAC00\uB2A5)."
    });
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    const selectAll = listEl.createDiv({ cls: "a4p-image-plan-item" });
    const allCheckbox = selectAll.createEl("input", { type: "checkbox" });
    selectAll.createSpan({ text: "\uBAA8\uB450 \uC120\uD0DD" });
    const itemCheckboxes = [];
    allCheckbox.addEventListener("change", () => {
      for (const cb of itemCheckboxes) {
        cb.checked = allCheckbox.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });
    for (const cand of this.candidates) {
      const item = listEl.createDiv({ cls: "a4p-image-plan-item" });
      const cb = item.createEl("input", { type: "checkbox" });
      itemCheckboxes.push(cb);
      item.createSpan({ text: `${cand.path} (${formatBytes(cand.size)})` });
      item.createSpan({ cls: "dedup", text: cand.reason });
      cb.addEventListener("change", () => {
        if (cb.checked)
          this.selected.add(cand.path);
        else
          this.selected.delete(cand.path);
      });
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const moveBtn = buttons.createEl("button", { text: "\uC120\uD0DD \uD56D\uBAA9 \uD734\uC9C0\uD1B5 \uC774\uB3D9\u2026", cls: "mod-warning" });
    moveBtn.addEventListener("click", () => {
      if (this.selected.size === 0) {
        new import_obsidian7.Notice("\uC120\uD0DD\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      this.close();
      new TrashConfirmModal(this.app, this.plugin, [...this.selected]).open();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TrashConfirmModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, paths) {
    super(app);
    this.plugin = plugin;
    this.paths = paths;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\uCD5C\uC885 \uD655\uC778" });
    contentEl.createEl("p", { text: `\uB2E4\uC74C ${this.paths.length}\uAC1C \uD30C\uC77C\uC744 \uBCFC\uD2B8 .trash/ \uD3F4\uB354\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4:` });
    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const p of this.paths) {
      listEl.createDiv({ cls: "a4p-image-plan-item", text: p });
    }
    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "\uCDE8\uC18C" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttons.createEl("button", { text: `${this.paths.length}\uAC1C \uC774\uB3D9 \uC2E4\uD589`, cls: "mod-warning" });
    confirmBtn.addEventListener("click", () => {
      this.close();
      void this.execute();
    });
  }
  async execute() {
    let moved = 0;
    const failures = [];
    for (const path of this.paths) {
      const file = this.plugin.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof import_obsidian7.TFile)) {
        failures.push(`${path}: \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
        continue;
      }
      try {
        await this.plugin.app.vault.trash(file, false);
        moved++;
      } catch (e) {
        failures.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    let msg = `${moved}\uAC1C \uD30C\uC77C\uC744 .trash/\uB85C \uC774\uB3D9\uD588\uC2B5\uB2C8\uB2E4.`;
    if (failures.length > 0) {
      msg += ` \uC2E4\uD328 ${failures.length}\uAC74 (\uCF58\uC194 \uCC38\uACE0).`;
      console.error("[a4p-image] \uD734\uC9C0\uD1B5 \uC774\uB3D9 \uC2E4\uD328:\n" + failures.join("\n"));
    }
    new import_obsidian7.Notice(msg, 8e3);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/commands.ts
async function runRetryCommand(plugin) {
  if (!plugin.r2.isConfigured()) {
    new import_obsidian8.Notice("R2 \uC124\uC815\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C R2 \uC815\uBCF4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.");
    return;
  }
  const result = await plugin.uploader.retryPending();
  if (result.retried === 0) {
    new import_obsidian8.Notice("\uC7AC\uC2DC\uB3C4\uD560 \uC2E4\uD328\xB7\uB300\uAE30 \uC5C5\uB85C\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  let msg = `\uC7AC\uC2DC\uB3C4 \uC644\uB8CC \u2014 \uC131\uACF5 ${result.succeeded}/${result.retried}`;
  if (result.failed.length > 0) {
    msg += `, \uC2E4\uD328 ${result.failed.length}\uAC74 (\uCF58\uC194 \uCC38\uACE0)`;
    console.error("[a4p-image] \uC7AC\uC2DC\uB3C4 \uC2E4\uD328:\n" + result.failed.join("\n"));
  }
  new import_obsidian8.Notice(msg, 8e3);
}
async function collectUnusedInput(plugin) {
  const { app } = plugin;
  const entries = plugin.manifestStore.all();
  const images = app.vault.getFiles().filter((f) => isImageExt(f.extension, plugin.settings.imageExtensions)).map((f) => ({ path: f.path, size: f.stat.size }));
  const resolvedTargets = /* @__PURE__ */ new Set();
  for (const links of Object.values(app.metadataCache.resolvedLinks)) {
    for (const target of Object.keys(links))
      resolvedTargets.add(target);
  }
  const urlsInVault = /* @__PURE__ */ new Set();
  const urls = entries.map((e) => e.url).filter(Boolean);
  if (urls.length > 0) {
    const base = plugin.settings.r2.publicBaseUrl.replace(/\/+$/g, "");
    const mdFiles = app.vault.getMarkdownFiles();
    for (const md of mdFiles) {
      const content = await app.vault.cachedRead(md);
      if (base && !content.includes(base))
        continue;
      for (const url of urls) {
        if (!urlsInVault.has(url) && content.includes(url))
          urlsInVault.add(url);
      }
    }
  }
  return { images, resolvedTargets, entries, urlsInVault };
}
async function runUnusedReportCommand(plugin) {
  const notice = new import_obsidian8.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\uB97C \uBD84\uC11D\uD558\uB294 \uC911\u2026", 0);
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    const markdown = buildReportMarkdown(report, /* @__PURE__ */ new Date());
    const folder = plugin.settings.reportFolder.trim();
    if (folder && !plugin.app.vault.getAbstractFileByPath((0, import_obsidian8.normalizePath)(folder))) {
      await plugin.app.vault.createFolder((0, import_obsidian8.normalizePath)(folder));
    }
    const stamp = /* @__PURE__ */ new Date();
    const name = `\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uB9AC\uD3EC\uD2B8 ${stamp.toISOString().slice(0, 10)} ${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const path = (0, import_obsidian8.normalizePath)(folder ? `${folder}/${name}.md` : `${name}.md`);
    const file = await plugin.app.vault.create(path, markdown);
    notice.hide();
    const total = report.fullyUnused.length + report.orphanedBackups.length + report.cloudOrphans.length;
    new import_obsidian8.Notice(`\uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC644\uB8CC \u2014 \uBBF8\uC0AC\uC6A9 \uD6C4\uBCF4 ${total}\uAC1C (${path})`, 8e3);
    await plugin.app.workspace.getLeaf(false).openFile(file);
  } catch (e) {
    notice.hide();
    new import_obsidian8.Notice(`\uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`, 8e3);
  }
}
async function runTrashUnusedCommand(plugin) {
  const notice = new import_obsidian8.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\uB97C \uBD84\uC11D\uD558\uB294 \uC911\u2026", 0);
  let candidates;
  try {
    const input = await collectUnusedInput(plugin);
    const report = classifyUnused(input);
    candidates = [
      ...report.fullyUnused.map((img) => ({
        path: img.path,
        size: img.size,
        reason: "\uC644\uC804 \uBBF8\uC0AC\uC6A9"
      })),
      ...report.orphanedBackups.filter((e) => e.localPath).map((e) => ({
        path: e.localPath,
        size: e.size,
        reason: "URL\uC774 \uB178\uD2B8\uC5D0\uC11C \uC0AC\uB77C\uC9C4 \uBC31\uC5C5 (\uD074\uB77C\uC6B0\uB4DC\uC5D0\uB294 \uC720\uC9C0\uB428)"
      }))
    ];
  } finally {
    notice.hide();
  }
  if (candidates.length === 0) {
    new import_obsidian8.Notice("\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  new TrashSelectModal(plugin.app, plugin, candidates).open();
}

// src/migrate-modal.ts
var import_obsidian9 = require("obsidian");

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
var MigrateUrlModal = class extends import_obsidian9.Modal {
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
    new import_obsidian9.Setting(contentEl).setName("\uC61B \uC8FC\uC18C (base URL)").addText(
      (text) => text.setPlaceholder("https://pub-xxxx.r2.dev").setValue(this.oldBase).onChange((v) => {
        this.oldBase = v;
        this.invalidateScan();
      })
    );
    new import_obsidian9.Setting(contentEl).setName("\uC0C8 \uC8FC\uC18C (base URL)").addText(
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
      new import_obsidian9.Notice(error);
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
    new import_obsidian9.Notice(
      `\uC8FC\uC18C \uBCC0\uACBD \uC644\uB8CC \u2014 \uB178\uD2B8 ${this.scanResult.files.length}\uAC1C\uC5D0\uC11C \uB9C1\uD06C ${replaced}\uAC74, \uB9E4\uB2C8\uD398\uC2A4\uD2B8 ${manifestFixed}\uAC74 \uAC31\uC2E0.`,
      8e3
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/eagle/client.ts
var import_obsidian10 = require("obsidian");
var EagleClient = class {
  constructor(getBaseUrl) {
    this.getBaseUrl = getBaseUrl;
  }
  base() {
    return this.getBaseUrl().replace(/\/+$/g, "");
  }
  async get(endpoint) {
    try {
      const res = await (0, import_obsidian10.requestUrl)({ url: `${this.base()}${endpoint}`, method: "GET", throw: false });
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
      const res = await (0, import_obsidian10.requestUrl)({
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
var import_obsidian11 = require("obsidian");
var EagleSearchModal = class _EagleSearchModal extends import_obsidian11.FuzzySuggestModal {
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
      new import_obsidian11.Notice("Eagle \uC571\uC774 \uC2E4\uD589 \uC911\uC774 \uC544\uB2D9\uB2C8\uB2E4. Eagle\uC744 \uBA3C\uC800 \uC2E4\uD589\uD558\uC138\uC694.");
      return;
    }
    const [items, libraryPath] = await Promise.all([client.searchImages(), client.libraryPath()]);
    if (!libraryPath) {
      new import_obsidian11.Notice("Eagle \uB77C\uC774\uBE0C\uB7EC\uB9AC \uACBD\uB85C\uB97C \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      return;
    }
    if (items.length === 0) {
      new import_obsidian11.Notice("Eagle \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
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
      new import_obsidian11.Notice(`Eagle \uC6D0\uBCF8 \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: ${filePath}`);
      return;
    }
    const notice = new import_obsidian11.Notice(`Eagle \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC \uC911: ${item.name}\u2026`, 0);
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
        new import_obsidian11.Notice(`\uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 \uB85C\uCEEC\uB85C \uC784\uBCA0\uB4DC\uD588\uC2B5\uB2C8\uB2E4. (${outcome.error})`, 8e3);
      } else {
        new import_obsidian11.Notice(`\uC5C5\uB85C\uB4DC \uC2E4\uD328: ${outcome.error}`, 8e3);
      }
    } catch (e) {
      notice.hide();
      new import_obsidian11.Notice(`Eagle \uC774\uBBF8\uC9C0 \uCC98\uB9AC \uC2E4\uD328: ${e instanceof Error ? e.message : String(e)}`, 8e3);
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
var A4pImagePlugin = class extends import_obsidian12.Plugin {
  async onload() {
    await this.loadState();
    this.r2 = new R2Client(() => this.settings.r2);
    this.manifestStore = new ManifestStore(this.createManifestIO());
    await this.manifestStore.load();
    this.uploader = new Uploader(this);
    this.eagle = new EagleClient(() => this.settings.eagle.apiUrl);
    if (import_obsidian12.Platform.isDesktopApp) {
      this.uploader.onUploaded = async (entry) => {
        var _a;
        const { enabled, registerOnUpload, folderId } = this.settings.eagle;
        if (!enabled || !registerOnUpload || !entry.localPath)
          return;
        if (!await this.eagle.isAvailable())
          return;
        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof import_obsidian12.FileSystemAdapter))
          return;
        const absPath = adapter.getFullPath(entry.localPath);
        const name = (_a = entry.localPath.split("/").pop()) != null ? _a : entry.localPath;
        await this.eagle.addFromPath(absPath, name, folderId || void 0);
      };
    }
    this.addSettingTab(new A4pImageSettingTab(this.app, this));
    registerPasteHandlers(this);
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian12.TFile)
          this.manifestStore.handleRename(oldPath, file.path);
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian12.TFile)
          this.manifestStore.handleDelete(file.path);
      })
    );
    this.registerView(VIEW_TYPE_A4P_IMAGE_GALLERY, (leaf) => new GalleryView(leaf, this));
    this.addRibbonIcon("image", "A4P \uC774\uBBF8\uC9C0 \uAC24\uB7EC\uB9AC", () => {
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
          new import_obsidian12.Notice("\uD65C\uC131 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
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
      name: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uB9AC\uD3EC\uD2B8 \uC0DD\uC131",
      callback: () => void runUnusedReportCommand(this)
    });
    this.addCommand({
      id: "trash-unused",
      name: "\uBBF8\uC0AC\uC6A9 \uC774\uBBF8\uC9C0 \uD734\uC9C0\uD1B5 \uC774\uB3D9 (\uC120\uD0DD\xB7\uC2B9\uC778 \uD544\uC694)",
      callback: () => void runTrashUnusedCommand(this)
    });
    if (import_obsidian12.Platform.isDesktopApp) {
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
    const indexPath = (0, import_obsidian12.normalizePath)(`${this.manifest.dir}/index.json`);
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

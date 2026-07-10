import { App, Modal, Notice, TFile } from "obsidian";
import type A4pImagePlugin from "./main";
import { EmbedRef, applyReplacements, buildConvertPlan, formatBytes, markdownImageText } from "./convert";
import { isImageExt } from "./filename";

/** metadataCache 기반으로 노트들의 로컬 이미지 임베드를 수집 */
export function scanImageEmbeds(plugin: A4pImagePlugin, notes: TFile[]): { refs: EmbedRef[]; sizes: Map<string, number> } {
  const { app } = plugin;
  const refs: EmbedRef[] = [];
  const sizes = new Map<string, number>();
  for (const md of notes) {
    const cache = app.metadataCache.getFileCache(md);
    for (const embed of cache?.embeds ?? []) {
      const dest = app.metadataCache.getFirstLinkpathDest(embed.link, md.path);
      if (!(dest instanceof TFile)) continue;
      if (!isImageExt(dest.extension, plugin.settings.imageExtensions)) continue;
      // `![[img|300]]`의 크기·캡션 보존 — displayText가 링크 자체와 같으면 없는 것으로 간주
      const alt =
        embed.displayText && embed.displayText !== embed.link && embed.displayText !== dest.name
          ? embed.displayText
          : undefined;
      refs.push({ notePath: md.path, original: embed.original, imagePath: dest.path, alt });
      sizes.set(dest.path, dest.stat.size);
    }
  }
  return { refs, sizes };
}

export async function openConvertModal(plugin: A4pImagePlugin, notes: TFile[], scopeLabel: string): Promise<void> {
  if (!plugin.r2.isConfigured()) {
    new Notice("R2 설정이 완료되지 않았습니다. 설정에서 R2 정보를 먼저 입력하세요.");
    return;
  }
  const { refs, sizes } = scanImageEmbeds(plugin, notes);
  if (refs.length === 0) {
    new Notice(`${scopeLabel}에 변환할 로컬 이미지가 없습니다.`);
    return;
  }
  new ConvertPlanModal(plugin.app, plugin, refs, sizes, scopeLabel).open();
}

/** dry-run 미리보기 — 승인 전에는 어떤 파일도 변경하지 않는다 */
class ConvertPlanModal extends Modal {
  constructor(
    app: App,
    private plugin: A4pImagePlugin,
    private refs: EmbedRef[],
    private sizes: Map<string, number>,
    private scopeLabel: string,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    const plan = buildConvertPlan(this.refs);

    const totalSize = plan.imagePaths.reduce((sum, p) => sum + (this.sizes.get(p) ?? 0), 0);
    const alreadyUploaded = plan.imagePaths.filter((p) => {
      const entry = this.plugin.manifestStore.byLocalPath(p);
      return entry?.status === "uploaded";
    });

    contentEl.createEl("h3", { text: `로컬 이미지 → 클라우드 변환 (${this.scopeLabel})` });
    contentEl.createEl("p", {
      text:
        `노트 ${plan.byNote.size}개에서 임베드 ${plan.totalEmbeds}개, 이미지 ${plan.imagePaths.length}개 (${formatBytes(totalSize)})가 대상입니다.` +
        (alreadyUploaded.length > 0 ? ` 그중 ${alreadyUploaded.length}개는 이미 업로드되어 URL을 재사용합니다.` : ""),
    });
    contentEl.createEl("p", {
      text: "원본 로컬 파일은 삭제되지 않고 그대로 백업으로 남습니다. 아래 목록을 확인한 뒤 승인하세요.",
      cls: "a4p-image-settings-status-line",
    });

    const listEl = contentEl.createDiv({ cls: "a4p-image-plan-list" });
    for (const [notePath, noteRefs] of plan.byNote) {
      listEl.createDiv({ cls: "a4p-image-plan-note", text: notePath });
      for (const ref of noteRefs) {
        const item = listEl.createDiv({ cls: "a4p-image-plan-item" });
        item.createSpan({ text: ref.imagePath });
        const entry = this.plugin.manifestStore.byLocalPath(ref.imagePath);
        if (entry?.status === "uploaded") item.createSpan({ cls: "dedup", text: "이미 업로드됨 — URL 재사용" });
      }
    }

    const buttons = contentEl.createDiv({ cls: "a4p-image-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "취소" });
    cancelBtn.addEventListener("click", () => this.close());
    const runBtn = buttons.createEl("button", { text: `변환 실행 (이미지 ${plan.imagePaths.length}개)`, cls: "mod-cta" });
    runBtn.addEventListener("click", () => {
      this.close();
      void executeConvert(this.plugin, this.refs);
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

async function executeConvert(plugin: A4pImagePlugin, refs: EmbedRef[]): Promise<void> {
  const { app } = plugin;
  const plan = buildConvertPlan(refs);
  const urlByImage = new Map<string, { url: string; filename: string }>();
  const failures: string[] = [];

  const notice = new Notice(`변환 중… 0/${plan.imagePaths.length}`, 0);
  try {
    let done = 0;
    await mapPool(plan.imagePaths, 3, async (imagePath) => {
      const file = app.vault.getAbstractFileByPath(imagePath);
      if (file instanceof TFile) {
        const outcome = await plugin.uploader.processExisting(file);
        if (outcome.ok) {
          urlByImage.set(imagePath, { url: outcome.url, filename: file.name });
        } else {
          failures.push(`${imagePath}: ${outcome.error}`);
        }
      } else {
        failures.push(`${imagePath}: 파일을 찾을 수 없습니다.`);
      }
      done++;
      notice.setMessage(`변환 중… ${done}/${plan.imagePaths.length}`);
    });

    // 업로드에 성공한 이미지의 임베드만 치환 (이미지 단위 원자성 — 롤백 불필요)
    let replaced = 0;
    for (const [notePath, noteRefs] of plan.byNote) {
      const md = app.vault.getAbstractFileByPath(notePath);
      if (!(md instanceof TFile)) continue;
      const replacements = noteRefs
        .filter((r) => urlByImage.has(r.imagePath))
        .map((r) => {
          const { url, filename } = urlByImage.get(r.imagePath)!;
          return { original: r.original, replacement: markdownImageText(filename, url, r.alt) };
        });
      if (replacements.length === 0) continue;
      await app.vault.process(md, (content) => {
        const result = applyReplacements(content, replacements);
        replaced += result.count;
        return result.content;
      });
    }

    notice.hide();
    const summary = `변환 완료 — 이미지 ${urlByImage.size}개 업로드, 임베드 ${replaced}개 치환` +
      (failures.length > 0 ? `, 실패 ${failures.length}건` : "");
    new Notice(summary, 8000);
    if (failures.length > 0) {
      console.error("[a4p-image] 일괄 변환 실패 목록:\n" + failures.join("\n"));
      new Notice("실패 목록은 개발자 콘솔에 기록했습니다. '실패한 업로드 재시도'로 다시 시도할 수 있습니다.", 8000);
    }
  } catch (e) {
    notice.hide();
    new Notice(`변환 중단: ${e instanceof Error ? e.message : String(e)}`, 8000);
  }
}

async function mapPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

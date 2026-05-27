import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

const sceneStyles = readProjectFile("miniprogram/pages/scene/scene.wxss");
const sceneMarkup = readProjectFile("miniprogram/pages/scene/scene.wxml");
const sceneScript = readProjectFile("miniprogram/pages/scene/scene.ts");
const indexStyles = readProjectFile("miniprogram/pages/index/index.wxss");
const favoritesStyles = readProjectFile("miniprogram/pages/favorites/favorites.wxss");
const mistakesStyles = readProjectFile("miniprogram/pages/mistakes/mistakes.wxss");
const reviewStyles = readProjectFile("miniprogram/pages/review/review.wxss");
const meStyles = readProjectFile("miniprogram/pages/me/me.wxss");

const getRule = (styles: string, selector: string) =>
  styles.match(new RegExp(`${selector.replaceAll(".", "\\.")} \\{[^}]+\\}`))?.[0] ?? "";

describe("mobile visual adaptation", () => {
  it("keeps tab pages clear of the safe area and compact side gutters", () => {
    for (const [styles, selector] of [
      [sceneStyles, ".scene-page"],
      [favoritesStyles, ".favorites-page"],
      [mistakesStyles, ".mistakes-page"],
      [reviewStyles, ".review-page"],
      [meStyles, ".me-page"]
    ] as const) {
      const pageRule = getRule(styles, selector);

      expect(pageRule).toContain("box-sizing: border-box;");
      expect(pageRule).toMatch(/padding: [^;]*32rpx/);
      expect(pageRule).toContain("padding-bottom: calc(112rpx + env(safe-area-inset-bottom));");
    }
  });

  it("lets small-screen card rows wrap instead of squeezing labels and actions", () => {
    expect(getRule(indexStyles, ".scene-meta-row")).toContain("flex-wrap: wrap;");
    expect(getRule(indexStyles, ".scene-action")).toContain("min-height: 64rpx;");
    expect(getRule(favoritesStyles, ".favorite-summary")).toContain("align-items: flex-start;");
    expect(getRule(favoritesStyles, ".favorite-scene")).toContain("max-width: 100%;");
    expect(getRule(mistakesStyles, ".mistake-summary")).toContain("flex-wrap: wrap;");
    expect(getRule(reviewStyles, ".review-entry")).toContain("flex-wrap: wrap;");
  });

  it("stacks practice actions and recognition feedback when horizontal space is tight", () => {
    expect(getRule(sceneStyles, ".listening-writing-complete-actions")).toContain(
      "flex-direction: column;"
    );
    expect(getRule(sceneStyles, ".listening-speaking-complete-actions")).toContain(
      "flex-direction: column;"
    );
    expect(getRule(sceneStyles, ".listening-speaking-recognition-card")).toContain(
      "align-items: flex-start;"
    );
    expect(getRule(sceneStyles, ".listening-speaking-recognition-card")).toContain(
      "flex-wrap: wrap;"
    );
    expect(getRule(sceneStyles, ".listening-speaking-record-actions")).toContain(
      "flex-wrap: wrap;"
    );
  });

  it("prevents long English copy from overflowing learning cards", () => {
    for (const [styles, selector] of [
      [sceneStyles, ".mode-title"],
      [sceneStyles, ".memory-word-card__line"],
      [favoritesStyles, ".favorite-expression-line"],
      [mistakesStyles, ".mistake-count"],
      [meStyles, ".status-value"]
    ] as const) {
      expect(getRule(styles, selector)).toContain("overflow-wrap: anywhere;");
    }
  });

  it("keeps three stats side by side on narrow phones", () => {
    expect(getRule(sceneStyles, ".listening-speaking-complete-stats")).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr));"
    );
    expect(getRule(meStyles, ".stats-grid")).toContain(
      "grid-template-columns: repeat(3, minmax(0, 1fr));"
    );
    expect(getRule(meStyles, ".stat-card")).toContain("padding: 20rpx 8rpx;");
    expect(getRule(meStyles, ".stat-value")).toContain("font-size: 36rpx;");
    expect(getRule(meStyles, ".stat-label")).toContain("font-size: 20rpx;");
  });

  it("uses a custom responsive hint for blank scene taps instead of native toast wrapping", () => {
    const toastRule = getRule(sceneStyles, ".scene-feedback-toast");

    expect(sceneMarkup).toContain('class="scene-feedback-toast"');
    expect(sceneMarkup).toContain("{{sceneFeedbackToast}}");
    expect(sceneScript).toContain("showSceneFeedbackToast(feedbackCopy.tapObject)");
    expect(sceneScript).not.toContain("title: feedbackCopy.tapObject");
    expect(toastRule).toContain("position: fixed;");
    expect(toastRule).toContain("font-size: 24rpx;");
    expect(toastRule).toContain("white-space: nowrap;");
    expect(toastRule).toContain("bottom: calc(132rpx + env(safe-area-inset-bottom));");
  });
});

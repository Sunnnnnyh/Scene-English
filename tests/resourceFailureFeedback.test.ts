import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scenePageScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/scene/scene.ts"),
  "utf8"
);
const sceneViewModelScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/scene/sceneViewModel.ts"),
  "utf8"
);
const sceneMarkup = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.wxml"), "utf8");
const sceneStyles = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.wxss"), "utf8");

describe("resource failure feedback", () => {
  it("keeps scene image failures in page state so the page can render a retry entry", () => {
    expect(sceneViewModelScript).toContain("SceneImageLoadStatus");
    expect(sceneViewModelScript).toContain("sceneImageLoadStatus");
    expect(sceneViewModelScript).toContain('sceneImageLoadStatus: "idle"');
    expect(scenePageScript).toContain("onSceneImageError");
    expect(scenePageScript).toContain('sceneImageLoadStatus: "failed"');
    expect(scenePageScript).toContain("onRetrySceneImage");
  });

  it("binds every scene image to load/error handling and renders a retry fallback", () => {
    const sceneImageCount = (sceneMarkup.match(/class="scene-image"/g) ?? []).length;
    const sceneImageErrorBindingCount = (sceneMarkup.match(/binderror="onSceneImageError"/g) ?? [])
      .length;
    const sceneImageLoadBindingCount = (sceneMarkup.match(/bindload="onSceneImageLoad"/g) ?? [])
      .length;

    expect(sceneImageCount).toBeGreaterThan(0);
    expect(sceneImageErrorBindingCount).toBe(sceneImageCount);
    expect(sceneImageLoadBindingCount).toBe(sceneImageCount);
    expect(sceneMarkup).toContain("scene-image-fallback");
    expect(sceneMarkup).toContain("Image unavailable.");
    expect(sceneMarkup).toContain('catchtap="onRetrySceneImage"');
    expect(sceneMarkup).toContain("Try again");
    expect(sceneStyles).toContain(".scene-image-fallback");
    expect(sceneStyles).toContain(".scene-image-fallback__retry");
  });

  it("uses one lightweight audio playback failure prompt for all word audio paths", () => {
    expect(scenePageScript).toContain("showAudioPlaybackErrorToast");
    expect(scenePageScript).toContain("AUDIO_PLAYBACK_ERROR_MESSAGE");
    expect(scenePageScript).toContain("wx.showToast");
    expect(scenePageScript).toContain('icon: "none"');

    const helperUseCount = (scenePageScript.match(/showAudioPlaybackErrorToast/g) ?? []).length;
    expect(helperUseCount).toBeGreaterThanOrEqual(4);
  });
});

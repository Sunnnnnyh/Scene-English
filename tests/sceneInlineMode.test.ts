import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sceneScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.ts", import.meta.url)),
  "utf8"
);
const sceneMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxml", import.meta.url)),
  "utf8"
);

describe("scene page in-tab learning mode navigation", () => {
  it("selects learning modes inside the Learn tab instead of navigating away", () => {
    const entryTapHandler = sceneScript.match(
      /onEntryTap\(event: SceneEntryTapEvent\) \{[\s\S]*?\n {2}\},/
    );

    expect(entryTapHandler?.[0]).toBeDefined();
    expect(entryTapHandler?.[0]).not.toContain("wx.navigateTo");
    expect(sceneScript).toContain("onBackToSceneHome");
    expect(sceneMarkup).toContain('wx:if="{{!activeMode}}"');
    expect(sceneMarkup).toContain('wx:if="{{activeMode}}"');
    expect(sceneMarkup).toContain("selectedModeTitle");
  });
});

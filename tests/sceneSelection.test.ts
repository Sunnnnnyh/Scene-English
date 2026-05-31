import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const indexPageSource = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/index/index.ts", import.meta.url)),
  "utf8"
);
const scenePageSource = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.ts", import.meta.url)),
  "utf8"
);
const sceneMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxml", import.meta.url)),
  "utf8"
);

describe("scene selection flow", () => {
  it("saves the selected Home scene before switching to the Learn tab", () => {
    expect(indexPageSource).toContain("import { saveSelectedSceneId }");
    expect(indexPageSource).toContain("saveSelectedSceneId(action.sceneId)");
    expect(indexPageSource).toContain("wx.switchTab");
  });

  it("loads the selected scene when the Learn tab is shown", () => {
    expect(scenePageSource).toContain("import { getSelectedSceneId }");
    expect(scenePageSource).toContain('options.sceneId ?? getSelectedSceneId() ?? "classroom"');
    expect(scenePageSource).toContain("selectedSceneId !== this.data.sceneId");
    expect(scenePageSource).toContain("this.loadScene(selectedSceneId)");
  });

  it("renders the current scene name instead of hardcoding Classroom copy", () => {
    expect(sceneMarkup).toContain("{{sceneNameEn}} Scene");
    expect(sceneMarkup).not.toContain("Classroom Scene");
  });
});

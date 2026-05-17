import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sceneStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxss", import.meta.url)),
  "utf8"
);

describe("scene page layout", () => {
  it("fits learning mode entries into a single non-scrolling tab view", () => {
    const pageRule = sceneStyles.match(/\.scene-page \{[^}]+\}/)?.[0] ?? "";

    expect(pageRule).toContain("height: 100vh;");
    expect(pageRule).toContain("overflow-y: auto;");
    expect(pageRule).not.toContain("overflow: hidden;");
    expect(sceneStyles).toContain("padding-bottom: calc(112rpx + env(safe-area-inset-bottom));");
    expect(sceneStyles).toContain("height: 380rpx;");
    expect(sceneStyles).toContain("min-height: 142rpx;");
  });
});

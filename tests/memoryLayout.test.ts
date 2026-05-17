import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const memoryMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/memory/memory.wxml", import.meta.url)),
  "utf8"
);
const memoryStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/memory/memory.wxss", import.meta.url)),
  "utf8"
);

describe("memory page scene image layout", () => {
  it("renders the classroom image in a stable responsive frame", () => {
    expect(memoryMarkup).toContain('class="memory-scene-frame"');
    expect(memoryMarkup).toContain('class="memory-scene-image"');
    expect(memoryMarkup).toContain('src="{{sceneImage}}"');
    expect(memoryMarkup).toContain('mode="aspectFit"');

    const pageRule = memoryStyles.match(/\.memory-page \{[^}]+\}/)?.[0] ?? "";
    const frameRule = memoryStyles.match(/\.memory-scene-frame \{[^}]+\}/)?.[0] ?? "";
    const imageRule = memoryStyles.match(/\.memory-scene-image \{[^}]+\}/)?.[0] ?? "";

    expect(pageRule).toContain("min-height: 100vh;");
    expect(pageRule).toContain("box-sizing: border-box;");
    expect(frameRule).toContain("width: 100%;");
    expect(frameRule).toContain("aspect-ratio: 16 / 9;");
    expect(frameRule).toContain("overflow: hidden;");
    expect(imageRule).toContain("width: 100%;");
    expect(imageRule).toContain("height: 100%;");
  });

  it("keeps only the bottom return action on the memory page", () => {
    expect(memoryMarkup).not.toContain("memory-back-button");
    expect(memoryMarkup).not.toContain("memory-header");
    expect(memoryMarkup).toContain('class="back-button"');
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

const userFacingFiles = [
  "miniprogram/pages/index/index.ts",
  "miniprogram/pages/index/index.wxml",
  "miniprogram/pages/index/indexViewModel.ts",
  "miniprogram/pages/memory/memory.ts",
  "miniprogram/pages/memory/memory.wxml",
  "miniprogram/pages/memory/memoryViewModel.ts",
  "miniprogram/pages/favorites/favorites.ts",
  "miniprogram/pages/favorites/favorites.wxml",
  "miniprogram/pages/favorites/favoritesViewModel.ts",
  "miniprogram/pages/mistakes/mistakes.ts",
  "miniprogram/pages/mistakes/mistakes.wxml",
  "miniprogram/pages/mistakes/mistakesViewModel.ts",
  "miniprogram/pages/review/review.ts",
  "miniprogram/pages/review/review.wxml",
  "miniprogram/pages/review/reviewViewModel.ts",
  "miniprogram/pages/scene/scene.wxml",
  "miniprogram/pages/listening-writing/listening-writing.ts",
  "miniprogram/pages/listening-writing/listening-writing.wxml",
  "miniprogram/pages/listening-speaking/listening-speaking.ts",
  "miniprogram/pages/listening-speaking/listening-speaking.wxml",
  "miniprogram/pages/shared/learningPageViewModel.ts"
];

describe("user-facing copy cleanup", () => {
  it("does not render developer-facing explanatory copy", () => {
    const combinedSources = userFacingFiles.map(readProjectFile).join("\n");

    expect(combinedSources).not.toContain("全局复习入口");
    expect(combinedSources).not.toContain("占位页面");
    expect(combinedSources).not.toContain("后续步骤");
    expect(combinedSources).not.toContain("基础模式视图");
    expect(combinedSources).not.toContain("subtitle");
    expect(combinedSources).not.toContain("description");
    expect(combinedSources).not.toContain("placeholder-copy");
    expect(combinedSources).not.toContain("review-subtitle");
  });
});

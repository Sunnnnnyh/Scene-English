import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { classroomWords, scenes } from "../miniprogram/data/scenes";

const workspaceRoot = process.cwd();

const resolveMiniProgramAsset = (assetPath: string) =>
  join(workspaceRoot, "miniprogram", assetPath.replace(/^\//, ""));

describe("static assets", () => {
  it("contains the classroom cover and scene placeholder images", () => {
    const classroom = scenes.find((scene) => scene.id === "classroom");

    expect(classroom).toBeDefined();

    for (const imagePath of [classroom?.coverImage, classroom?.sceneImage]) {
      expect(imagePath).toBeDefined();

      const fullPath = resolveMiniProgramAsset(imagePath ?? "");
      expect(existsSync(fullPath)).toBe(true);

      const bytes = readFileSync(fullPath);
      expect(bytes.length).toBeGreaterThan(0);
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    }
  });

  it("contains a placeholder audio file for every classroom word", () => {
    for (const word of classroomWords) {
      const fullPath = resolveMiniProgramAsset(word.audioUrl);

      expect(existsSync(fullPath)).toBe(true);
      expect(readFileSync(fullPath).length).toBeGreaterThan(0);
    }
  });
});

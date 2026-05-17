import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createSceneViewModel } from "../miniprogram/pages/scene/sceneViewModel";
import { getSceneById } from "../miniprogram/services/sceneService";
import { getWordsBySceneId } from "../miniprogram/services/wordService";
import type { UserProgress } from "../miniprogram/types";

const sceneMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxml", import.meta.url)),
  "utf8"
);

const classroom = getSceneById("classroom");

const emptyProgress: UserProgress = {
  sceneId: "classroom",
  learnedWordIds: [],
  completedMemoryCount: 0,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: "2026-05-17T00:00:00.000Z"
};

describe("scene page memory hotspots", () => {
  it("builds transparent hotspot data from Classroom words", () => {
    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(
      classroom,
      emptyProgress,
      getWordsBySceneId("classroom")
    );

    expect(viewModel.memoryHotspots).toHaveLength(20);
    expect(
      viewModel.memoryHotspots.find((hotspot) => hotspot.wordId === "projector")
    ).toMatchObject({
      wordId: "projector",
      label: "projector"
    });
    expect(
      viewModel.memoryHotspots.find((hotspot) => hotspot.wordId === "projector")?.style
    ).toContain("left: 45.3125%;");
  });

  it("renders hotspot overlays only inside the Memory mode scene image", () => {
    expect(sceneMarkup).toContain("wx:if=\"{{activeMode === 'memory'}}\"");
    expect(sceneMarkup).toContain('wx:for="{{memoryHotspots}}"');
    expect(sceneMarkup).toContain('data-word-id="{{item.wordId}}"');
    expect(sceneMarkup).toContain('catchtap="onMemoryHotspotTap"');
    expect(sceneMarkup).toContain('bindtap="onMemoryBlankTap"');
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createSceneViewModel } from "../miniprogram/pages/scene/sceneViewModel";
import { getSceneById } from "../miniprogram/services/sceneService";
import { getWordsBySceneId } from "../miniprogram/services/wordService";
import type { UserProgress } from "../miniprogram/types";

const sceneScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.ts", import.meta.url)),
  "utf8"
);
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

describe("scene page Memory guide", () => {
  it("builds Memory guide defaults for the projector hotspot", () => {
    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(
      classroom,
      emptyProgress,
      getWordsBySceneId("classroom")
    );

    expect(viewModel.showMemoryGuide).toBe(false);
    expect(viewModel.memoryGuideWordId).toBe("projector");
  });

  it("renders a dismissible first-time guide over the Memory scene", () => {
    expect(sceneMarkup).toContain('wx:if="{{showMemoryGuide}}"');
    expect(sceneMarkup).toContain("memory-guide");
    expect(sceneMarkup).toContain("点一点教室里的物品，看看它用英语怎么说");
    expect(sceneMarkup).toContain('bindtap="onDismissMemoryGuide"');
    expect(sceneMarkup).toContain("item.wordId === memoryGuideWordId");
  });

  it("loads and completes the guide through the onboarding service", () => {
    expect(sceneScript).toContain("shouldShowMemoryGuide");
    expect(sceneScript).toContain("completeMemoryGuide");
    expect(sceneScript).toContain("onDismissMemoryGuide");
  });
});

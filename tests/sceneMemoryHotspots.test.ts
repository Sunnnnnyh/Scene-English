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
const sceneStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxss", import.meta.url)),
  "utf8"
);

const classroom = getSceneById("classroom");
const lectureHall = getSceneById("lecture-hall");

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
    ).toContain("left: 54.72488038277512%;");
  });

  it("builds repeated hotspots for Lecture Hall repeated objects", () => {
    if (!lectureHall) {
      throw new Error("Lecture Hall scene fixture is missing");
    }

    const viewModel = createSceneViewModel(
      lectureHall,
      {
        ...emptyProgress,
        sceneId: "lecture-hall"
      },
      getWordsBySceneId("lecture-hall")
    );

    const seatHotspots = viewModel.memoryHotspots.filter(
      (hotspot) => hotspot.wordId === "auditorium-seat"
    );

    expect(viewModel.memoryHotspots.length).toBeGreaterThan(20);
    expect(seatHotspots.length).toBeGreaterThan(1);
    expect(new Set(seatHotspots.map((hotspot) => hotspot.hotspotId)).size).toBe(
      seatHotspots.length
    );
  });

  it("renders hotspot overlays only inside the Memory mode scene image", () => {
    expect(sceneMarkup).toContain("wx:if=\"{{activeMode === 'memory'}}\"");
    expect(sceneMarkup).toContain('wx:for="{{memoryHotspots}}"');
    expect(sceneMarkup).toContain('wx:key="hotspotId"');
    expect(sceneMarkup).toContain('data-word-id="{{item.wordId}}"');
    expect(sceneMarkup).toContain('catchtap="onMemoryHotspotTap"');
    expect(sceneMarkup).toContain('bindtap="onMemoryBlankTap"');
  });

  it("renders memory hint and scene word list controls", () => {
    expect(sceneMarkup).toContain("memory-assist");
    expect(sceneMarkup).toContain("memoryHintButtonLabel");
    expect(sceneMarkup).toContain("memory-hotspot--hinted");
    expect(sceneMarkup).toContain("onShowMemoryHint");
    expect(sceneMarkup).toContain("scene-word-list");
    expect(sceneMarkup).toContain("onToggleSceneWordList");
    expect(sceneMarkup).toContain('wx:for="{{sceneWordList}}"');
  });

  it("keeps ordinary hotspot taps visually transparent", () => {
    expect(sceneMarkup.match(/hover-class="none"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(sceneStyles).not.toContain(".memory-hotspot:active");
    expect(sceneStyles).not.toContain(".listening-writing-hotspot:active");
    expect(sceneStyles).not.toContain(".listening-speaking-hotspot:active");
  });
});

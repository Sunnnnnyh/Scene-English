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
const sceneScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.ts", import.meta.url)),
  "utf8"
);
const sceneViewModelScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/sceneViewModel.ts", import.meta.url)),
  "utf8"
);
const getRule = (styles: string, selector: string) =>
  styles.match(new RegExp(`${selector.replaceAll(".", "\\.")} \\{[^}]+\\}`))?.[0] ?? "";

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
    expect(
      "markerStyle" in
        (viewModel.memoryHotspots.find((hotspot) => hotspot.wordId === "projector") ?? {})
    ).toBe(false);
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

  it("builds Memory hotspot data for Lecture Hall words without hint button state", () => {
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
    const firstSeatHotspot = viewModel.memoryHotspots.find(
      (hotspot) => hotspot.wordId === "auditorium-seat"
    );

    expect(viewModel.memoryHotspots.length).toBeGreaterThan(20);
    expect(firstSeatHotspot?.style).toContain("left: 0%;");
    expect(firstSeatHotspot?.style).toContain("top:");
    expect("hintOutlineStyles" in (firstSeatHotspot ?? {})).toBe(false);
    expect("memoryHintButtonDisabled" in viewModel).toBe(false);
    expect("memoryHintButtonLabel" in viewModel).toBe(false);
    expect("memoryHintWordId" in viewModel).toBe(false);
  });

  it("renders hotspot overlays only inside the Memory mode scene image", () => {
    expect(sceneMarkup).toContain("wx:if=\"{{activeMode === 'memory'}}\"");
    expect(sceneMarkup).toContain('wx:for="{{memoryHotspots}}"');
    expect(sceneMarkup).toContain('wx:key="hotspotId"');
    expect(sceneMarkup).toContain('data-word-id="{{item.wordId}}"');
    expect(sceneMarkup).toContain('catchtap="onMemoryHotspotTap"');
    expect(sceneMarkup).toContain('bindtap="onMemoryBlankTap"');
  });

  it("renders scene word list controls without the Memory hint button feature", () => {
    expect(sceneMarkup).toContain("memory-assist");
    expect(sceneMarkup).not.toContain("memoryHintButtonLabel");
    expect(sceneMarkup).not.toContain("memoryHintButtonDisabled");
    expect(sceneMarkup).not.toContain("onShowMemoryHint");
    expect(sceneMarkup).not.toContain("提示一下");
    expect(sceneMarkup).not.toContain("已找完");
    expect(sceneMarkup).not.toContain("memory-hint-marker");
    expect(sceneMarkup).toContain("memory-hotspot--hinted");
    expect(sceneMarkup).not.toContain("memory-hint-outline");
    expect(sceneMarkup).not.toContain("item.hintOutlineStyles");
    expect(sceneMarkup).toContain("scene-word-list");
    expect(sceneMarkup).toContain("onToggleSceneWordList");
    expect(sceneMarkup).toContain('wx:for="{{sceneWordList}}"');
    expect(sceneScript).not.toContain("onShowMemoryHint");
    expect(sceneScript).not.toContain("memoryHintWordId");
    expect(sceneViewModelScript).not.toContain("memoryHintWordId");
    expect(sceneViewModelScript).not.toContain("memoryHintButtonLabel");
    expect(sceneViewModelScript).not.toContain("memoryHintButtonDisabled");
  });

  it("renders the Memory scene image as a view background to avoid native image repaint flicker", () => {
    const memoryModeBlock = sceneMarkup.slice(
      sceneMarkup.indexOf('<block wx:if="{{activeMode === \'memory\'}}"'),
      sceneMarkup.indexOf('<view wx:if="{{selectedMemoryWordCard}}"')
    );

    expect(memoryModeBlock).toContain(
      'style="background-image: url({{sceneImage}});"'
    );
    expect(memoryModeBlock).not.toContain("<image");
    expect(memoryModeBlock).not.toContain('class="memory-hint-marker"');
  });

  it("keeps ordinary hotspot taps visually transparent", () => {
    const memoryHotspotRule = getRule(sceneStyles, ".memory-hotspot");
    const listeningWritingHotspotRule = getRule(sceneStyles, ".listening-writing-hotspot");
    const listeningSpeakingHotspotRule = getRule(sceneStyles, ".listening-speaking-hotspot");
    const listeningWritingTargetRule = getRule(sceneStyles, ".listening-writing-hotspot--target");
    const listeningSpeakingTargetRule = getRule(sceneStyles, ".listening-speaking-hotspot--target");

    expect(sceneMarkup.match(/hover-class="none"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(memoryHotspotRule).toContain("opacity: 0;");
    expect(memoryHotspotRule).not.toContain("rgba(255, 148, 111, 0)");
    expect(listeningWritingHotspotRule).toContain("opacity: 0;");
    expect(listeningWritingHotspotRule).not.toContain("rgba(255, 148, 111, 0)");
    expect(listeningSpeakingHotspotRule).toContain("opacity: 0;");
    expect(listeningSpeakingHotspotRule).not.toContain("rgba(255, 148, 111, 0)");
    expect(listeningWritingTargetRule).toContain("opacity: 1;");
    expect(listeningSpeakingTargetRule).toContain("opacity: 1;");
    expect(sceneStyles).not.toContain(".memory-hotspot:active");
    expect(sceneStyles).not.toContain(".listening-writing-hotspot:active");
    expect(sceneStyles).not.toContain(".listening-speaking-hotspot:active");
  });

  it("does not use unsupported attribute selectors in the scene page wxss", () => {
    expect(sceneStyles).not.toContain("[disabled]");
  });

  it("keeps learned word rows visually consistent with the rest of the word list", () => {
    const learnedRule = getRule(sceneStyles, ".scene-word-list-item--learned");

    expect(learnedRule).toContain("background: #ffffff;");
    expect(learnedRule).not.toContain("background: #eef9ef;");
  });

  it("highlights the hinted word as the full clickable hotspot without white fill", () => {
    const hintedRule = getRule(sceneStyles, ".memory-hotspot--hinted");

    expect(hintedRule).toContain("border: 4rpx solid #ff7f5f;");
    expect(hintedRule).toContain("opacity: 1;");
    expect(hintedRule).toContain("background: rgba(255, 148, 111, 0.24);");
    expect(hintedRule).toContain("box-shadow:");
    expect(hintedRule).not.toContain("background: #ffffff;");
    expect(hintedRule).not.toContain("background: white;");
    expect(sceneStyles).not.toContain(".memory-hint-outline");
    expect(sceneStyles).not.toContain(".memory-hint-marker");
    expect(sceneStyles).not.toContain(".memory-hint");
  });
});

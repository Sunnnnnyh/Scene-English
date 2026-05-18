import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  createMemoryWordCard,
  createSceneViewModel
} from "../miniprogram/pages/scene/sceneViewModel";
import { getSceneById } from "../miniprogram/services/sceneService";
import { getWordById, getWordsBySceneId } from "../miniprogram/services/wordService";
import type { UserProgress } from "../miniprogram/types";

const sceneScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.ts", import.meta.url)),
  "utf8"
);
const sceneMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxml", import.meta.url)),
  "utf8"
);
const sceneStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/scene/scene.wxss", import.meta.url)),
  "utf8"
);

const classroom = getSceneById("classroom");
const projector = getWordById("projector");

const emptyProgress: UserProgress = {
  sceneId: "classroom",
  learnedWordIds: [],
  completedMemoryCount: 0,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: "2026-05-17T00:00:00.000Z"
};

describe("scene page Memory word card", () => {
  it("builds a word card with only a useful expression and folded translation", () => {
    if (!projector) {
      throw new Error("Projector word fixture is missing");
    }

    const card = createMemoryWordCard(projector);

    expect(card).toMatchObject({
      wordId: "projector",
      en: "projector",
      phonetic: projector.phonetic,
      cn: projector.cn,
      expressionEn: "The projector needs to be adjusted before everyone can see the slide clearly.",
      expressionCn: projector.expressionCn,
      showExpressionCn: false
    });
    expect(card).not.toHaveProperty("exampleEn");
    expect(card).not.toHaveProperty("exampleCn");
    expect(card).not.toHaveProperty("showExampleCn");
  });

  it("adds an empty selected word card state to the scene view model", () => {
    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(
      classroom,
      emptyProgress,
      getWordsBySceneId("classroom")
    );

    expect(viewModel.selectedMemoryWordCard).toBeNull();
  });

  it("renders a compact closeable card with one tappable useful expression", () => {
    expect(sceneMarkup).toContain('wx:if="{{selectedMemoryWordCard}}"');
    expect(sceneMarkup).toContain("memory-word-card");
    expect(sceneMarkup).toContain("{{selectedMemoryWordCard.en}}");
    expect(sceneMarkup).toContain("{{selectedMemoryWordCard.cn}}");
    expect(sceneMarkup).toContain("{{selectedMemoryWordCard.phonetic}}");
    expect(sceneMarkup).toContain("{{selectedMemoryWordCard.expressionEn}}");
    expect(sceneMarkup).toContain("selectedMemoryWordCard.showExpressionCn");
    expect(sceneMarkup).toContain('data-translation-type="expression"');
    expect(sceneMarkup).toContain('bindtap="onToggleMemoryTranslation"');
    expect(sceneMarkup).toContain('bindtap="onCloseMemoryWordCard"');
    expect(sceneMarkup).toContain('wx:if="{{showMemoryTranslationGuide}}"');
    expect(sceneMarkup).toContain("memory-translation-guide");
    expect(sceneMarkup).toContain("memory-word-card__close-icon");
    expect(sceneMarkup).not.toContain('<button class="memory-word-card__close"');
    expect(sceneMarkup).not.toContain("Example");
    expect(sceneMarkup).not.toContain("selectedMemoryWordCard.exampleEn");
    expect(sceneMarkup).not.toContain("selectedMemoryWordCard.showExampleCn");
    expect(sceneMarkup).not.toContain('data-translation-type="example"');
    expect(sceneMarkup).not.toContain("memory-word-card__toggle");
    expect(sceneMarkup).not.toContain("已打开");
    expect(sceneMarkup).not.toContain("selectedMemoryWordLabel");
  });

  it("connects hotspot taps to word lookup and card interactions", () => {
    expect(sceneScript).toContain("getWordById");
    expect(sceneScript).toContain("createMemoryWordCard");
    expect(sceneScript).toContain("shouldShowMemoryTranslationGuide");
    expect(sceneScript).toContain("completeMemoryTranslationGuide");
    expect(sceneScript).toContain("selectedMemoryWordCard");
    expect(sceneScript).toContain("showMemoryTranslationGuide");
    expect(sceneScript).toContain("onToggleMemoryTranslation");
    expect(sceneScript).toContain("onCloseMemoryWordCard");
  });

  it("styles the word card to expand in the page flow with a small circular close control", () => {
    const wordCardRule = sceneStyles.match(/\.memory-word-card\s*\{[^}]*\}/)?.[0] ?? "";
    const wordCardPanelRule = sceneStyles.match(/\.memory-word-card__panel\s*\{[^}]*\}/)?.[0] ?? "";

    expect(sceneStyles).toContain(".memory-word-card");
    expect(sceneStyles).toContain(".memory-word-card__panel");
    expect(sceneStyles).toContain(".memory-word-card__close");
    expect(wordCardRule).toContain("margin-top: 24rpx;");
    expect(sceneStyles).toContain("width: 40rpx;");
    expect(sceneStyles).toContain("height: 40rpx;");
    expect(sceneStyles).toContain("border-radius: 50%;");
    expect(sceneStyles).toContain(".memory-word-card__close-icon");
    expect(sceneStyles).toContain(".memory-translation-guide");
    expect(wordCardRule).not.toContain("position: fixed;");
    expect(wordCardRule).not.toContain("bottom:");
    expect(wordCardPanelRule).not.toContain("max-height: 58vh;");
  });
});

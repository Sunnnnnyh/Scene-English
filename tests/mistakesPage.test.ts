import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createMistakesViewModel } from "../miniprogram/pages/mistakes/mistakesViewModel";
import { getWordById } from "../miniprogram/services/wordService";
import type { Mistake } from "../miniprogram/types";

const mistakesScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/mistakes/mistakes.ts", import.meta.url)),
  "utf8"
);
const mistakesMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/mistakes/mistakes.wxml", import.meta.url)),
  "utf8"
);
const mistakesStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/mistakes/mistakes.wxss", import.meta.url)),
  "utf8"
);

const mistakeRecords: Mistake[] = [
  {
    wordId: "projector",
    sceneId: "classroom",
    lastMistakeAt: "2026-05-18T10:12:00.000Z",
    typeStats: {
      click: {
        mistakeCount: 2,
        correctStreak: 1,
        masteryProgress: 50,
        lastMistakeAt: "2026-05-18T10:12:00.000Z"
      },
      spelling: {
        mistakeCount: 1,
        correctStreak: 0,
        masteryProgress: 0,
        lastMistakeAt: "2026-05-18T09:30:00.000Z"
      }
    }
  },
  {
    wordId: "podium",
    sceneId: "classroom",
    lastMistakeAt: "2026-05-18T11:20:00.000Z",
    typeStats: {
      click: {
        mistakeCount: 4,
        correctStreak: 0,
        masteryProgress: 0,
        lastMistakeAt: "2026-05-18T11:20:00.000Z"
      },
      speaking: {
        mistakeCount: 1,
        correctStreak: 1,
        masteryProgress: 50,
        lastMistakeAt: "2026-05-18T10:40:00.000Z"
      }
    }
  }
];

const projector = getWordById("projector");
const podium = getWordById("podium");

describe("mistakes page", () => {
  it("builds a list view model from mistake records", () => {
    if (!projector || !podium) {
      throw new Error("Mistake word fixture is missing");
    }

    expect(createMistakesViewModel(mistakeRecords)).toEqual({
      title: "Mistakes",
      emptyTitle: "No mistakes yet",
      isEmpty: false,
      mistakeItems: [
        {
          wordId: "podium",
          en: "podium",
          cn: podium.cn,
          sceneName: "Classroom",
          sceneId: "classroom",
          lastMistakeAt: "2026-05-18",
          totalMistakeCount: 5,
          typeItems: [
            {
              type: "click",
              label: "Object",
              mistakeCount: 4,
              masteryProgress: 0,
              progressLabel: "0%",
              lastMistakeAt: "2026-05-18"
            },
            {
              type: "speaking",
              label: "Speaking",
              mistakeCount: 1,
              masteryProgress: 50,
              progressLabel: "50%",
              lastMistakeAt: "2026-05-18"
            }
          ]
        },
        {
          wordId: "projector",
          en: "projector",
          cn: projector.cn,
          sceneName: "Classroom",
          sceneId: "classroom",
          lastMistakeAt: "2026-05-18",
          totalMistakeCount: 3,
          typeItems: [
            {
              type: "click",
              label: "Object",
              mistakeCount: 2,
              masteryProgress: 50,
              progressLabel: "50%",
              lastMistakeAt: "2026-05-18"
            },
            {
              type: "spelling",
              label: "Spelling",
              mistakeCount: 1,
              masteryProgress: 0,
              progressLabel: "0%",
              lastMistakeAt: "2026-05-18"
            }
          ]
        }
      ]
    });
  });

  it("builds an empty state when there are no mistakes", () => {
    const viewModel = createMistakesViewModel([]);

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.mistakeItems).toEqual([]);
  });

  it("treats fully mastered mistake records as removed from the list", () => {
    const viewModel = createMistakesViewModel([
      {
        wordId: "projector",
        sceneId: "classroom",
        lastMistakeAt: "2026-05-18T10:12:00.000Z",
        typeStats: {}
      }
    ]);

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.mistakeItems).toEqual([]);
  });

  it("renders a real mistake list and empty state instead of a placeholder page", () => {
    expect(mistakesMarkup).toContain("mistakes-page");
    expect(mistakesMarkup).toContain("mistakeItems");
    expect(mistakesMarkup).toContain('wx:for="{{mistakeItems}}"');
    expect(mistakesMarkup).toContain("{{item.en}}");
    expect(mistakesMarkup).toContain("{{item.cn}}");
    expect(mistakesMarkup).toContain("{{item.sceneName}}");
    expect(mistakesMarkup).toContain("{{item.totalMistakeCount}}");
    expect(mistakesMarkup).toContain("{{item.lastMistakeAt}}");
    expect(mistakesMarkup).not.toContain("{{typeItem.lastMistakeAt}}");
    expect(mistakesMarkup).toContain('wx:for="{{item.typeItems}}"');
    expect(mistakesMarkup).toContain("{{typeItem.label}}");
    expect(mistakesMarkup).toContain("{{typeItem.mistakeCount}}");
    expect(mistakesMarkup).toContain("mistake-type-trailing");
    expect(mistakesMarkup).toContain('style="width: {{typeItem.progressLabel}}"');
    expect(mistakesMarkup).not.toContain("mistake-progress-label");
    expect(mistakesMarkup).not.toContain('data-mistake-type="{{typeItem.type}}"');
    expect(mistakesMarkup).not.toContain('catchtap="onPracticeMistake"');
    expect(mistakesMarkup).toContain('wx:if="{{isEmpty}}"');
    expect(mistakesMarkup).toContain("mistakes-empty");
    expect(mistakesMarkup).not.toContain("placeholder-page");
  });

  it("refreshes mistakes from local storage whenever the page is shown", () => {
    expect(mistakesScript).toContain("getMistakes");
    expect(mistakesScript).toContain("getWordById");
    expect(mistakesScript).toContain("getSceneById");
    expect(mistakesScript).toContain("onShow");
    expect(mistakesScript).toContain("setData");
  });

  it("supports manually removing a mistake after confirmation", () => {
    expect(mistakesMarkup).toContain("Remove");
    expect(mistakesMarkup).toContain('data-word-id="{{item.wordId}}"');
    expect(mistakesMarkup).toContain('catchtap="onRemoveMistake"');
    expect(mistakesMarkup).toContain("mistake-remove-button");

    expect(mistakesScript).toContain("removeMistake");
    expect(mistakesScript).toContain("onRemoveMistake");
    expect(mistakesScript).toContain("showModal");
    expect(mistakesScript).toContain("Remove this mistake?");
    expect(mistakesScript).toContain("This word will leave your mistake list.");
    expect(mistakesScript).not.toContain("answering wrong later");
    expect(mistakesScript).toContain("confirm");
    expect(mistakesScript).toContain("setData(createPageData())");
  });

  it("starts mistake practice from a top-level type picker", () => {
    expect(mistakesMarkup).toContain("Practice");
    expect(mistakesMarkup).toContain('bindtap="onPracticeMistakes"');
    expect(mistakesMarkup).toContain("mistakes-practice-button");
    expect(mistakesMarkup).not.toContain("<button");
    expect(mistakesMarkup).not.toContain("mistake-practice-button");
    expect(mistakesMarkup).not.toContain("mistake-type-actions");

    expect(mistakesScript).toContain("savePendingMistakePracticeRequest");
    expect(mistakesScript).toContain("onPracticeMistakes");
    expect(mistakesScript).toContain("showActionSheet");
    expect(mistakesScript).toContain('itemList: ["Object", "Spelling"]');
    expect(mistakesScript).toContain('const practiceTypes: MistakeType[] = ["click", "spelling"]');
    expect(mistakesScript).toContain('wx.switchTab({ url: "/pages/scene/scene" })');
  });

  it("styles list rows, type badges, progress bars, and the empty state", () => {
    expect(mistakesStyles).toContain(".mistakes-page");
    expect(mistakesStyles).toContain(".mistakes-list");
    expect(mistakesStyles).toContain(".mistake-item");
    expect(mistakesStyles).toContain(".mistake-word");
    expect(mistakesStyles).toContain(".mistake-type-list");
    expect(mistakesStyles).toContain(".mistake-type-item");
    expect(mistakesStyles).toContain(".mistake-progress-track");
    expect(mistakesStyles).toContain(".mistake-progress-fill");
    expect(mistakesStyles).toContain(".mistake-actions");
    expect(mistakesStyles).toContain(".mistake-remove-button");
    expect(mistakesStyles).toContain(".mistake-type-trailing");
    expect(mistakesStyles).toContain(".mistakes-practice-button");
    expect(mistakesStyles).not.toContain("width: 116rpx");
    expect(mistakesStyles).not.toContain("width: auto");
    expect(mistakesStyles).not.toContain("width: 78rpx");
    expect(mistakesStyles).toContain("align-self: flex-start");
    expect(mistakesStyles).toContain("padding: 12rpx 24rpx");
    expect(mistakesStyles).toContain("padding: 11rpx 20rpx");
    expect(mistakesStyles).toContain("font-size: 24rpx");
    expect(mistakesStyles).toContain("font-size: 23rpx");
    expect(mistakesStyles).toContain("margin-left: auto");
    expect(mistakesStyles).toContain("justify-content: center");
    expect(mistakesStyles).not.toContain(".mistake-type-copy");
    expect(mistakesStyles).not.toContain(".mistake-type-meta");
    expect(mistakesStyles).not.toContain(".mistake-progress-label");
    expect(mistakesStyles).not.toContain(".mistake-type-actions");
    expect(mistakesStyles).not.toContain(".mistake-type-time");
    expect(mistakesStyles).toContain(".mistakes-empty");
  });
});

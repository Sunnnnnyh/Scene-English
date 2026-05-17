import { describe, expect, it } from "vitest";

import { createMeViewModel } from "../miniprogram/pages/me/meViewModel";
import type { Favorite, Mistake, UserProgress } from "../miniprogram/types";

const progress: UserProgress = {
  sceneId: "classroom",
  learnedWordIds: ["blackboard", "projector", "desk"],
  completedMemoryCount: 1,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: "2026-05-17T00:00:00.000Z"
};

const favorites: Favorite[] = [
  {
    wordId: "blackboard",
    sceneId: "classroom",
    createdAt: "2026-05-17T00:00:00.000Z"
  },
  {
    wordId: "projector",
    sceneId: "classroom",
    createdAt: "2026-05-17T00:00:00.000Z"
  }
];

const mistakes: Mistake[] = [
  {
    wordId: "desk",
    sceneId: "classroom",
    lastMistakeAt: "2026-05-17T00:00:00.000Z",
    typeStats: {
      spelling: {
        mistakeCount: 1,
        correctStreak: 0,
        masteryProgress: 0,
        lastMistakeAt: "2026-05-17T00:00:00.000Z"
      }
    }
  }
];

describe("me page view model", () => {
  it("builds a lightweight profile summary from local learning data", () => {
    expect(createMeViewModel(progress, favorites, mistakes)).toEqual({
      title: "我的",
      nickname: "SceneEnglish Learner",
      stats: [
        {
          label: "已学单词",
          value: "3"
        },
        {
          label: "收藏",
          value: "2"
        },
        {
          label: "错题",
          value: "1"
        }
      ],
      asrStatus: {
        label: "口语识别",
        value: "Mock ASR enabled"
      }
    });
  });
});

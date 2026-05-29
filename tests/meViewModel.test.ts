import { describe, expect, it } from "vitest";

import { createMeViewModel } from "../miniprogram/pages/me/meViewModel";
import type {
  Favorite,
  LearningActivityChartPoint,
  Mistake,
  UserProfile,
  UserProgress
} from "../miniprogram/types";

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

const profile: UserProfile = {
  nickname: "Sunny",
  signature: "每天多记一点点",
  avatarText: "SU",
  avatarUrl: "",
  updatedAt: "2026-05-27T08:00:00.000Z"
};

const activityChart: LearningActivityChartPoint[] = [
  { date: "2026-05-26", label: "5/26", value: 3, heightPercent: 50 },
  { date: "2026-05-27", label: "5/27", value: 6, heightPercent: 100 }
];

describe("me page view model", () => {
  it("builds a profile dashboard from local learning data", () => {
    expect(
      createMeViewModel(progress, favorites, mistakes, profile, "week", activityChart)
    ).toEqual({
      title: "我的",
      profile,
      isEditingProfile: false,
      editableProfile: profile,
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
      chartTabs: [
        { label: "周", value: "week", isActive: true },
        { label: "月", value: "month", isActive: false }
      ],
      activityChart,
      quickEntries: [
        { label: "继续学习", target: "learn" },
        { label: "收藏夹", target: "favorites" },
        { label: "错题夹", target: "mistakes" }
      ]
    });
  });
});

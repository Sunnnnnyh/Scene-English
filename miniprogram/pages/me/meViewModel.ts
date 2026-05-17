import type { Favorite, Mistake, UserProgress } from "../../types";

export type MeStat = {
  label: string;
  value: string;
};

export type MeViewModel = {
  title: string;
  nickname: string;
  stats: MeStat[];
  asrStatus: {
    label: string;
    value: string;
  };
};

export function createMeViewModel(
  progress: UserProgress,
  favorites: Favorite[],
  mistakes: Mistake[]
): MeViewModel {
  return {
    title: "我的",
    nickname: "SceneEnglish Learner",
    stats: [
      {
        label: "已学单词",
        value: `${progress.learnedWordIds.length}`
      },
      {
        label: "收藏",
        value: `${favorites.length}`
      },
      {
        label: "错题",
        value: `${mistakes.length}`
      }
    ],
    asrStatus: {
      label: "口语识别",
      value: "Mock ASR enabled"
    }
  };
}

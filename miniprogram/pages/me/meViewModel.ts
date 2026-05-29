import type {
  Favorite,
  LearningActivityChartPoint,
  LearningActivityRange,
  Mistake,
  UserProfile,
  UserProgress
} from "../../types";

export type MeStat = {
  label: string;
  value: string;
};

export type MeChartTab = {
  label: string;
  value: LearningActivityRange;
  isActive: boolean;
};

export type MeQuickEntry = {
  label: string;
  target: "learn" | "favorites" | "mistakes";
};

export type MeViewModel = {
  title: string;
  profile: UserProfile;
  isEditingProfile: boolean;
  editableProfile: UserProfile;
  stats: MeStat[];
  chartTabs: MeChartTab[];
  activityChart: LearningActivityChartPoint[];
  quickEntries: MeQuickEntry[];
};

export function createMeViewModel(
  progress: UserProgress,
  favorites: Favorite[],
  mistakes: Mistake[],
  profile: UserProfile,
  activeChartRange: LearningActivityRange,
  activityChart: LearningActivityChartPoint[],
  isEditingProfile = false,
  editableProfile: UserProfile = profile
): MeViewModel {
  return {
    title: "我的",
    profile,
    isEditingProfile,
    editableProfile,
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
    chartTabs: [
      {
        label: "周",
        value: "week",
        isActive: activeChartRange === "week"
      },
      {
        label: "月",
        value: "month",
        isActive: activeChartRange === "month"
      }
    ],
    activityChart,
    quickEntries: [
      {
        label: "继续学习",
        target: "learn"
      },
      {
        label: "收藏夹",
        target: "favorites"
      },
      {
        label: "错题夹",
        target: "mistakes"
      }
    ]
  };
}

import { getFavorites } from "../../services/favoriteService";
import { getMistakes } from "../../services/mistakeService";
import { getSceneProgress } from "../../services/progressService";
import type { Favorite, Mistake, UserProgress } from "../../types";
import { feedbackCopy } from "../../utils/feedbackCopy";

function createPageData(progress: UserProgress, favorites: Favorite[], mistakes: Mistake[]) {
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
      value: feedbackCopy.speechStatusReady
    }
  };
}

Page({
  data: createPageData(getSceneProgress("classroom"), getFavorites(), getMistakes()),

  onShow() {
    this.setData(createPageData(getSceneProgress("classroom"), getFavorites(), getMistakes()));
  }
});

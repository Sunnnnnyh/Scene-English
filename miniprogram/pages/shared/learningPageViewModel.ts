import type { Scene, StudyMode } from "../../types";

export type LearningPageViewModel = {
  sceneId: Scene["id"];
  title: string;
  backLabel: string;
  backAction: BackToSceneAction;
};

export type BackToSceneAction = {
  type: "switchTab";
  url: string;
};

const pageCopy: Record<StudyMode, Pick<LearningPageViewModel, "title">> = {
  memory: {
    title: "单词记忆模式"
  },
  listeningWriting: {
    title: "听力 + 默写"
  },
  listeningSpeaking: {
    title: "听力 + 口语"
  }
};

export function getBackToSceneAction(): BackToSceneAction {
  return {
    type: "switchTab",
    url: "/pages/scene/scene"
  };
}

export function createLearningPageViewModel(
  mode: StudyMode,
  sceneId: Scene["id"]
): LearningPageViewModel {
  return {
    sceneId,
    ...pageCopy[mode],
    backLabel: "返回 Classroom",
    backAction: getBackToSceneAction()
  };
}

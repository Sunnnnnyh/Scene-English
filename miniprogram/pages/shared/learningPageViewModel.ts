import type { Scene, StudyMode } from "../../types";

export type LearningPageViewModel = {
  sceneId: Scene["id"];
  title: string;
  description: string;
  backLabel: string;
  backAction: BackToSceneAction;
};

export type BackToSceneAction = {
  type: "switchTab";
  url: string;
};

const pageCopy: Record<StudyMode, Pick<LearningPageViewModel, "title" | "description">> = {
  memory: {
    title: "单词记忆模式",
    description: "Memory Mode 占位页面"
  },
  listeningWriting: {
    title: "听力 + 默写",
    description: "Listen + Spell 占位页面"
  },
  listeningSpeaking: {
    title: "听力 + 口语",
    description: "Listen + Speak 占位页面"
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

import type { Scene, StudyMode, UserProgress, Word } from "../../types";
import { createHotspotStyle } from "../../utils/hotspot";

export type SceneEntryId = StudyMode;

export type SceneModeEntry = {
  id: StudyMode;
  title: string;
  subtitle: string;
  actionLabel: string;
  isRecommended: boolean;
};

export type SceneMemoryHotspot = {
  wordId: Word["id"];
  label: Word["en"];
  style: string;
};

export type SceneViewModel = {
  sceneId: Scene["id"];
  title: string;
  sceneNameCn: Scene["nameCn"];
  sceneNameEn: Scene["nameEn"];
  sceneImage: Scene["sceneImage"];
  progressLabel: string;
  progressPercent: number;
  modeEntries: SceneModeEntry[];
  activeMode: "" | SceneEntryId;
  selectedModeTitle: string;
  selectedModeSubtitle: string;
  memoryHotspots: SceneMemoryHotspot[];
  showMemoryGuide: boolean;
  memoryGuideWordId: Word["id"];
  selectedMemoryWordId: string;
  selectedMemoryWordLabel: string;
};

export type SceneEntryAction = {
  type: "selectMode";
  mode: SceneEntryId;
};

const modeEntries: SceneModeEntry[] = [
  {
    id: "memory",
    title: "单词记忆",
    subtitle: "先探索场景里的物品",
    actionLabel: "Recommended",
    isRecommended: true
  },
  {
    id: "listeningWriting",
    title: "听力 + 默写",
    subtitle: "听发音，找物品，再拼写",
    actionLabel: "Practice",
    isRecommended: false
  },
  {
    id: "listeningSpeaking",
    title: "听力 + 口语",
    subtitle: "听发音，找物品，再开口读",
    actionLabel: "Speak",
    isRecommended: false
  }
];

export function createSceneViewModel(
  scene: Scene,
  progress: UserProgress,
  words: Word[] = []
): SceneViewModel {
  const learnedCount = progress.learnedWordIds.length;
  const progressPercent =
    scene.wordCount > 0 ? Math.round((learnedCount / scene.wordCount) * 100) : 0;
  const memoryHotspots = words.map((word) => ({
    wordId: word.id,
    label: word.en,
    style: createHotspotStyle(word.position, scene.baseWidth, scene.baseHeight)
  }));

  return {
    sceneId: scene.id,
    title: `${scene.nameCn} ${scene.nameEn}`,
    sceneNameCn: scene.nameCn,
    sceneNameEn: scene.nameEn,
    sceneImage: scene.sceneImage,
    progressLabel: `Learned ${learnedCount} / ${scene.wordCount}`,
    progressPercent,
    modeEntries,
    activeMode: "",
    selectedModeTitle: "",
    selectedModeSubtitle: "",
    memoryHotspots,
    showMemoryGuide: false,
    memoryGuideWordId: "projector",
    selectedMemoryWordId: "",
    selectedMemoryWordLabel: ""
  };
}

export function getSceneEntryAction(entryId: SceneEntryId): SceneEntryAction {
  return {
    type: "selectMode",
    mode: entryId
  };
}

import type { Scene, StudyMode, UserProgress, Word } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const PROGRESS_DEFAULT: UserProgress[] = [];

const createEmptyProgress = (sceneId: Scene["id"]): UserProgress => ({
  sceneId,
  learnedWordIds: [],
  completedMemoryCount: 0,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: new Date().toISOString()
});

const getProgressList = (adapter?: StorageAdapter): UserProgress[] =>
  readStorage("progress", PROGRESS_DEFAULT, adapter);

const saveSceneProgress = (progress: UserProgress, adapter?: StorageAdapter): UserProgress => {
  const progressList = getProgressList(adapter);
  const nextProgressList = progressList.some((item) => item.sceneId === progress.sceneId)
    ? progressList.map((item) => (item.sceneId === progress.sceneId ? progress : item))
    : [...progressList, progress];

  writeStorage("progress", nextProgressList, adapter);

  return progress;
};

export function getSceneProgress(sceneId: Scene["id"], adapter?: StorageAdapter): UserProgress {
  return (
    getProgressList(adapter).find((progress) => progress.sceneId === sceneId) ??
    createEmptyProgress(sceneId)
  );
}

export function recordLearnedWord(
  sceneId: Scene["id"],
  wordId: Word["id"],
  adapter?: StorageAdapter
): UserProgress {
  const currentProgress = getSceneProgress(sceneId, adapter);
  const learnedWordIds = currentProgress.learnedWordIds.includes(wordId)
    ? currentProgress.learnedWordIds
    : [...currentProgress.learnedWordIds, wordId];

  return saveSceneProgress(
    {
      ...currentProgress,
      learnedWordIds,
      updatedAt: new Date().toISOString()
    },
    adapter
  );
}

export function recordModeCompletion(
  sceneId: Scene["id"],
  mode: StudyMode,
  adapter?: StorageAdapter
): UserProgress {
  const currentProgress = getSceneProgress(sceneId, adapter);
  const nextProgress = {
    ...currentProgress,
    updatedAt: new Date().toISOString()
  };

  if (mode === "memory") {
    nextProgress.completedMemoryCount += 1;
  }

  if (mode === "listeningWriting") {
    nextProgress.completedWritingCount += 1;
  }

  if (mode === "listeningSpeaking") {
    nextProgress.completedSpeakingCount += 1;
  }

  return saveSceneProgress(nextProgress, adapter);
}

import type {
  MasteryProgress,
  Mistake,
  MistakeType,
  MistakeTypeStats,
  MistakeTypeStatsMap,
  Scene,
  Word
} from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const MISTAKES_DEFAULT: Mistake[] = [];

export function getMistakes(adapter?: StorageAdapter): Mistake[] {
  return readStorage("mistakes", MISTAKES_DEFAULT, adapter);
}

const saveMistakes = (mistakes: Mistake[], adapter?: StorageAdapter): Mistake[] => {
  writeStorage("mistakes", mistakes, adapter);

  return mistakes;
};

const createMistakeTypeStats = (timestamp: string): MistakeTypeStats => ({
  mistakeCount: 1,
  correctStreak: 0,
  masteryProgress: 0,
  lastMistakeAt: timestamp
});

const updateMistakeTypeStats = (
  typeStats: MistakeTypeStats | undefined,
  timestamp: string
): MistakeTypeStats => {
  if (!typeStats) {
    return createMistakeTypeStats(timestamp);
  }

  return {
    ...typeStats,
    mistakeCount: typeStats.mistakeCount + 1,
    correctStreak: 0,
    masteryProgress: 0,
    lastMistakeAt: timestamp
  };
};

export function recordMistake(
  wordId: Word["id"],
  sceneId: Scene["id"],
  mistakeType: MistakeType,
  adapter?: StorageAdapter
): Mistake[] {
  const timestamp = new Date().toISOString();
  const mistakes = getMistakes(adapter);
  const existingMistake = mistakes.find((mistake) => mistake.wordId === wordId);

  if (!existingMistake) {
    return saveMistakes(
      [
        ...mistakes,
        {
          wordId,
          sceneId,
          lastMistakeAt: timestamp,
          typeStats: {
            [mistakeType]: createMistakeTypeStats(timestamp)
          }
        }
      ],
      adapter
    );
  }

  const nextMistake = {
    ...existingMistake,
    sceneId,
    lastMistakeAt: timestamp,
    typeStats: {
      ...existingMistake.typeStats,
      [mistakeType]: updateMistakeTypeStats(existingMistake.typeStats[mistakeType], timestamp)
    }
  };

  return saveMistakes(
    mistakes.map((mistake) => (mistake.wordId === wordId ? nextMistake : mistake)),
    adapter
  );
}

const getNextMasteryProgress = (correctStreak: number): MasteryProgress =>
  correctStreak >= 1 ? 50 : 0;

const removeMistakeType = (
  typeStats: MistakeTypeStatsMap,
  mistakeType: MistakeType
): MistakeTypeStatsMap => {
  const nextTypeStats = { ...typeStats };

  delete nextTypeStats[mistakeType];

  return nextTypeStats;
};

export function recordMistakeCorrectAnswer(
  wordId: Word["id"],
  mistakeType: MistakeType,
  adapter?: StorageAdapter
): Mistake[] {
  const mistakes = getMistakes(adapter);
  const existingMistake = mistakes.find((mistake) => mistake.wordId === wordId);
  const existingTypeStats = existingMistake?.typeStats[mistakeType];

  if (!existingMistake || !existingTypeStats) {
    return mistakes;
  }

  const correctStreak = existingTypeStats.correctStreak + 1;
  const nextTypeStats =
    correctStreak >= 2
      ? removeMistakeType(existingMistake.typeStats, mistakeType)
      : {
          ...existingMistake.typeStats,
          [mistakeType]: {
            ...existingTypeStats,
            correctStreak,
            masteryProgress: getNextMasteryProgress(correctStreak)
          }
        };

  const nextMistakes =
    Object.keys(nextTypeStats).length === 0
      ? mistakes.filter((mistake) => mistake.wordId !== wordId)
      : mistakes.map((mistake) =>
          mistake.wordId === wordId ? { ...existingMistake, typeStats: nextTypeStats } : mistake
        );

  return saveMistakes(nextMistakes, adapter);
}

export function removeMistake(wordId: Word["id"], adapter?: StorageAdapter): Mistake[] {
  return saveMistakes(
    getMistakes(adapter).filter((mistake) => mistake.wordId !== wordId),
    adapter
  );
}

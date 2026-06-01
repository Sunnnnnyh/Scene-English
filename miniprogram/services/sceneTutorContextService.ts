import type {
  Scene,
  SceneTutorBaseContextInput,
  SceneTutorBaseContextResult,
  SceneTutorLearningSignals,
  SceneTutorLearningSignalsResult,
  SceneTutorUnavailableResult,
  Word
} from "../types";
import type { StorageAdapter } from "../utils/storage";
import { getFavorites } from "./favoriteService";
import { getMistakes } from "./mistakeService";
import { getSceneProgress } from "./progressService";
import { getSceneById } from "./sceneService";
import { getWordsBySceneId } from "./wordService";

const UNAVAILABLE_RESULT: SceneTutorUnavailableResult = {
  ok: false,
  errorCode: "unavailable",
  message: "Scene Tutor is unavailable for this scene."
};

const toSceneSummary = (scene: Scene) => ({
  id: scene.id,
  nameEn: scene.nameEn,
  nameCn: scene.nameCn,
  wordCount: scene.wordCount
});

const getAvailableSceneBundle = (sceneId: Scene["id"]) => {
  const scene = getSceneById(sceneId);

  if (!scene || scene.status !== "available") {
    return undefined;
  }

  return {
    scene,
    words: getWordsBySceneId(sceneId)
  };
};

const getSceneScopedWordIds = (words: Word[], candidateWordIds: Word["id"][]): Word["id"][] => {
  const candidateSet = new Set(candidateWordIds);

  return words.filter((word) => candidateSet.has(word.id)).map((word) => word.id);
};

export function buildSceneTutorLearningSignals(
  sceneId: Scene["id"],
  adapter?: StorageAdapter
): SceneTutorLearningSignalsResult {
  const sceneBundle = getAvailableSceneBundle(sceneId);

  if (!sceneBundle) {
    return UNAVAILABLE_RESULT;
  }

  const { scene, words } = sceneBundle;
  const favorites = getFavorites(adapter).filter((favorite) => favorite.sceneId === sceneId);
  const mistakes = getMistakes(adapter).filter((mistake) => mistake.sceneId === sceneId);
  const progress = getSceneProgress(sceneId, adapter);
  const signals: SceneTutorLearningSignals = {
    favoriteWordIds: getSceneScopedWordIds(
      words,
      favorites.map((favorite) => favorite.wordId)
    ),
    mistakeWordIds: getSceneScopedWordIds(
      words,
      mistakes.map((mistake) => mistake.wordId)
    ),
    learnedWordIds: getSceneScopedWordIds(words, progress.learnedWordIds),
    learnedCount: getSceneScopedWordIds(words, progress.learnedWordIds).length,
    totalWordCount: words.length
  };

  return {
    ok: true,
    scene: toSceneSummary(scene),
    signals
  };
}

export function buildSceneTutorBaseContext(
  input: SceneTutorBaseContextInput,
  adapter?: StorageAdapter
): SceneTutorBaseContextResult {
  const sceneBundle = getAvailableSceneBundle(input.sceneId);

  if (!sceneBundle) {
    return UNAVAILABLE_RESULT;
  }

  const learningSignalsResult = buildSceneTutorLearningSignals(input.sceneId, adapter);

  if (!learningSignalsResult.ok) {
    return learningSignalsResult;
  }

  return {
    ok: true,
    context: {
      scene: learningSignalsResult.scene,
      task: input.task,
      query: input.query,
      selectedWordIds: getSceneScopedWordIds(sceneBundle.words, input.selectedWordIds ?? []),
      matchedWords: [],
      learningSignals: learningSignalsResult.signals
    }
  };
}

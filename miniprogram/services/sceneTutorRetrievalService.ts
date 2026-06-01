import type {
  MistakeType,
  Scene,
  SceneTutorMatchedWord,
  SceneTutorRetrievalInput,
  SceneTutorRetrievalResult,
  SceneTutorUnavailableResult,
  Word
} from "../types";
import type { StorageAdapter } from "../utils/storage";
import { getMistakes } from "./mistakeService";
import { getSceneById } from "./sceneService";
import { getWordsBySceneId } from "./wordService";

const MAX_MATCHED_WORDS = 5;
const FALLBACK_WORD_COUNT = 5;

const UNAVAILABLE_RESULT: SceneTutorUnavailableResult = {
  ok: false,
  errorCode: "unavailable",
  message: "Scene Tutor is unavailable for this scene."
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "mean",
  "of",
  "say",
  "the",
  "to",
  "use",
  "what",
  "with"
]);

const normalizeText = (value: string): string => value.trim().toLowerCase();

const tokenizeQuery = (query: string): string[] =>
  normalizeText(query)
    .split(/[^a-z0-9\u4e00-\u9fff]+/u)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const getAvailableSceneWords = (sceneId: Scene["id"]): Word[] | undefined => {
  const scene = getSceneById(sceneId);

  if (!scene || scene.status !== "available") {
    return undefined;
  }

  return getWordsBySceneId(sceneId);
};

const getMistakeTypesByWordId = (
  sceneId: Scene["id"],
  adapter?: StorageAdapter
): Map<Word["id"], MistakeType[]> => {
  const mistakeTypesByWordId = new Map<Word["id"], MistakeType[]>();

  getMistakes(adapter)
    .filter((mistake) => mistake.sceneId === sceneId)
    .forEach((mistake) => {
      mistakeTypesByWordId.set(mistake.wordId, Object.keys(mistake.typeStats) as MistakeType[]);
    });

  return mistakeTypesByWordId;
};

const scoreTextMatch = (word: Word, tokens: string[], normalizedQuery: string): number => {
  if (tokens.length === 0) {
    return 0;
  }

  const normalizedWord = {
    en: normalizeText(word.en),
    cn: normalizeText(word.cn),
    expressionEn: normalizeText(word.expressionEn),
    expressionCn: normalizeText(word.expressionCn)
  };

  return tokens.reduce((score, token) => {
    if (normalizedWord.en === token || normalizedQuery === normalizedWord.en) {
      return score + 80;
    }

    if (normalizedWord.en.includes(token) || normalizedWord.cn.includes(token)) {
      return score + 50;
    }

    if (
      normalizedWord.expressionEn.includes(token) ||
      normalizedWord.expressionCn.includes(token)
    ) {
      return score + 18;
    }

    return score;
  }, 0);
};

const toMatchedWord = (
  word: Word,
  input: SceneTutorRetrievalInput,
  mistakeTypesByWordId: Map<Word["id"], MistakeType[]>
): SceneTutorMatchedWord => ({
  id: word.id,
  sceneId: word.sceneId,
  en: word.en,
  cn: word.cn,
  phonetic: word.phonetic,
  expressionEn: word.expressionEn,
  expressionCn: word.expressionCn,
  isFavorite: input.learningSignals.favoriteWordIds.includes(word.id),
  mistakeTypes: mistakeTypesByWordId.get(word.id) ?? [],
  isLearned: input.learningSignals.learnedWordIds.includes(word.id)
});

const scoreSignalBoost = (word: Word, input: SceneTutorRetrievalInput): number => {
  let score = 0;

  if (input.learningSignals.mistakeWordIds.includes(word.id)) {
    score += 12;
  }

  if (input.learningSignals.favoriteWordIds.includes(word.id)) {
    score += 10;
  }

  if (input.learningSignals.learnedWordIds.includes(word.id)) {
    score += 4;
  }

  return score;
};

export function retrieveSceneTutorMatchedWords(
  input: SceneTutorRetrievalInput,
  adapter?: StorageAdapter
): SceneTutorRetrievalResult {
  const words = getAvailableSceneWords(input.sceneId);

  if (!words) {
    return UNAVAILABLE_RESULT;
  }

  const selectedWordIds = new Set(input.selectedWordIds ?? []);
  const tokens = tokenizeQuery(input.query);
  const normalizedQuery = normalizeText(input.query);
  const mistakeTypesByWordId = getMistakeTypesByWordId(input.sceneId, adapter);

  const scoredWords = words.map((word, index) => {
    const selectedScore = selectedWordIds.has(word.id) ? 100 : 0;
    const textScore = scoreTextMatch(word, tokens, normalizedQuery);
    const signalScore = scoreSignalBoost(word, input);

    return {
      word,
      index,
      score: selectedScore + textScore + signalScore,
      hasDirectMatch: selectedScore > 0 || textScore > 0
    };
  });

  const directMatches = scoredWords.filter((item) => item.hasDirectMatch);
  const sourceWords = directMatches.length > 0 ? directMatches : scoredWords;
  const limit = directMatches.length > 0 ? MAX_MATCHED_WORDS : FALLBACK_WORD_COUNT;
  const matchedWords = sourceWords
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((item) => toMatchedWord(item.word, input, mistakeTypesByWordId));

  return {
    ok: true,
    matchedWords
  };
}

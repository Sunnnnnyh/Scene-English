import type {
  Mistake,
  MistakeType,
  QuizQuestion,
  QuizRound,
  Scene,
  StudyMode,
  Word
} from "../types";

export const DEFAULT_QUIZ_QUESTION_COUNT = 5;

type QuizMode = Exclude<StudyMode, "memory">;

type CreatePracticeQuizRoundParams = {
  sceneId: Scene["id"];
  mode: QuizMode;
  words: Word[];
  learnedWordIds: Word["id"][];
  questionCount?: number;
};

type CreateMistakePracticeQuizRoundParams = {
  sceneId: Scene["id"];
  mode: QuizMode;
  words: Word[];
  mistakes: Mistake[];
  targetMistakeType?: MistakeType;
  questionCount?: number;
};

type MistakePracticeCandidate = {
  word: Word;
  mistakeType: MistakeType;
  mistakeCount: number;
  masteryProgress: number;
  lastMistakeAt: string;
  wordOrder: number;
};

const takeQuestions = <T>(items: T[], questionCount: number): T[] =>
  items.slice(0, Math.max(0, questionCount));

const createQuizQuestion = (
  sceneId: Scene["id"],
  mode: QuizMode,
  word: Word,
  index: number,
  targetMistakeType?: MistakeType
): QuizQuestion => ({
  id: `${sceneId}:${mode}:${word.id}:${index + 1}`,
  sceneId,
  wordId: word.id,
  mode,
  targetMistakeType
});

const createQuizRound = (
  sceneId: Scene["id"],
  mode: QuizMode,
  questions: QuizQuestion[]
): QuizRound => {
  const startedAt = new Date().toISOString();

  return {
    id: `${sceneId}:${mode}:${startedAt}`,
    sceneId,
    mode,
    questions,
    currentIndex: 0,
    startedAt
  };
};

export function createPracticeQuizRound({
  sceneId,
  mode,
  words,
  learnedWordIds,
  questionCount = DEFAULT_QUIZ_QUESTION_COUNT
}: CreatePracticeQuizRoundParams): QuizRound {
  const learnedWordIdSet = new Set(learnedWordIds);
  const learnedWords = words.filter((word) => learnedWordIdSet.has(word.id));
  const unlearnedWords = words.filter((word) => !learnedWordIdSet.has(word.id));
  const selectedWords = takeQuestions([...learnedWords, ...unlearnedWords], questionCount);

  return createQuizRound(
    sceneId,
    mode,
    selectedWords.map((word, index) => createQuizQuestion(sceneId, mode, word, index))
  );
}

const createMistakePracticeCandidates = (
  sceneId: Scene["id"],
  words: Word[],
  mistakes: Mistake[],
  targetMistakeType?: MistakeType
): MistakePracticeCandidate[] => {
  const wordsById = new Map(words.map((word, index) => [word.id, { word, index }]));

  return mistakes
    .filter((mistake) => mistake.sceneId === sceneId)
    .flatMap((mistake) => {
      const wordEntry = wordsById.get(mistake.wordId);

      if (!wordEntry) {
        return [];
      }

      return (
        Object.entries(mistake.typeStats) as [
          MistakeType,
          NonNullable<Mistake["typeStats"][MistakeType]>
        ][]
      )
        .filter(([mistakeType]) => !targetMistakeType || mistakeType === targetMistakeType)
        .map(([mistakeType, stats]) => ({
          word: wordEntry.word,
          mistakeType,
          mistakeCount: stats.mistakeCount,
          masteryProgress: stats.masteryProgress,
          lastMistakeAt: stats.lastMistakeAt,
          wordOrder: wordEntry.index
        }));
    });
};

const compareMistakePracticeCandidates = (
  first: MistakePracticeCandidate,
  second: MistakePracticeCandidate
): number =>
  first.masteryProgress - second.masteryProgress ||
  second.mistakeCount - first.mistakeCount ||
  second.lastMistakeAt.localeCompare(first.lastMistakeAt) ||
  first.wordOrder - second.wordOrder;

export function createMistakePracticeQuizRound({
  sceneId,
  mode,
  words,
  mistakes,
  targetMistakeType,
  questionCount = DEFAULT_QUIZ_QUESTION_COUNT
}: CreateMistakePracticeQuizRoundParams): QuizRound {
  const selectedCandidates = takeQuestions(
    createMistakePracticeCandidates(sceneId, words, mistakes, targetMistakeType).sort(
      compareMistakePracticeCandidates
    ),
    questionCount
  );

  return createQuizRound(
    sceneId,
    mode,
    selectedCandidates.map((candidate, index) =>
      createQuizQuestion(sceneId, mode, candidate.word, index, candidate.mistakeType)
    )
  );
}

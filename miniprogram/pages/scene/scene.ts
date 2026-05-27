import { addFavorite, isFavorite, removeFavorite } from "../../services/favoriteService";
import { getSceneProgress, recordLearnedWord } from "../../services/progressService";
import {
  getMistakes,
  recordMistake,
  recordMistakeCorrectAnswer
} from "../../services/mistakeService";
import { consumePendingMistakePracticeRequest } from "../../services/mistakePracticeService";
import { getSceneById } from "../../services/sceneService";
import { speechService } from "../../services/speechService";
import { getWordById, getWordsBySceneId } from "../../services/wordService";
import { feedbackCopy } from "../../utils/feedbackCopy";
import { isNormalizedSpellingMatch } from "../../utils/normalize";
import {
  completeMemoryGuide,
  completeMemoryTranslationGuide,
  shouldShowMemoryGuide,
  shouldShowMemoryTranslationGuide
} from "../../services/onboardingService";
import {
  createEmptyListeningSpeakingState,
  createEmptyListeningWritingState,
  createListeningSpeakingStartState,
  createListeningWritingStartState,
  createMemoryWordCard,
  createSceneViewModel,
  getSceneEntryAction,
  type SceneListeningSpeakingRecognitionStatus,
  type SceneListeningSpeakingQuestion,
  type SceneListeningSpeakingRecordingStatus,
  type SceneListeningSpeakingState,
  type SceneListeningWritingQuestion,
  type SceneListeningWritingState,
  type SceneMemoryWordCard,
  type SceneEntryId,
  type SceneViewModel
} from "./sceneViewModel";
import type {
  Mistake,
  MistakeType,
  QuizQuestion,
  QuizRound,
  Scene,
  StudyMode,
  Word
} from "../../types";

type ScenePageOptions = {
  sceneId?: string;
};

type SceneEntryTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      entryId?: SceneEntryId;
    };
  };
};

type MemoryHotspotTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: string;
    };
  };
};

type ListeningWritingHotspotTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: string;
    };
  };
};

type ListeningSpeakingHotspotTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: string;
    };
  };
};

type ListeningWritingSpellingInputEvent = WechatMiniprogram.BaseEvent & {
  detail: {
    value?: string;
  };
};

type MemoryTranslationTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      translationType?: "expression";
    };
  };
};

const DEFAULT_LISTENING_WRITING_QUESTION_COUNT = 5;
const LISTENING_WRITING_CORRECT_SOUND_URL = "/assets/audio/feedback-correct.wav";
const LISTENING_WRITING_WRONG_SOUND_URL = "/assets/audio/feedback-wrong.wav";
const AUDIO_PLAYBACK_ERROR_MESSAGE = feedbackCopy.audioUnavailable;
const MIN_LISTENING_SPEAKING_RECORDING_MS = 900;
let sceneFeedbackToastTimer: ReturnType<typeof setTimeout> | null = null;

type ListeningWritingFeedbackKind = "" | "success" | "error" | "info";
type ListeningSpeakingFeedbackKind = "" | "success" | "error" | "info";
type ListeningSpeakingRecordingStopResult = {
  tempFilePath?: string;
  duration?: number;
};
type ListeningSpeakingRecorderOwner = {
  handleListeningSpeakingRecordingStop(result: ListeningSpeakingRecordingStopResult): void;
  handleListeningSpeakingRecordingError(): void;
};

type ListeningWritingTaskData = {
  listeningWritingStepLabel: string;
  listeningWritingTaskTitle: string;
  listeningWritingInstruction: string;
};

type ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: string;
  listeningSpeakingTaskTitle: string;
  listeningSpeakingInstruction: string;
};

type ListeningSpeakingCompletionStats = {
  listeningSpeakingCorrectCount: number;
  listeningSpeakingMistakeCount: number;
  listeningSpeakingNewMistakeCount: number;
};

function createListeningSpeakingRecordingData(
  status: SceneListeningSpeakingRecordingStatus = "idle",
  feedback = ""
) {
  return {
    listeningSpeakingRecordingStatus: status,
    listeningSpeakingRecordingPath: "",
    listeningSpeakingRecordingDurationMs: 0,
    listeningSpeakingRecordingFeedback: feedback
  };
}

function createListeningSpeakingRecognitionData(
  status: SceneListeningSpeakingRecognitionStatus = "idle",
  feedback = "",
  transcript = ""
) {
  return {
    listeningSpeakingRecognitionStatus: status,
    listeningSpeakingRecognitionTranscript: transcript,
    listeningSpeakingRecognitionFeedback: feedback
  };
}

function showAudioPlaybackErrorToast() {
  wx.showToast({
    title: AUDIO_PLAYBACK_ERROR_MESSAGE,
    icon: "none"
  });
}

function clearSceneFeedbackToastTimer() {
  if (sceneFeedbackToastTimer) {
    clearTimeout(sceneFeedbackToastTimer);
    sceneFeedbackToastTimer = null;
  }
}

const LISTENING_WRITING_LISTEN_TASK: ListeningWritingTaskData = {
  listeningWritingStepLabel: "Listen",
  listeningWritingTaskTitle: "Listen",
  listeningWritingInstruction: "Play audio, then find it."
};

const LISTENING_WRITING_FIND_TASK: ListeningWritingTaskData = {
  listeningWritingStepLabel: "Find",
  listeningWritingTaskTitle: "Find the object",
  listeningWritingInstruction: "Tap the matching object."
};

const LISTENING_WRITING_SPELL_TASK: ListeningWritingTaskData = {
  listeningWritingStepLabel: "Spell",
  listeningWritingTaskTitle: "Spell now",
  listeningWritingInstruction: ""
};

const LISTENING_WRITING_REVIEW_TASK: ListeningWritingTaskData = {
  listeningWritingStepLabel: "Review",
  listeningWritingTaskTitle: "Review",
  listeningWritingInstruction: ""
};

const LISTENING_WRITING_COMPLETE_TASK: ListeningWritingTaskData = {
  listeningWritingStepLabel: "Complete",
  listeningWritingTaskTitle: "Round complete",
  listeningWritingInstruction: "You finished this Listen + Spell round."
};

const LISTENING_SPEAKING_LISTEN_TASK: ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: "Listen",
  listeningSpeakingTaskTitle: "Listen",
  listeningSpeakingInstruction: "Play audio, then find it."
};

const LISTENING_SPEAKING_FIND_TASK: ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: "Find",
  listeningSpeakingTaskTitle: "Find the object",
  listeningSpeakingInstruction: "Tap the matching object."
};

const LISTENING_SPEAKING_RECORD_TASK: ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: "Speak",
  listeningSpeakingTaskTitle: "Speak",
  listeningSpeakingInstruction: "Get ready to say the word."
};

const LISTENING_SPEAKING_REVIEW_TASK: ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: "Review",
  listeningSpeakingTaskTitle: "Review",
  listeningSpeakingInstruction: ""
};

const LISTENING_SPEAKING_COMPLETE_TASK: ListeningSpeakingTaskData = {
  listeningSpeakingStepLabel: "Complete",
  listeningSpeakingTaskTitle: "Speaking round complete",
  listeningSpeakingInstruction: "You finished this Listen + Speak round."
};

let memoryWordAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningWritingAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningWritingFeedbackAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningSpeakingAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningSpeakingRecorderManager: WechatMiniprogram.RecorderManager | undefined;
let listeningSpeakingRecorderOwner: ListeningSpeakingRecorderOwner | null = null;
let isListeningSpeakingRecorderBound = false;
let listeningSpeakingRecordingStartedAt = 0;
let shouldCancelListeningSpeakingRecording = false;
let listeningSpeakingRecognitionRequestId = 0;

function getListeningSpeakingRecorderManager() {
  if (!listeningSpeakingRecorderManager) {
    listeningSpeakingRecorderManager = wx.getRecorderManager();
  }

  return listeningSpeakingRecorderManager;
}

function bindListeningSpeakingRecorder(owner: ListeningSpeakingRecorderOwner) {
  const recorderManager = getListeningSpeakingRecorderManager();
  listeningSpeakingRecorderOwner = owner;

  if (isListeningSpeakingRecorderBound) {
    return recorderManager;
  }

  recorderManager.onStop((result) => {
    listeningSpeakingRecorderOwner?.handleListeningSpeakingRecordingStop(
      result as ListeningSpeakingRecordingStopResult
    );
  });
  recorderManager.onError(() => {
    listeningSpeakingRecorderOwner?.handleListeningSpeakingRecordingError();
  });
  isListeningSpeakingRecorderBound = true;

  return recorderManager;
}

function stopListeningSpeakingRecording({ isCancel = false }: { isCancel?: boolean } = {}) {
  const recorderManager = listeningSpeakingRecorderManager;

  if (!recorderManager) {
    return;
  }

  shouldCancelListeningSpeakingRecording = isCancel;

  try {
    recorderManager.stop();
  } catch {
    shouldCancelListeningSpeakingRecording = false;
  }
}

function stopMemoryWordAudio() {
  if (!memoryWordAudioContext) {
    return;
  }

  try {
    memoryWordAudioContext.stop();
  } catch {
    // Best-effort cleanup; playback errors are surfaced from play callbacks.
  }
}

function releaseMemoryWordAudio() {
  if (!memoryWordAudioContext) {
    return;
  }

  stopMemoryWordAudio();

  try {
    memoryWordAudioContext.destroy();
  } catch {
    // Best-effort cleanup when the page unloads or a new word starts.
  }

  memoryWordAudioContext = undefined;
}

function playMemoryWordAudio(src: SceneMemoryWordCard["audioUrl"], onError: () => void) {
  releaseMemoryWordAudio();

  try {
    const audioContext = wx.createInnerAudioContext();
    memoryWordAudioContext = audioContext;
    audioContext.src = src;
    audioContext.onError(onError);
    audioContext.play();
  } catch {
    onError();
  }
}

function stopListeningWritingAudio() {
  if (!listeningWritingAudioContext) {
    return;
  }

  try {
    listeningWritingAudioContext.stop();
  } catch {
    // Best-effort cleanup; playback errors are surfaced from play callbacks.
  }
}

function releaseListeningWritingAudio() {
  if (!listeningWritingAudioContext) {
    return;
  }

  stopListeningWritingAudio();

  try {
    listeningWritingAudioContext.destroy();
  } catch {
    // Best-effort cleanup when the page unloads or a new prompt starts.
  }

  listeningWritingAudioContext = undefined;
}

function stopListeningWritingFeedbackAudio() {
  if (!listeningWritingFeedbackAudioContext) {
    return;
  }

  try {
    listeningWritingFeedbackAudioContext.stop();
  } catch {
    // Best-effort cleanup for short UI feedback sounds.
  }
}

function releaseListeningWritingFeedbackAudio() {
  if (!listeningWritingFeedbackAudioContext) {
    return;
  }

  stopListeningWritingFeedbackAudio();

  try {
    listeningWritingFeedbackAudioContext.destroy();
  } catch {
    // Best-effort cleanup when replacing a short UI feedback sound.
  }

  listeningWritingFeedbackAudioContext = undefined;
}

function playListeningWritingFeedbackSound(kind: "correct" | "wrong") {
  releaseListeningWritingFeedbackAudio();

  const src =
    kind === "correct" ? LISTENING_WRITING_CORRECT_SOUND_URL : LISTENING_WRITING_WRONG_SOUND_URL;

  try {
    const audioContext = wx.createInnerAudioContext();
    listeningWritingFeedbackAudioContext = audioContext;
    audioContext.src = src;
    audioContext.volume = kind === "wrong" ? 0.44 : 0.62;
    audioContext.play();
  } catch {
    // Feedback sounds should never block the learning flow.
  }
}

function playListeningWritingAudio(
  src: SceneListeningWritingQuestion["audioUrl"],
  onError: () => void,
  onEnded: () => void
) {
  releaseListeningWritingAudio();

  try {
    const audioContext = wx.createInnerAudioContext();
    listeningWritingAudioContext = audioContext;
    audioContext.src = src;
    audioContext.onError(onError);
    audioContext.onEnded(onEnded);
    audioContext.play();
  } catch {
    onError();
  }
}

function stopListeningSpeakingAudio() {
  if (!listeningSpeakingAudioContext) {
    return;
  }

  try {
    listeningSpeakingAudioContext.stop();
  } catch {
    // Best-effort cleanup; playback errors are surfaced from play callbacks.
  }
}

function releaseListeningSpeakingAudio() {
  if (!listeningSpeakingAudioContext) {
    return;
  }

  stopListeningSpeakingAudio();

  try {
    listeningSpeakingAudioContext.destroy();
  } catch {
    // Best-effort cleanup when the page unloads or a new prompt starts.
  }

  listeningSpeakingAudioContext = undefined;
}

function playListeningSpeakingAudio(
  src: SceneListeningSpeakingQuestion["audioUrl"],
  onError: () => void,
  onEnded: () => void
) {
  releaseListeningSpeakingAudio();

  try {
    const audioContext = wx.createInnerAudioContext();
    listeningSpeakingAudioContext = audioContext;
    audioContext.src = src;
    audioContext.onError(onError);
    audioContext.onEnded(onEnded);
    audioContext.play();
  } catch {
    onError();
  }
}

function refreshSceneProgress(sceneId: Scene["id"]) {
  const scene = getSceneById(sceneId);

  if (!scene) {
    return {};
  }

  const progress = getSceneProgress(scene.id);
  const learnedCount = progress.learnedWordIds.length;

  return {
    progressLabel: `Learned ${learnedCount} / ${scene.wordCount}`,
    progressPercent: scene.wordCount > 0 ? Math.round((learnedCount / scene.wordCount) * 100) : 0
  };
}

function shuffleWords<T>(items: T[]): T[] {
  return items
    .map((item, index) => ({
      item,
      index,
      sortKey: Math.random()
    }))
    .sort((first, second) => first.sortKey - second.sortKey || first.index - second.index)
    .map(({ item }) => item);
}

function createPracticeQuizRound({
  sceneId,
  mode,
  words,
  learnedWordIds,
  excludeWordIds = []
}: {
  sceneId: Scene["id"];
  mode: Exclude<StudyMode, "memory">;
  words: Word[];
  learnedWordIds: Word["id"][];
  excludeWordIds?: Word["id"][];
}): QuizRound {
  const learnedWordIdSet = new Set(learnedWordIds);
  const excludedWordIdSet = new Set(excludeWordIds);
  const learnedWords = words.filter((word) => learnedWordIdSet.has(word.id));
  const unlearnedWords = words.filter((word) => !learnedWordIdSet.has(word.id));
  const orderedWords = [...shuffleWords(learnedWords), ...shuffleWords(unlearnedWords)];
  const availableWords = orderedWords.filter((word) => !excludedWordIdSet.has(word.id));
  const fallbackWords = orderedWords.filter((word) => excludedWordIdSet.has(word.id));
  const selectedWords = [...availableWords, ...fallbackWords].slice(
    0,
    DEFAULT_LISTENING_WRITING_QUESTION_COUNT
  );
  const startedAt = new Date().toISOString();
  const questions: QuizQuestion[] = selectedWords.map((word, index) => ({
    id: `${sceneId}:${mode}:${word.id}:${index + 1}`,
    sceneId,
    wordId: word.id,
    mode
  }));

  return {
    id: `${sceneId}:${mode}:${startedAt}`,
    sceneId,
    mode,
    questions,
    currentIndex: 0,
    startedAt
  };
}

function createListeningSpeakingCompletionStats({
  correctCount,
  mistakeCount,
  newMistakeCount
}: {
  correctCount: number;
  mistakeCount: number;
  newMistakeCount: number;
}): ListeningSpeakingCompletionStats {
  return {
    listeningSpeakingCorrectCount: correctCount,
    listeningSpeakingMistakeCount: mistakeCount,
    listeningSpeakingNewMistakeCount: newMistakeCount
  };
}

function hasSpeakingMistake(sceneId: Scene["id"], wordId: Word["id"]): boolean {
  return getMistakes().some(
    (mistake) =>
      mistake.sceneId === sceneId && mistake.wordId === wordId && mistake.typeStats.speaking
  );
}

type MistakePracticeCandidate = {
  word: Word;
  mistakeType: MistakeType;
  mistakeCount: number;
  masteryProgress: number;
  lastMistakeAt: string;
  wordOrder: number;
};

function createMistakePracticeQuizRound({
  sceneId,
  mode,
  words,
  mistakes,
  targetMistakeType
}: {
  sceneId: Scene["id"];
  mode: "listeningWriting";
  words: Word[];
  mistakes: Mistake[];
  targetMistakeType: MistakeType;
}): QuizRound {
  const wordsById = new Map(words.map((word, index) => [word.id, { word, index }]));
  const candidates: MistakePracticeCandidate[] = mistakes
    .filter((mistake) => mistake.sceneId === sceneId)
    .flatMap((mistake) => {
      const wordEntry = wordsById.get(mistake.wordId);
      const stats = mistake.typeStats[targetMistakeType];

      if (!wordEntry || !stats) {
        return [];
      }

      return [
        {
          word: wordEntry.word,
          mistakeType: targetMistakeType,
          mistakeCount: stats.mistakeCount,
          masteryProgress: stats.masteryProgress,
          lastMistakeAt: stats.lastMistakeAt,
          wordOrder: wordEntry.index
        }
      ];
    })
    .sort(
      (first, second) =>
        first.masteryProgress - second.masteryProgress ||
        second.mistakeCount - first.mistakeCount ||
        second.lastMistakeAt.localeCompare(first.lastMistakeAt) ||
        first.wordOrder - second.wordOrder
    );
  const selectedCandidates = candidates.slice(0, DEFAULT_LISTENING_WRITING_QUESTION_COUNT);
  const startedAt = new Date().toISOString();
  const questions: QuizQuestion[] = selectedCandidates.map((candidate, index) => ({
    id: `${sceneId}:${mode}:${candidate.word.id}:${index + 1}`,
    sceneId,
    wordId: candidate.word.id,
    mode,
    targetMistakeType: candidate.mistakeType
  }));

  return {
    id: `${sceneId}:${mode}:${startedAt}`,
    sceneId,
    mode,
    questions,
    currentIndex: 0,
    startedAt
  };
}

function createListeningWritingModeData(sceneId: Scene["id"], excludeWordIds: Word["id"][] = []) {
  const words = getWordsBySceneId(sceneId);
  const progress = getSceneProgress(sceneId);
  const listeningWritingRound = createPracticeQuizRound({
    sceneId,
    mode: "listeningWriting",
    words,
    learnedWordIds: progress.learnedWordIds,
    excludeWordIds
  });

  return {
    listeningWritingRound,
    listeningWritingState: createListeningWritingStartState(listeningWritingRound, words),
    listeningWritingClickAttemptCount: 0,
    ...LISTENING_WRITING_LISTEN_TASK,
    listeningWritingFeedback: "",
    listeningWritingFeedbackKind: "" as ListeningWritingFeedbackKind,
    listeningWritingPhase: "locating" as const,
    listeningWritingTargetWordId: "",
    listeningWritingCanSelectObject: false,
    listeningWritingSpellingInput: "",
    listeningWritingSpellingAttemptCount: 0,
    listeningWritingAnswerReveal: "",
    listeningWritingIsRoundComplete: false,
    listeningWritingPendingNextQuestion: false,
    listeningWritingPendingNextQuestionIndex: -1,
    listeningWritingContinueLabel: "Continue",
    listeningWritingPracticeMistakeType: "" as MistakeType | ""
  };
}

function createEmptyListeningWritingModeData() {
  return {
    listeningWritingRound: null,
    listeningWritingState: createEmptyListeningWritingState(),
    listeningWritingClickAttemptCount: 0,
    ...LISTENING_WRITING_LISTEN_TASK,
    listeningWritingFeedback: "",
    listeningWritingFeedbackKind: "" as ListeningWritingFeedbackKind,
    listeningWritingPhase: "locating" as const,
    listeningWritingTargetWordId: "",
    listeningWritingCanSelectObject: false,
    listeningWritingSpellingInput: "",
    listeningWritingSpellingAttemptCount: 0,
    listeningWritingAnswerReveal: "",
    listeningWritingIsRoundComplete: false,
    listeningWritingPendingNextQuestion: false,
    listeningWritingPendingNextQuestionIndex: -1,
    listeningWritingContinueLabel: "Continue",
    listeningWritingPracticeMistakeType: "" as MistakeType | ""
  };
}

function createEmptyListeningSpeakingModeData() {
  return {
    listeningSpeakingRound: null,
    listeningSpeakingState: createEmptyListeningSpeakingState(),
    listeningSpeakingClickAttemptCount: 0,
    ...LISTENING_SPEAKING_LISTEN_TASK,
    listeningSpeakingFeedback: "",
    listeningSpeakingFeedbackKind: "" as ListeningSpeakingFeedbackKind,
    listeningSpeakingPhase: "locating" as const,
    listeningSpeakingTargetWordId: "",
    listeningSpeakingCanSelectObject: false,
    ...createListeningSpeakingRecordingData(),
    ...createListeningSpeakingRecognitionData(),
    listeningSpeakingRecognitionAttemptCount: 0,
    listeningSpeakingAnswerReveal: "",
    listeningSpeakingIsRoundComplete: false,
    listeningSpeakingPendingNextQuestion: false,
    listeningSpeakingPendingNextQuestionIndex: -1,
    listeningSpeakingContinueLabel: "Continue",
    ...createListeningSpeakingCompletionStats({
      correctCount: 0,
      mistakeCount: 0,
      newMistakeCount: 0
    })
  };
}

function createSceneHomeModeResetData() {
  return {
    activeMode: "" as const,
    selectedModeTitle: "",
    showMemoryGuide: false,
    showMemoryTranslationGuide: false,
    selectedMemoryWordId: "",
    selectedMemoryWordCard: null,
    ...createEmptyListeningWritingModeData(),
    ...createEmptyListeningSpeakingModeData()
  };
}

function createListeningSpeakingModeData(sceneId: Scene["id"], excludeWordIds: Word["id"][] = []) {
  const words = getWordsBySceneId(sceneId);
  const progress = getSceneProgress(sceneId);
  const listeningSpeakingRound = createPracticeQuizRound({
    sceneId,
    mode: "listeningSpeaking",
    words,
    learnedWordIds: progress.learnedWordIds,
    excludeWordIds
  });

  return {
    listeningSpeakingRound,
    listeningSpeakingState: createListeningSpeakingStartState(listeningSpeakingRound, words),
    listeningSpeakingClickAttemptCount: 0,
    ...LISTENING_SPEAKING_LISTEN_TASK,
    listeningSpeakingFeedback: "",
    listeningSpeakingFeedbackKind: "" as ListeningSpeakingFeedbackKind,
    listeningSpeakingPhase: "locating" as const,
    listeningSpeakingTargetWordId: "",
    listeningSpeakingCanSelectObject: false,
    ...createListeningSpeakingRecordingData(),
    ...createListeningSpeakingRecognitionData(),
    listeningSpeakingRecognitionAttemptCount: 0,
    listeningSpeakingAnswerReveal: "",
    listeningSpeakingIsRoundComplete: false,
    listeningSpeakingPendingNextQuestion: false,
    listeningSpeakingPendingNextQuestionIndex: -1,
    listeningSpeakingContinueLabel: "Continue",
    ...createListeningSpeakingCompletionStats({
      correctCount: 0,
      mistakeCount: 0,
      newMistakeCount: 0
    })
  };
}

function createMistakePracticeModeData(sceneId: Scene["id"], mistakeType: MistakeType) {
  const words = getWordsBySceneId(sceneId);
  const listeningWritingRound = createMistakePracticeQuizRound({
    sceneId,
    mode: "listeningWriting",
    words,
    mistakes: getMistakes(),
    targetMistakeType: mistakeType
  });

  return {
    listeningWritingRound,
    listeningWritingState: createListeningWritingStartState(listeningWritingRound, words),
    listeningWritingClickAttemptCount: 0,
    ...LISTENING_WRITING_LISTEN_TASK,
    listeningWritingFeedback: "",
    listeningWritingFeedbackKind: "" as ListeningWritingFeedbackKind,
    listeningWritingPhase: "locating" as const,
    listeningWritingTargetWordId: "",
    listeningWritingCanSelectObject: false,
    listeningWritingSpellingInput: "",
    listeningWritingSpellingAttemptCount: 0,
    listeningWritingAnswerReveal: "",
    listeningWritingIsRoundComplete: false,
    listeningWritingPendingNextQuestion: false,
    listeningWritingPendingNextQuestionIndex: -1,
    listeningWritingContinueLabel: "Continue",
    listeningWritingPracticeMistakeType: mistakeType
  };
}

const defaultScene = getSceneById("classroom");
const defaultProgress = {
  sceneId: "classroom",
  learnedWordIds: [],
  completedMemoryCount: 0,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: ""
};

Page({
  data: defaultScene
    ? createSceneViewModel(defaultScene, defaultProgress, getWordsBySceneId(defaultScene.id))
    : ({} as SceneViewModel),

  onLoad(options: ScenePageOptions) {
    const sceneId = options.sceneId ?? "classroom";
    const scene = getSceneById(sceneId);

    if (!scene || scene.status !== "available") {
      wx.showToast({
        title: feedbackCopy.comingSoon,
        icon: "none"
      });
      return;
    }

    this.setData(
      createSceneViewModel(scene, getSceneProgress(scene.id), getWordsBySceneId(scene.id))
    );
  },

  onSceneImageLoad() {
    if (this.data.sceneImageLoadStatus === "idle") {
      return;
    }

    this.setData({
      sceneImageLoadStatus: "idle"
    });
  },

  onSceneImageError() {
    this.setData({
      sceneImageLoadStatus: "failed"
    });
  },

  onRetrySceneImage() {
    this.setData({
      sceneImageLoadStatus: "idle"
    });
  },

  onShow() {
    this.startPendingMistakePracticeIfNeeded();
  },

  startPendingMistakePracticeIfNeeded() {
    const request = consumePendingMistakePracticeRequest();

    if (!request) {
      return;
    }

    const scene = getSceneById(request.sceneId);

    if (!scene || scene.status !== "available") {
      return;
    }

    if (request.mistakeType === "speaking") {
      wx.showToast({
        title: feedbackCopy.speakingMistakePracticeUnavailable,
        icon: "none"
      });
      return;
    }

    const modeEntry = getSceneEntryAction("listeningWriting");
    const selectedMode = createSceneViewModel(
      scene,
      getSceneProgress(scene.id),
      getWordsBySceneId(scene.id)
    ).modeEntries.find((entry) => entry.id === modeEntry.mode);

    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
    stopListeningSpeakingAudio();
    stopListeningSpeakingRecording({ isCancel: true });

    this.setData({
      ...createSceneViewModel(scene, getSceneProgress(scene.id), getWordsBySceneId(scene.id)),
      activeMode: "listeningWriting",
      selectedModeTitle: selectedMode?.title ?? "",
      showMemoryGuide: false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null,
      ...createMistakePracticeModeData(request.sceneId, request.mistakeType),
      ...createEmptyListeningSpeakingModeData()
    });
  },

  onEntryTap(event: SceneEntryTapEvent) {
    const { entryId } = event.currentTarget.dataset;
    const sceneId = this.data.sceneId;

    if (!entryId || !sceneId) {
      return;
    }

    const action = getSceneEntryAction(entryId);
    const selectedMode = this.data.modeEntries.find((entry) => entry.id === action.mode);
    const listeningWritingData =
      action.mode === "listeningWriting"
        ? createListeningWritingModeData(sceneId)
        : createEmptyListeningWritingModeData();
    const listeningSpeakingData =
      action.mode === "listeningSpeaking"
        ? createListeningSpeakingModeData(sceneId)
        : createEmptyListeningSpeakingModeData();

    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
    stopListeningSpeakingAudio();
    stopListeningSpeakingRecording({ isCancel: true });

    this.setData({
      activeMode: action.mode,
      selectedModeTitle: selectedMode?.title ?? "",
      showMemoryGuide: action.mode === "memory" ? shouldShowMemoryGuide() : false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null,
      ...listeningWritingData,
      ...listeningSpeakingData
    });
  },

  onBackToSceneHome() {
    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
    stopListeningSpeakingAudio();
    stopListeningSpeakingRecording({ isCancel: true });

    this.setData(createSceneHomeModeResetData());
  },

  resetInterruptedPracticeState() {
    if (
      this.data.activeMode !== "listeningWriting" &&
      this.data.activeMode !== "listeningSpeaking"
    ) {
      return;
    }

    this.setData(createSceneHomeModeResetData());
  },

  completeMemoryGuideIfNeeded() {
    if (!this.data.showMemoryGuide) {
      return;
    }

    completeMemoryGuide();
    this.setData({
      showMemoryGuide: false
    });
  },

  onMemoryHotspotTap(event: MemoryHotspotTapEvent) {
    const { wordId } = event.currentTarget.dataset;

    if (!wordId) {
      return;
    }

    const selectedWord = getWordById(wordId);

    if (!selectedWord) {
      this.setData({
        selectedMemoryWordId: wordId,
        selectedMemoryWordCard: null,
        showMemoryTranslationGuide: false
      });
      this.completeMemoryGuideIfNeeded();
      return;
    }

    recordLearnedWord(selectedWord.sceneId, selectedWord.id);

    this.setData({
      selectedMemoryWordId: wordId,
      selectedMemoryWordCard: createMemoryWordCard(selectedWord, isFavorite(selectedWord.id)),
      showMemoryTranslationGuide: shouldShowMemoryTranslationGuide(),
      ...refreshSceneProgress(selectedWord.sceneId)
    });
    playMemoryWordAudio(selectedWord.audioUrl, showAudioPlaybackErrorToast);
    this.completeMemoryGuideIfNeeded();
  },

  onToggleMemoryFavorite() {
    const selectedMemoryWordCard = this.data.selectedMemoryWordCard as SceneMemoryWordCard | null;
    const sceneId = this.data.sceneId;

    if (!selectedMemoryWordCard || !sceneId) {
      return;
    }

    const nextIsFavorite = !selectedMemoryWordCard.isFavorite;

    if (nextIsFavorite) {
      addFavorite(selectedMemoryWordCard.wordId, sceneId);
    } else {
      removeFavorite(selectedMemoryWordCard.wordId);
    }

    this.setData({
      selectedMemoryWordCard: {
        ...selectedMemoryWordCard,
        isFavorite: nextIsFavorite
      }
    });
  },

  onDismissMemoryGuide() {
    this.completeMemoryGuideIfNeeded();
  },

  onToggleMemoryTranslation(event: MemoryTranslationTapEvent) {
    const { translationType } = event.currentTarget.dataset;
    const selectedMemoryWordCard = this.data.selectedMemoryWordCard as SceneMemoryWordCard | null;

    if (!selectedMemoryWordCard || !translationType) {
      return;
    }

    const shouldCompleteTranslationGuide = this.data.showMemoryTranslationGuide;

    if (shouldCompleteTranslationGuide) {
      completeMemoryTranslationGuide();
    }

    this.setData({
      selectedMemoryWordCard: {
        ...selectedMemoryWordCard,
        showExpressionCn: !selectedMemoryWordCard.showExpressionCn
      },
      showMemoryTranslationGuide: false
    });
  },

  onCloseMemoryWordCard() {
    stopMemoryWordAudio();

    this.setData({
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null,
      showMemoryTranslationGuide: false
    });
  },

  onPlayMemoryWordAudio() {
    const selectedMemoryWordCard = this.data.selectedMemoryWordCard as SceneMemoryWordCard | null;

    if (!selectedMemoryWordCard) {
      return;
    }

    playMemoryWordAudio(selectedMemoryWordCard.audioUrl, showAudioPlaybackErrorToast);
  },

  onPlayListeningWritingAudio() {
    this.playListeningWritingAudioForCurrentQuestion();
  },

  handleListeningWritingAudioEnded() {
    if (
      this.data.listeningWritingPhase === "spellingReady" ||
      this.data.listeningWritingIsRoundComplete ||
      this.data.listeningWritingPendingNextQuestion
    ) {
      return;
    }

    this.setData({
      listeningWritingCanSelectObject: true,
      ...LISTENING_WRITING_FIND_TASK
    });
  },

  playListeningWritingAudioForCurrentQuestion({
    autoPlayNextQuestion = false
  }: { autoPlayNextQuestion?: boolean } = {}) {
    const listeningWritingState = this.data.listeningWritingState as SceneListeningWritingState;
    const audioUrl = listeningWritingState.currentQuestion?.audioUrl;

    if (!audioUrl) {
      return;
    }

    if (
      this.data.listeningWritingPhase !== "spellingReady" &&
      !this.data.listeningWritingPendingNextQuestion
    ) {
      this.setData({
        listeningWritingCanSelectObject: false,
        ...(autoPlayNextQuestion ? LISTENING_WRITING_LISTEN_TASK : {})
      });
    }

    playListeningWritingAudio(audioUrl, showAudioPlaybackErrorToast, () => {
      this.handleListeningWritingAudioEnded();
    });
  },

  onListeningWritingHotspotTap(event: ListeningWritingHotspotTapEvent) {
    if (
      this.data.listeningWritingPhase === "spellingReady" ||
      this.data.listeningWritingPendingNextQuestion
    ) {
      return;
    }

    if (!this.data.listeningWritingCanSelectObject) {
      wx.showToast({
        title: feedbackCopy.listenFirst,
        icon: "none"
      });
      return;
    }

    const { wordId } = event.currentTarget.dataset;
    const sceneId = this.data.sceneId;
    const listeningWritingState = this.data.listeningWritingState as SceneListeningWritingState;
    const targetWordId = listeningWritingState.currentQuestion?.wordId;

    if (!wordId || !sceneId || !targetWordId) {
      return;
    }

    if (wordId === targetWordId) {
      recordMistakeCorrectAnswer(targetWordId, "click");
      playListeningWritingFeedbackSound("correct");

      if (this.data.listeningWritingPracticeMistakeType === "click") {
        this.prepareListeningWritingNextStep(feedbackCopy.correctObject, "success");
        return;
      }

      this.setData({
        listeningWritingClickAttemptCount: 0,
        ...LISTENING_WRITING_SPELL_TASK,
        listeningWritingFeedback: "",
        listeningWritingFeedbackKind: "",
        listeningWritingPhase: "spellingReady",
        listeningWritingTargetWordId: targetWordId,
        listeningWritingSpellingInput: "",
        listeningWritingSpellingAttemptCount: 0,
        listeningWritingAnswerReveal: ""
      });
      return;
    }

    const nextAttemptCount = this.data.listeningWritingClickAttemptCount + 1;

    if (nextAttemptCount === 1) {
      recordMistake(targetWordId, sceneId, "click");
      playListeningWritingFeedbackSound("wrong");
      this.setData({
        listeningWritingClickAttemptCount: nextAttemptCount,
        ...LISTENING_WRITING_FIND_TASK,
        listeningWritingFeedback: feedbackCopy.tryAgain,
        listeningWritingFeedbackKind: "error",
        listeningWritingPhase: "locating",
        listeningWritingTargetWordId: "",
        listeningWritingAnswerReveal: ""
      });
      return;
    }

    playListeningWritingFeedbackSound("wrong");

    if (this.data.listeningWritingPracticeMistakeType === "click") {
      this.prepareListeningWritingNextStep("", "error");
      return;
    }

    this.setData({
      listeningWritingClickAttemptCount: nextAttemptCount,
      ...LISTENING_WRITING_SPELL_TASK,
      listeningWritingFeedback: "",
      listeningWritingFeedbackKind: "error",
      listeningWritingPhase: "spellingReady",
      listeningWritingTargetWordId: targetWordId,
      listeningWritingSpellingInput: "",
      listeningWritingSpellingAttemptCount: 0,
      listeningWritingAnswerReveal: "",
      listeningWritingIsRoundComplete: false
    });
  },

  prepareListeningWritingNextStep(
    feedback: string,
    feedbackKind: Exclude<ListeningWritingFeedbackKind, "">,
    answerReveal = ""
  ) {
    const round = this.data.listeningWritingRound as QuizRound | null;
    const sceneId = this.data.sceneId;

    if (!round || !sceneId) {
      return;
    }

    const nextQuestionIndex = round.currentIndex + 1;
    const hasNextQuestion = nextQuestionIndex < round.questions.length;

    this.setData({
      ...LISTENING_WRITING_REVIEW_TASK,
      listeningWritingFeedback: feedback,
      listeningWritingFeedbackKind: feedbackKind,
      listeningWritingCanSelectObject: false,
      listeningWritingAnswerReveal: answerReveal,
      listeningWritingPendingNextQuestion: true,
      listeningWritingPendingNextQuestionIndex: nextQuestionIndex,
      listeningWritingContinueLabel: hasNextQuestion ? "Continue" : "Finish"
    });
  },

  returnToMistakesAfterPractice() {
    this.onBackToSceneHome();
    wx.navigateTo({ url: "/pages/mistakes/mistakes" });
  },

  onContinueListeningWritingQuestion() {
    const round = this.data.listeningWritingRound as QuizRound | null;
    const sceneId = this.data.sceneId;

    if (!round || !sceneId || !this.data.listeningWritingPendingNextQuestion) {
      return;
    }

    const nextQuestionIndex = this.data.listeningWritingPendingNextQuestionIndex;

    if (nextQuestionIndex >= round.questions.length) {
      if (this.data.listeningWritingPracticeMistakeType) {
        this.returnToMistakesAfterPractice();
        return;
      }

      this.setData({
        ...LISTENING_WRITING_COMPLETE_TASK,
        listeningWritingFeedback: "",
        listeningWritingFeedbackKind: "",
        listeningWritingPhase: "locating",
        listeningWritingTargetWordId: "",
        listeningWritingCanSelectObject: false,
        listeningWritingSpellingInput: "",
        listeningWritingSpellingAttemptCount: 0,
        listeningWritingAnswerReveal: "",
        listeningWritingIsRoundComplete: true,
        listeningWritingPendingNextQuestion: false,
        listeningWritingPendingNextQuestionIndex: -1,
        listeningWritingContinueLabel: "Continue",
        listeningWritingPracticeMistakeType: this.data.listeningWritingPracticeMistakeType
      });
      return;
    }

    const words = getWordsBySceneId(sceneId);
    const nextRound = {
      ...round,
      currentIndex: nextQuestionIndex
    };
    const nextState = createListeningWritingStartState(nextRound, words);

    this.setData({
      listeningWritingRound: nextRound,
      listeningWritingState: nextState,
      listeningWritingClickAttemptCount: 0,
      ...LISTENING_WRITING_LISTEN_TASK,
      listeningWritingFeedback: "",
      listeningWritingFeedbackKind: "",
      listeningWritingPhase: "locating",
      listeningWritingTargetWordId: "",
      listeningWritingCanSelectObject: false,
      listeningWritingSpellingInput: "",
      listeningWritingSpellingAttemptCount: 0,
      listeningWritingAnswerReveal: "",
      listeningWritingIsRoundComplete: false,
      listeningWritingPendingNextQuestion: false,
      listeningWritingPendingNextQuestionIndex: -1,
      listeningWritingContinueLabel: "Continue",
      listeningWritingPracticeMistakeType: this.data.listeningWritingPracticeMistakeType
    });

    if (nextState.currentQuestion?.audioUrl) {
      this.playListeningWritingAudioForCurrentQuestion({ autoPlayNextQuestion: true });
    }
  },

  onListeningWritingSpellingInput(event: ListeningWritingSpellingInputEvent) {
    this.setData({
      listeningWritingSpellingInput: event.detail.value ?? ""
    });
  },

  onSubmitListeningWritingSpelling() {
    const sceneId = this.data.sceneId;
    const targetWordId = this.data.listeningWritingTargetWordId;
    const targetWord = targetWordId ? getWordById(targetWordId) : undefined;

    if (
      this.data.listeningWritingPhase !== "spellingReady" ||
      this.data.listeningWritingPendingNextQuestion ||
      !sceneId ||
      !targetWord
    ) {
      return;
    }

    if (isNormalizedSpellingMatch(this.data.listeningWritingSpellingInput, targetWord.en)) {
      recordMistakeCorrectAnswer(targetWord.id, "spelling");
      playListeningWritingFeedbackSound("correct");
      this.prepareListeningWritingNextStep(feedbackCopy.correctSpelling, "success");
      return;
    }

    const nextAttemptCount = this.data.listeningWritingSpellingAttemptCount + 1;

    if (nextAttemptCount === 1) {
      recordMistake(targetWord.id, sceneId, "spelling");
      playListeningWritingFeedbackSound("wrong");
      this.setData({
        listeningWritingFeedback: feedbackCopy.tryOnceMore,
        listeningWritingFeedbackKind: "error",
        listeningWritingSpellingAttemptCount: nextAttemptCount,
        listeningWritingAnswerReveal: ""
      });
      return;
    }

    playListeningWritingFeedbackSound("wrong");
    const answerRevealData = {
      listeningWritingAnswerReveal: targetWord.en
    };
    this.prepareListeningWritingNextStep(
      "",
      "error",
      answerRevealData.listeningWritingAnswerReveal
    );
  },

  onRestartListeningWritingRound() {
    const sceneId = this.data.sceneId;
    const previousRound = this.data.listeningWritingRound as QuizRound | null;

    if (!sceneId) {
      return;
    }

    const previousWordIds = previousRound
      ? previousRound.questions.map((question) => question.wordId)
      : [];

    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
    this.setData(createListeningWritingModeData(sceneId, previousWordIds));
  },

  onEndListeningWritingPractice() {
    this.onBackToSceneHome();
  },

  onListeningWritingBlankTap() {
    this.showSceneFeedbackToast(feedbackCopy.tapObject);
  },

  onPlayListeningSpeakingAudio() {
    this.playListeningSpeakingAudioForCurrentQuestion();
  },

  handleListeningSpeakingAudioEnded() {
    if (this.data.listeningSpeakingPhase === "recordReady") {
      return;
    }

    this.setData({
      listeningSpeakingCanSelectObject: true,
      ...LISTENING_SPEAKING_FIND_TASK
    });
  },

  playListeningSpeakingAudioForCurrentQuestion() {
    const listeningSpeakingState = this.data.listeningSpeakingState as SceneListeningSpeakingState;
    const audioUrl = listeningSpeakingState.currentQuestion?.audioUrl;

    if (!audioUrl) {
      return;
    }

    if (this.data.listeningSpeakingPhase !== "recordReady") {
      this.setData({
        listeningSpeakingCanSelectObject: false,
        ...LISTENING_SPEAKING_LISTEN_TASK
      });
    }

    playListeningSpeakingAudio(audioUrl, showAudioPlaybackErrorToast, () => {
      this.handleListeningSpeakingAudioEnded();
    });
  },

  onListeningSpeakingHotspotTap(event: ListeningSpeakingHotspotTapEvent) {
    if (this.data.listeningSpeakingPhase === "recordReady") {
      return;
    }

    if (!this.data.listeningSpeakingCanSelectObject) {
      wx.showToast({
        title: feedbackCopy.listenFirst,
        icon: "none"
      });
      return;
    }

    const { wordId } = event.currentTarget.dataset;
    const sceneId = this.data.sceneId;
    const listeningSpeakingState = this.data.listeningSpeakingState as SceneListeningSpeakingState;
    const targetWordId = listeningSpeakingState.currentQuestion?.wordId;

    if (!wordId || !sceneId || !targetWordId) {
      return;
    }

    if (wordId === targetWordId) {
      recordMistakeCorrectAnswer(targetWordId, "click");
      playListeningWritingFeedbackSound("correct");
      this.setData({
        listeningSpeakingClickAttemptCount: 0,
        ...LISTENING_SPEAKING_RECORD_TASK,
        listeningSpeakingFeedback: "",
        listeningSpeakingFeedbackKind: "",
        listeningSpeakingPhase: "recordReady",
        listeningSpeakingTargetWordId: targetWordId,
        listeningSpeakingCanSelectObject: false,
        ...createListeningSpeakingRecordingData(),
        ...createListeningSpeakingRecognitionData(),
        listeningSpeakingRecognitionAttemptCount: 0,
        listeningSpeakingAnswerReveal: "",
        listeningSpeakingIsRoundComplete: false,
        listeningSpeakingPendingNextQuestion: false,
        listeningSpeakingPendingNextQuestionIndex: -1,
        listeningSpeakingContinueLabel: "Continue"
      });
      return;
    }

    const nextAttemptCount = this.data.listeningSpeakingClickAttemptCount + 1;

    if (nextAttemptCount === 1) {
      recordMistake(targetWordId, sceneId, "click");
      playListeningWritingFeedbackSound("wrong");
      this.setData({
        listeningSpeakingClickAttemptCount: nextAttemptCount,
        ...LISTENING_SPEAKING_FIND_TASK,
        listeningSpeakingFeedback: feedbackCopy.tryAgain,
        listeningSpeakingFeedbackKind: "error",
        listeningSpeakingPhase: "locating",
        listeningSpeakingTargetWordId: "",
        ...createListeningSpeakingRecordingData(),
        ...createListeningSpeakingRecognitionData(),
        listeningSpeakingAnswerReveal: "",
        listeningSpeakingPendingNextQuestion: false,
        listeningSpeakingPendingNextQuestionIndex: -1,
        listeningSpeakingContinueLabel: "Continue"
      });
      return;
    }

    playListeningWritingFeedbackSound("wrong");
    this.setData({
      listeningSpeakingClickAttemptCount: nextAttemptCount,
      ...LISTENING_SPEAKING_RECORD_TASK,
      listeningSpeakingFeedback: "",
      listeningSpeakingFeedbackKind: "error",
      listeningSpeakingPhase: "recordReady",
      listeningSpeakingTargetWordId: targetWordId,
      listeningSpeakingCanSelectObject: false,
      ...createListeningSpeakingRecordingData(),
      ...createListeningSpeakingRecognitionData(),
      listeningSpeakingRecognitionAttemptCount: 0,
      listeningSpeakingAnswerReveal: "",
      listeningSpeakingIsRoundComplete: false,
      listeningSpeakingPendingNextQuestion: false,
      listeningSpeakingPendingNextQuestionIndex: -1,
      listeningSpeakingContinueLabel: "Continue"
    });
  },

  onStartListeningSpeakingRecording() {
    if (this.data.listeningSpeakingPhase !== "recordReady") {
      return;
    }

    bindListeningSpeakingRecorder(this as unknown as ListeningSpeakingRecorderOwner);

    wx.authorize({
      scope: "scope.record",
      success: () => {
        this.startListeningSpeakingRecording();
      },
      fail: () => {
        this.handleListeningSpeakingPermissionDenied();
      }
    });
  },

  startListeningSpeakingRecording() {
    if (this.data.listeningSpeakingPhase !== "recordReady") {
      return;
    }

    const recorderManager = bindListeningSpeakingRecorder(
      this as unknown as ListeningSpeakingRecorderOwner
    );
    shouldCancelListeningSpeakingRecording = false;
    listeningSpeakingRecordingStartedAt = Date.now();
    listeningSpeakingRecognitionRequestId += 1;

    this.setData({
      listeningSpeakingRecordingStatus: "recording",
      listeningSpeakingRecordingPath: "",
      listeningSpeakingRecordingDurationMs: 0,
      listeningSpeakingRecordingFeedback: feedbackCopy.recording,
      ...createListeningSpeakingRecognitionData(),
      listeningSpeakingAnswerReveal: "",
      listeningSpeakingPendingNextQuestion: false,
      listeningSpeakingPendingNextQuestionIndex: -1,
      listeningSpeakingContinueLabel: "Continue"
    });

    try {
      recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: "mp3"
      });
    } catch {
      this.handleListeningSpeakingRecordingError();
    }
  },

  onStopListeningSpeakingRecording() {
    if (this.data.listeningSpeakingRecordingStatus !== "recording") {
      return;
    }

    stopListeningSpeakingRecording();
  },

  onCancelListeningSpeakingRecording() {
    if (this.data.listeningSpeakingRecordingStatus !== "recording") {
      return;
    }

    stopListeningSpeakingRecording({ isCancel: true });
  },

  handleListeningSpeakingRecordingStop(result: ListeningSpeakingRecordingStopResult) {
    const durationMs = Math.round(
      result.duration ?? Date.now() - listeningSpeakingRecordingStartedAt
    );

    if (shouldCancelListeningSpeakingRecording) {
      shouldCancelListeningSpeakingRecording = false;
      this.setData({
        ...createListeningSpeakingRecordingData("idle", feedbackCopy.recordingCancelled),
        ...createListeningSpeakingRecognitionData()
      });
      return;
    }

    if (durationMs < MIN_LISTENING_SPEAKING_RECORDING_MS) {
      this.setData({
        listeningSpeakingRecordingStatus: "tooShort",
        listeningSpeakingRecordingPath: "",
        listeningSpeakingRecordingDurationMs: durationMs,
        listeningSpeakingRecordingFeedback: feedbackCopy.recordingTooShort,
        ...createListeningSpeakingRecognitionData(),
        listeningSpeakingAnswerReveal: "",
        listeningSpeakingPendingNextQuestion: false,
        listeningSpeakingPendingNextQuestionIndex: -1,
        listeningSpeakingContinueLabel: "Continue"
      });
      return;
    }

    const recordingPath = result.tempFilePath ?? "";

    this.setData({
      listeningSpeakingRecordingStatus: "recorded",
      listeningSpeakingRecordingPath: recordingPath,
      listeningSpeakingRecordingDurationMs: durationMs,
      listeningSpeakingRecordingFeedback: feedbackCopy.recordingSaved,
      listeningSpeakingRecognitionStatus: "recognizing",
      listeningSpeakingRecognitionTranscript: "",
      listeningSpeakingRecognitionFeedback: feedbackCopy.checkingPronunciation
    });

    void this.recognizeListeningSpeakingRecording(recordingPath);
  },

  async recognizeListeningSpeakingRecording(audioFilePath: string) {
    const targetWordId = this.data.listeningSpeakingTargetWordId;
    const targetWord = targetWordId ? getWordById(targetWordId) : undefined;
    const requestId = ++listeningSpeakingRecognitionRequestId;

    if (!audioFilePath || !targetWord) {
      this.setData({
        listeningSpeakingRecognitionStatus: "failed",
        listeningSpeakingRecognitionTranscript: "",
        listeningSpeakingRecognitionFeedback: feedbackCopy.recognitionFailed
      });
      return;
    }

    this.setData({
      listeningSpeakingRecognitionStatus: "recognizing",
      listeningSpeakingRecognitionTranscript: "",
      listeningSpeakingRecognitionFeedback: feedbackCopy.checkingPronunciation
    });

    try {
      const result = await speechService.recognizeWord(audioFilePath, targetWord.en);

      if (requestId !== listeningSpeakingRecognitionRequestId) {
        return;
      }

      if (result.passed) {
        recordMistakeCorrectAnswer(targetWord.id, "speaking");
        playListeningWritingFeedbackSound("correct");
        this.setData({
          listeningSpeakingCorrectCount: this.data.listeningSpeakingCorrectCount + 1
        });
        this.prepareListeningSpeakingNextStep({
          recognitionStatus: "passed",
          transcript: result.transcript,
          feedback: feedbackCopy.greatPronunciation,
          answerReveal: ""
        });
        return;
      }

      this.handleListeningSpeakingRecognitionFailure(
        targetWord,
        "notRecognized",
        result.transcript,
        feedbackCopy.recognitionNotClear
      );
    } catch {
      if (requestId !== listeningSpeakingRecognitionRequestId) {
        return;
      }

      if (!targetWord) {
        this.setData({
          listeningSpeakingRecognitionStatus: "failed",
          listeningSpeakingRecognitionTranscript: "",
          listeningSpeakingRecognitionFeedback: feedbackCopy.recognitionFailed
        });
        return;
      }

      this.handleListeningSpeakingRecognitionFailure(
        targetWord,
        "failed",
        "",
        feedbackCopy.recognitionFailed
      );
    }
  },

  prepareListeningSpeakingNextStep({
    recognitionStatus,
    transcript,
    feedback,
    answerReveal
  }: {
    recognitionStatus: SceneListeningSpeakingRecognitionStatus;
    transcript: string;
    feedback: string;
    answerReveal: string;
  }) {
    const round = this.data.listeningSpeakingRound as QuizRound | null;
    const nextQuestionIndex = round ? round.currentIndex + 1 : 0;
    const hasNextQuestion = round ? nextQuestionIndex < round.questions.length : false;

    this.setData({
      ...LISTENING_SPEAKING_REVIEW_TASK,
      listeningSpeakingRecognitionStatus: recognitionStatus,
      listeningSpeakingRecognitionTranscript: transcript,
      listeningSpeakingRecognitionFeedback: feedback,
      listeningSpeakingAnswerReveal: answerReveal,
      listeningSpeakingPendingNextQuestion: true,
      listeningSpeakingPendingNextQuestionIndex: nextQuestionIndex,
      listeningSpeakingContinueLabel: hasNextQuestion ? "Continue" : "Finish"
    });
  },

  handleListeningSpeakingRecognitionFailure(
    targetWord: Word,
    recognitionStatus: Extract<SceneListeningSpeakingRecognitionStatus, "notRecognized" | "failed">,
    transcript: string,
    feedback: string
  ) {
    const sceneId = this.data.sceneId;
    const nextAttemptCount = this.data.listeningSpeakingRecognitionAttemptCount + 1;
    const shouldCountMistakeForQuestion = this.data.listeningSpeakingRecognitionAttemptCount === 0;
    const isNewSpeakingMistake =
      shouldCountMistakeForQuestion && sceneId
        ? !hasSpeakingMistake(sceneId, targetWord.id)
        : false;

    if (sceneId) {
      recordMistake(targetWord.id, sceneId, "speaking");
    }

    playListeningWritingFeedbackSound("wrong");

    if (nextAttemptCount >= 2) {
      this.setData({
        listeningSpeakingRecognitionAttemptCount: nextAttemptCount,
        listeningSpeakingMistakeCount:
          this.data.listeningSpeakingMistakeCount + (shouldCountMistakeForQuestion ? 1 : 0),
        listeningSpeakingNewMistakeCount:
          this.data.listeningSpeakingNewMistakeCount + (isNewSpeakingMistake ? 1 : 0)
      });
      this.prepareListeningSpeakingNextStep({
        recognitionStatus,
        transcript,
        feedback,
        answerReveal: targetWord.en
      });
      return;
    }

    this.setData({
      listeningSpeakingRecognitionAttemptCount: nextAttemptCount,
      listeningSpeakingRecognitionStatus: recognitionStatus,
      listeningSpeakingRecognitionTranscript: transcript,
      listeningSpeakingRecognitionFeedback: feedback,
      listeningSpeakingAnswerReveal: "",
      listeningSpeakingPendingNextQuestion: false,
      listeningSpeakingPendingNextQuestionIndex: -1,
      listeningSpeakingContinueLabel: "Continue",
      listeningSpeakingMistakeCount:
        this.data.listeningSpeakingMistakeCount + (shouldCountMistakeForQuestion ? 1 : 0),
      listeningSpeakingNewMistakeCount:
        this.data.listeningSpeakingNewMistakeCount + (isNewSpeakingMistake ? 1 : 0)
    });
  },

  onContinueListeningSpeakingQuestion() {
    const round = this.data.listeningSpeakingRound as QuizRound | null;
    const sceneId = this.data.sceneId;

    if (!round || !sceneId || !this.data.listeningSpeakingPendingNextQuestion) {
      return;
    }

    const nextQuestionIndex = this.data.listeningSpeakingPendingNextQuestionIndex;

    if (nextQuestionIndex >= round.questions.length) {
      this.setData({
        ...LISTENING_SPEAKING_COMPLETE_TASK,
        listeningSpeakingFeedback: "",
        listeningSpeakingFeedbackKind: "",
        listeningSpeakingPhase: "locating",
        listeningSpeakingTargetWordId: "",
        listeningSpeakingCanSelectObject: false,
        ...createListeningSpeakingRecordingData(),
        ...createListeningSpeakingRecognitionData(),
        listeningSpeakingRecognitionAttemptCount: 0,
        listeningSpeakingAnswerReveal: "",
        listeningSpeakingIsRoundComplete: true,
        listeningSpeakingPendingNextQuestion: false,
        listeningSpeakingPendingNextQuestionIndex: -1,
        listeningSpeakingContinueLabel: "Continue",
        ...createListeningSpeakingCompletionStats({
          correctCount: this.data.listeningSpeakingCorrectCount,
          mistakeCount: this.data.listeningSpeakingMistakeCount,
          newMistakeCount: this.data.listeningSpeakingNewMistakeCount
        })
      });
      return;
    }

    const words = getWordsBySceneId(sceneId);
    const nextRound = {
      ...round,
      currentIndex: nextQuestionIndex
    };
    const nextState = createListeningSpeakingStartState(nextRound, words);

    this.setData({
      listeningSpeakingRound: nextRound,
      listeningSpeakingState: nextState,
      listeningSpeakingClickAttemptCount: 0,
      ...LISTENING_SPEAKING_LISTEN_TASK,
      listeningSpeakingFeedback: "",
      listeningSpeakingFeedbackKind: "",
      listeningSpeakingPhase: "locating",
      listeningSpeakingTargetWordId: "",
      listeningSpeakingCanSelectObject: false,
      ...createListeningSpeakingRecordingData(),
      ...createListeningSpeakingRecognitionData(),
      listeningSpeakingRecognitionAttemptCount: 0,
      listeningSpeakingAnswerReveal: "",
      listeningSpeakingIsRoundComplete: false,
      listeningSpeakingPendingNextQuestion: false,
      listeningSpeakingPendingNextQuestionIndex: -1,
      listeningSpeakingContinueLabel: "Continue"
    });

    if (nextState.currentQuestion?.audioUrl) {
      this.playListeningSpeakingAudioForCurrentQuestion();
    }
  },

  onRestartListeningSpeakingRound() {
    const sceneId = this.data.sceneId;
    const previousRound = this.data.listeningSpeakingRound as QuizRound | null;

    if (!sceneId) {
      return;
    }

    const previousWordIds = previousRound
      ? previousRound.questions.map((question) => question.wordId)
      : [];

    stopListeningSpeakingAudio();
    stopListeningSpeakingRecording({ isCancel: true });
    this.setData(createListeningSpeakingModeData(sceneId, previousWordIds));
  },

  onEndListeningSpeakingPractice() {
    this.onBackToSceneHome();
  },

  handleListeningSpeakingRecordingError() {
    this.setData({
      ...createListeningSpeakingRecordingData("idle", feedbackCopy.recordingFailed),
      ...createListeningSpeakingRecognitionData()
    });
  },

  handleListeningSpeakingPermissionDenied() {
    this.setData({
      ...createListeningSpeakingRecordingData(
        "permissionDenied",
        feedbackCopy.microphonePermission
      ),
      ...createListeningSpeakingRecognitionData()
    });
    wx.showModal({
      title: feedbackCopy.microphoneNeededTitle,
      content: feedbackCopy.microphonePermission,
      showCancel: false,
      confirmText: "OK"
    });
  },

  onListeningSpeakingBlankTap() {
    this.showSceneFeedbackToast(feedbackCopy.tapObject);
  },

  onHide() {
    clearSceneFeedbackToastTimer();
    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
    stopListeningSpeakingAudio();
    stopListeningSpeakingRecording({ isCancel: true });
    this.resetInterruptedPracticeState();
  },

  onUnload() {
    clearSceneFeedbackToastTimer();
    stopListeningSpeakingRecording({ isCancel: true });
    releaseMemoryWordAudio();
    releaseListeningWritingAudio();
    releaseListeningWritingFeedbackAudio();
    releaseListeningSpeakingAudio();
  },

  onMemoryBlankTap() {
    wx.showToast({
      title: "试着点击图中的物品",
      icon: "none"
    });
  },

  showSceneFeedbackToast(message: string) {
    clearSceneFeedbackToastTimer();
    this.setData({
      sceneFeedbackToast: message
    });
    sceneFeedbackToastTimer = setTimeout(() => {
      this.setData({
        sceneFeedbackToast: ""
      });
      sceneFeedbackToastTimer = null;
    }, 1600);
  }
});

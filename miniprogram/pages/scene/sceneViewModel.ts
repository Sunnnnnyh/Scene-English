import type {
  MistakeType,
  QuizQuestion,
  QuizRound,
  Scene,
  StudyMode,
  UserProgress,
  Word
} from "../../types";
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

export type SceneMemoryWordCard = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  phonetic: Word["phonetic"];
  audioUrl: Word["audioUrl"];
  isFavorite: boolean;
  expressionEn: Word["expressionEn"];
  expressionCn: Word["expressionCn"];
  showExpressionCn: boolean;
};

export type SceneListeningWritingQuestion = {
  questionId: QuizQuestion["id"];
  wordId: Word["id"];
  audioUrl: Word["audioUrl"];
};

export type SceneListeningWritingState = {
  currentQuestionNumber: number;
  totalQuestionCount: number;
  questionLabel: string;
  currentQuestion: SceneListeningWritingQuestion | null;
};

export type SceneListeningSpeakingQuestion = {
  questionId: QuizQuestion["id"];
  wordId: Word["id"];
  audioUrl: Word["audioUrl"];
};

export type SceneListeningSpeakingState = {
  currentQuestionNumber: number;
  totalQuestionCount: number;
  questionLabel: string;
  currentQuestion: SceneListeningSpeakingQuestion | null;
};

export type SceneListeningSpeakingRecordingStatus =
  | "idle"
  | "recording"
  | "recorded"
  | "tooShort"
  | "permissionDenied";

export type SceneListeningSpeakingRecognitionStatus =
  | "idle"
  | "recognizing"
  | "passed"
  | "notRecognized"
  | "failed";

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
  showMemoryTranslationGuide: boolean;
  memoryGuideWordId: Word["id"];
  selectedMemoryWordId: string;
  selectedMemoryWordCard: SceneMemoryWordCard | null;
  listeningWritingRound: QuizRound | null;
  listeningWritingState: SceneListeningWritingState;
  listeningWritingClickAttemptCount: number;
  listeningWritingStepLabel: string;
  listeningWritingTaskTitle: string;
  listeningWritingInstruction: string;
  listeningWritingFeedback: string;
  listeningWritingFeedbackKind: "" | "success" | "error" | "info";
  listeningWritingPhase: "locating" | "spellingReady";
  listeningWritingTargetWordId: string;
  listeningWritingCanSelectObject: boolean;
  listeningWritingSpellingInput: string;
  listeningWritingSpellingAttemptCount: number;
  listeningWritingIsRoundComplete: boolean;
  listeningWritingPendingNextQuestion: boolean;
  listeningWritingPendingNextQuestionIndex: number;
  listeningWritingContinueLabel: string;
  listeningWritingPracticeMistakeType: MistakeType | "";
  listeningSpeakingRound: QuizRound | null;
  listeningSpeakingState: SceneListeningSpeakingState;
  listeningSpeakingClickAttemptCount: number;
  listeningSpeakingStepLabel: string;
  listeningSpeakingTaskTitle: string;
  listeningSpeakingInstruction: string;
  listeningSpeakingFeedback: string;
  listeningSpeakingFeedbackKind: "" | "success" | "error" | "info";
  listeningSpeakingPhase: "locating" | "recordReady";
  listeningSpeakingTargetWordId: string;
  listeningSpeakingCanSelectObject: boolean;
  listeningSpeakingRecordingStatus: SceneListeningSpeakingRecordingStatus;
  listeningSpeakingRecordingPath: string;
  listeningSpeakingRecordingDurationMs: number;
  listeningSpeakingRecordingFeedback: string;
  listeningSpeakingRecognitionStatus: SceneListeningSpeakingRecognitionStatus;
  listeningSpeakingRecognitionTranscript: string;
  listeningSpeakingRecognitionFeedback: string;
  listeningSpeakingRecognitionAttemptCount: number;
  listeningSpeakingAnswerReveal: string;
  listeningSpeakingIsRoundComplete: boolean;
  listeningSpeakingPendingNextQuestion: boolean;
  listeningSpeakingPendingNextQuestionIndex: number;
  listeningSpeakingContinueLabel: string;
  listeningSpeakingCorrectCount: number;
  listeningSpeakingMistakeCount: number;
  listeningSpeakingNewMistakeCount: number;
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

export function createEmptyListeningWritingState(): SceneListeningWritingState {
  return {
    currentQuestionNumber: 0,
    totalQuestionCount: 0,
    questionLabel: "",
    currentQuestion: null
  };
}

export function createListeningWritingStartState(
  round: QuizRound,
  words: Word[]
): SceneListeningWritingState {
  const currentQuestion = round.questions[round.currentIndex];
  const currentWord = currentQuestion
    ? words.find((word) => word.id === currentQuestion.wordId)
    : undefined;

  if (!currentQuestion || !currentWord) {
    return createEmptyListeningWritingState();
  }

  const currentQuestionNumber = round.currentIndex + 1;
  const totalQuestionCount = round.questions.length;

  return {
    currentQuestionNumber,
    totalQuestionCount,
    questionLabel: `${currentQuestionNumber} / ${totalQuestionCount}`,
    currentQuestion: {
      questionId: currentQuestion.id,
      wordId: currentQuestion.wordId,
      audioUrl: currentWord.audioUrl
    }
  };
}

export function createEmptyListeningSpeakingState(): SceneListeningSpeakingState {
  return {
    currentQuestionNumber: 0,
    totalQuestionCount: 0,
    questionLabel: "",
    currentQuestion: null
  };
}

export function createListeningSpeakingStartState(
  round: QuizRound,
  words: Word[]
): SceneListeningSpeakingState {
  const currentQuestion = round.questions[round.currentIndex];
  const currentWord = currentQuestion
    ? words.find((word) => word.id === currentQuestion.wordId)
    : undefined;

  if (!currentQuestion || !currentWord) {
    return createEmptyListeningSpeakingState();
  }

  const currentQuestionNumber = round.currentIndex + 1;
  const totalQuestionCount = round.questions.length;

  return {
    currentQuestionNumber,
    totalQuestionCount,
    questionLabel: `${currentQuestionNumber} / ${totalQuestionCount}`,
    currentQuestion: {
      questionId: currentQuestion.id,
      wordId: currentQuestion.wordId,
      audioUrl: currentWord.audioUrl
    }
  };
}

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
    showMemoryTranslationGuide: false,
    memoryGuideWordId: "projector",
    selectedMemoryWordId: "",
    selectedMemoryWordCard: null,
    listeningWritingRound: null,
    listeningWritingState: createEmptyListeningWritingState(),
    listeningWritingClickAttemptCount: 0,
    listeningWritingStepLabel: "Listen",
    listeningWritingTaskTitle: "Listen",
    listeningWritingInstruction: "Play audio, then find it.",
    listeningWritingFeedback: "",
    listeningWritingFeedbackKind: "",
    listeningWritingPhase: "locating",
    listeningWritingTargetWordId: "",
    listeningWritingCanSelectObject: false,
    listeningWritingSpellingInput: "",
    listeningWritingSpellingAttemptCount: 0,
    listeningWritingIsRoundComplete: false,
    listeningWritingPendingNextQuestion: false,
    listeningWritingPendingNextQuestionIndex: -1,
    listeningWritingContinueLabel: "Continue",
    listeningWritingPracticeMistakeType: "",
    listeningSpeakingRound: null,
    listeningSpeakingState: createEmptyListeningSpeakingState(),
    listeningSpeakingClickAttemptCount: 0,
    listeningSpeakingStepLabel: "Listen",
    listeningSpeakingTaskTitle: "Listen",
    listeningSpeakingInstruction: "Play audio, then find it.",
    listeningSpeakingFeedback: "",
    listeningSpeakingFeedbackKind: "",
    listeningSpeakingPhase: "locating",
    listeningSpeakingTargetWordId: "",
    listeningSpeakingCanSelectObject: false,
    listeningSpeakingRecordingStatus: "idle",
    listeningSpeakingRecordingPath: "",
    listeningSpeakingRecordingDurationMs: 0,
    listeningSpeakingRecordingFeedback: "",
    listeningSpeakingRecognitionStatus: "idle",
    listeningSpeakingRecognitionTranscript: "",
    listeningSpeakingRecognitionFeedback: "",
    listeningSpeakingRecognitionAttemptCount: 0,
    listeningSpeakingAnswerReveal: "",
    listeningSpeakingIsRoundComplete: false,
    listeningSpeakingPendingNextQuestion: false,
    listeningSpeakingPendingNextQuestionIndex: -1,
    listeningSpeakingContinueLabel: "Continue",
    listeningSpeakingCorrectCount: 0,
    listeningSpeakingMistakeCount: 0,
    listeningSpeakingNewMistakeCount: 0
  };
}

export function createMemoryWordCard(word: Word, isFavorite = false): SceneMemoryWordCard {
  return {
    wordId: word.id,
    en: word.en,
    cn: word.cn,
    phonetic: word.phonetic,
    audioUrl: word.audioUrl,
    isFavorite,
    expressionEn: word.expressionEn,
    expressionCn: word.expressionCn,
    showExpressionCn: false
  };
}

export function getSceneEntryAction(entryId: SceneEntryId): SceneEntryAction {
  return {
    type: "selectMode",
    mode: entryId
  };
}

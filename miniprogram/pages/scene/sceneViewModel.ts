import type {
  MistakeType,
  QuizQuestion,
  QuizRound,
  Scene,
  SceneTutorAskResponse,
  StudyMode,
  UserProgress,
  Word
} from "../../types";
import { createHotspotStyle } from "../../utils/hotspot";
import { sceneTutorCopy } from "../../utils/sceneTutorCopy";

export type SceneEntryId = StudyMode | "sceneTutor";

export type SceneModeEntry = {
  id: StudyMode;
  title: string;
  actionLabel: string;
  isRecommended: boolean;
};

export type SceneTutorEntry = {
  id: "sceneTutor";
  title: string;
  sceneTutorLabel: string;
  supportingText: string;
  capabilityLabels: readonly string[];
  actionLabel: string;
};

export type SceneTutorPanelAction = {
  id: "ask" | "make";
  title: string;
  supportingText: string;
  actionLabel: string;
};

export type SceneTutorPanelAsk = {
  title: string;
  inputPlaceholder: string;
  sendLabel: string;
  recommendedQuestions: readonly string[];
};

export type SceneTutorPanel = {
  title: string;
  sceneNameLabel: string;
  emptyState: string;
  actions: SceneTutorPanelAction[];
  ask: SceneTutorPanelAsk;
  loading: string;
};

export type SceneMemoryHotspot = {
  hotspotId: string;
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

export type SceneWordListItem = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  phonetic: Word["phonetic"];
  isLearned: boolean;
};

export type SceneImageLoadStatus = "idle" | "failed";

export type SceneTutorActiveTool = "home" | "ask" | "make";
export type SceneTutorAskStatus = "idle" | "loading" | "success" | "error";

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
  sceneImageLoadStatus: SceneImageLoadStatus;
  sceneFeedbackToast: string;
  progressLabel: string;
  progressPercent: number;
  modeEntries: SceneModeEntry[];
  sceneTutorEntry: SceneTutorEntry | null;
  activeMode: "" | SceneEntryId;
  selectedModeTitle: string;
  sceneTutorPanel: SceneTutorPanel;
  sceneTutorActiveTool: SceneTutorActiveTool;
  sceneTutorAskInput: string;
  sceneTutorAskCanSubmit: boolean;
  sceneTutorAskStatus: SceneTutorAskStatus;
  sceneTutorAskResult: SceneTutorAskResponse | null;
  sceneTutorAskError: string;
  memoryHotspots: SceneMemoryHotspot[];
  showMemoryGuide: boolean;
  showMemoryTranslationGuide: boolean;
  memoryGuideWordId: Word["id"];
  selectedMemoryWordId: string;
  selectedMemoryWordCard: SceneMemoryWordCard | null;
  showSceneWordList: boolean;
  sceneWordList: SceneWordListItem[];
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
    actionLabel: "Recommended",
    isRecommended: true
  },
  {
    id: "listeningWriting",
    title: "听力 + 默写",
    actionLabel: "Practice",
    isRecommended: false
  },
  {
    id: "listeningSpeaking",
    title: "听力 + 口语",
    actionLabel: "Speak",
    isRecommended: false
  }
];

function createSceneTutorEntry(scene: Scene): SceneTutorEntry | null {
  if (scene.status !== "available") {
    return null;
  }

  return {
    id: "sceneTutor",
    title: sceneTutorCopy.entryTitle,
    sceneTutorLabel: sceneTutorCopy.title,
    supportingText: sceneTutorCopy.entryDescription,
    capabilityLabels: [sceneTutorCopy.ask.title, sceneTutorCopy.make.title],
    actionLabel: "Open"
  };
}

function createSceneTutorPanel(scene: Scene): SceneTutorPanel {
  return {
    title: sceneTutorCopy.title,
    sceneNameLabel: `${scene.nameEn} Scene`,
    emptyState: sceneTutorCopy.emptyState,
    actions: [
      {
        id: "ask",
        title: sceneTutorCopy.ask.title,
        supportingText: sceneTutorCopy.ask.homeSupportingText,
        actionLabel: sceneTutorCopy.ask.homeActionLabel
      },
      {
        id: "make",
        title: sceneTutorCopy.make.title,
        supportingText: sceneTutorCopy.make.homeSupportingText,
        actionLabel: sceneTutorCopy.make.homeActionLabel
      }
    ],
    ask: {
      title: sceneTutorCopy.ask.title,
      inputPlaceholder: sceneTutorCopy.ask.inputPlaceholder,
      sendLabel: sceneTutorCopy.ask.sendLabel,
      recommendedQuestions: sceneTutorCopy.ask.recommendedQuestions
    },
    loading: sceneTutorCopy.loading
  };
}

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
  const learnedWordIdSet = new Set(progress.learnedWordIds);
  const progressPercent =
    scene.wordCount > 0 ? Math.round((learnedCount / scene.wordCount) * 100) : 0;
  const memoryHotspots = words.flatMap((word) =>
    (word.positions ?? [word.position]).map((position, index) => ({
      hotspotId: `${word.id}:${index}`,
      wordId: word.id,
      label: word.en,
      style: createHotspotStyle(position, scene.baseWidth, scene.baseHeight)
    }))
  );
  const sceneWordList = words.map((word) => ({
    wordId: word.id,
    en: word.en,
    cn: word.cn,
    phonetic: word.phonetic,
    isLearned: learnedWordIdSet.has(word.id)
  }));

  return {
    sceneId: scene.id,
    title: `${scene.nameCn} ${scene.nameEn}`,
    sceneNameCn: scene.nameCn,
    sceneNameEn: scene.nameEn,
    sceneImage: scene.sceneImage,
    sceneImageLoadStatus: "idle",
    sceneFeedbackToast: "",
    progressLabel: `Learned ${learnedCount} / ${scene.wordCount}`,
    progressPercent,
    modeEntries,
    sceneTutorEntry: createSceneTutorEntry(scene),
    activeMode: "",
    selectedModeTitle: "",
    sceneTutorPanel: createSceneTutorPanel(scene),
    sceneTutorActiveTool: "home",
    sceneTutorAskInput: "",
    sceneTutorAskCanSubmit: false,
    sceneTutorAskStatus: "idle",
    sceneTutorAskResult: null,
    sceneTutorAskError: "",
    memoryHotspots,
    showMemoryGuide: false,
    showMemoryTranslationGuide: false,
    memoryGuideWordId: "projector",
    selectedMemoryWordId: "",
    selectedMemoryWordCard: null,
    showSceneWordList: false,
    sceneWordList,
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

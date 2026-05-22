import { addFavorite, isFavorite, removeFavorite } from "../../services/favoriteService";
import { getSceneProgress, recordLearnedWord } from "../../services/progressService";
import { recordMistake } from "../../services/mistakeService";
import { getSceneById } from "../../services/sceneService";
import { getWordById, getWordsBySceneId } from "../../services/wordService";
import { isNormalizedSpellingMatch } from "../../utils/normalize";
import {
  completeMemoryGuide,
  completeMemoryTranslationGuide,
  shouldShowMemoryGuide,
  shouldShowMemoryTranslationGuide
} from "../../services/onboardingService";
import {
  createEmptyListeningWritingState,
  createListeningWritingStartState,
  createMemoryWordCard,
  createSceneViewModel,
  getSceneEntryAction,
  type SceneListeningWritingQuestion,
  type SceneListeningWritingState,
  type SceneMemoryWordCard,
  type SceneEntryId,
  type SceneViewModel
} from "./sceneViewModel";
import type { QuizQuestion, QuizRound, Scene, Word } from "../../types";

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

type ListeningWritingFeedbackKind = "" | "success" | "error" | "info";

type ListeningWritingTaskData = {
  listeningWritingStepLabel: string;
  listeningWritingTaskTitle: string;
  listeningWritingInstruction: string;
};

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

let memoryWordAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningWritingAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningWritingFeedbackAudioContext: WechatMiniprogram.InnerAudioContext | undefined;

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
    audioContext.volume = kind === "wrong" ? 0.36 : 0.62;
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

function createPracticeQuizRound({
  sceneId,
  mode,
  words,
  learnedWordIds,
  excludeWordIds = []
}: {
  sceneId: Scene["id"];
  mode: "listeningWriting";
  words: Word[];
  learnedWordIds: Word["id"][];
  excludeWordIds?: Word["id"][];
}): QuizRound {
  const learnedWordIdSet = new Set(learnedWordIds);
  const excludedWordIdSet = new Set(excludeWordIds);
  const learnedWords = words.filter((word) => learnedWordIdSet.has(word.id));
  const unlearnedWords = words.filter((word) => !learnedWordIdSet.has(word.id));
  const orderedWords = [...learnedWords, ...unlearnedWords];
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
    listeningWritingContinueLabel: "Continue"
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
        title: "Coming soon",
        icon: "none"
      });
      return;
    }

    this.setData(
      createSceneViewModel(scene, getSceneProgress(scene.id), getWordsBySceneId(scene.id))
    );
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
        : {
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
            listeningWritingContinueLabel: "Continue"
          };

    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();

    this.setData({
      activeMode: action.mode,
      selectedModeTitle: selectedMode?.title ?? "",
      selectedModeSubtitle: selectedMode?.subtitle ?? "",
      showMemoryGuide: action.mode === "memory" ? shouldShowMemoryGuide() : false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null,
      ...listeningWritingData
    });
  },

  onBackToSceneHome() {
    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();

    this.setData({
      activeMode: "",
      selectedModeTitle: "",
      selectedModeSubtitle: "",
      showMemoryGuide: false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null,
      listeningWritingRound: null,
      listeningWritingState: createEmptyListeningWritingState(),
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
      listeningWritingContinueLabel: "Continue"
    });
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
    playMemoryWordAudio(selectedWord.audioUrl, () => {
      wx.showToast({
        title: "音频暂时无法播放",
        icon: "none"
      });
    });
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

    playMemoryWordAudio(selectedMemoryWordCard.audioUrl, () => {
      wx.showToast({
        title: "音频暂时无法播放",
        icon: "none"
      });
    });
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

    playListeningWritingAudio(
      audioUrl,
      () => {
        wx.showToast({
          title: "音频暂时无法播放",
          icon: "none"
        });
      },
      () => {
        this.handleListeningWritingAudioEnded();
      }
    );
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
        title: "Listen to the word first",
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
      playListeningWritingFeedbackSound("correct");
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
        listeningWritingFeedback: "Try again.",
        listeningWritingFeedbackKind: "error",
        listeningWritingPhase: "locating",
        listeningWritingTargetWordId: "",
        listeningWritingAnswerReveal: ""
      });
      return;
    }

    playListeningWritingFeedbackSound("wrong");
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

  onContinueListeningWritingQuestion() {
    const round = this.data.listeningWritingRound as QuizRound | null;
    const sceneId = this.data.sceneId;

    if (!round || !sceneId || !this.data.listeningWritingPendingNextQuestion) {
      return;
    }

    const nextQuestionIndex = this.data.listeningWritingPendingNextQuestionIndex;

    if (nextQuestionIndex >= round.questions.length) {
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
        listeningWritingContinueLabel: "Continue"
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
      listeningWritingContinueLabel: "Continue"
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
      playListeningWritingFeedbackSound("correct");
      this.prepareListeningWritingNextStep("Correct spelling.", "success");
      return;
    }

    const nextAttemptCount = this.data.listeningWritingSpellingAttemptCount + 1;

    if (nextAttemptCount === 1) {
      recordMistake(targetWord.id, sceneId, "spelling");
      playListeningWritingFeedbackSound("wrong");
      this.setData({
        listeningWritingFeedback: "Try once more.",
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
    wx.showToast({
      title: "Tap an object in the picture",
      icon: "none"
    });
  },

  onHide() {
    stopMemoryWordAudio();
    stopListeningWritingAudio();
    stopListeningWritingFeedbackAudio();
  },

  onUnload() {
    releaseMemoryWordAudio();
    releaseListeningWritingAudio();
    releaseListeningWritingFeedbackAudio();
  },

  onMemoryBlankTap() {
    wx.showToast({
      title: "试着点击图中的物品",
      icon: "none"
    });
  }
});

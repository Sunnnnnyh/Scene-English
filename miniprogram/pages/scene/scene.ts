import { addFavorite, isFavorite, removeFavorite } from "../../services/favoriteService";
import { getSceneProgress, recordLearnedWord } from "../../services/progressService";
import { recordMistake } from "../../services/mistakeService";
import { getSceneById } from "../../services/sceneService";
import { getWordById, getWordsBySceneId } from "../../services/wordService";
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

type MemoryTranslationTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      translationType?: "expression";
    };
  };
};

const DEFAULT_LISTENING_WRITING_QUESTION_COUNT = 5;

let memoryWordAudioContext: WechatMiniprogram.InnerAudioContext | undefined;
let listeningWritingAudioContext: WechatMiniprogram.InnerAudioContext | undefined;

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
  learnedWordIds
}: {
  sceneId: Scene["id"];
  mode: "listeningWriting";
  words: Word[];
  learnedWordIds: Word["id"][];
}): QuizRound {
  const learnedWordIdSet = new Set(learnedWordIds);
  const learnedWords = words.filter((word) => learnedWordIdSet.has(word.id));
  const unlearnedWords = words.filter((word) => !learnedWordIdSet.has(word.id));
  const selectedWords = [...learnedWords, ...unlearnedWords].slice(
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

function createListeningWritingModeData(sceneId: Scene["id"]) {
  const words = getWordsBySceneId(sceneId);
  const progress = getSceneProgress(sceneId);
  const listeningWritingRound = createPracticeQuizRound({
    sceneId,
    mode: "listeningWriting",
    words,
    learnedWordIds: progress.learnedWordIds
  });

  return {
    listeningWritingRound,
    listeningWritingState: createListeningWritingStartState(listeningWritingRound, words),
    listeningWritingClickAttemptCount: 0,
    listeningWritingFeedback: "",
    listeningWritingPhase: "locating" as const,
    listeningWritingTargetWordId: "",
    listeningWritingCanSelectObject: false
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
            listeningWritingFeedback: "",
            listeningWritingPhase: "locating" as const,
            listeningWritingTargetWordId: "",
            listeningWritingCanSelectObject: false
          };

    stopMemoryWordAudio();
    stopListeningWritingAudio();

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
      listeningWritingFeedback: "",
      listeningWritingPhase: "locating",
      listeningWritingTargetWordId: "",
      listeningWritingCanSelectObject: false
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
    const listeningWritingState = this.data.listeningWritingState as SceneListeningWritingState;
    const audioUrl = listeningWritingState.currentQuestion?.audioUrl;

    if (!audioUrl) {
      return;
    }

    this.setData({
      listeningWritingCanSelectObject: false,
      listeningWritingFeedback: ""
    });

    playListeningWritingAudio(
      audioUrl,
      () => {
        wx.showToast({
          title: "音频暂时无法播放",
          icon: "none"
        });
      },
      () => {
        this.setData({
          listeningWritingCanSelectObject: true,
          listeningWritingFeedback: "Now tap the object you heard."
        });
      }
    );
  },

  onListeningWritingHotspotTap(event: ListeningWritingHotspotTapEvent) {
    if (this.data.listeningWritingPhase === "spellingReady") {
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
      this.setData({
        listeningWritingClickAttemptCount: 0,
        listeningWritingFeedback: "Correct! Get ready to spell.",
        listeningWritingPhase: "spellingReady",
        listeningWritingTargetWordId: targetWordId
      });
      return;
    }

    const nextAttemptCount = this.data.listeningWritingClickAttemptCount + 1;

    if (nextAttemptCount === 1) {
      recordMistake(targetWordId, sceneId, "click");
      this.setData({
        listeningWritingClickAttemptCount: nextAttemptCount,
        listeningWritingFeedback: "Try again. Listen once more and tap the matching object.",
        listeningWritingPhase: "locating",
        listeningWritingTargetWordId: ""
      });
      return;
    }

    this.setData({
      listeningWritingClickAttemptCount: nextAttemptCount,
      listeningWritingFeedback: "This is the correct object. Get ready to spell.",
      listeningWritingPhase: "spellingReady",
      listeningWritingTargetWordId: targetWordId
    });
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
  },

  onUnload() {
    releaseMemoryWordAudio();
    releaseListeningWritingAudio();
  },

  onMemoryBlankTap() {
    wx.showToast({
      title: "试着点击图中的物品",
      icon: "none"
    });
  }
});

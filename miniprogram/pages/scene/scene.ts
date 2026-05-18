import { getSceneProgress } from "../../services/progressService";
import { getSceneById } from "../../services/sceneService";
import { getWordById, getWordsBySceneId } from "../../services/wordService";
import {
  completeMemoryGuide,
  completeMemoryTranslationGuide,
  shouldShowMemoryGuide,
  shouldShowMemoryTranslationGuide
} from "../../services/onboardingService";
import {
  createMemoryWordCard,
  createSceneViewModel,
  getSceneEntryAction,
  type SceneMemoryWordCard,
  type SceneEntryId,
  type SceneViewModel
} from "./sceneViewModel";

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

type MemoryTranslationTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      translationType?: "expression";
    };
  };
};

let memoryWordAudioContext: WechatMiniprogram.InnerAudioContext | undefined;

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

    this.setData({
      activeMode: action.mode,
      selectedModeTitle: selectedMode?.title ?? "",
      selectedModeSubtitle: selectedMode?.subtitle ?? "",
      showMemoryGuide: action.mode === "memory" ? shouldShowMemoryGuide() : false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null
    });
  },

  onBackToSceneHome() {
    stopMemoryWordAudio();

    this.setData({
      activeMode: "",
      selectedModeTitle: "",
      selectedModeSubtitle: "",
      showMemoryGuide: false,
      showMemoryTranslationGuide: false,
      selectedMemoryWordId: "",
      selectedMemoryWordCard: null
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

    this.setData({
      selectedMemoryWordId: wordId,
      selectedMemoryWordCard: selectedWord ? createMemoryWordCard(selectedWord) : null,
      showMemoryTranslationGuide: selectedWord ? shouldShowMemoryTranslationGuide() : false
    });
    this.completeMemoryGuideIfNeeded();
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

  onHide() {
    stopMemoryWordAudio();
  },

  onUnload() {
    releaseMemoryWordAudio();
  },

  onMemoryBlankTap() {
    wx.showToast({
      title: "试着点击图中的物品",
      icon: "none"
    });
  }
});

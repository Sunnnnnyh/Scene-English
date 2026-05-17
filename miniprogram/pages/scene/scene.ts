import { getSceneProgress } from "../../services/progressService";
import { getSceneById } from "../../services/sceneService";
import { getWordsBySceneId } from "../../services/wordService";
import {
  createSceneViewModel,
  getSceneEntryAction,
  type SceneMemoryHotspot,
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
      selectedMemoryWordId: "",
      selectedMemoryWordLabel: ""
    });
  },

  onBackToSceneHome() {
    this.setData({
      activeMode: "",
      selectedModeTitle: "",
      selectedModeSubtitle: "",
      selectedMemoryWordId: "",
      selectedMemoryWordLabel: ""
    });
  },

  onMemoryHotspotTap(event: MemoryHotspotTapEvent) {
    const { wordId } = event.currentTarget.dataset;

    if (!wordId) {
      return;
    }

    const selectedHotspot = (this.data.memoryHotspots as SceneMemoryHotspot[]).find(
      (hotspot) => hotspot.wordId === wordId
    );

    this.setData({
      selectedMemoryWordId: wordId,
      selectedMemoryWordLabel: selectedHotspot?.label ?? wordId
    });
  },

  onMemoryBlankTap() {
    wx.showToast({
      title: "试着点击图中的物品",
      icon: "none"
    });
  }
});

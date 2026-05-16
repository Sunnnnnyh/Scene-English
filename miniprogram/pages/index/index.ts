import { getScenes } from "../../services/sceneService";
import { createIndexViewModel, getIndexSceneAction } from "./indexViewModel";

type SceneTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      sceneId?: string;
    };
  };
};

const scenes = getScenes();

Page({
  data: createIndexViewModel(scenes),

  onSceneTap(event: SceneTapEvent) {
    const { sceneId } = event.currentTarget.dataset;

    if (!sceneId) {
      return;
    }

    const action = getIndexSceneAction(sceneId, scenes);

    if (action.type === "navigate") {
      wx.navigateTo({
        url: action.url
      });
      return;
    }

    wx.showToast({
      title: action.message,
      icon: "none"
    });
  }
});

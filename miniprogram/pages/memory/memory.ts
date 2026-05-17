import { getSceneById } from "../../services/sceneService";
import type { Scene } from "../../types";

type MemoryPageOptions = {
  sceneId?: string;
};

function createMemoryPageData(scene: Scene) {
  return {
    sceneId: scene.id,
    title: "单词记忆",
    subtitle: "观察教室里的物品，准备建立物品与英文单词的连接。",
    sceneName: `${scene.nameCn} ${scene.nameEn}`,
    sceneImage: scene.sceneImage,
    imageAspectRatio: `${scene.baseWidth / 120} / ${scene.baseHeight / 120}`,
    backLabel: "返回 Classroom",
    backAction: {
      type: "switchTab",
      url: "/pages/scene/scene"
    }
  };
}

const defaultScene = getSceneById("classroom");

Page({
  data: defaultScene ? createMemoryPageData(defaultScene) : {},

  onLoad(options: MemoryPageOptions) {
    const scene = getSceneById(options.sceneId ?? "classroom");

    if (!scene || scene.status !== "available") {
      wx.showToast({
        title: "Coming soon",
        icon: "none"
      });
      return;
    }

    this.setData(createMemoryPageData(scene));
  },

  onBackToScene() {
    wx.switchTab({
      url: "/pages/scene/scene"
    });
  }
});

import type { Scene } from "../../types";

export type MemoryViewModel = {
  sceneId: Scene["id"];
  title: string;
  sceneName: string;
  sceneImage: string;
  imageAspectRatio: string;
  backLabel: string;
  backAction: {
    type: "switchTab";
    url: string;
  };
};

export function createMemoryViewModel(scene: Scene): MemoryViewModel {
  return {
    sceneId: scene.id,
    title: "单词记忆",
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

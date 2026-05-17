import type { Scene } from "../../types";

export type IndexSceneCard = {
  id: Scene["id"];
  nameCn: Scene["nameCn"];
  nameEn: Scene["nameEn"];
  coverImage: Scene["coverImage"];
  wordCountLabel: string;
  actionLabel: string;
  statusLabel: string;
};

export type IndexViewModel = {
  title: string;
  subtitle: string;
  availableScenes: IndexSceneCard[];
  comingSoonScenes: IndexSceneCard[];
};

export type IndexSceneAction =
  | {
      type: "switchTab";
      url: string;
    }
  | {
      type: "toast";
      message: string;
    };

function createSceneCard(scene: Scene): IndexSceneCard {
  const isAvailable = scene.status === "available";

  return {
    id: scene.id,
    nameCn: scene.nameCn,
    nameEn: scene.nameEn,
    coverImage: scene.coverImage,
    wordCountLabel: isAvailable ? `${scene.wordCount} words` : "More scenes later",
    actionLabel: isAvailable ? "Start learning" : "Locked",
    statusLabel: isAvailable ? "Available now" : "Coming soon"
  };
}

export function createIndexViewModel(scenes: Scene[]): IndexViewModel {
  return {
    title: "SceneEnglish",
    subtitle: "按真实场景学习英语单词",
    availableScenes: scenes.filter((scene) => scene.status === "available").map(createSceneCard),
    comingSoonScenes: scenes.filter((scene) => scene.status === "comingSoon").map(createSceneCard)
  };
}

export function getIndexSceneAction(sceneId: Scene["id"], scenes: Scene[]): IndexSceneAction {
  const scene = scenes.find((item) => item.id === sceneId);

  if (scene?.status === "available") {
    return {
      type: "switchTab",
      url: "/pages/scene/scene"
    };
  }

  return {
    type: "toast",
    message: "Coming soon"
  };
}

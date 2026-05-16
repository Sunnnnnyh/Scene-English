import { comingSoonScenes, availableScenes, scenes } from "../data/scenes";
import type { Scene } from "../types";

export function getScenes(): Scene[] {
  return scenes;
}

export function getAvailableScenes(): Scene[] {
  return availableScenes;
}

export function getComingSoonScenes(): Scene[] {
  return comingSoonScenes;
}

export function getSceneById(sceneId: Scene["id"]): Scene | undefined {
  return scenes.find((scene) => scene.id === sceneId);
}

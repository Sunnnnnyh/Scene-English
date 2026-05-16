import { classroomWords } from "../data/scenes";
import type { Scene, Word } from "../types";

const words: Word[] = classroomWords;

export function getWordsBySceneId(sceneId: Scene["id"]): Word[] {
  return words.filter((word) => word.sceneId === sceneId);
}

export function getWordById(wordId: Word["id"]): Word | undefined {
  return words.find((word) => word.id === wordId);
}

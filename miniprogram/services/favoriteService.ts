import type { Favorite, Scene, Word } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const FAVORITES_DEFAULT: Favorite[] = [];

export function getFavorites(adapter?: StorageAdapter): Favorite[] {
  return readStorage("favorites", FAVORITES_DEFAULT, adapter);
}

export function isFavorite(wordId: Word["id"], adapter?: StorageAdapter): boolean {
  return getFavorites(adapter).some((favorite) => favorite.wordId === wordId);
}

export function addFavorite(
  wordId: Word["id"],
  sceneId: Scene["id"],
  adapter?: StorageAdapter
): Favorite[] {
  const favorites = getFavorites(adapter);

  if (favorites.some((favorite) => favorite.wordId === wordId)) {
    return favorites;
  }

  const nextFavorites = [
    ...favorites,
    {
      wordId,
      sceneId,
      createdAt: new Date().toISOString()
    }
  ];

  writeStorage("favorites", nextFavorites, adapter);

  return nextFavorites;
}

export function removeFavorite(wordId: Word["id"], adapter?: StorageAdapter): Favorite[] {
  const nextFavorites = getFavorites(adapter).filter((favorite) => favorite.wordId !== wordId);

  writeStorage("favorites", nextFavorites, adapter);

  return nextFavorites;
}

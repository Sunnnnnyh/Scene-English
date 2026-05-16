import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite
} from "../miniprogram/services/favoriteService";
import type { StorageAdapter } from "../miniprogram/utils/storage";

type TestStorageAdapter = StorageAdapter & {
  getStorageSync: ReturnType<typeof vi.fn>;
  setStorageSync: ReturnType<typeof vi.fn>;
  removeStorageSync: ReturnType<typeof vi.fn>;
};

const createStorageAdapter = (): TestStorageAdapter => {
  const storage = new Map<string, unknown>();

  return {
    getStorageSync: vi.fn((key: string) => storage.get(key)),
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storage.set(key, value);
    }),
    removeStorageSync: vi.fn((key: string) => {
      storage.delete(key);
    })
  };
};

describe("favoriteService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T03:00:00.000Z"));
  });

  it("returns an empty favorite list before anything is saved", () => {
    const storage = createStorageAdapter();

    expect(getFavorites(storage)).toEqual([]);
  });

  it("adds a favorite and writes it to local storage immediately", () => {
    const storage = createStorageAdapter();

    expect(addFavorite("projector", "classroom", storage)).toEqual([
      {
        wordId: "projector",
        sceneId: "classroom",
        createdAt: "2026-05-16T03:00:00.000Z"
      }
    ]);
    expect(getFavorites(storage)).toEqual([
      {
        wordId: "projector",
        sceneId: "classroom",
        createdAt: "2026-05-16T03:00:00.000Z"
      }
    ]);
    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:favorites", {
      version: 1,
      updatedAt: "2026-05-16T03:00:00.000Z",
      data: [
        {
          wordId: "projector",
          sceneId: "classroom",
          createdAt: "2026-05-16T03:00:00.000Z"
        }
      ]
    });
  });

  it("does not duplicate the same word when favorited repeatedly", () => {
    const storage = createStorageAdapter();

    addFavorite("projector", "classroom", storage);
    vi.setSystemTime(new Date("2026-05-16T04:00:00.000Z"));
    addFavorite("projector", "classroom", storage);

    expect(getFavorites(storage)).toEqual([
      {
        wordId: "projector",
        sceneId: "classroom",
        createdAt: "2026-05-16T03:00:00.000Z"
      }
    ]);
  });

  it("checks favorite state by word id", () => {
    const storage = createStorageAdapter();

    addFavorite("projector", "classroom", storage);

    expect(isFavorite("projector", storage)).toBe(true);
    expect(isFavorite("podium", storage)).toBe(false);
  });

  it("removes a favorite and keeps storage in sync", () => {
    const storage = createStorageAdapter();

    addFavorite("projector", "classroom", storage);
    addFavorite("podium", "classroom", storage);

    expect(removeFavorite("projector", storage)).toEqual([
      {
        wordId: "podium",
        sceneId: "classroom",
        createdAt: "2026-05-16T03:00:00.000Z"
      }
    ]);
    expect(isFavorite("projector", storage)).toBe(false);
    expect(isFavorite("podium", storage)).toBe(true);
    expect(getFavorites(storage)).toHaveLength(1);
  });
});

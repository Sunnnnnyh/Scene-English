import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createLocalStore,
  getStorageKey,
  readStorage,
  removeStorage,
  writeStorage
} from "../miniprogram/utils/storage";

type TestWxStorage = {
  getStorageSync: ReturnType<typeof vi.fn>;
  setStorageSync: ReturnType<typeof vi.fn>;
  removeStorageSync: ReturnType<typeof vi.fn>;
};

const createWxStorage = (): TestWxStorage => {
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

describe("storage util", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T08:00:00.000Z"));
  });

  it("builds SceneEnglish storage keys with the required prefix", () => {
    expect(getStorageKey("favorites")).toBe("sceneenglish:favorites");
    expect(getStorageKey("mistakes")).toBe("sceneenglish:mistakes");
    expect(getStorageKey("progress")).toBe("sceneenglish:progress");
    expect(getStorageKey("settings")).toBe("sceneenglish:settings");
    expect(getStorageKey("onboarding")).toBe("sceneenglish:onboarding");
  });

  it("wraps data with version and updatedAt metadata", () => {
    expect(createLocalStore(["projector"])).toEqual({
      version: 1,
      updatedAt: "2026-05-15T08:00:00.000Z",
      data: ["projector"]
    });
  });

  it("returns the default value when storage is empty", () => {
    const wxStorage = createWxStorage();

    expect(readStorage("favorites", [], wxStorage)).toEqual([]);
    expect(wxStorage.getStorageSync).toHaveBeenCalledWith("sceneenglish:favorites");
  });

  it("writes data and reads the same data back", () => {
    const wxStorage = createWxStorage();
    const favorites = [{ wordId: "projector", sceneId: "classroom" }];

    writeStorage("favorites", favorites, wxStorage);

    expect(wxStorage.setStorageSync).toHaveBeenCalledWith("sceneenglish:favorites", {
      version: 1,
      updatedAt: "2026-05-15T08:00:00.000Z",
      data: favorites
    });
    expect(readStorage("favorites", [], wxStorage)).toEqual(favorites);
  });

  it("falls back to the default value when stored data is malformed", () => {
    const wxStorage = createWxStorage();

    wxStorage.setStorageSync("sceneenglish:progress", { version: 1 });

    expect(readStorage("progress", { learnedWordIds: [] }, wxStorage)).toEqual({
      learnedWordIds: []
    });
  });

  it("falls back to the default value when wx storage throws", () => {
    const wxStorage = createWxStorage();

    wxStorage.getStorageSync.mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(readStorage("onboarding", { memoryGuideCompleted: false }, wxStorage)).toEqual({
      memoryGuideCompleted: false
    });
  });

  it("removes data by the normalized SceneEnglish key", () => {
    const wxStorage = createWxStorage();

    writeStorage("settings", { soundEnabled: true }, wxStorage);
    removeStorage("settings", wxStorage);

    expect(wxStorage.removeStorageSync).toHaveBeenCalledWith("sceneenglish:settings");
    expect(readStorage("settings", { soundEnabled: false }, wxStorage)).toEqual({
      soundEnabled: false
    });
  });
});

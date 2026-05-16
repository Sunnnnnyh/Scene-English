import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSceneProgress,
  recordLearnedWord,
  recordModeCompletion
} from "../miniprogram/services/progressService";
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

describe("progressService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T05:00:00.000Z"));
  });

  it("returns empty scene progress before anything is saved", () => {
    const storage = createStorageAdapter();

    expect(getSceneProgress("classroom", storage)).toEqual({
      sceneId: "classroom",
      learnedWordIds: [],
      completedMemoryCount: 0,
      completedWritingCount: 0,
      completedSpeakingCount: 0,
      updatedAt: "2026-05-16T05:00:00.000Z"
    });
  });

  it("records a learned word and writes progress immediately", () => {
    const storage = createStorageAdapter();

    expect(recordLearnedWord("classroom", "projector", storage)).toEqual({
      sceneId: "classroom",
      learnedWordIds: ["projector"],
      completedMemoryCount: 0,
      completedWritingCount: 0,
      completedSpeakingCount: 0,
      updatedAt: "2026-05-16T05:00:00.000Z"
    });
    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:progress", {
      version: 1,
      updatedAt: "2026-05-16T05:00:00.000Z",
      data: [
        {
          sceneId: "classroom",
          learnedWordIds: ["projector"],
          completedMemoryCount: 0,
          completedWritingCount: 0,
          completedSpeakingCount: 0,
          updatedAt: "2026-05-16T05:00:00.000Z"
        }
      ]
    });
  });

  it("does not count the same learned word twice", () => {
    const storage = createStorageAdapter();

    recordLearnedWord("classroom", "projector", storage);
    recordLearnedWord("classroom", "projector", storage);

    expect(getSceneProgress("classroom", storage).learnedWordIds).toEqual(["projector"]);
  });

  it("increments completion counts for memory, writing, and speaking modes", () => {
    const storage = createStorageAdapter();

    recordModeCompletion("classroom", "memory", storage);
    recordModeCompletion("classroom", "listeningWriting", storage);
    recordModeCompletion("classroom", "listeningWriting", storage);
    recordModeCompletion("classroom", "listeningSpeaking", storage);

    expect(getSceneProgress("classroom", storage)).toMatchObject({
      completedMemoryCount: 1,
      completedWritingCount: 2,
      completedSpeakingCount: 1
    });
  });

  it("keeps progress for different scenes separate", () => {
    const storage = createStorageAdapter();

    recordLearnedWord("classroom", "projector", storage);
    recordModeCompletion("lecture-hall", "memory", storage);

    expect(getSceneProgress("classroom", storage)).toMatchObject({
      sceneId: "classroom",
      learnedWordIds: ["projector"],
      completedMemoryCount: 0
    });
    expect(getSceneProgress("lecture-hall", storage)).toMatchObject({
      sceneId: "lecture-hall",
      learnedWordIds: [],
      completedMemoryCount: 1
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getMistakes,
  recordMistake,
  recordMistakeCorrectAnswer,
  removeMistake
} from "../miniprogram/services/mistakeService";
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

describe("mistakeService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T06:00:00.000Z"));
  });

  it("returns an empty mistake list before anything is saved", () => {
    const storage = createStorageAdapter();

    expect(getMistakes(storage)).toEqual([]);
  });

  it("records a mistake by word and type, then writes it immediately", () => {
    const storage = createStorageAdapter();

    expect(recordMistake("projector", "classroom", "click", storage)).toEqual([
      {
        wordId: "projector",
        sceneId: "classroom",
        lastMistakeAt: "2026-05-16T06:00:00.000Z",
        typeStats: {
          click: {
            mistakeCount: 1,
            correctStreak: 0,
            masteryProgress: 0,
            lastMistakeAt: "2026-05-16T06:00:00.000Z"
          }
        }
      }
    ]);
    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:mistakes", {
      version: 1,
      updatedAt: "2026-05-16T06:00:00.000Z",
      data: [
        {
          wordId: "projector",
          sceneId: "classroom",
          lastMistakeAt: "2026-05-16T06:00:00.000Z",
          typeStats: {
            click: {
              mistakeCount: 1,
              correctStreak: 0,
              masteryProgress: 0,
              lastMistakeAt: "2026-05-16T06:00:00.000Z"
            }
          }
        }
      ]
    });
  });

  it("increments mistake count for repeated mistakes of the same type", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "spelling", storage);
    vi.setSystemTime(new Date("2026-05-16T07:00:00.000Z"));
    recordMistake("projector", "classroom", "spelling", storage);

    expect(getMistakes(storage)[0]).toMatchObject({
      wordId: "projector",
      lastMistakeAt: "2026-05-16T07:00:00.000Z",
      typeStats: {
        spelling: {
          mistakeCount: 2,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T07:00:00.000Z"
        }
      }
    });
  });

  it("keeps different mistake types on the same word", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "click", storage);
    recordMistake("projector", "classroom", "spelling", storage);
    recordMistake("projector", "classroom", "speaking", storage);

    expect(Object.keys(getMistakes(storage)[0].typeStats).sort()).toEqual([
      "click",
      "speaking",
      "spelling"
    ]);
  });

  it("sets mastery progress to 50 after one correct answer for a mistake type", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "click", storage);
    recordMistakeCorrectAnswer("projector", "click", storage);

    expect(getMistakes(storage)[0].typeStats.click).toMatchObject({
      mistakeCount: 1,
      correctStreak: 1,
      masteryProgress: 50
    });
  });

  it("removes a mistake type after two consecutive correct answers", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "click", storage);
    recordMistake("projector", "classroom", "spelling", storage);
    recordMistakeCorrectAnswer("projector", "click", storage);
    recordMistakeCorrectAnswer("projector", "click", storage);

    expect(getMistakes(storage)[0].typeStats.click).toBeUndefined();
    expect(getMistakes(storage)[0].typeStats.spelling).toBeDefined();
  });

  it("removes the word after all mistake types are mastered", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "speaking", storage);
    recordMistakeCorrectAnswer("projector", "speaking", storage);
    recordMistakeCorrectAnswer("projector", "speaking", storage);

    expect(getMistakes(storage)).toEqual([]);
  });

  it("manually removes a mistake word", () => {
    const storage = createStorageAdapter();

    recordMistake("projector", "classroom", "click", storage);
    recordMistake("podium", "classroom", "spelling", storage);

    expect(removeMistake("projector", storage)).toEqual([
      expect.objectContaining({
        wordId: "podium"
      })
    ]);
    expect(getMistakes(storage).map((mistake) => mistake.wordId)).toEqual(["podium"]);
  });
});

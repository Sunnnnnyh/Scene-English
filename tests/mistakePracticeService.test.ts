import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  consumePendingMistakePracticeRequest,
  savePendingMistakePracticeRequest
} from "../miniprogram/services/mistakePracticeService";
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

describe("mistakePracticeService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-24T02:00:00.000Z"));
  });

  it("saves and consumes one pending mistake practice request", () => {
    const storage = createStorageAdapter();

    savePendingMistakePracticeRequest(
      {
        sceneId: "classroom",
        mistakeType: "click"
      },
      storage
    );

    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:settings", {
      version: 1,
      updatedAt: "2026-05-24T02:00:00.000Z",
      data: {
        pendingMistakePracticeRequest: {
          sceneId: "classroom",
          mistakeType: "click",
          createdAt: "2026-05-24T02:00:00.000Z"
        }
      }
    });
    expect(consumePendingMistakePracticeRequest(storage)).toEqual({
      sceneId: "classroom",
      mistakeType: "click",
      createdAt: "2026-05-24T02:00:00.000Z"
    });
    expect(consumePendingMistakePracticeRequest(storage)).toBeNull();
  });
});

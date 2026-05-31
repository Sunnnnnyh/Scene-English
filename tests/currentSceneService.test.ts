import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSelectedSceneId,
  saveSelectedSceneId
} from "../miniprogram/services/currentSceneService";
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

describe("currentSceneService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-30T02:00:00.000Z"));
  });

  it("saves and reads the selected learnable scene id", () => {
    const storage = createStorageAdapter();

    expect(getSelectedSceneId(storage)).toBeNull();

    saveSelectedSceneId("lecture-hall", storage);

    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:settings", {
      version: 1,
      updatedAt: "2026-05-30T02:00:00.000Z",
      data: {
        selectedSceneId: "lecture-hall"
      }
    });
    expect(getSelectedSceneId(storage)).toBe("lecture-hall");
  });
});

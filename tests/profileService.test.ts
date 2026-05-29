import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserProfile, saveUserProfile } from "../miniprogram/services/profileService";
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

describe("profileService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T08:00:00.000Z"));
  });

  it("returns a friendly local default profile before the user edits it", () => {
    const storage = createStorageAdapter();

    expect(getUserProfile(storage)).toEqual({
      nickname: "SceneEnglish Learner",
      signature: "Keep learning from real scenes.",
      avatarText: "SE",
      avatarUrl: "",
      updatedAt: "2026-05-27T08:00:00.000Z"
    });
  });

  it("saves the edited nickname signature and avatar fields locally", () => {
    const storage = createStorageAdapter();

    const profile = saveUserProfile(
      {
        nickname: "Sunny",
        signature: "每天多记一点点",
        avatarText: "SU",
        avatarUrl: "/tmp/avatar.png"
      },
      storage
    );

    expect(profile).toEqual({
      nickname: "Sunny",
      signature: "每天多记一点点",
      avatarText: "SU",
      avatarUrl: "/tmp/avatar.png",
      updatedAt: "2026-05-27T08:00:00.000Z"
    });
    expect(getUserProfile(storage)).toEqual(profile);
    expect(storage.setStorageSync).toHaveBeenCalledWith("sceneenglish:profile", {
      version: 1,
      updatedAt: "2026-05-27T08:00:00.000Z",
      data: profile
    });
  });
});

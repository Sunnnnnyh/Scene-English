import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeMemoryGuide,
  getOnboardingState,
  shouldShowMemoryGuide
} from "../miniprogram/services/onboardingService";

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

describe("onboarding service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T10:00:00.000Z"));
  });

  it("shows the Memory guide before it has been completed", () => {
    const wxStorage = createWxStorage();

    expect(getOnboardingState(wxStorage)).toEqual({
      memoryGuideCompleted: false,
      updatedAt: ""
    });
    expect(shouldShowMemoryGuide(wxStorage)).toBe(true);
  });

  it("persists Memory guide completion and stops showing it", () => {
    const wxStorage = createWxStorage();

    completeMemoryGuide(wxStorage);

    expect(wxStorage.setStorageSync).toHaveBeenCalledWith("sceneenglish:onboarding", {
      version: 1,
      updatedAt: "2026-05-17T10:00:00.000Z",
      data: {
        memoryGuideCompleted: true,
        updatedAt: "2026-05-17T10:00:00.000Z"
      }
    });
    expect(shouldShowMemoryGuide(wxStorage)).toBe(false);
  });
});

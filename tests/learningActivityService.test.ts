import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createLearningActivityChart,
  getLearningActivity,
  recordDailyLearnedWord
} from "../miniprogram/services/learningActivityService";
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

describe("learningActivityService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T08:00:00.000Z"));
  });

  it("records learned words into today's activity bucket", () => {
    const storage = createStorageAdapter();

    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);

    expect(getLearningActivity(storage)).toEqual([
      {
        date: "2026-05-27",
        learnedWordCount: 2,
        updatedAt: "2026-05-27T08:00:00.000Z"
      }
    ]);
  });

  it("creates week and month chart points with zero-filled missing days", () => {
    const storage = createStorageAdapter();
    vi.setSystemTime(new Date("2026-05-26T08:00:00.000Z"));
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);

    vi.setSystemTime(new Date("2026-05-27T08:00:00.000Z"));
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);
    recordDailyLearnedWord(storage);

    const weekChart = createLearningActivityChart("week", storage);
    const monthChart = createLearningActivityChart("month", storage);

    expect(weekChart).toHaveLength(7);
    expect(monthChart).toHaveLength(30);
    expect(weekChart.at(-2)).toMatchObject({
      label: "5/26",
      value: 3,
      heightPercent: 50
    });
    expect(weekChart.at(-1)).toMatchObject({
      label: "5/27",
      value: 6,
      heightPercent: 100
    });
    expect(weekChart[0]).toMatchObject({
      value: 0,
      heightPercent: 0
    });
  });
});

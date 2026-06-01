import { describe, expect, it, vi } from "vitest";

import { addFavorite } from "../miniprogram/services/favoriteService";
import { recordMistake } from "../miniprogram/services/mistakeService";
import { recordLearnedWord } from "../miniprogram/services/progressService";
import { buildSceneTutorLearningSignals } from "../miniprogram/services/sceneTutorContextService";
import { retrieveSceneTutorMatchedWords } from "../miniprogram/services/sceneTutorRetrievalService";
import type { SceneTutorLearningSignals } from "../miniprogram/types";
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

const getSignals = (sceneId: string, storage: StorageAdapter): SceneTutorLearningSignals => {
  const result = buildSceneTutorLearningSignals(sceneId, storage);

  if (!result.ok) {
    throw new Error("Expected available scene signals.");
  }

  return result.signals;
};

describe("sceneTutorRetrievalService", () => {
  it("matches projector inside the Classroom word set", () => {
    const storage = createStorageAdapter();

    const result = retrieveSceneTutorMatchedWords(
      {
        sceneId: "classroom",
        query: "What does projector mean?",
        selectedWordIds: [],
        learningSignals: getSignals("classroom", storage)
      },
      storage
    );

    expect(result).toEqual({
      ok: true,
      matchedWords: [
        expect.objectContaining({
          id: "projector",
          sceneId: "classroom",
          en: "projector"
        })
      ]
    });
  });

  it("keeps Lecture Hall stage retrieval inside the Lecture Hall scene", () => {
    const storage = createStorageAdapter();

    const result = retrieveSceneTutorMatchedWords(
      {
        sceneId: "lecture-hall",
        query: "How do I say stage?",
        selectedWordIds: [],
        learningSignals: getSignals("lecture-hall", storage)
      },
      storage
    );

    expect(result.ok).toBe(true);
    expect(result.ok ? result.matchedWords[0] : undefined).toEqual(
      expect.objectContaining({
        id: "stage",
        sceneId: "lecture-hall",
        en: "stage"
      })
    );
    expect(result.ok ? result.matchedWords : []).not.toContainEqual(
      expect.objectContaining({
        id: "podium",
        sceneId: "classroom"
      })
    );
  });

  it("ranks favorite and mistake words ahead when text matches are otherwise similar", () => {
    const storage = createStorageAdapter();

    addFavorite("whiteboard", "classroom", storage);
    recordMistake("blackboard", "classroom", "spelling", storage);

    const result = retrieveSceneTutorMatchedWords(
      {
        sceneId: "classroom",
        query: "board",
        selectedWordIds: [],
        learningSignals: getSignals("classroom", storage)
      },
      storage
    );

    expect(result.ok ? result.matchedWords.slice(0, 2).map((word) => word.id) : []).toEqual([
      "blackboard",
      "whiteboard"
    ]);
    expect(result.ok ? result.matchedWords[0]?.mistakeTypes : []).toEqual(["spelling"]);
    expect(result.ok ? result.matchedWords[1]?.isFavorite : false).toBe(true);
  });

  it("uses selected words before query-only matches", () => {
    const storage = createStorageAdapter();

    const result = retrieveSceneTutorMatchedWords(
      {
        sceneId: "classroom",
        query: "screen",
        selectedWordIds: ["projector"],
        learningSignals: getSignals("classroom", storage)
      },
      storage
    );

    expect(result.ok ? result.matchedWords[0]?.id : undefined).toBe("projector");
  });

  it("returns current-scene fallback words when there is no query hit", () => {
    const storage = createStorageAdapter();

    recordLearnedWord("lecture-hall", "presentation-screen", storage);
    addFavorite("stage", "lecture-hall", storage);

    const result = retrieveSceneTutorMatchedWords(
      {
        sceneId: "lecture-hall",
        query: "zzzzqwerty",
        selectedWordIds: [],
        learningSignals: getSignals("lecture-hall", storage)
      },
      storage
    );

    expect(result.ok).toBe(true);
    expect(result.ok ? result.matchedWords.length : 0).toBeGreaterThanOrEqual(3);
    expect(result.ok ? result.matchedWords.length : 0).toBeLessThanOrEqual(5);
    expect(
      result.ok ? result.matchedWords.every((word) => word.sceneId === "lecture-hall") : false
    ).toBe(true);
    expect(result.ok ? result.matchedWords.map((word) => word.id) : []).toContain("stage");
  });
});

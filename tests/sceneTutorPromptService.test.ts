import { describe, expect, it, vi } from "vitest";

import { addFavorite } from "../miniprogram/services/favoriteService";
import { recordMistake } from "../miniprogram/services/mistakeService";
import { buildSceneTutorRequestPayload } from "../miniprogram/services/sceneTutorPromptService";
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

describe("sceneTutorPromptService", () => {
  it("builds an Ask AI cloud payload with task, scene, query, matched words, and learning signals", () => {
    const storage = createStorageAdapter();

    addFavorite("projector", "classroom", storage);
    recordMistake("projector", "classroom", "spelling", storage);

    const result = buildSceneTutorRequestPayload(
      {
        task: "ask",
        sceneId: "classroom",
        query: "What is a projector?",
        selectedWordIds: []
      },
      storage
    );

    expect(result).toEqual({
      ok: true,
      payload: {
        task: "ask",
        context: {
          scene: expect.objectContaining({
            id: "classroom",
            nameEn: "Classroom",
            wordCount: 20
          }),
          task: "ask",
          query: "What is a projector?",
          selectedWordIds: [],
          matchedWords: [
            expect.objectContaining({
              id: "projector",
              isFavorite: true,
              mistakeTypes: ["spelling"]
            })
          ],
          learningSignals: {
            favoriteWordIds: ["projector"],
            mistakeWordIds: ["projector"],
            learnedWordIds: [],
            learnedCount: 0,
            totalWordCount: 20
          }
        }
      }
    });
  });

  it("keeps selectedWordIds in a Make Sentences payload", () => {
    const storage = createStorageAdapter();

    const result = buildSceneTutorRequestPayload(
      {
        task: "generate_paragraph",
        sceneId: "lecture-hall",
        query: "Use stage and presentation screen in a short paragraph.",
        selectedWordIds: ["stage", "presentation-screen"]
      },
      storage
    );

    expect(result.ok ? result.payload.context.selectedWordIds : []).toEqual([
      "stage",
      "presentation-screen"
    ]);
    expect(result.ok ? result.payload.context.matchedWords.map((word) => word.id) : []).toContain(
      "stage"
    );
  });

  it("does not include model secrets or raw local storage structures", () => {
    const storage = createStorageAdapter();

    const result = buildSceneTutorRequestPayload(
      {
        task: "ask",
        sceneId: "classroom",
        query: "Tell me about desk.",
        selectedWordIds: []
      },
      storage
    );
    const payloadJson = JSON.stringify(result);

    expect(payloadJson).not.toContain("apiKey");
    expect(payloadJson).not.toContain("LLM_API_KEY");
    expect(payloadJson).not.toContain("providerKey");
    expect(payloadJson).not.toContain("sceneenglish:");
    expect(payloadJson).not.toContain("getStorageSync");
    expect(payloadJson).not.toContain("setStorageSync");
  });

  it("returns a structured unavailable result for an unknown scene", () => {
    const storage = createStorageAdapter();

    expect(
      buildSceneTutorRequestPayload(
        {
          task: "ask",
          sceneId: "unknown-scene",
          query: "What can I learn here?",
          selectedWordIds: []
        },
        storage
      )
    ).toEqual({
      ok: false,
      errorCode: "unavailable",
      message: "Scene Tutor is unavailable for this scene."
    });
  });
});

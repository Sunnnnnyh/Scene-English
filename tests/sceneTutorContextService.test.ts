import { describe, expect, it, vi } from "vitest";

import { addFavorite } from "../miniprogram/services/favoriteService";
import { recordMistake } from "../miniprogram/services/mistakeService";
import { recordLearnedWord } from "../miniprogram/services/progressService";
import {
  buildSceneTutorBaseContext,
  buildSceneTutorLearningSignals
} from "../miniprogram/services/sceneTutorContextService";
import type {
  SceneTutorAskResponse,
  SceneTutorContext,
  SceneTutorLearningSignals,
  SceneTutorMakeSentencesResponse,
  SceneTutorMatchedWord,
  SceneTutorRequestPayload,
  SceneTutorTask
} from "../miniprogram/types";
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

describe("Scene Tutor type contracts", () => {
  it("supports the v2 task set and RAG context payload shape", () => {
    const task: SceneTutorTask = "ask";
    const matchedWord: SceneTutorMatchedWord = {
      id: "projector",
      sceneId: "classroom",
      en: "projector",
      cn: "投影仪",
      phonetic: "/prəˈdʒektər/",
      expressionEn: "The projector needs to be adjusted before everyone can see the slide clearly.",
      expressionCn: "投影仪需要先调一下，大家才能看清幻灯片。",
      isFavorite: true,
      mistakeTypes: ["spelling"],
      isLearned: true
    };
    const learningSignals: SceneTutorLearningSignals = {
      favoriteWordIds: ["projector"],
      mistakeWordIds: ["projector"],
      learnedWordIds: ["projector"],
      learnedCount: 1,
      totalWordCount: 20
    };
    const context: SceneTutorContext = {
      scene: {
        id: "classroom",
        nameEn: "Classroom",
        nameCn: "教室",
        wordCount: 20
      },
      task,
      query: "How do I use projector in a sentence?",
      selectedWordIds: [],
      matchedWords: [matchedWord],
      learningSignals
    };
    const payload: SceneTutorRequestPayload = {
      task,
      context
    };

    expect(payload.context.matchedWords[0]?.mistakeTypes).toEqual(["spelling"]);
    expect(payload.context.learningSignals.favoriteWordIds).toEqual(["projector"]);
  });

  it("supports structured Ask AI and Make Sentences responses", () => {
    const askResponse: SceneTutorAskResponse = {
      type: "ask",
      answer: "A projector shows slides on a screen or wall.",
      example: "The projector needs to be adjusted before class starts.",
      relatedWords: ["projector"],
      basedOn: ["projector"]
    };
    const sentenceResponse: SceneTutorMakeSentencesResponse = {
      type: "generate_sentence",
      generatedText: "The teacher uses the projector to show slides.",
      keyWordsUsed: ["projector"],
      chineseHelp: "老师用投影仪展示幻灯片。",
      trySaying: "Try saying: The teacher uses the projector."
    };

    expect(askResponse.basedOn).toContain("projector");
    expect(sentenceResponse.keyWordsUsed).toEqual(["projector"]);
  });
});

describe("sceneTutorContextService", () => {
  it.each([
    ["classroom", "Classroom"],
    ["lecture-hall", "Lecture Hall"]
  ])("builds empty learning signals for %s", (sceneId, sceneName) => {
    const storage = createStorageAdapter();

    const result = buildSceneTutorLearningSignals(sceneId, storage);

    expect(result).toEqual({
      ok: true,
      scene: expect.objectContaining({
        id: sceneId,
        nameEn: sceneName,
        wordCount: 20
      }),
      signals: {
        favoriteWordIds: [],
        mistakeWordIds: [],
        learnedWordIds: [],
        learnedCount: 0,
        totalWordCount: 20
      }
    });
  });

  it("keeps favorite, mistake, and learned signals scoped to the requested scene", () => {
    const storage = createStorageAdapter();

    addFavorite("projector", "classroom", storage);
    addFavorite("auditorium-seat", "lecture-hall", storage);
    recordMistake("desk", "classroom", "spelling", storage);
    recordMistake("stage", "lecture-hall", "click", storage);
    recordLearnedWord("classroom", "whiteboard", storage);
    recordLearnedWord("lecture-hall", "presentation-screen", storage);

    const result = buildSceneTutorLearningSignals("classroom", storage);

    expect(result).toMatchObject({
      ok: true,
      signals: {
        favoriteWordIds: ["projector"],
        mistakeWordIds: ["desk"],
        learnedWordIds: ["whiteboard"],
        learnedCount: 1,
        totalWordCount: 20
      }
    });
  });

  it("builds a base context with scene metadata and empty matched words before retrieval runs", () => {
    const storage = createStorageAdapter();

    const result = buildSceneTutorBaseContext(
      {
        sceneId: "lecture-hall",
        task: "generate_dialogue",
        query: "Use stage and presentation screen in a short dialogue.",
        selectedWordIds: ["stage", "presentation-screen"]
      },
      storage
    );

    expect(result).toEqual({
      ok: true,
      context: {
        scene: expect.objectContaining({
          id: "lecture-hall",
          nameEn: "Lecture Hall",
          wordCount: 20
        }),
        task: "generate_dialogue",
        query: "Use stage and presentation screen in a short dialogue.",
        selectedWordIds: ["stage", "presentation-screen"],
        matchedWords: [],
        learningSignals: {
          favoriteWordIds: [],
          mistakeWordIds: [],
          learnedWordIds: [],
          learnedCount: 0,
          totalWordCount: 20
        }
      }
    });
  });

  it("returns an unavailable result for an unknown scene id", () => {
    const storage = createStorageAdapter();

    expect(buildSceneTutorLearningSignals("unknown-scene", storage)).toEqual({
      ok: false,
      errorCode: "unavailable",
      message: "Scene Tutor is unavailable for this scene."
    });
  });
});

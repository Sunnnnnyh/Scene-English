import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { handleSceneTutorRequest } = require("../cloudfunctions/sceneTutor/index.js") as {
  handleSceneTutorRequest(event: unknown): Promise<unknown>;
};

const createPayload = (overrides: Record<string, unknown> = {}) => ({
  task: "ask",
  context: {
    scene: {
      id: "classroom",
      nameEn: "Classroom",
      nameCn: "教室",
      wordCount: 20
    },
    task: "ask",
    query: "What is a projector?",
    selectedWordIds: [],
    matchedWords: [
      {
        id: "projector",
        sceneId: "classroom",
        en: "projector",
        cn: "投影仪",
        phonetic: "/prəˈdʒek.tɚ/",
        expressionEn: "The projector needs to be adjusted before class.",
        expressionCn: "上课前需要调整投影仪。",
        isFavorite: false,
        mistakeTypes: [],
        isLearned: false
      }
    ],
    learningSignals: {
      favoriteWordIds: [],
      mistakeWordIds: [],
      learnedWordIds: [],
      learnedCount: 0,
      totalWordCount: 20
    }
  },
  ...overrides
});

describe("cloud sceneTutor function", () => {
  it("accepts a supported Scene Tutor task", async () => {
    await expect(handleSceneTutorRequest(createPayload())).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        task: "ask"
      })
    );
  });

  it("returns a structured error for an unsupported task", async () => {
    await expect(
      handleSceneTutorRequest(
        createPayload({
          task: "free_chat"
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Unsupported Scene Tutor task."
    });
  });

  it("returns a structured error when query is too long", async () => {
    await expect(
      handleSceneTutorRequest(
        createPayload({
          context: {
            ...createPayload().context,
            query: "a".repeat(501)
          }
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Scene Tutor query is too long."
    });
  });
});

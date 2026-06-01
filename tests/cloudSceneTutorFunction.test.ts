import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { handleSceneTutorRequest } = require("../cloudfunctions/sceneTutor/index.js") as {
  handleSceneTutorRequest(
    event: unknown,
    dependencies?: {
      provider?: (input: unknown) => Promise<unknown>;
    }
  ): Promise<unknown>;
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
  it("returns provider_not_configured for a supported task without provider configuration", async () => {
    await expect(handleSceneTutorRequest(createPayload())).resolves.toEqual({
      ok: false,
      errorCode: "provider_not_configured",
      message: "Scene Tutor provider is not configured."
    });
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

  it("returns a structured error when scene id is missing", async () => {
    await expect(
      handleSceneTutorRequest(
        createPayload({
          context: {
            ...createPayload().context,
            scene: {
              nameEn: "Classroom",
              wordCount: 20
            }
          }
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Scene Tutor scene id is required."
    });
  });

  it("returns a structured error when matched words exceed the prompt limit", async () => {
    const matchedWord = createPayload().context.matchedWords[0];

    await expect(
      handleSceneTutorRequest(
        createPayload({
          context: {
            ...createPayload().context,
            matchedWords: Array.from({ length: 6 }, (_, index) => ({
              ...matchedWord,
              id: `word-${index}`
            }))
          }
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Scene Tutor matched words exceed the limit."
    });
  });

  it("returns a structured error when Make Sentences selected words exceed the limit", async () => {
    await expect(
      handleSceneTutorRequest(
        createPayload({
          task: "generate_paragraph",
          context: {
            ...createPayload().context,
            task: "generate_paragraph",
            selectedWordIds: ["one", "two", "three", "four", "five", "six"]
          }
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Scene Tutor selected words exceed the limit."
    });
  });

  it("returns a structured error when the request includes secret-like fields", async () => {
    await expect(
      handleSceneTutorRequest(
        createPayload({
          apiKey: "should-not-be-here"
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "invalid_request",
      message: "Scene Tutor request must not include secret fields."
    });
  });

  it("returns a parsed Ask AI result through the full local handler pipeline", async () => {
    const provider = async () => ({
      ok: true,
      text: JSON.stringify({
        type: "ask",
        answer: "A projector shows slides on a screen.",
        example: "The teacher turns on the projector.",
        relatedWords: ["projector"],
        basedOn: ["projector"]
      }),
      model: "fake-model"
    });

    await expect(
      handleSceneTutorRequest(createPayload(), {
        provider
      })
    ).resolves.toEqual({
      ok: true,
      response: {
        type: "ask",
        answer: "A projector shows slides on a screen.",
        example: "The teacher turns on the projector.",
        relatedWords: ["projector"],
        basedOn: ["projector"]
      },
      model: "fake-model"
    });
  });

  it("returns a parsed Make Sentences result through the full local handler pipeline", async () => {
    const provider = async () => ({
      ok: true,
      text: JSON.stringify({
        type: "generate_sentence",
        generatedText: "The teacher uses the projector.",
        keyWordsUsed: ["projector"],
        chineseHelp: "老师使用投影仪。",
        trySaying: "Try saying: The teacher uses the projector."
      }),
      model: "fake-model"
    });

    await expect(
      handleSceneTutorRequest(
        createPayload({
          task: "generate_sentence",
          context: {
            ...createPayload().context,
            task: "generate_sentence",
            selectedWordIds: ["projector"]
          }
        }),
        {
          provider
        }
      )
    ).resolves.toEqual({
      ok: true,
      response: {
        type: "generate_sentence",
        generatedText: "The teacher uses the projector.",
        keyWordsUsed: ["projector"],
        chineseHelp: "老师使用投影仪。",
        trySaying: "Try saying: The teacher uses the projector."
      },
      model: "fake-model"
    });
  });
});

import { createRequire } from "node:module";

import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { buildSceneTutorPrompt } = require("../cloudfunctions/sceneTutor/promptBuilder.js") as {
  buildSceneTutorPrompt(payload: unknown): { system: string; user: string };
};

const createPayload = (task: string = "ask") => ({
  task,
  context: {
    scene: {
      id: "classroom",
      nameEn: "Classroom",
      nameCn: "教室",
      wordCount: 20
    },
    task,
    query: "What is the difference between projector and screen?",
    selectedWordIds: task === "ask" ? [] : ["projector", "screen"],
    matchedWords: [
      {
        id: "projector",
        sceneId: "classroom",
        en: "projector",
        cn: "投影仪",
        phonetic: "/prəˈdʒek.tɚ/",
        expressionEn: "The projector needs to be adjusted before class.",
        expressionCn: "上课前需要调整投影仪。",
        isFavorite: true,
        mistakeTypes: ["spelling"],
        isLearned: false
      },
      {
        id: "screen",
        sceneId: "classroom",
        en: "screen",
        cn: "屏幕",
        phonetic: "/skriːn/",
        expressionEn: "The screen shows the slides clearly.",
        expressionCn: "屏幕清楚地显示幻灯片。",
        isFavorite: false,
        mistakeTypes: [],
        isLearned: true
      }
    ],
    learningSignals: {
      favoriteWordIds: ["projector"],
      mistakeWordIds: ["projector"],
      learnedWordIds: ["screen"],
      learnedCount: 1,
      totalWordCount: 20
    }
  }
});

describe("cloud sceneTutor promptBuilder", () => {
  afterEach(() => {
    delete process.env.LLM_API_KEY;
  });

  it("builds an Ask AI prompt with scene scope, matched words, and JSON output fields", () => {
    const prompt = buildSceneTutorPrompt(createPayload("ask"));

    expect(prompt.system).toContain("Scene Tutor");
    expect(prompt.system).toContain("JSON");
    expect(prompt.system).toContain("current scene");
    expect(prompt.user).toContain("Classroom");
    expect(prompt.user).toContain("projector");
    expect(prompt.user).toContain("screen");
    expect(prompt.user).toContain("answer");
    expect(prompt.user).toContain("example");
    expect(prompt.user).toContain("relatedWords");
    expect(prompt.user).toContain("basedOn");
  });

  it("builds a Make Sentences prompt with generation task, selected words, and JSON output fields", () => {
    const prompt = buildSceneTutorPrompt(createPayload("generate_paragraph"));

    expect(prompt.user).toContain("generate_paragraph");
    expect(prompt.user).toContain("selected words");
    expect(prompt.user).toContain("projector");
    expect(prompt.user).toContain("screen");
    expect(prompt.user).toContain("generatedText");
    expect(prompt.user).toContain("keyWordsUsed");
    expect(prompt.user).toContain("chineseHelp");
    expect(prompt.user).toContain("trySaying");
  });

  it("does not include API key environment variable values", () => {
    process.env.LLM_API_KEY = "sk-test-secret-value";

    const prompt = buildSceneTutorPrompt(createPayload("ask"));
    const promptJson = JSON.stringify(prompt);

    expect(promptJson).not.toContain("sk-test-secret-value");
    expect(promptJson).not.toContain("LLM_API_KEY");
  });
});

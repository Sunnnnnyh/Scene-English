import { describe, expect, it } from "vitest";

import { sceneTutorCopy } from "../miniprogram/utils/sceneTutorCopy";

const collectTextValues = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectTextValues);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(collectTextValues);
  }

  return [];
};

describe("sceneTutorCopy", () => {
  it("centralizes Scene Tutor user-facing copy", () => {
    expect(sceneTutorCopy.title).toBe("Scene Tutor");
    expect(sceneTutorCopy.entryTitle).toBe("AI 助教");
    expect(sceneTutorCopy.entryDescription).toBe(
      "Ask about words or make sentences from this scene."
    );
    expect(sceneTutorCopy.ask.title).toBe("Ask AI");
    expect(sceneTutorCopy.ask.recommendedQuestions).toEqual([
      "What is the difference between two words?",
      "Which words are most useful in this scene?",
      "How do I use this word in a real sentence?",
      "Can you explain this word simply?"
    ]);
    expect(sceneTutorCopy.ask.inputPlaceholder).toBe("Ask about this scene");
    expect(sceneTutorCopy.ask.sendLabel).toBe("Ask");
    expect(sceneTutorCopy.make.generationTypes).toEqual([
      {
        task: "generate_sentence",
        label: "Single sentence"
      },
      {
        task: "generate_paragraph",
        label: "Short paragraph"
      },
      {
        task: "generate_dialogue",
        label: "Mini dialogue"
      }
    ]);
    expect(sceneTutorCopy.loading).toBe("Thinking with this scene...");
    expect(sceneTutorCopy.errorUnavailable).toBe(
      "AI Tutor is temporarily unavailable. Please try again."
    );
    expect(sceneTutorCopy.outOfScope).toBe(
      "I can help with words and expressions from this scene. Try asking about an object, a word difference, or a sentence you want to make."
    );
    expect(sceneTutorCopy.emptyState).toBe("Choose a tool to start learning with this scene.");
  });

  it("does not expose technical wording in user-facing copy", () => {
    const forbiddenWords = ["rag", "prompt", "token", "api", "provider", "mock", "stack", "key"];
    const allCopy = collectTextValues(sceneTutorCopy).join("\n").toLowerCase();

    for (const forbiddenWord of forbiddenWords) {
      expect(allCopy).not.toMatch(new RegExp(`\\b${forbiddenWord}\\b`));
    }
  });
});

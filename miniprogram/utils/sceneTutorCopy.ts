import type { SceneTutorTask } from "../types";

type SceneTutorGenerationTask = Exclude<SceneTutorTask, "ask">;

export const sceneTutorCopy = {
  title: "Scene Tutor",
  entryTitle: "AI 助教",
  entryDescription: "Ask about words or make sentences from this scene.",
  ask: {
    title: "Ask AI",
    homeSupportingText: "Ask about a word, object, or expression in this scene.",
    homeActionLabel: "Ask",
    inputPlaceholder: "Ask about this scene",
    sendLabel: "Ask",
    recommendedQuestions: [
      "What is the difference between two words?",
      "Which words are most useful in this scene?",
      "How do I use this word in a real sentence?",
      "Can you explain this word simply?"
    ]
  },
  make: {
    title: "Make Sentences",
    homeSupportingText: "Make a sentence, short paragraph, or dialogue with scene words.",
    homeActionLabel: "Make",
    generationTypes: [
      {
        task: "generate_sentence" as SceneTutorGenerationTask,
        label: "Single sentence"
      },
      {
        task: "generate_paragraph" as SceneTutorGenerationTask,
        label: "Short paragraph"
      },
      {
        task: "generate_dialogue" as SceneTutorGenerationTask,
        label: "Mini dialogue"
      }
    ],
    generateWithScene: "Generate with this scene",
    clearSelection: "Clear selection",
    selectedWordsEmpty: "Use the whole scene"
  },
  loading: "Thinking with this scene...",
  errorUnavailable: "AI Tutor is temporarily unavailable. Please try again.",
  outOfScope:
    "I can help with words and expressions from this scene. Try asking about an object, a word difference, or a sentence you want to make.",
  emptyState: "Choose a tool to start learning with this scene."
} as const;

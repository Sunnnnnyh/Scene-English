import { beforeEach, describe, expect, it, vi } from "vitest";

import { classroomWords } from "../miniprogram/data/scenes";
import {
  createMistakePracticeQuizRound,
  createPracticeQuizRound,
  DEFAULT_QUIZ_QUESTION_COUNT
} from "../miniprogram/services/quizService";
import type { Mistake } from "../miniprogram/types";

const words = classroomWords.slice(0, 8);

const createMistake = (
  wordId: string,
  typeStats: Mistake["typeStats"],
  lastMistakeAt = "2026-05-16T06:00:00.000Z"
): Mistake => ({
  wordId,
  sceneId: "classroom",
  typeStats,
  lastMistakeAt
});

describe("quizService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T06:00:00.000Z"));
  });

  it("creates a 5-question practice round from learned words first", () => {
    const round = createPracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningWriting",
      words,
      learnedWordIds: words.slice(0, 6).map((word) => word.id)
    });

    expect(round).toMatchObject({
      sceneId: "classroom",
      mode: "listeningWriting",
      currentIndex: 0,
      startedAt: "2026-05-16T06:00:00.000Z"
    });
    expect(round.questions).toHaveLength(DEFAULT_QUIZ_QUESTION_COUNT);
    expect(round.questions.map((question) => question.wordId)).toEqual(
      words.slice(0, 5).map((word) => word.id)
    );
  });

  it("fills practice questions with unlearned words when learned words are insufficient", () => {
    const round = createPracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningSpeaking",
      words,
      learnedWordIds: [words[2].id, words[5].id]
    });

    expect(round.questions.map((question) => question.wordId)).toEqual([
      words[2].id,
      words[5].id,
      words[0].id,
      words[1].id,
      words[3].id
    ]);
  });

  it("does not repeat practice questions when there are enough words", () => {
    const round = createPracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningWriting",
      words,
      learnedWordIds: words.map((word) => word.id)
    });
    const wordIds = round.questions.map((question) => question.wordId);

    expect(new Set(wordIds).size).toBe(wordIds.length);
  });

  it("gracefully creates a shorter practice round when fewer than 5 words exist", () => {
    const round = createPracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningWriting",
      words: words.slice(0, 2),
      learnedWordIds: [words[0].id]
    });

    expect(round.questions.map((question) => question.wordId)).toEqual([words[0].id, words[1].id]);
  });

  it("prioritizes mistake practice by higher mistake count and lower mastery", () => {
    const mistakes: Mistake[] = [
      createMistake("blackboard", {
        spelling: {
          mistakeCount: 1,
          correctStreak: 1,
          masteryProgress: 50,
          lastMistakeAt: "2026-05-16T05:00:00.000Z"
        }
      }),
      createMistake("projector", {
        click: {
          mistakeCount: 3,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T06:00:00.000Z"
        }
      }),
      createMistake("podium", {
        speaking: {
          mistakeCount: 2,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T04:00:00.000Z"
        }
      })
    ];

    const round = createMistakePracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningSpeaking",
      words,
      mistakes
    });

    expect(round.questions.map((question) => question.wordId)).toEqual([
      "projector",
      "podium",
      "blackboard"
    ]);
    expect(round.questions.map((question) => question.targetMistakeType)).toEqual([
      "click",
      "speaking",
      "spelling"
    ]);
  });

  it("can create mistake practice for one target mistake type", () => {
    const mistakes: Mistake[] = [
      createMistake("projector", {
        click: {
          mistakeCount: 4,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T06:00:00.000Z"
        },
        spelling: {
          mistakeCount: 2,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T06:00:00.000Z"
        }
      }),
      createMistake("podium", {
        spelling: {
          mistakeCount: 3,
          correctStreak: 0,
          masteryProgress: 0,
          lastMistakeAt: "2026-05-16T05:00:00.000Z"
        }
      })
    ];

    const round = createMistakePracticeQuizRound({
      sceneId: "classroom",
      mode: "listeningWriting",
      words,
      mistakes,
      targetMistakeType: "spelling"
    });

    expect(round.questions.map((question) => question.wordId)).toEqual(["podium", "projector"]);
    expect(round.questions.every((question) => question.targetMistakeType === "spelling")).toBe(
      true
    );
  });
});

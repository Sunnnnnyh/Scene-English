import { describe, expect, it, vi } from "vitest";

import {
  requestSceneTutor,
  type SceneTutorCloudAdapter
} from "../miniprogram/services/sceneTutorCloudService";
import type { SceneTutorRequestPayload } from "../miniprogram/types";

const createPayload = (): SceneTutorRequestPayload => ({
  task: "ask",
  context: {
    scene: {
      id: "classroom",
      nameEn: "Classroom",
      nameCn: "Classroom",
      wordCount: 20
    },
    task: "ask",
    query: "What is a projector?",
    selectedWordIds: [],
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

describe("sceneTutorCloudService", () => {
  it("calls the sceneTutor cloud function and returns an Ask AI response", async () => {
    const callFunction = vi.fn(async () => ({
      result: {
        ok: true,
        response: {
          type: "ask",
          answer: "A projector shows slides.",
          example: "The teacher turns on the projector.",
          relatedWords: ["projector"],
          basedOn: ["projector"]
        },
        model: "fake-model"
      }
    }));

    await expect(
      requestSceneTutor(createPayload(), {
        callFunction
      })
    ).resolves.toEqual({
      ok: true,
      response: {
        type: "ask",
        answer: "A projector shows slides.",
        example: "The teacher turns on the projector.",
        relatedWords: ["projector"],
        basedOn: ["projector"]
      },
      model: "fake-model"
    });
    expect(callFunction).toHaveBeenCalledWith({
      name: "sceneTutor",
      data: createPayload()
    });
  });

  it("returns a Make Sentences response", async () => {
    const callFunction = vi.fn(async () => ({
      result: {
        ok: true,
        response: {
          type: "generate_sentence",
          generatedText: "The projector is ready.",
          keyWordsUsed: ["projector"],
          chineseHelp: "投影仪准备好了。",
          trySaying: "Try saying: The projector is ready."
        }
      }
    }));

    await expect(
      requestSceneTutor(
        {
          ...createPayload(),
          task: "generate_sentence",
          context: {
            ...createPayload().context,
            task: "generate_sentence",
            selectedWordIds: ["projector"]
          }
        },
        {
          callFunction
        }
      )
    ).resolves.toEqual({
      ok: true,
      response: {
        type: "generate_sentence",
        generatedText: "The projector is ready.",
        keyWordsUsed: ["projector"],
        chineseHelp: "投影仪准备好了。",
        trySaying: "Try saying: The projector is ready."
      }
    });
  });

  it("returns unavailable when the cloud call rejects", async () => {
    const callFunction = vi.fn(async () => {
      throw new Error("network unavailable");
    });

    await expect(
      requestSceneTutor(createPayload(), {
        callFunction
      })
    ).resolves.toEqual({
      ok: false,
      errorCode: "unavailable",
      message: "AI Tutor is temporarily unavailable. Please try again."
    });
  });

  it("returns unavailable when the cloud result shape is invalid", async () => {
    const callFunction = vi.fn(async () => ({
      result: {
        ok: true,
        response: {
          type: "ask",
          answer: "Missing required fields."
        }
      }
    }));

    await expect(
      requestSceneTutor(createPayload(), {
        callFunction
      })
    ).resolves.toEqual({
      ok: false,
      errorCode: "unavailable",
      message: "AI Tutor is temporarily unavailable. Please try again."
    });
  });

  it("returns unavailable when the cloud call times out", async () => {
    vi.useFakeTimers();

    const callFunction: SceneTutorCloudAdapter["callFunction"] = () =>
      new Promise(() => {
        // Keep the promise pending so the service timeout path wins.
      });
    const resultPromise = requestSceneTutor(createPayload(), {
      callFunction,
      timeoutMs: 10
    });

    await vi.advanceTimersByTimeAsync(11);

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      errorCode: "unavailable",
      message: "AI Tutor is temporarily unavailable. Please try again."
    });

    vi.useRealTimers();
  });

  it("does not pass secret-like fields to the cloud function", async () => {
    const callFunction = vi.fn<SceneTutorCloudAdapter["callFunction"]>(async () => ({
      result: {
        ok: true,
        response: {
          type: "ask",
          answer: "A projector shows slides.",
          example: "The teacher turns on the projector.",
          relatedWords: [],
          basedOn: []
        }
      }
    }));

    await requestSceneTutor(
      {
        ...createPayload(),
        apiKey: "should-not-leave-the-client",
        context: {
          ...createPayload().context,
          token: "also-secret"
        }
      } as SceneTutorRequestPayload,
      {
        callFunction
      }
    );

    expect(callFunction).toHaveBeenCalled();

    const sentOptions = callFunction.mock.lastCall?.[0];

    expect(sentOptions).toBeDefined();

    const sentJson = JSON.stringify(sentOptions?.data);

    expect(sentJson).not.toContain("apiKey");
    expect(sentJson).not.toContain("should-not-leave-the-client");
    expect(sentJson).not.toContain("token");
    expect(sentJson).not.toContain("also-secret");
  });
});

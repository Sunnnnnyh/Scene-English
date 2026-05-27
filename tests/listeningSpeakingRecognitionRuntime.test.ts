/// <reference types="miniprogram-api-typings" />

import { beforeEach, describe, expect, it, vi } from "vitest";

const recognizeWord = vi.fn();

type ListeningSpeakingRuntimeData = {
  listeningSpeakingTargetWordId: string;
  listeningSpeakingRecordingStatus?: unknown;
  listeningSpeakingRecognitionStatus?: unknown;
  listeningSpeakingRecognitionFeedback?: unknown;
};

type ListeningSpeakingRuntimePage = {
  data: ListeningSpeakingRuntimeData;
  setData(update: Partial<ListeningSpeakingRuntimeData>): void;
  handleListeningSpeakingRecordingStop(result: { tempFilePath: string; duration: number }): void;
};

type CapturedPageConfig = Partial<ListeningSpeakingRuntimePage> & Record<string, unknown>;

let pageConfig: CapturedPageConfig;

vi.mock("../miniprogram/services/speechService", () => ({
  speechService: {
    recognizeWord
  }
}));

vi.mock("../miniprogram/services/sceneService", () => ({
  getSceneById: vi.fn(() => ({
    id: "classroom",
    nameCn: "教室",
    nameEn: "Classroom",
    sceneImage: "/assets/images/classroom.png",
    wordCount: 1,
    baseWidth: 100,
    baseHeight: 100,
    status: "available"
  }))
}));

vi.mock("../miniprogram/services/wordService", () => ({
  getWordById: vi.fn(() => ({
    id: "projector",
    sceneId: "classroom",
    en: "projector",
    cn: "投影仪",
    phonetic: "/prəˈdʒektər/",
    audioUrl: "/assets/audio/projector.mp3",
    expressionEn: "Turn on the projector.",
    expressionCn: "打开投影仪。",
    position: {
      x: 0,
      y: 0,
      width: 10,
      height: 10
    }
  })),
  getWordsBySceneId: vi.fn(() => [])
}));

vi.mock("../miniprogram/services/progressService", () => ({
  getSceneProgress: vi.fn(() => ({
    sceneId: "classroom",
    learnedWordIds: [],
    completedMemoryCount: 0,
    completedWritingCount: 0,
    completedSpeakingCount: 0,
    updatedAt: ""
  })),
  recordLearnedWord: vi.fn()
}));

vi.mock("../miniprogram/services/mistakeService", () => ({
  getMistakes: vi.fn(() => []),
  recordMistake: vi.fn(),
  recordMistakeCorrectAnswer: vi.fn()
}));

vi.mock("../miniprogram/services/mistakePracticeService", () => ({
  consumePendingMistakePracticeRequest: vi.fn(() => null)
}));

vi.mock("../miniprogram/services/favoriteService", () => ({
  addFavorite: vi.fn(),
  isFavorite: vi.fn(() => false),
  removeFavorite: vi.fn()
}));

vi.mock("../miniprogram/services/onboardingService", () => ({
  completeMemoryGuide: vi.fn(),
  completeMemoryTranslationGuide: vi.fn(),
  shouldShowMemoryGuide: vi.fn(() => false),
  shouldShowMemoryTranslationGuide: vi.fn(() => false)
}));

describe("Listen + Speak recognition runtime flow", () => {
  beforeEach(async () => {
    vi.resetModules();
    recognizeWord.mockReset();
    recognizeWord.mockResolvedValue({
      transcript: "projector",
      passed: true,
      provider: "mock"
    });
    pageConfig = {};
    (globalThis as unknown as { Page: typeof Page }).Page = vi.fn((config) => {
      pageConfig = config as CapturedPageConfig;
    }) as unknown as typeof Page;
    (globalThis as unknown as { wx: typeof wx }).wx = {
      getRecorderManager: vi.fn(),
      createInnerAudioContext: vi.fn(),
      showModal: vi.fn(),
      showToast: vi.fn(),
      authorize: vi.fn()
    } as unknown as typeof wx;

    await import("../miniprogram/pages/scene/scene");
  });

  it("updates recognition state after a valid recording stop", async () => {
    const data: ListeningSpeakingRuntimeData = {
      listeningSpeakingTargetWordId: "projector"
    };
    const page = {
      ...pageConfig,
      data,
      setData(update: Partial<ListeningSpeakingRuntimeData>) {
        Object.assign(data, update);
      }
    } as ListeningSpeakingRuntimePage;

    await page.handleListeningSpeakingRecordingStop({
      tempFilePath: "/tmp/projector.mp3",
      duration: 1200
    });

    expect(recognizeWord).toHaveBeenCalledWith("/tmp/projector.mp3", "projector");
    expect(data.listeningSpeakingRecognitionStatus).toBe("passed");
    expect(data.listeningSpeakingRecognitionFeedback).toBe("Great pronunciation.");
  });

  it("shows recognition progress before the speech service resolves", () => {
    recognizeWord.mockReturnValue(new Promise(() => undefined));
    const data: ListeningSpeakingRuntimeData = {
      listeningSpeakingTargetWordId: "projector"
    };
    const page = {
      ...pageConfig,
      data,
      setData(update: Partial<ListeningSpeakingRuntimeData>) {
        Object.assign(data, update);
      }
    } as ListeningSpeakingRuntimePage;

    page.handleListeningSpeakingRecordingStop({
      tempFilePath: "/tmp/projector.mp3",
      duration: 1200
    });

    expect(data.listeningSpeakingRecordingStatus).toBe("recorded");
    expect(data.listeningSpeakingRecognitionStatus).toBe("recognizing");
    expect(data.listeningSpeakingRecognitionFeedback).toBe("Checking your pronunciation...");
  });

  it("sets saved recording and recognition progress in the same first update", () => {
    recognizeWord.mockReturnValue(new Promise(() => undefined));
    const updates: Partial<ListeningSpeakingRuntimeData>[] = [];
    const data: ListeningSpeakingRuntimeData = {
      listeningSpeakingTargetWordId: "projector"
    };
    const page = {
      ...pageConfig,
      data,
      setData(update: Partial<ListeningSpeakingRuntimeData>) {
        updates.push(update);
        Object.assign(data, update);
      }
    } as ListeningSpeakingRuntimePage;

    page.handleListeningSpeakingRecordingStop({
      tempFilePath: "/tmp/projector.mp3",
      duration: 1200
    });

    expect(updates[0]).toMatchObject({
      listeningSpeakingRecordingStatus: "recorded",
      listeningSpeakingRecognitionStatus: "recognizing",
      listeningSpeakingRecognitionFeedback: "Checking your pronunciation..."
    });
  });
});

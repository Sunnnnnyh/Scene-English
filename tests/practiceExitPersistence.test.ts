/// <reference types="miniprogram-api-typings" />

import { beforeEach, describe, expect, it, vi } from "vitest";

const recordMistake = vi.fn();
const recordMistakeCorrectAnswer = vi.fn();

type PracticeExitData = Record<string, unknown> & {
  activeMode: string;
  selectedModeTitle?: string;
  selectedModeSubtitle?: string;
  listeningWritingRound?: unknown;
  listeningWritingState?: {
    currentQuestion: unknown;
  };
  listeningWritingPracticeMistakeType?: string;
  listeningSpeakingRound?: unknown;
  listeningSpeakingState?: {
    currentQuestion: unknown;
  };
  listeningSpeakingRecognitionAttemptCount?: number;
  listeningSpeakingIsRoundComplete?: boolean;
};

type PracticeExitPage = {
  data: PracticeExitData;
  setData(update: Partial<PracticeExitData>): void;
  onHide(): void;
};

type CapturedPageConfig = Partial<PracticeExitPage> & Record<string, unknown>;

let pageConfig: CapturedPageConfig;

vi.mock("../miniprogram/services/sceneService", () => ({
  getSceneById: vi.fn(() => ({
    id: "classroom",
    nameCn: "Classroom",
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
    cn: "projector",
    phonetic: "/pruh-jek-ter/",
    audioUrl: "/assets/audio/projector.mp3",
    expressionEn: "Turn on the projector.",
    expressionCn: "Turn on the projector.",
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
  recordMistake,
  recordMistakeCorrectAnswer
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

vi.mock("../miniprogram/services/speechService", () => ({
  speechService: {
    recognizeWord: vi.fn()
  }
}));

describe("mid-practice exit persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    recordMistake.mockReset();
    recordMistakeCorrectAnswer.mockReset();
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

  function createPage(data: PracticeExitData) {
    return {
      ...pageConfig,
      data,
      setData(update: Partial<PracticeExitData>) {
        Object.assign(data, update);
      }
    } as PracticeExitPage;
  }

  it("drops an interrupted Listen + Spell queue without writing extra mistake changes", () => {
    const data: PracticeExitData = {
      activeMode: "listeningWriting",
      selectedModeTitle: "Listen + Spell",
      selectedModeSubtitle: "Halfway",
      listeningWritingRound: {
        questions: [{ wordId: "projector" }, { wordId: "desk" }],
        currentIndex: 1
      },
      listeningWritingState: {
        currentQuestion: { wordId: "desk" }
      },
      listeningWritingPracticeMistakeType: "spelling"
    };
    const page = createPage(data);

    page.onHide();

    expect(data.activeMode).toBe("");
    expect(data.selectedModeTitle).toBe("");
    expect(data.selectedModeSubtitle).toBe("");
    expect(data.listeningWritingRound).toBeNull();
    expect(data.listeningWritingState?.currentQuestion).toBeNull();
    expect(data.listeningWritingPracticeMistakeType).toBe("");
    expect(recordMistake).not.toHaveBeenCalled();
    expect(recordMistakeCorrectAnswer).not.toHaveBeenCalled();
  });

  it("drops an interrupted Listen + Speak queue and resets recognition progress", () => {
    const data: PracticeExitData = {
      activeMode: "listeningSpeaking",
      selectedModeTitle: "Listen + Speak",
      selectedModeSubtitle: "Halfway",
      listeningSpeakingRound: {
        questions: [{ wordId: "projector" }, { wordId: "desk" }],
        currentIndex: 1
      },
      listeningSpeakingState: {
        currentQuestion: { wordId: "desk" }
      },
      listeningSpeakingRecognitionAttemptCount: 1,
      listeningSpeakingIsRoundComplete: false
    };
    const page = createPage(data);

    page.onHide();

    expect(data.activeMode).toBe("");
    expect(data.selectedModeTitle).toBe("");
    expect(data.selectedModeSubtitle).toBe("");
    expect(data.listeningSpeakingRound).toBeNull();
    expect(data.listeningSpeakingState?.currentQuestion).toBeNull();
    expect(data.listeningSpeakingRecognitionAttemptCount).toBe(0);
    expect(data.listeningSpeakingIsRoundComplete).toBe(false);
    expect(recordMistake).not.toHaveBeenCalled();
    expect(recordMistakeCorrectAnswer).not.toHaveBeenCalled();
  });
});

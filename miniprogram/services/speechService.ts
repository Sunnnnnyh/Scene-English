import type { SpeechResult, Word } from "../types";
import { isNormalizedSpellingMatch } from "../utils/normalize";

export type MockSpeechScenario = "auto" | "success" | "failure" | "empty";

export type SpeechRecognitionOptions = {
  scenario?: MockSpeechScenario;
  transcript?: string;
};

export type SpeechServiceOptions = {
  defaultScenario?: MockSpeechScenario;
  random?: () => number;
};

export type SpeechService = {
  recognizeWord(
    audioFilePath: string,
    targetWord: Word["en"],
    options?: SpeechRecognitionOptions
  ): Promise<SpeechResult>;
};

const DEFAULT_FAILURE_TRANSCRIPT = "unrecognized speech";
const AUTO_SUCCESS_THRESHOLD = 0.72;
const AUTO_FAILURE_THRESHOLD = 0.94;

const resolveAutoScenario = (random: () => number): Exclude<MockSpeechScenario, "auto"> => {
  const roll = random();

  if (roll < AUTO_SUCCESS_THRESHOLD) {
    return "success";
  }

  if (roll < AUTO_FAILURE_THRESHOLD) {
    return "failure";
  }

  return "empty";
};

const createTranscript = (
  targetWord: Word["en"],
  scenario: MockSpeechScenario,
  transcript?: string
): string => {
  if (transcript !== undefined) {
    return transcript;
  }

  if (scenario === "success") {
    return targetWord;
  }

  if (scenario === "empty") {
    return "";
  }

  return DEFAULT_FAILURE_TRANSCRIPT;
};

export function createSpeechService(options: SpeechServiceOptions = {}): SpeechService {
  const defaultScenario = options.defaultScenario ?? "auto";
  const random = options.random ?? Math.random;

  return {
    async recognizeWord(audioFilePath, targetWord, recognitionOptions = {}) {
      void audioFilePath;
      const scenario = recognitionOptions.scenario ?? defaultScenario;

      const transcript = createTranscript(
        targetWord,
        scenario === "auto" ? resolveAutoScenario(random) : scenario,
        recognitionOptions.transcript
      );

      return {
        transcript,
        passed: transcript.length > 0 && isNormalizedSpellingMatch(transcript, targetWord),
        provider: "mock"
      };
    }
  };
}

export const speechService = createSpeechService();

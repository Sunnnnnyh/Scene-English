import type { SpeechResult, Word } from "../types";
import { isNormalizedSpellingMatch } from "../utils/normalize";

export type MockSpeechScenario = "success" | "failure" | "empty";

export type SpeechRecognitionOptions = {
  scenario?: MockSpeechScenario;
  transcript?: string;
};

export type SpeechServiceOptions = {
  defaultScenario?: MockSpeechScenario;
};

export type SpeechService = {
  recognizeWord(
    audioFilePath: string,
    targetWord: Word["en"],
    options?: SpeechRecognitionOptions
  ): Promise<SpeechResult>;
};

const DEFAULT_FAILURE_TRANSCRIPT = "unrecognized speech";

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
  const defaultScenario = options.defaultScenario ?? "success";

  return {
    async recognizeWord(audioFilePath, targetWord, recognitionOptions = {}) {
      void audioFilePath;

      const transcript = createTranscript(
        targetWord,
        recognitionOptions.scenario ?? defaultScenario,
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

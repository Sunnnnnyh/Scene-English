import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scenePageScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/scene/scene.ts"),
  "utf8"
);
const sceneViewModelScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/scene/sceneViewModel.ts"),
  "utf8"
);
const sceneMarkup = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.wxml"), "utf8");
const sceneStyles = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.wxss"), "utf8");

describe("Listen + Speak round completion", () => {
  it("keeps speaking attempt, answer reveal, continuation, and completion state in the view model", () => {
    expect(sceneViewModelScript).toContain("listeningSpeakingRecognitionAttemptCount");
    expect(sceneViewModelScript).toContain("listeningSpeakingAnswerReveal");
    expect(sceneViewModelScript).toContain("listeningSpeakingIsRoundComplete");
    expect(sceneViewModelScript).toContain("listeningSpeakingPendingNextQuestion");
    expect(sceneViewModelScript).toContain("listeningSpeakingPendingNextQuestionIndex");
    expect(sceneViewModelScript).toContain("listeningSpeakingContinueLabel");
    expect(sceneViewModelScript).toContain("listeningSpeakingCorrectCount");
    expect(sceneViewModelScript).toContain("listeningSpeakingMistakeCount");
    expect(sceneViewModelScript).toContain("listeningSpeakingNewMistakeCount");
  });

  it("records speaking mistakes and speaking mastery from recognition outcomes", () => {
    expect(scenePageScript).toContain('recordMistake(targetWord.id, sceneId, "speaking")');
    expect(scenePageScript).toContain('recordMistakeCorrectAnswer(targetWord.id, "speaking")');
    expect(scenePageScript).toContain("handleListeningSpeakingRecognitionFailure");
    expect(scenePageScript).toContain("listeningSpeakingRecognitionAttemptCount + 1");
  });

  it("waits for the user to continue after a passed or final failed speaking answer", () => {
    expect(scenePageScript).toContain("prepareListeningSpeakingNextStep");
    expect(scenePageScript).toContain("onContinueListeningSpeakingQuestion");
    expect(scenePageScript).toContain("listeningSpeakingPendingNextQuestion: true");
    expect(scenePageScript).toContain("listeningSpeakingPendingNextQuestionIndex");
    expect(scenePageScript).toContain('listeningSpeakingContinueLabel: "Continue"');
    expect(sceneMarkup).toContain('bindtap="onContinueListeningSpeakingQuestion"');
    expect(sceneMarkup).toContain("{{listeningSpeakingContinueLabel}}");
  });

  it("reveals the correct spoken word only after the second recognition failure", () => {
    expect(scenePageScript).toContain("answerReveal: targetWord.en");
    expect(sceneMarkup).toContain("listening-speaking-answer-card");
    expect(sceneMarkup).toContain("Correct pronunciation");
    expect(sceneMarkup).toContain("{{listeningSpeakingAnswerReveal}}");
  });

  it("renders a Listen + Speak completion state with round stats, restart, and end actions", () => {
    expect(scenePageScript).toContain("createListeningSpeakingCompletionStats");
    expect(sceneMarkup).toContain("listening-speaking-complete-stats");
    expect(sceneMarkup).toContain("Correct");
    expect(sceneMarkup).toContain("Mistakes");
    expect(sceneMarkup).toContain("New mistakes");
    expect(sceneMarkup).toContain("{{listeningSpeakingCorrectCount}}");
    expect(sceneMarkup).toContain("{{listeningSpeakingMistakeCount}}");
    expect(sceneMarkup).toContain("{{listeningSpeakingNewMistakeCount}}");
    expect(sceneMarkup).toContain("listening-speaking-complete");
    expect(sceneMarkup).toContain("Speaking round complete");
    expect(sceneMarkup).toContain('bindtap="onRestartListeningSpeakingRound"');
    expect(sceneMarkup).toContain('bindtap="onEndListeningSpeakingPractice"');
    expect(sceneMarkup).toContain("New 5-word set");
    expect(sceneMarkup).toContain("End practice");
    expect(sceneStyles).toContain(".listening-speaking-complete");
    expect(sceneStyles).toContain(".listening-speaking-answer-card");
    expect(sceneStyles).toContain(".listening-speaking-continue");
  });
});

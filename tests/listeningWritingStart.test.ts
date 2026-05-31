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

describe("Listen + Spell start state inside the Learn tab", () => {
  it("creates a five-question Listen + Spell round when the mode is selected", () => {
    expect(scenePageScript).toContain("createPracticeQuizRound");
    expect(scenePageScript).toContain('mode: "listeningWriting"');
    expect(scenePageScript).toContain("learnedWordIds");
    expect(scenePageScript).toContain("listeningWritingRound");
    expect(scenePageScript).toContain("listeningWritingState");
    expect(scenePageScript).toContain("createListeningWritingStartState");
  });

  it("keeps the scene page runtime self-contained for quiz creation", () => {
    expect(scenePageScript).not.toContain("../../services/quizService");
    expect(scenePageScript).toContain("DEFAULT_LISTENING_WRITING_QUESTION_COUNT");
    expect(scenePageScript).toContain("function createPracticeQuizRound");
  });

  it("keeps the current question state in the scene view model", () => {
    expect(sceneViewModelScript).toContain("SceneListeningWritingState");
    expect(sceneViewModelScript).toContain("createListeningWritingStartState");
    expect(sceneViewModelScript).toContain("currentQuestionNumber");
    expect(sceneViewModelScript).toContain("totalQuestionCount");
    expect(sceneViewModelScript).toContain("questionLabel");
  });

  it("renders question progress and a manual target audio playback entry", () => {
    expect(sceneMarkup).toContain(`wx:elif="{{activeMode === 'listeningWriting'}}"`);
    expect(sceneMarkup).toContain("{{listeningWritingState.questionLabel}}");
    expect(sceneMarkup).toContain('bindtap="onPlayListeningWritingAudio"');
    expect(sceneMarkup).toContain("Play Word Audio");
    expect(sceneMarkup).not.toContain("播放单词音频");
    expect(sceneMarkup).not.toContain("{{listeningWritingState.currentQuestion.en}}");
  });

  it("renders Listen + Spell hotspots for click judging without exposing the target word", () => {
    expect(sceneMarkup).toContain("listening-writing-scene-preview");
    expect(sceneMarkup).toContain("listening-writing-hotspot");
    expect(sceneMarkup).toContain('catchtap="onListeningWritingHotspotTap"');
    expect(sceneMarkup).toContain('bindtap="onListeningWritingBlankTap"');
    expect(sceneMarkup).toContain("listeningWritingTargetWordId");
    expect(sceneMarkup).toContain("listeningWritingState.currentQuestion.wordId");
    expect(sceneMarkup).not.toContain("{{listeningWritingState.currentQuestion.en}}");
  });

  it("manages target word audio playback in the scene page runtime", () => {
    expect(scenePageScript).toContain("listeningWritingAudioContext");
    expect(scenePageScript).toContain("stopListeningWritingAudio");
    expect(scenePageScript).toContain("releaseListeningWritingAudio");
    expect(scenePageScript).toContain("playListeningWritingAudio");
    expect(scenePageScript).toContain("onPlayListeningWritingAudio");
    expect(scenePageScript).toContain("wx.createInnerAudioContext()");
    expect(scenePageScript).toContain("feedbackCopy.audioUnavailable");
  });

  it("judges Listen + Spell object taps and records first click mistakes", () => {
    expect(scenePageScript).toContain("onListeningWritingHotspotTap");
    expect(scenePageScript).toContain("onListeningWritingBlankTap");
    expect(scenePageScript).toContain("recordMistake");
    expect(scenePageScript).toContain('"click"');
    expect(scenePageScript).toContain("listeningWritingClickAttemptCount");
    expect(scenePageScript).toContain("listeningWritingPhase");
    expect(scenePageScript).toContain("spellingReady");
    expect(scenePageScript).toContain("listeningWritingTargetWordId");
  });

  it("updates mistake mastery when the user answers an existing weak item correctly", () => {
    expect(scenePageScript).toContain("recordMistakeCorrectAnswer");
    expect(scenePageScript).toContain('recordMistakeCorrectAnswer(targetWordId, "click")');
    expect(scenePageScript).toContain('recordMistakeCorrectAnswer(targetWord.id, "spelling")');
  });

  it("only enables object selection after the target audio has finished playing", () => {
    expect(scenePageScript).toContain("listeningWritingCanSelectObject");
    expect(scenePageScript).toContain("audioContext.onEnded");
    expect(scenePageScript).toContain("listeningWritingCanSelectObject: true");
    expect(scenePageScript).toContain("!this.data.listeningWritingCanSelectObject");
  });

  it("keeps task instruction separate from answer feedback during audio replay", () => {
    expect(sceneViewModelScript).toContain("listeningWritingStepLabel");
    expect(sceneViewModelScript).toContain("listeningWritingTaskTitle");
    expect(sceneViewModelScript).toContain("listeningWritingInstruction");
    expect(scenePageScript).toContain("handleListeningWritingAudioEnded");
    expect(scenePageScript).not.toContain("shouldPreserveListeningWritingFeedbackOnReplay");
  });

  it("keeps the scene visible and hides replay while reviewing an answer", () => {
    expect(sceneMarkup).toContain("listening-writing-scene-preview");
    expect(sceneMarkup).toContain(
      `wx:if="{{!listeningWritingPendingNextQuestion && listeningWritingPhase !== 'spellingReady'}}"`
    );
    expect(sceneMarkup).toContain('class="listening-writing-play"');
    expect(sceneMarkup).toContain('wx:if="{{listeningWritingPendingNextQuestion}}"');
    expect(scenePageScript).toContain("listeningWritingPendingNextQuestion: true");
  });

  it("uses a lightweight cue before spelling without repeating the spelling title", () => {
    expect(sceneMarkup).toContain("listening-writing-cue");
    expect(sceneMarkup).toContain("listening-writing-cue-title");
    expect(sceneMarkup).toContain(
      `wx:if="{{!listeningWritingPendingNextQuestion && listeningWritingPhase !== 'spellingReady'}}"`
    );
    expect(sceneStyles).toContain(".listening-writing-cue");
    expect(sceneMarkup).not.toContain("listening-writing-cue--spell");
    expect(sceneStyles).not.toContain(".listening-writing-cue--spell");
    expect(sceneMarkup).not.toContain("listening-writing-task-card");
    expect(sceneStyles).not.toContain(".listening-writing-task-card");
    expect(sceneMarkup).not.toContain("listening-writing-step-chip");
    expect(sceneStyles).not.toContain(".listening-writing-step-chip");
  });

  it("ignores further object taps after the correct object has been found", () => {
    expect(scenePageScript).toContain('this.data.listeningWritingPhase === "spellingReady"');
  });

  it("renders spelling input only after the target object is found", () => {
    expect(sceneMarkup).toContain(
      `wx:if="{{listeningWritingPhase === 'spellingReady' && !listeningWritingPendingNextQuestion}}"`
    );
    expect(sceneMarkup).toContain("listening-writing-spelling");
    expect(sceneMarkup).toContain("listening-writing-spell-focus");
    expect(sceneMarkup).toContain("listening-writing-spell-actions");
    expect(sceneMarkup).toContain("Spell now");
    expect(sceneMarkup).toContain("listening-writing-play-inline");
    expect(sceneMarkup).toContain("Play audio");
    expect(sceneMarkup).not.toContain("Replay audio");
    expect(sceneMarkup).toContain('bindinput="onListeningWritingSpellingInput"');
    expect(sceneMarkup).toContain('bindtap="onSubmitListeningWritingSpelling"');
    expect(sceneMarkup).toContain("{{listeningWritingSpellingInput}}");
  });

  it("checks spelling with normalized input and records the first spelling mistake", () => {
    expect(scenePageScript).toContain("isNormalizedSpellingMatch");
    expect(scenePageScript).toContain("onListeningWritingSpellingInput");
    expect(scenePageScript).toContain("onSubmitListeningWritingSpelling");
    expect(scenePageScript).toContain('"spelling"');
    expect(scenePageScript).toContain("listeningWritingSpellingAttemptCount");
  });

  it("waits for the user to continue after spelling feedback", () => {
    expect(scenePageScript).toContain("prepareListeningWritingNextStep");
    expect(scenePageScript).toContain("listeningWritingPendingNextQuestion: true");
    expect(scenePageScript).toContain("listeningWritingPendingNextQuestionIndex");
    expect(scenePageScript).toContain("onContinueListeningWritingQuestion");
    expect(scenePageScript).toContain('listeningWritingContinueLabel: "Continue"');
    expect(scenePageScript).not.toContain("Continue to Next Word");
    expect(sceneMarkup).toContain('bindtap="onContinueListeningWritingQuestion"');
    expect(sceneMarkup).toContain("{{listeningWritingContinueLabel}}");
  });

  it("automatically plays the next word only after the user switches questions", () => {
    expect(scenePageScript).toContain("playListeningWritingAudioForCurrentQuestion");
    expect(scenePageScript).toContain("autoPlayNextQuestion");
    expect(scenePageScript).toContain(
      "this.playListeningWritingAudioForCurrentQuestion({ autoPlayNextQuestion: true })"
    );
    expect(scenePageScript).toContain("listeningWritingPendingNextQuestion: false");
  });

  it("plays distinct feedback sounds for correct and wrong answers", () => {
    expect(scenePageScript).toContain("LISTENING_WRITING_CORRECT_SOUND_URL");
    expect(scenePageScript).toContain("LISTENING_WRITING_WRONG_SOUND_URL");
    expect(scenePageScript).toContain("listeningWritingFeedbackAudioContext");
    expect(scenePageScript).toContain("playListeningWritingFeedbackSound");
    expect(scenePageScript).toContain("audioContext.volume");
    expect(scenePageScript).toContain('playListeningWritingFeedbackSound("correct")');
    expect(scenePageScript).toContain('playListeningWritingFeedbackSound("wrong")');
    expect(scenePageScript).toContain("/assets/audio/feedback-correct.wav");
    expect(scenePageScript).toContain("/assets/audio/feedback-wrong.wav");
  });

  it("flashes the target object and reveals the answer after the final spelling miss", () => {
    expect(scenePageScript).toContain("listeningWritingAnswerReveal");
    expect(scenePageScript).toContain("listeningWritingAnswerReveal: targetWord.en");
    expect(sceneMarkup).toContain("listening-writing-hotspot--flash");
    expect(sceneMarkup).toContain("listening-writing-answer-card");
    expect(sceneMarkup).toContain("listening-writing-answer-word");
    expect(sceneMarkup).toContain("{{listeningWritingAnswerReveal}}");
    expect(sceneStyles).not.toMatch(/\.listening-writing-hotspot--target\s*\{[^}]*#19324d/);
    expect(sceneStyles).toContain("@keyframes targetFlash");
    expect(sceneStyles).toContain("targetFlash 0.42s ease-in-out 3");
  });

  it("renders a clear completion state after the final spelling answer", () => {
    expect(sceneViewModelScript).toContain("listeningWritingIsRoundComplete");
    expect(scenePageScript).toContain("listeningWritingIsRoundComplete: true");
    expect(sceneMarkup).toContain("listening-writing-complete");
    expect(sceneMarkup).toContain("Round complete");
    expect(sceneMarkup).toContain('bindtap="onRestartListeningWritingRound"');
    expect(sceneMarkup).toContain('bindtap="onEndListeningWritingPractice"');
    expect(sceneMarkup).toContain("New 5-word set");
    expect(sceneMarkup).toContain("End practice");
    expect(sceneMarkup).toContain("listening-writing-next-set");
    expect(sceneMarkup).toContain("listening-writing-end-practice");
    expect(scenePageScript).toContain("onEndListeningWritingPractice");
    expect(sceneMarkup).not.toContain("Practice Again");
  });

  it("starts a new five-word set by excluding the previous round first", () => {
    expect(scenePageScript).toContain("excludeWordIds");
    expect(scenePageScript).toContain("previousRound.questions.map");
    expect(scenePageScript).toContain("shuffleWords");
    expect(scenePageScript).toContain("excludedWordIdSet");
    expect(scenePageScript).toContain("availableWords");
    expect(scenePageScript).toContain("fallbackWords");
    expect(scenePageScript).toContain("createListeningWritingModeData(sceneId, previousWordIds)");
  });

  it("starts a mistake practice round from a pending mistake practice request", () => {
    expect(scenePageScript).toContain("consumePendingMistakePracticeRequest");
    expect(scenePageScript).toContain("startPendingMistakePracticeIfNeeded");
    expect(scenePageScript).toContain("createMistakePracticeModeData");
    expect(scenePageScript).toContain("listeningWritingPracticeMistakeType");
    expect(scenePageScript).toContain("targetMistakeType: mistakeType");
    expect(scenePageScript).toContain(
      "createMistakePracticeModeData(request.sceneId, request.mistakeType)"
    );
    expect(scenePageScript).toContain("onShow()");
  });

  it("keeps click mistake practice focused on object selection only", () => {
    expect(scenePageScript).toContain('this.data.listeningWritingPracticeMistakeType === "click"');
    expect(scenePageScript).toContain(
      'this.prepareListeningWritingNextStep(feedbackCopy.correctObject, "success")'
    );
  });

  it("returns to the mistakes page after a mistake practice round finishes", () => {
    expect(scenePageScript).toContain("returnToMistakesAfterPractice");
    expect(scenePageScript).toContain("this.data.listeningWritingPracticeMistakeType");
    expect(scenePageScript).toContain('wx.navigateTo({ url: "/pages/mistakes/mistakes" })');
    expect(scenePageScript).toContain("this.returnToMistakesAfterPractice()");
  });

  it("uses a single lightweight top back control instead of a bottom orange back button", () => {
    expect(sceneMarkup).toContain("mode-topbar");
    expect(sceneMarkup).toContain("mode-back-icon");
    expect(sceneMarkup).toContain("mode-back-chevron");
    expect(sceneMarkup).toContain("‹");
    expect(sceneMarkup).toContain('aria-label="Back to scene"');
    expect(sceneStyles).toContain(".mode-topbar");
    expect(sceneStyles).toContain(".mode-back-icon");
    expect(sceneStyles).toContain(".mode-back-chevron");
    expect(sceneStyles).not.toMatch(/\.mode-back-icon\s*\{[^}]*border-radius: 50%/);
    expect(sceneStyles).not.toContain(".back-button");
    expect(sceneMarkup).not.toContain("back-button");
    expect(sceneMarkup).not.toContain("返回 Classroom");
  });

  it("adds stable styles for the Listen + Spell start panel", () => {
    expect(sceneStyles).toContain(".listening-writing-start");
    expect(sceneStyles).toContain(".listening-writing-progress");
    expect(sceneStyles).toContain(".listening-writing-play");
    expect(sceneStyles).toContain(".listening-writing-hotspot");
    expect(sceneStyles).toContain(".listening-writing-hotspot--target");
    expect(sceneStyles).toContain(".listening-writing-feedback");
    expect(sceneStyles).toContain(".listening-writing-feedback-card");
    expect(sceneStyles).toContain(".listening-writing-feedback-card--success");
    expect(sceneStyles).toContain(".listening-writing-feedback-card--error");
    expect(sceneStyles).toContain(".listening-writing-cue");
    expect(sceneStyles).toContain(".listening-writing-spell-focus");
    expect(sceneStyles).toContain(".listening-writing-spell-actions");
    expect(sceneStyles).toContain(".listening-writing-play-inline");
    expect(sceneStyles).toContain(".listening-writing-continue");
    expect(sceneStyles).toContain(".listening-writing-end-practice");
    expect(sceneStyles).toContain(".listening-writing-spelling");
    expect(sceneStyles).toContain(".listening-writing-input");
    expect(sceneStyles).toContain(".listening-writing-submit");
    expect(sceneStyles).toContain(".listening-writing-complete");
  });
});

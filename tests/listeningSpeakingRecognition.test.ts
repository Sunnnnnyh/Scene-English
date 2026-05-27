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

describe("Listen + Speak recognition feedback", () => {
  it("keeps recognition state in the scene view model", () => {
    expect(sceneViewModelScript).toContain("SceneListeningSpeakingRecognitionStatus");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecognitionStatus");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecognitionTranscript");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecognitionFeedback");
  });

  it("calls speech recognition after a valid saved recording", () => {
    expect(scenePageScript).toContain(
      'import { speechService } from "../../services/speechService"'
    );
    expect(scenePageScript).toContain("recognizeListeningSpeakingRecording");
    expect(scenePageScript).toContain("speechService.recognizeWord");
    expect(scenePageScript).toContain("result.tempFilePath");
    expect(scenePageScript).toContain("targetWord.en");
  });

  it("maps recognizing, success, failure, and empty-result states to user-facing feedback", () => {
    expect(scenePageScript).toContain('listeningSpeakingRecognitionStatus: "recognizing"');
    expect(scenePageScript).toContain('recognitionStatus: "passed"');
    expect(scenePageScript).toContain('"notRecognized"');
    expect(scenePageScript).toContain('"failed"');
    expect(scenePageScript).toContain("feedbackCopy.checkingPronunciation");
    expect(scenePageScript).toContain("feedbackCopy.greatPronunciation");
    expect(scenePageScript).toContain("feedbackCopy.recognitionNotClear");
    expect(scenePageScript).toContain("feedbackCopy.recognitionFailed");
  });

  it("renders recognition feedback without exposing the mock implementation", () => {
    expect(sceneMarkup).toContain("{{listeningSpeakingRecognitionFeedback}}");
    expect(sceneMarkup).toContain("listening-speaking-recognition-card");
    expect(sceneMarkup).toContain("Checking...");
    expect(sceneMarkup).toContain("Passed");
    expect(sceneMarkup.toLowerCase()).not.toContain("mock");
    expect(sceneStyles).toContain(".listening-speaking-recognition-card");
    expect(sceneStyles).toContain(".listening-speaking-recognition-card--success");
    expect(sceneStyles).toContain(".listening-speaking-recognition-card--error");
  });

  it("hides saved recording actions after recognition has passed", () => {
    expect(sceneMarkup).toContain("listeningSpeakingRecognitionStatus !== 'passed'");
    expect(sceneMarkup).toContain("listeningSpeakingRecognitionStatus !== 'recognizing'");
    expect(sceneMarkup).toContain(
      "listeningSpeakingRecordingStatus === 'recorded' && listeningSpeakingRecognitionStatus !== 'passed'"
    );
  });

  it("lets recognition feedback become the primary visible status", () => {
    expect(sceneMarkup).toContain(
      "listeningSpeakingRecordingFeedback && !listeningSpeakingRecognitionFeedback"
    );
    expect(sceneStyles).toContain("min-height: 112rpx");
    expect(sceneStyles).toContain("font-size: 32rpx");
    expect(sceneStyles).toContain("border: 3rpx solid #a6dfb2");
  });

  it("lays out recognition status and feedback in one horizontal row", () => {
    expect(sceneMarkup).toContain('<view class="listening-speaking-recognition-label">');
    expect(sceneMarkup).toContain('<view class="listening-speaking-recognition-text">');
    expect(sceneStyles).toContain("flex-direction: row");
    expect(sceneStyles).toContain("align-items: center");
    expect(sceneStyles).toContain("justify-content: space-between");
    expect(sceneStyles).toContain("text-align: right");
    expect(sceneStyles).toContain(".listening-speaking-recognition-label {\n  display: block;");
    expect(sceneStyles).toContain(".listening-speaking-recognition-text {\n  display: block;");
    expect(sceneStyles).toContain(
      ".listening-speaking-recognition-text {\n  display: block;\n  min-width: 0;\n  color: #45647f;\n  font-size: 32rpx;"
    );
    expect(sceneStyles).toContain("line-height: 1;");
  });

  it("keeps recognition feedback separate from the Step 8.4 continuation controls", () => {
    expect(scenePageScript).toContain("recognizeListeningSpeakingRecording");
    expect(scenePageScript).toContain("onContinueListeningSpeakingQuestion");
    expect(sceneMarkup).toContain("listening-speaking-recognition-card");
    expect(sceneMarkup).toContain("listening-speaking-continue");
  });
});

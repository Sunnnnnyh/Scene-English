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

describe("Listen + Speak recording interaction", () => {
  it("keeps recording state in the scene view model", () => {
    expect(sceneViewModelScript).toContain("SceneListeningSpeakingRecordingStatus");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecordingStatus");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecordingPath");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecordingDurationMs");
    expect(sceneViewModelScript).toContain("listeningSpeakingRecordingFeedback");
  });

  it("renders start, stop, and cancel recording controls in record-ready state", () => {
    expect(sceneMarkup).toContain('bindtap="onStartListeningSpeakingRecording"');
    expect(sceneMarkup).toContain('bindtap="onStopListeningSpeakingRecording"');
    expect(sceneMarkup).toContain('bindtap="onCancelListeningSpeakingRecording"');
    expect(sceneMarkup).toContain("Start Recording");
    expect(sceneMarkup).toContain("Saved");
    expect(sceneMarkup).toContain("Record Again");
    expect(sceneMarkup).toContain("Try Again");
    expect(sceneMarkup).toContain("Stop");
    expect(sceneMarkup).toContain("Cancel");
    expect(sceneMarkup).toContain("{{listeningSpeakingRecordingFeedback}}");
  });

  it("uses WeChat RecorderManager for the recording step", () => {
    expect(scenePageScript).toContain("wx.getRecorderManager()");
    expect(scenePageScript).toContain("onStartListeningSpeakingRecording");
    expect(scenePageScript).toContain("onStopListeningSpeakingRecording");
    expect(scenePageScript).toContain("onCancelListeningSpeakingRecording");
    expect(scenePageScript).toContain("recorderManager.start");
    expect(scenePageScript).toContain("recorderManager.stop");
  });

  it("handles microphone denial and too-short recordings with retryable feedback", () => {
    expect(scenePageScript).toContain("wx.authorize");
    expect(scenePageScript).toContain('scope: "scope.record"');
    expect(scenePageScript).toContain("handleListeningSpeakingPermissionDenied");
    expect(scenePageScript).toContain("MIN_LISTENING_SPEAKING_RECORDING_MS");
    expect(scenePageScript).toContain("feedbackCopy.recordingTooShort");
    expect(scenePageScript).toContain("feedbackCopy.microphonePermission");
  });

  it("styles recording actions and feedback inside the Listen + Speak panel", () => {
    expect(sceneStyles).toContain(".listening-speaking-record-actions");
    expect(sceneStyles).toContain(".listening-speaking-record-actions--saved");
    expect(sceneStyles).toContain(".listening-speaking-record-saved");
    expect(sceneStyles).toContain(".listening-speaking-record-button");
    expect(sceneStyles).toContain(".listening-speaking-record-button--again");
    expect(sceneStyles).toContain(".listening-speaking-record-button--stop");
    expect(sceneStyles).toContain(".listening-speaking-record-button--secondary");
    expect(sceneStyles).toContain(".listening-speaking-record-feedback");
  });
});

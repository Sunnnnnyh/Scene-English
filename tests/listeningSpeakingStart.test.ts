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

describe("Listen + Speak start state inside the Learn tab", () => {
  it("creates a five-question Listen + Speak round when the mode is selected", () => {
    expect(scenePageScript).toContain("createListeningSpeakingModeData");
    expect(scenePageScript).toContain('mode: "listeningSpeaking"');
    expect(scenePageScript).toContain("listeningSpeakingRound");
    expect(scenePageScript).toContain("listeningSpeakingState");
    expect(scenePageScript).toContain("createListeningSpeakingStartState");
  });

  it("keeps the current Listen + Speak question state in the scene view model", () => {
    expect(sceneViewModelScript).toContain("SceneListeningSpeakingState");
    expect(sceneViewModelScript).toContain("createListeningSpeakingStartState");
    expect(sceneViewModelScript).toContain("listeningSpeakingRound");
    expect(sceneViewModelScript).toContain("listeningSpeakingState");
    expect(sceneViewModelScript).toContain("listeningSpeakingPhase");
  });

  it("renders Listen + Speak question progress, audio playback, and hotspots", () => {
    expect(sceneMarkup).toContain(`wx:elif="{{activeMode === 'listeningSpeaking'}}"`);
    expect(sceneMarkup).toContain("{{listeningSpeakingState.questionLabel}}");
    expect(sceneMarkup).toContain('bindtap="onPlayListeningSpeakingAudio"');
    expect(sceneMarkup).toContain("Play Word Audio");
    expect(sceneMarkup).toContain("listening-speaking-scene-preview");
    expect(sceneMarkup).toContain("listening-speaking-hotspot");
    expect(sceneMarkup).toContain('catchtap="onListeningSpeakingHotspotTap"');
    expect(sceneMarkup).toContain('bindtap="onListeningSpeakingBlankTap"');
    expect(sceneMarkup).not.toContain("{{listeningSpeakingState.currentQuestion.en}}");
  });

  it("only enables object selection after the target audio has finished playing", () => {
    expect(scenePageScript).toContain("listeningSpeakingCanSelectObject");
    expect(scenePageScript).toContain("handleListeningSpeakingAudioEnded");
    expect(scenePageScript).toContain("listeningSpeakingCanSelectObject: true");
    expect(scenePageScript).toContain("!this.data.listeningSpeakingCanSelectObject");
  });

  it("judges object taps, records first click mistakes, and enters record-ready state", () => {
    expect(scenePageScript).toContain("onListeningSpeakingHotspotTap");
    expect(scenePageScript).toContain("listeningSpeakingClickAttemptCount");
    expect(scenePageScript).toContain('recordMistake(targetWordId, sceneId, "click")');
    expect(scenePageScript).toContain('recordMistakeCorrectAnswer(targetWordId, "click")');
    expect(scenePageScript).toContain('listeningSpeakingPhase: "recordReady"');
    expect(sceneMarkup).toContain("Ready to speak");
  });

  it("adds stable styles for the Listen + Speak start panel", () => {
    expect(sceneStyles).toContain(".listening-speaking-start");
    expect(sceneStyles).toContain(".listening-speaking-progress");
    expect(sceneStyles).toContain(".listening-speaking-play");
    expect(sceneStyles).toContain(".listening-speaking-hotspot");
    expect(sceneStyles).toContain(".listening-speaking-hotspot--target");
    expect(sceneStyles).toContain(".listening-speaking-record-ready");
  });
});

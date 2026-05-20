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
    expect(sceneMarkup).toContain("播放单词音频");
    expect(sceneMarkup).not.toContain("{{listeningWritingState.currentQuestion.en}}");
  });

  it("manages target word audio playback in the scene page runtime", () => {
    expect(scenePageScript).toContain("listeningWritingAudioContext");
    expect(scenePageScript).toContain("stopListeningWritingAudio");
    expect(scenePageScript).toContain("releaseListeningWritingAudio");
    expect(scenePageScript).toContain("playListeningWritingAudio");
    expect(scenePageScript).toContain("onPlayListeningWritingAudio");
    expect(scenePageScript).toContain("wx.createInnerAudioContext()");
    expect(scenePageScript).toContain("音频暂时无法播放");
  });

  it("adds stable styles for the Listen + Spell start panel", () => {
    expect(sceneStyles).toContain(".listening-writing-start");
    expect(sceneStyles).toContain(".listening-writing-progress");
    expect(sceneStyles).toContain(".listening-writing-play");
  });
});

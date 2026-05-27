import { describe, expect, it } from "vitest";

import {
  createLearningPageViewModel,
  getBackToSceneAction
} from "../miniprogram/pages/shared/learningPageViewModel";

describe("learning page placeholder view model", () => {
  it("builds a memory page with a clear return path to the scene home", () => {
    expect(createLearningPageViewModel("memory", "classroom")).toEqual({
      sceneId: "classroom",
      title: "单词记忆模式",
      backLabel: "返回 Classroom",
      backAction: {
        type: "switchTab",
        url: "/pages/scene/scene"
      }
    });
  });

  it("builds listening-writing and listening-speaking placeholders", () => {
    expect(createLearningPageViewModel("listeningWriting", "classroom")).toMatchObject({
      title: "听力 + 默写"
    });
    expect(createLearningPageViewModel("listeningSpeaking", "classroom")).toMatchObject({
      title: "听力 + 口语"
    });
  });

  it("uses a switchTab action for returning to the scene home", () => {
    expect(getBackToSceneAction()).toEqual({
      type: "switchTab",
      url: "/pages/scene/scene"
    });
  });
});

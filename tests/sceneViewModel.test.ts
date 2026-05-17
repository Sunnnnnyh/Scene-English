import { describe, expect, it } from "vitest";

import {
  createSceneViewModel,
  getSceneEntryAction
} from "../miniprogram/pages/scene/sceneViewModel";
import { getSceneById } from "../miniprogram/services/sceneService";
import type { UserProgress } from "../miniprogram/types";

const classroom = getSceneById("classroom");

const emptyProgress: UserProgress = {
  sceneId: "classroom",
  learnedWordIds: [],
  completedMemoryCount: 0,
  completedWritingCount: 0,
  completedSpeakingCount: 0,
  updatedAt: "2026-05-16T00:00:00.000Z"
};

describe("scene page view model", () => {
  it("builds Classroom overview with progress and learning entries", () => {
    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(classroom, emptyProgress);

    expect(viewModel).toMatchObject({
      title: "教室 Classroom",
      sceneImage: "/assets/images/classroom.png",
      progressLabel: "Learned 0 / 20",
      progressPercent: 0
    });
    expect(viewModel.modeEntries).toHaveLength(3);
    expect(viewModel.modeEntries[0]).toMatchObject({
      id: "memory",
      title: "单词记忆",
      subtitle: "先探索场景里的物品",
      actionLabel: "Recommended",
      isRecommended: true
    });
    expect("quickEntries" in viewModel).toBe(false);
  });

  it("uses learned words to calculate scene progress", () => {
    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(classroom, {
      ...emptyProgress,
      learnedWordIds: ["blackboard", "projector", "desk"]
    });

    expect(viewModel.progressLabel).toBe("Learned 3 / 20");
    expect(viewModel.progressPercent).toBe(15);
  });

  it("maps scene entries to their page routes", () => {
    expect(getSceneEntryAction("memory", "classroom")).toEqual({
      type: "navigate",
      url: "/pages/memory/memory?sceneId=classroom"
    });
    expect(getSceneEntryAction("listeningWriting", "classroom")).toEqual({
      type: "navigate",
      url: "/pages/listening-writing/listening-writing?sceneId=classroom"
    });
    expect(getSceneEntryAction("listeningSpeaking", "classroom")).toEqual({
      type: "navigate",
      url: "/pages/listening-speaking/listening-speaking?sceneId=classroom"
    });
  });
});

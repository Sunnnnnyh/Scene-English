import { describe, expect, it } from "vitest";

import { createMemoryViewModel } from "../miniprogram/pages/memory/memoryViewModel";
import { getSceneById } from "../miniprogram/services/sceneService";

describe("memory page view model", () => {
  it("builds Classroom scene image data for memory mode", () => {
    const classroom = getSceneById("classroom");

    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    expect(createMemoryViewModel(classroom)).toEqual({
      sceneId: "classroom",
      title: "单词记忆",
      subtitle: "观察教室里的物品，准备建立物品与英文单词的连接。",
      sceneName: "教室 Classroom",
      sceneImage: "/assets/images/classroom.png",
      imageAspectRatio: "16 / 9",
      backLabel: "返回 Classroom",
      backAction: {
        type: "switchTab",
        url: "/pages/scene/scene"
      }
    });
  });
});

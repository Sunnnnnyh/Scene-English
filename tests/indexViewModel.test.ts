import { describe, expect, it } from "vitest";

import {
  createIndexViewModel,
  getIndexSceneAction
} from "../miniprogram/pages/index/indexViewModel";
import { getScenes } from "../miniprogram/services/sceneService";

describe("index page view model", () => {
  it("builds one Classroom card and three coming soon cards from scene data", () => {
    const viewModel = createIndexViewModel(getScenes());

    expect(viewModel.availableScenes).toHaveLength(1);
    expect(viewModel.availableScenes[0]).toMatchObject({
      id: "classroom",
      nameEn: "Classroom",
      nameCn: "教室",
      wordCountLabel: "20 words",
      actionLabel: "Start learning"
    });
    expect(viewModel.comingSoonScenes.map((scene) => scene.id)).toEqual([
      "lecture-hall",
      "dormitory",
      "cafeteria"
    ]);
    expect(viewModel.comingSoonScenes.every((scene) => scene.statusLabel === "Coming soon")).toBe(
      true
    );
  });

  it("allows Classroom to switch to the Learn tab and blocks coming soon scenes", () => {
    expect(getIndexSceneAction("classroom", getScenes())).toEqual({
      type: "switchTab",
      url: "/pages/scene/scene"
    });
    expect(getIndexSceneAction("lecture-hall", getScenes())).toEqual({
      type: "toast",
      message: "Coming soon"
    });
  });
});

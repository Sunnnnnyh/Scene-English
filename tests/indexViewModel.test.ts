import { describe, expect, it } from "vitest";

import {
  createIndexViewModel,
  getIndexSceneAction
} from "../miniprogram/pages/index/indexViewModel";
import { getScenes } from "../miniprogram/services/sceneService";

describe("index page view model", () => {
  it("builds Classroom and Lecture Hall cards plus remaining coming soon cards", () => {
    const viewModel = createIndexViewModel(getScenes());

    expect(viewModel.availableScenes).toHaveLength(2);
    expect(viewModel.availableScenes.map((scene) => scene.id)).toEqual([
      "classroom",
      "lecture-hall"
    ]);
    expect(viewModel.availableScenes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "classroom",
          nameEn: "Classroom",
          wordCountLabel: "20 words",
          actionLabel: "Start learning"
        }),
        expect.objectContaining({
          id: "lecture-hall",
          nameEn: "Lecture Hall",
          wordCountLabel: "20 words",
          actionLabel: "Start learning"
        })
      ])
    );
    expect(viewModel.comingSoonScenes.map((scene) => scene.id)).toEqual(["dormitory", "cafeteria"]);
    expect(viewModel.comingSoonScenes.every((scene) => scene.statusLabel === "Coming soon")).toBe(
      true
    );
  });

  it("allows available scenes to switch to the Learn tab and blocks coming soon scenes", () => {
    expect(getIndexSceneAction("classroom", getScenes())).toEqual({
      type: "switchTab",
      sceneId: "classroom",
      url: "/pages/scene/scene"
    });
    expect(getIndexSceneAction("lecture-hall", getScenes())).toEqual({
      type: "switchTab",
      sceneId: "lecture-hall",
      url: "/pages/scene/scene"
    });
    expect(getIndexSceneAction("dormitory", getScenes())).toEqual({
      type: "toast",
      message: "Coming soon"
    });
  });
});

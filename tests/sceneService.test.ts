import { describe, expect, it } from "vitest";

import {
  getAvailableScenes,
  getComingSoonScenes,
  getSceneById,
  getScenes
} from "../miniprogram/services/sceneService";

describe("sceneService", () => {
  it("returns all MVP scenes in display order", () => {
    expect(getScenes().map((scene) => scene.id)).toEqual([
      "classroom",
      "lecture-hall",
      "dormitory",
      "cafeteria"
    ]);
  });

  it("returns Classroom and Lecture Hall as learnable scenes", () => {
    expect(getAvailableScenes().map((scene) => scene.id)).toEqual(["classroom", "lecture-hall"]);
    expect(getAvailableScenes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "classroom",
          nameEn: "Classroom",
          status: "available",
          wordCount: 20
        }),
        expect.objectContaining({
          id: "lecture-hall",
          nameEn: "Lecture Hall",
          status: "available",
          wordCount: 20
        })
      ])
    );
  });

  it("returns Dormitory and Cafeteria as coming soon", () => {
    expect(getComingSoonScenes().map((scene) => scene.id)).toEqual(["dormitory", "cafeteria"]);
    expect(getComingSoonScenes().every((scene) => scene.status === "comingSoon")).toBe(true);
  });

  it("finds scenes by id", () => {
    expect(getSceneById("classroom")).toMatchObject({
      id: "classroom",
      nameEn: "Classroom"
    });
    expect(getSceneById("lecture-hall")).toMatchObject({
      id: "lecture-hall",
      nameEn: "Lecture Hall"
    });
  });

  it("returns undefined for an unknown scene id", () => {
    expect(getSceneById("unknown-scene")).toBeUndefined();
  });
});

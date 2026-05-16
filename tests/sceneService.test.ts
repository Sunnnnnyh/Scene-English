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

  it("returns Classroom as the only learnable scene", () => {
    expect(getAvailableScenes()).toHaveLength(1);
    expect(getAvailableScenes()[0]).toMatchObject({
      id: "classroom",
      nameEn: "Classroom",
      status: "available",
      wordCount: 20
    });
  });

  it("returns all non-Classroom scenes as coming soon", () => {
    expect(getComingSoonScenes().map((scene) => scene.id)).toEqual([
      "lecture-hall",
      "dormitory",
      "cafeteria"
    ]);
    expect(getComingSoonScenes().every((scene) => scene.status === "comingSoon")).toBe(true);
  });

  it("finds a scene by id", () => {
    expect(getSceneById("classroom")).toMatchObject({
      id: "classroom",
      nameCn: "教室",
      nameEn: "Classroom"
    });
  });

  it("returns undefined for an unknown scene id", () => {
    expect(getSceneById("unknown-scene")).toBeUndefined();
  });
});

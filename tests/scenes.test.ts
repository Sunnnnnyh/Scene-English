import { describe, expect, it } from "vitest";

import { availableScenes, comingSoonScenes, scenes } from "../miniprogram/data/scenes";

describe("scene data", () => {
  it("contains the MVP classroom scene and coming soon scenes", () => {
    expect(scenes.map((scene) => scene.id)).toEqual([
      "classroom",
      "lecture-hall",
      "dormitory",
      "cafeteria"
    ]);
  });

  it("marks only Classroom as available", () => {
    expect(availableScenes).toHaveLength(1);
    expect(availableScenes[0]).toMatchObject({
      id: "classroom",
      nameEn: "Classroom",
      wordCount: 20,
      status: "available"
    });
  });

  it("keeps all other scenes as coming soon", () => {
    expect(comingSoonScenes.map((scene) => scene.id)).toEqual([
      "lecture-hall",
      "dormitory",
      "cafeteria"
    ]);
    expect(comingSoonScenes.every((scene) => scene.status === "comingSoon")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  availableScenes,
  classroomWords,
  comingSoonScenes,
  scenes
} from "../miniprogram/data/scenes";

const expectedAmericanPhonetics: Record<string, string> = {
  blackboard: "/ˈblæk.bɔːrd/",
  whiteboard: "/ˈwaɪt.bɔːrd/",
  projector: "/prəˈdʒek.tɚ/",
  podium: "/ˈpoʊ.di.əm/",
  desk: "/desk/",
  chair: "/tʃer/",
  backpack: "/ˈbæk.pæk/",
  textbook: "/ˈtekst.bʊk/",
  notebook: "/ˈnoʊt.bʊk/",
  pencil: "/ˈpen.səl/",
  pen: "/pen/",
  eraser: "/ɪˈreɪ.sɚ/",
  chalk: "/tʃɑːk/",
  ruler: "/ˈruː.lɚ/",
  window: "/ˈwɪn.doʊ/",
  curtain: "/ˈkɝː.t̬ən/",
  door: "/dɔːr/",
  clock: "/klɑːk/",
  socket: "/ˈsɑː.kɪt/",
  "trash-can": "/ˈtræʃ ˌkæn/"
};

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

  it("uses a shared placeholder image for coming soon scenes", () => {
    expect(
      comingSoonScenes.every(
        (scene) =>
          scene.coverImage === "/assets/images/coming-soon-cover.png" &&
          scene.sceneImage === "/assets/images/coming-soon-cover.png"
      )
    ).toBe(true);
  });

  it("contains exactly 20 complete classroom words", () => {
    expect(classroomWords).toHaveLength(20);
    expect(new Set(classroomWords.map((word) => word.id)).size).toBe(20);
    expect(classroomWords.every((word) => word.sceneId === "classroom")).toBe(true);

    for (const word of classroomWords) {
      expect(word.cn).not.toBe("");
      expect(word.en).not.toBe("");
      expect(word.phonetic).not.toBe("");
      expect(word.exampleEn).not.toBe("");
      expect(word.exampleCn).not.toBe("");
      expect(word.expressionEn).not.toBe("");
      expect(word.expressionCn).not.toBe("");
      expect(word.audioUrl).toBe(`/assets/audio/${word.id}.mp3`);
      expect(word.position.width).toBeGreaterThan(0);
      expect(word.position.height).toBeGreaterThan(0);
    }
  });

  it("keeps classroom scene wordCount aligned with classroom words", () => {
    const classroom = scenes.find((scene) => scene.id === "classroom");

    expect(classroom?.wordCount).toBe(classroomWords.length);
  });

  it("keeps classroom phonetics aligned with the reviewed American IPA list", () => {
    expect(Object.fromEntries(classroomWords.map((word) => [word.id, word.phonetic]))).toEqual(
      expectedAmericanPhonetics
    );
  });
});

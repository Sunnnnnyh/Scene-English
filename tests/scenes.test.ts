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

const expectedClassroomHotspots: Record<
  string,
  { x: number; y: number; width: number; height: number }
> = {
  blackboard: { x: 322, y: 157, width: 506, height: 312 },
  whiteboard: { x: 856, y: 176, width: 431, height: 292 },
  projector: { x: 915, y: 36, width: 176, height: 101 },
  podium: { x: 699, y: 487, width: 311, height: 246 },
  desk: { x: 36, y: 583, width: 790, height: 228 },
  chair: { x: 0, y: 643, width: 425, height: 298 },
  backpack: { x: 1018, y: 616, width: 240, height: 298 },
  textbook: { x: 164, y: 590, width: 194, height: 75 },
  notebook: { x: 348, y: 605, width: 195, height: 100 },
  pencil: { x: 563, y: 618, width: 53, height: 98 },
  pen: { x: 620, y: 633, width: 47, height: 93 },
  eraser: { x: 681, y: 669, width: 48, height: 61 },
  chalk: { x: 395, y: 421, width: 80, height: 35 },
  ruler: { x: 742, y: 624, width: 48, height: 98 },
  window: { x: 0, y: 76, width: 178, height: 477 },
  curtain: { x: 177, y: 60, width: 111, height: 470 },
  door: { x: 1357, y: 214, width: 251, height: 467 },
  clock: { x: 1387, y: 62, width: 128, height: 129 },
  socket: { x: 1242, y: 557, width: 47, height: 68 },
  "trash-can": { x: 1401, y: 715, width: 158, height: 185 }
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

  it("uses the real classroom image dimensions for hotspot conversion", () => {
    const classroom = scenes.find((scene) => scene.id === "classroom");

    expect(classroom).toMatchObject({
      sceneImage: "/assets/picture/classroom.png",
      baseWidth: 1672,
      baseHeight: 941
    });
  });

  it("keeps classroom phonetics aligned with the reviewed American IPA list", () => {
    expect(Object.fromEntries(classroomWords.map((word) => [word.id, word.phonetic]))).toEqual(
      expectedAmericanPhonetics
    );
  });

  it("keeps useful expressions distinct from basic examples", () => {
    for (const word of classroomWords) {
      expect(word.expressionEn).not.toBe(word.exampleEn);
      expect(word.expressionEn.split(" ").length).toBeGreaterThan(word.exampleEn.split(" ").length);
    }
  });

  it("keeps useful expressions varied instead of making them all questions", () => {
    const questionExpressions = classroomWords.filter((word) =>
      word.expressionEn.trim().endsWith("?")
    );
    const questionTranslations = classroomWords.filter((word) =>
      word.expressionCn.trim().endsWith("？")
    );

    expect(questionExpressions.length).toBeLessThanOrEqual(8);
    expect(questionTranslations.length).toBeLessThanOrEqual(8);
  });

  it("keeps classroom hotspots calibrated to the current classroom artwork", () => {
    expect(Object.fromEntries(classroomWords.map((word) => [word.id, word.position]))).toEqual(
      expectedClassroomHotspots
    );
  });
});

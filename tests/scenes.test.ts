import { describe, expect, it } from "vitest";

import {
  availableScenes,
  classroomWords,
  comingSoonScenes,
  lectureHallWords,
  scenes
} from "../miniprogram/data/scenes";
import type { HotspotPosition } from "../miniprogram/types";

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

const expectedLectureHallVocabulary = [
  ["auditorium-seat", "auditorium seat"],
  ["aisle", "aisle"],
  ["stair", "stair"],
  ["handrail", "handrail"],
  ["stage", "stage"],
  ["presentation-screen", "presentation screen"],
  ["spotlight", "spotlight"],
  ["speaker-array", "speaker array"],
  ["control-booth", "control booth"],
  ["monitor", "monitor"],
  ["acoustic-panel", "acoustic panel"],
  ["ventilation-grille", "ventilation grille"],
  ["wall-light", "wall light"],
  ["exit-sign", "exit sign"],
  ["camera", "camera"],
  ["tripod", "tripod"],
  ["floor-cable-cover", "floor cable cover"],
  ["lecture-hall-podium", "podium"],
  ["microphone-stand", "microphone stand"],
  ["lecture-hall-clock", "clock"]
];

const isPointInPosition = (point: { x: number; y: number }, position: HotspotPosition) =>
  point.x >= position.x &&
  point.x <= position.x + position.width &&
  point.y >= position.y &&
  point.y <= position.y + position.height;

const getTopmostLectureHallWordIdAt = (point: { x: number; y: number }) => {
  let hitWordId = "";

  for (const word of lectureHallWords) {
    for (const position of word.positions ?? [word.position]) {
      if (isPointInPosition(point, position)) {
        hitWordId = word.id;
      }
    }
  }

  return hitWordId;
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

  it("marks Classroom and Lecture Hall as available", () => {
    expect(availableScenes.map((scene) => scene.id)).toEqual(["classroom", "lecture-hall"]);
    expect(availableScenes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "classroom",
          nameEn: "Classroom",
          wordCount: 20,
          status: "available"
        }),
        expect.objectContaining({
          id: "lecture-hall",
          nameEn: "Lecture Hall",
          wordCount: 20,
          status: "available"
        })
      ])
    );
  });

  it("keeps Dormitory and Cafeteria as coming soon", () => {
    expect(comingSoonScenes.map((scene) => scene.id)).toEqual(["dormitory", "cafeteria"]);
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

  it("contains exactly 20 complete lecture hall words", () => {
    expect(lectureHallWords).toHaveLength(20);
    expect(new Set(lectureHallWords.map((word) => word.id)).size).toBe(20);
    expect(lectureHallWords.map((word) => [word.id, word.en])).toEqual(
      expectedLectureHallVocabulary
    );
    expect(lectureHallWords.every((word) => word.sceneId === "lecture-hall")).toBe(true);

    for (const word of lectureHallWords) {
      expect(word.cn).not.toBe("");
      expect(word.en).not.toBe("");
      expect(word.phonetic).not.toBe("");
      expect(word.exampleEn).not.toBe("");
      expect(word.exampleCn).not.toBe("");
      expect(word.expressionEn).not.toBe("");
      expect(word.expressionCn).not.toBe("");
      expect(word.audioUrl).toBe(`/assets/audio/lecture-hall/${word.id}.mp3`);
      expect(word.position.width).toBeGreaterThan(0);
      expect(word.position.height).toBeGreaterThan(0);

      for (const position of word.positions ?? []) {
        expect(position.width).toBeGreaterThan(0);
        expect(position.height).toBeGreaterThan(0);
      }
    }
  });

  it("keeps lecture hall Chinese copy and phonetics readable", () => {
    for (const word of lectureHallWords) {
      for (const field of [word.cn, word.exampleCn, word.expressionCn]) {
        expect(field).toMatch(/[\u4e00-\u9fff]/);
        expect(field).not.toContain("?");
      }

      expect(word.phonetic).not.toContain("?");
    }
  });

  it("keeps lecture hall scene metadata aligned with its artwork and words", () => {
    const lectureHall = scenes.find((scene) => scene.id === "lecture-hall");

    expect(lectureHall).toMatchObject({
      coverImage: "/assets/picture/lecture-hall.png",
      sceneImage: "/assets/picture/lecture-hall.png",
      baseWidth: 1672,
      baseHeight: 941,
      wordCount: lectureHallWords.length,
      status: "available"
    });
  });

  it("keeps word ids globally unique even when scene vocabulary repeats a word", () => {
    const allWordIds = [...classroomWords, ...lectureHallWords].map((word) => word.id);

    expect(new Set(allWordIds).size).toBe(allWordIds.length);
  });

  it("supports multiple lecture hall hotspots for repeated visual objects", () => {
    const wordsWithMultipleHotspots = lectureHallWords.filter(
      (word) => (word.positions?.length ?? 0) > 1
    );
    const auditoriumSeat = lectureHallWords.find((word) => word.id === "auditorium-seat");

    expect(wordsWithMultipleHotspots.length).toBeGreaterThanOrEqual(6);
    expect(auditoriumSeat?.positions?.length).toBeGreaterThan(1);
    expect(auditoriumSeat?.positions?.[0]).toEqual(auditoriumSeat?.position);
  });

  it("removes the old seat accessory words from the new no-accessory artwork", () => {
    expect(lectureHallWords.map((word) => word.id)).not.toEqual(
      expect.arrayContaining(["armrest", "tablet-arm", "cup-holder"])
    );
  });

  it("keeps lecture hall seat hotspots split into small local regions", () => {
    const auditoriumSeat = lectureHallWords.find((word) => word.id === "auditorium-seat");

    expect(auditoriumSeat?.positions).toEqual(
      expect.arrayContaining([
        { x: 0, y: 329, width: 120, height: 174 },
        { x: 104, y: 399, width: 166, height: 162 },
        { x: 428, y: 451, width: 165, height: 190 },
        { x: 698, y: 574, width: 161, height: 201 }
      ])
    );

    for (const position of auditoriumSeat?.positions ?? []) {
      expect(position.width).toBeLessThanOrEqual(180);
      expect(position.height).toBeLessThanOrEqual(220);
    }
  });

  it("keeps lecture hall seat taps on seat cushions without covering aisles or railings", () => {
    const blueSeatSamplePoints = [
      { x: 170, y: 430 },
      { x: 370, y: 470 },
      { x: 505, y: 540 },
      { x: 635, y: 590 },
      { x: 775, y: 665 },
      { x: 890, y: 705 }
    ];
    const nonSeatSamplePoints = [
      { x: 90, y: 720 },
      { x: 320, y: 850 },
      { x: 760, y: 735 },
      { x: 1000, y: 830 },
      { x: 830, y: 580 }
    ];

    for (const point of blueSeatSamplePoints) {
      expect(getTopmostLectureHallWordIdAt(point)).toBe("auditorium-seat");
    }

    for (const point of nonSeatSamplePoints) {
      expect(getTopmostLectureHallWordIdAt(point)).not.toBe("auditorium-seat");
    }
  });

  it("keeps lecture hall small-object hotspots tight and real", () => {
    const spotlight = lectureHallWords.find((word) => word.id === "spotlight");
    const wallLight = lectureHallWords.find((word) => word.id === "wall-light");
    const floorCableCover = lectureHallWords.find((word) => word.id === "floor-cable-cover");

    expect(spotlight?.positions).toEqual([
      { x: 906, y: 50, width: 30, height: 68 },
      { x: 1017, y: 33, width: 31, height: 72 },
      { x: 1132, y: 19, width: 35, height: 73 },
      { x: 1258, y: 4, width: 37, height: 82 },
      { x: 1386, y: 0, width: 38, height: 77 }
    ]);
    expect(wallLight?.positions).toEqual([
      { x: 4, y: 205, width: 32, height: 88 },
      { x: 432, y: 218, width: 28, height: 78 },
      { x: 706, y: 354, width: 34, height: 88 }
    ]);
    expect(floorCableCover?.positions).toEqual([{ x: 1139, y: 813, width: 108, height: 126 }]);
    expect(floorCableCover?.position).toEqual(floorCableCover?.positions?.[0]);

    for (const point of [
      { x: 920, y: 82 },
      { x: 1030, y: 70 },
      { x: 1148, y: 55 },
      { x: 1275, y: 45 },
      { x: 1405, y: 35 }
    ]) {
      expect(getTopmostLectureHallWordIdAt(point)).toBe("spotlight");
    }

    expect(getTopmostLectureHallWordIdAt({ x: 820, y: 95 })).not.toBe("spotlight");
    expect(getTopmostLectureHallWordIdAt({ x: 775, y: 75 })).not.toBe("spotlight");
    expect(getTopmostLectureHallWordIdAt({ x: 1450, y: 60 })).not.toBe("spotlight");
    expect(getTopmostLectureHallWordIdAt({ x: 20, y: 245 })).toBe("wall-light");
    expect(getTopmostLectureHallWordIdAt({ x: 445, y: 250 })).toBe("wall-light");
    expect(getTopmostLectureHallWordIdAt({ x: 723, y: 390 })).toBe("wall-light");
    expect(getTopmostLectureHallWordIdAt({ x: 1120, y: 780 })).not.toBe("floor-cable-cover");
    expect(getTopmostLectureHallWordIdAt({ x: 1190, y: 870 })).toBe("floor-cable-cover");
  });

  it("keeps the right acoustic panel clickable without covering the exit sign", () => {
    const acousticPanel = lectureHallWords.find((word) => word.id === "acoustic-panel");
    const exitSign = lectureHallWords.find((word) => word.id === "exit-sign");

    expect(acousticPanel?.positions).toEqual([
      { x: 510, y: 128, width: 130, height: 323 },
      { x: 1594, y: 224, width: 66, height: 218 }
    ]);
    expect(exitSign?.position).toEqual({ x: 1588, y: 486, width: 58, height: 62 });
    expect(getTopmostLectureHallWordIdAt({ x: 1625, y: 230 })).toBe("acoustic-panel");
    expect(getTopmostLectureHallWordIdAt({ x: 1625, y: 380 })).toBe("acoustic-panel");
    expect(getTopmostLectureHallWordIdAt({ x: 1625, y: 470 })).not.toBe("acoustic-panel");
    expect(getTopmostLectureHallWordIdAt({ x: 1625, y: 515 })).toBe("exit-sign");
    expect(getTopmostLectureHallWordIdAt({ x: 1625, y: 565 })).not.toBe("exit-sign");
  });

  it("keeps the lecture hall front objects aligned to the new artwork", () => {
    expect(getTopmostLectureHallWordIdAt({ x: 830, y: 560 })).toBe("stage");
    expect(getTopmostLectureHallWordIdAt({ x: 1120, y: 650 })).toBe("stage");
    expect(getTopmostLectureHallWordIdAt({ x: 1085, y: 520 })).toBe("lecture-hall-podium");
    expect(getTopmostLectureHallWordIdAt({ x: 1455, y: 430 })).toBe("microphone-stand");
    expect(getTopmostLectureHallWordIdAt({ x: 1460, y: 650 })).toBe("microphone-stand");
    expect(getTopmostLectureHallWordIdAt({ x: 1368, y: 648 })).toBe("camera");
    expect(getTopmostLectureHallWordIdAt({ x: 1346, y: 780 })).toBe("tripod");
    expect(getTopmostLectureHallWordIdAt({ x: 1622, y: 160 })).toBe("lecture-hall-clock");
    expect(getTopmostLectureHallWordIdAt({ x: 1515, y: 620 })).not.toBe("stage");
  });

  it("keeps the lecture hall lower aisles and cable cover from covering each other", () => {
    expect(getTopmostLectureHallWordIdAt({ x: 65, y: 800 })).toBe("handrail");
    expect(getTopmostLectureHallWordIdAt({ x: 780, y: 835 })).toBe("aisle");
    expect(getTopmostLectureHallWordIdAt({ x: 1010, y: 850 })).toBe("stair");
    expect(getTopmostLectureHallWordIdAt({ x: 1190, y: 870 })).toBe("floor-cable-cover");
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

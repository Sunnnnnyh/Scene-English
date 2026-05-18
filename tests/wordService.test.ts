import { describe, expect, it } from "vitest";

import { getWordById, getWordsBySceneId } from "../miniprogram/services/wordService";

describe("wordService", () => {
  it("returns all 20 Classroom words", () => {
    const words = getWordsBySceneId("classroom");

    expect(words).toHaveLength(20);
    expect(words.every((word) => word.sceneId === "classroom")).toBe(true);
  });

  it("keeps practical expression fields available for word cards", () => {
    const projector = getWordById("projector");

    expect(projector).toMatchObject({
      id: "projector",
      sceneId: "classroom",
      cn: "投影仪",
      en: "projector",
      phonetic: "/prəˈdʒek.tɚ/",
      exampleEn: "The teacher is using the projector.",
      exampleCn: "老师正在使用投影仪。",
      expressionEn: "The projector needs to be adjusted before everyone can see the slide clearly.",
      expressionCn: "投影仪需要先调一下，大家才能看清幻灯片。",
      audioUrl: "/assets/audio/projector.mp3"
    });
  });

  it("finds a word by id across the local word list", () => {
    expect(getWordById("trash-can")).toMatchObject({
      id: "trash-can",
      en: "trash can",
      sceneId: "classroom"
    });
  });

  it("returns an empty list for an unknown scene id", () => {
    expect(getWordsBySceneId("unknown-scene")).toEqual([]);
  });

  it("returns undefined for an unknown word id", () => {
    expect(getWordById("unknown-word")).toBeUndefined();
  });
});

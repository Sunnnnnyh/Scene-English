import { describe, expect, it } from "vitest";

import { getWordById, getWordsBySceneId } from "../miniprogram/services/wordService";

describe("wordService", () => {
  it("returns all 20 Classroom words", () => {
    const words = getWordsBySceneId("classroom");

    expect(words).toHaveLength(20);
    expect(words.every((word) => word.sceneId === "classroom")).toBe(true);
  });

  it("returns all 20 Lecture Hall words", () => {
    const words = getWordsBySceneId("lecture-hall");

    expect(words).toHaveLength(20);
    expect(words.every((word) => word.sceneId === "lecture-hall")).toBe(true);
  });

  it("keeps practical expression fields available for word cards", () => {
    const projector = getWordById("projector");

    expect(projector).toMatchObject({
      id: "projector",
      sceneId: "classroom",
      en: "projector",
      audioUrl: "/assets/audio/projector.mp3"
    });
  });

  it("finds words by id across both local word lists", () => {
    expect(getWordById("trash-can")).toMatchObject({
      id: "trash-can",
      en: "trash can",
      sceneId: "classroom"
    });
    expect(getWordById("auditorium-seat")).toMatchObject({
      id: "auditorium-seat",
      en: "auditorium seat",
      sceneId: "lecture-hall"
    });
  });

  it("returns an empty list for an unknown scene id", () => {
    expect(getWordsBySceneId("unknown-scene")).toEqual([]);
  });

  it("returns undefined for an unknown word id", () => {
    expect(getWordById("unknown-word")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import {
  convertHotspotToPercent,
  createHotspotStyle,
  isPointInHotspot
} from "../miniprogram/utils/hotspot";

describe("hotspot util", () => {
  const hotspot = {
    x: 480,
    y: 270,
    width: 240,
    height: 135
  };

  it("converts original canvas coordinates to percentage values", () => {
    expect(convertHotspotToPercent(hotspot, 1920, 1080)).toEqual({
      left: 25,
      top: 25,
      width: 12.5,
      height: 12.5
    });
  });

  it("keeps percentage conversion proportional across scaled canvases", () => {
    expect(convertHotspotToPercent(hotspot, 1920, 1080)).toEqual(
      convertHotspotToPercent({ x: 240, y: 135, width: 120, height: 67.5 }, 960, 540)
    );
  });

  it("creates a wxss style string for transparent hotspot views", () => {
    expect(createHotspotStyle(hotspot, 1920, 1080)).toBe(
      "left: 25%; top: 25%; width: 12.5%; height: 12.5%;"
    );
  });

  it("rejects non-positive base dimensions", () => {
    expect(() => convertHotspotToPercent(hotspot, 0, 1080)).toThrow(
      "Hotspot base dimensions must be greater than 0"
    );
    expect(() => convertHotspotToPercent(hotspot, 1920, 0)).toThrow(
      "Hotspot base dimensions must be greater than 0"
    );
  });

  it("detects points inside a hotspot", () => {
    expect(isPointInHotspot({ x: 600, y: 330 }, hotspot)).toBe(true);
  });

  it("treats hotspot edges as clickable", () => {
    expect(isPointInHotspot({ x: 480, y: 270 }, hotspot)).toBe(true);
    expect(isPointInHotspot({ x: 720, y: 405 }, hotspot)).toBe(true);
  });

  it("rejects points outside a hotspot", () => {
    expect(isPointInHotspot({ x: 479, y: 330 }, hotspot)).toBe(false);
    expect(isPointInHotspot({ x: 600, y: 406 }, hotspot)).toBe(false);
  });
});

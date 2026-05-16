import type { HotspotPosition } from "../types";

export type Point = {
  x: number;
  y: number;
};

export type PercentHotspotPosition = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const toPercent = (value: number, base: number) => (value / base) * 100;

export const convertHotspotToPercent = (
  position: HotspotPosition,
  baseWidth: number,
  baseHeight: number
): PercentHotspotPosition => ({
  left: toPercent(position.x, baseWidth),
  top: toPercent(position.y, baseHeight),
  width: toPercent(position.width, baseWidth),
  height: toPercent(position.height, baseHeight)
});

export const createHotspotStyle = (
  position: HotspotPosition,
  baseWidth: number,
  baseHeight: number
) => {
  const percentPosition = convertHotspotToPercent(position, baseWidth, baseHeight);

  return `left: ${percentPosition.left}%; top: ${percentPosition.top}%; width: ${percentPosition.width}%; height: ${percentPosition.height}%;`;
};

export const isPointInHotspot = (point: Point, position: HotspotPosition) =>
  point.x >= position.x &&
  point.x <= position.x + position.width &&
  point.y >= position.y &&
  point.y <= position.y + position.height;

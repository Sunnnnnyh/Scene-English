import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

type AppConfig = {
  tabBar?: {
    list?: Array<{
      iconPath?: string;
      pagePath: string;
      selectedIconPath?: string;
      text: string;
    }>;
  };
};

const appConfig = JSON.parse(
  readFileSync(fileURLToPath(new URL("../miniprogram/app.json", import.meta.url)), "utf8")
) as AppConfig;

describe("bottom tab navigation", () => {
  it("registers Home, Learn, Review, and Me as tab bar pages", () => {
    expect(appConfig.tabBar?.list).toEqual([
      {
        iconPath: "assets/icons/tab-home.png",
        pagePath: "pages/index/index",
        selectedIconPath: "assets/icons/tab-home-active.png",
        text: "Home"
      },
      {
        iconPath: "assets/icons/tab-learn.png",
        pagePath: "pages/scene/scene",
        selectedIconPath: "assets/icons/tab-learn-active.png",
        text: "Learn"
      },
      {
        iconPath: "assets/icons/tab-review.png",
        pagePath: "pages/review/review",
        selectedIconPath: "assets/icons/tab-review-active.png",
        text: "Review"
      },
      {
        iconPath: "assets/icons/tab-me.png",
        pagePath: "pages/me/me",
        selectedIconPath: "assets/icons/tab-me-active.png",
        text: "Me"
      }
    ]);
  });

  it("uses local tab icons so native tab text does not sit in the icon slot", () => {
    for (const item of appConfig.tabBar?.list ?? []) {
      expect(item.iconPath).toBeTruthy();
      expect(item.selectedIconPath).toBeTruthy();
      expect(item.iconPath).toMatch(/\.png$/);
      expect(item.selectedIconPath).toMatch(/\.png$/);
      expect(existsSync(join(process.cwd(), "miniprogram", item.iconPath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "miniprogram", item.selectedIconPath ?? ""))).toBe(
        true
      );
      expect(
        readFileSync(join(process.cwd(), "miniprogram", item.iconPath ?? "")).subarray(0, 8)
      ).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      expect(
        readFileSync(join(process.cwd(), "miniprogram", item.selectedIconPath ?? "")).subarray(0, 8)
      ).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
  });
});

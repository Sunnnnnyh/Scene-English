import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type AppConfig = {
  tabBar?: {
    list?: Array<{
      pagePath: string;
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
        pagePath: "pages/index/index",
        text: "Home"
      },
      {
        pagePath: "pages/scene/scene",
        text: "Learn"
      },
      {
        pagePath: "pages/review/review",
        text: "Review"
      },
      {
        pagePath: "pages/me/me",
        text: "Me"
      }
    ]);
  });
});

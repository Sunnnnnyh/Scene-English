import { describe, expect, it } from "vitest";

import { createReviewViewModel } from "../miniprogram/pages/review/reviewViewModel";

describe("review page view model", () => {
  it("reserves global entries for favorites and mistakes", () => {
    expect(createReviewViewModel()).toEqual({
      title: "复习",
      subtitle: "把收藏和错题集中放在全局复习入口里。",
      reviewEntries: [
        {
          id: "favorites",
          title: "收藏夹",
          description: "查看主动标记的重点单词",
          actionLabel: "View",
          url: "/pages/favorites/favorites"
        },
        {
          id: "mistakes",
          title: "错题夹",
          description: "回到薄弱单词和错误类型",
          actionLabel: "Review",
          url: "/pages/mistakes/mistakes"
        }
      ]
    });
  });
});

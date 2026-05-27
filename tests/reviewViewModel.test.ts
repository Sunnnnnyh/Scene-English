import { describe, expect, it } from "vitest";

import { createReviewViewModel } from "../miniprogram/pages/review/reviewViewModel";

describe("review page view model", () => {
  it("reserves global entries for favorites and mistakes", () => {
    expect(createReviewViewModel()).toEqual({
      title: "复习",
      reviewEntries: [
        {
          id: "favorites",
          title: "收藏夹",
          actionLabel: "View",
          url: "/pages/favorites/favorites"
        },
        {
          id: "mistakes",
          title: "错题夹",
          actionLabel: "Review",
          url: "/pages/mistakes/mistakes"
        }
      ]
    });
  });
});

export type ReviewEntryId = "favorites" | "mistakes";

export type ReviewEntry = {
  id: ReviewEntryId;
  title: string;
  actionLabel: string;
  url: string;
};

export type ReviewViewModel = {
  title: string;
  reviewEntries: ReviewEntry[];
};

export function createReviewViewModel(): ReviewViewModel {
  return {
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
  };
}

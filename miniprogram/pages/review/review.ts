type ReviewEntryTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      url?: string;
    };
  };
};

Page({
  data: {
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
  },

  onReviewEntryTap(event: ReviewEntryTapEvent) {
    const { url } = event.currentTarget.dataset;

    if (!url) {
      return;
    }

    wx.navigateTo({ url });
  }
});

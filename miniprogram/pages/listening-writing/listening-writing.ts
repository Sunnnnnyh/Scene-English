type ListeningWritingPageOptions = {
  sceneId?: string;
};

function createListeningWritingPageData(sceneId: string) {
  return {
    sceneId,
    title: "听力 + 默写",
    backLabel: "返回 Classroom",
    backAction: {
      type: "switchTab",
      url: "/pages/scene/scene"
    }
  };
}

Page({
  data: createListeningWritingPageData("classroom"),

  onLoad(options: ListeningWritingPageOptions) {
    this.setData(createListeningWritingPageData(options.sceneId ?? "classroom"));
  },

  onBackToScene() {
    wx.switchTab({
      url: "/pages/scene/scene"
    });
  }
});

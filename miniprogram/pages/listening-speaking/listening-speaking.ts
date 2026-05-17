type ListeningSpeakingPageOptions = {
  sceneId?: string;
};

function createListeningSpeakingPageData(sceneId: string) {
  return {
    sceneId,
    title: "听力 + 口语",
    description: "Listen + Speak 占位页面",
    backLabel: "返回 Classroom",
    backAction: {
      type: "switchTab",
      url: "/pages/scene/scene"
    }
  };
}

Page({
  data: createListeningSpeakingPageData("classroom"),

  onLoad(options: ListeningSpeakingPageOptions) {
    this.setData(createListeningSpeakingPageData(options.sceneId ?? "classroom"));
  },

  onBackToScene() {
    wx.switchTab({
      url: "/pages/scene/scene"
    });
  }
});

type MemoryPageOptions = {
  sceneId?: string;
};

function createMemoryPageData(sceneId: string) {
  return {
    sceneId,
    title: "单词记忆模式",
    description: "Memory Mode 占位页面",
    backLabel: "返回 Classroom",
    backAction: {
      type: "switchTab",
      url: "/pages/scene/scene"
    }
  };
}

Page({
  data: createMemoryPageData("classroom"),

  onLoad(options: MemoryPageOptions) {
    this.setData(createMemoryPageData(options.sceneId ?? "classroom"));
  },

  onBackToScene() {
    wx.switchTab({
      url: "/pages/scene/scene"
    });
  }
});

import { initializeCloudCapability } from "./services/cloudInitService";

App<IAppOption>({
  globalData: {
    isCloudAvailable: false
  },

  onLaunch() {
    const cloudInitResult = initializeCloudCapability(wx);

    this.globalData.isCloudAvailable = cloudInitResult.ok;
  }
});

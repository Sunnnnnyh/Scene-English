import { createLearningActivityChart } from "../../services/learningActivityService";
import { getFavorites } from "../../services/favoriteService";
import { getMistakes } from "../../services/mistakeService";
import { getSceneProgress } from "../../services/progressService";
import { getUserProfile, saveUserProfile } from "../../services/profileService";
import type { LearningActivityRange, UserProfile } from "../../types";
import { createMeViewModel } from "./meViewModel";

type ProfileInputEvent = {
  detail: {
    value: string;
  };
};

type ChartRangeEvent = {
  currentTarget: {
    dataset: {
      range: LearningActivityRange;
    };
  };
};

type QuickEntryEvent = {
  currentTarget: {
    dataset: {
      target: "learn" | "favorites" | "mistakes";
    };
  };
};

type ChooseAvatarEvent = {
  detail: {
    avatarUrl?: string;
  };
};

const createPageData = (
  activeChartRange: LearningActivityRange,
  isEditingProfile = false,
  editableProfile = getUserProfile()
) =>
  createMeViewModel(
    getSceneProgress("classroom"),
    getFavorites(),
    getMistakes(),
    getUserProfile(),
    activeChartRange,
    createLearningActivityChart(activeChartRange),
    isEditingProfile,
    editableProfile
  );

Page({
  data: createPageData("week"),

  onShow() {
    const activeChartRange = this.data.chartTabs?.find((tab) => tab.isActive)?.value ?? "week";

    this.setData(createPageData(activeChartRange));
  },

  onStartEditProfile() {
    this.setData(
      createPageData(this.data.chartTabs?.find((tab) => tab.isActive)?.value ?? "week", true)
    );
  },

  onCancelEditProfile() {
    this.setData(createPageData(this.data.chartTabs?.find((tab) => tab.isActive)?.value ?? "week"));
  },

  onNicknameInput(event: ProfileInputEvent) {
    this.setData({
      editableProfile: {
        ...this.data.editableProfile,
        nickname: event.detail.value
      }
    });
  },

  onSignatureInput(event: ProfileInputEvent) {
    this.setData({
      editableProfile: {
        ...this.data.editableProfile,
        signature: event.detail.value
      }
    });
  },

  onChooseAvatar(event: ChooseAvatarEvent) {
    const avatarUrl = event.detail.avatarUrl;

    if (avatarUrl) {
      this.saveAvatarUrl(avatarUrl);
    }
  },

  saveAvatarUrl(avatarUrl: string) {
    const activeChartRange = this.data.chartTabs?.find((tab) => tab.isActive)?.value ?? "week";
    const editableProfile = {
      ...this.data.editableProfile,
      avatarUrl
    };
    const savedProfile = saveUserProfile({
      ...this.data.profile,
      avatarUrl
    });

    this.setData(
      createPageData(activeChartRange, this.data.isEditingProfile, {
        ...editableProfile,
        updatedAt: savedProfile.updatedAt
      })
    );
  },

  onSaveProfile() {
    const activeChartRange = this.data.chartTabs?.find((tab) => tab.isActive)?.value ?? "week";
    const savedProfile = saveUserProfile(this.data.editableProfile as UserProfile);

    this.setData(createPageData(activeChartRange, false, savedProfile));
  },

  onChangeChartRange(event: ChartRangeEvent) {
    const activeChartRange = event.currentTarget.dataset.range;

    this.setData(createPageData(activeChartRange));
  },

  onTapQuickEntry(event: QuickEntryEvent) {
    const target = event.currentTarget.dataset.target;

    if (target === "learn") {
      wx.switchTab({
        url: "/pages/scene/scene"
      });
      return;
    }

    wx.navigateTo({
      url: target === "favorites" ? "/pages/favorites/favorites" : "/pages/mistakes/mistakes"
    });
  }
});

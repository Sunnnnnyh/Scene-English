import type { UserProfile } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const DEFAULT_PROFILE_COPY = {
  nickname: "SceneEnglish Learner",
  signature: "Keep learning from real scenes.",
  avatarText: "SE",
  avatarUrl: ""
};

export type EditableUserProfile = Partial<Omit<UserProfile, "updatedAt">>;

const createDefaultProfile = (): UserProfile => ({
  ...DEFAULT_PROFILE_COPY,
  updatedAt: new Date().toISOString()
});

const normalizeAvatarText = (value: string | undefined, fallback: string): string => {
  const normalizedValue = value?.trim().slice(0, 2).toUpperCase();

  return normalizedValue || fallback;
};

export function getUserProfile(adapter?: StorageAdapter): UserProfile {
  return readStorage("profile", createDefaultProfile(), adapter);
}

export function saveUserProfile(
  profileUpdate: EditableUserProfile,
  adapter?: StorageAdapter
): UserProfile {
  const currentProfile = getUserProfile(adapter);
  const nextProfile: UserProfile = {
    nickname: profileUpdate.nickname?.trim() || currentProfile.nickname,
    signature: profileUpdate.signature?.trim() || currentProfile.signature,
    avatarText: normalizeAvatarText(profileUpdate.avatarText, currentProfile.avatarText),
    avatarUrl: profileUpdate.avatarUrl?.trim() ?? currentProfile.avatarUrl,
    updatedAt: new Date().toISOString()
  };

  writeStorage("profile", nextProfile, adapter);

  return nextProfile;
}

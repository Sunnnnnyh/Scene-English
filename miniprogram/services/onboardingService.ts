import type { OnboardingState } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const defaultOnboardingState: OnboardingState = {
  memoryGuideCompleted: false,
  updatedAt: ""
};

export function getOnboardingState(adapter?: StorageAdapter): OnboardingState {
  return readStorage("onboarding", defaultOnboardingState, adapter);
}

export function shouldShowMemoryGuide(adapter?: StorageAdapter): boolean {
  return !getOnboardingState(adapter).memoryGuideCompleted;
}

export function completeMemoryGuide(adapter?: StorageAdapter): OnboardingState {
  const completedState: OnboardingState = {
    ...getOnboardingState(adapter),
    memoryGuideCompleted: true,
    updatedAt: new Date().toISOString()
  };

  writeStorage("onboarding", completedState, adapter);

  return completedState;
}

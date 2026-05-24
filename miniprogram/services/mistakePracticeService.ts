import type { MistakeType, Scene } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

export type PendingMistakePracticeRequest = {
  sceneId: Scene["id"];
  mistakeType: MistakeType;
  createdAt: string;
};

type SettingsStorage = {
  pendingMistakePracticeRequest?: PendingMistakePracticeRequest;
};

export function savePendingMistakePracticeRequest(
  request: Omit<PendingMistakePracticeRequest, "createdAt">,
  adapter?: StorageAdapter
): PendingMistakePracticeRequest {
  const settings = readStorage<SettingsStorage>("settings", {}, adapter);
  const pendingMistakePracticeRequest = {
    ...request,
    createdAt: new Date().toISOString()
  };

  writeStorage(
    "settings",
    {
      ...settings,
      pendingMistakePracticeRequest
    },
    adapter
  );

  return pendingMistakePracticeRequest;
}

export function consumePendingMistakePracticeRequest(
  adapter?: StorageAdapter
): PendingMistakePracticeRequest | null {
  const settings = readStorage<SettingsStorage>("settings", {}, adapter);
  const pendingMistakePracticeRequest = settings.pendingMistakePracticeRequest;

  if (!pendingMistakePracticeRequest) {
    return null;
  }

  const remainingSettings = { ...settings };

  delete remainingSettings.pendingMistakePracticeRequest;
  writeStorage("settings", remainingSettings, adapter);

  return pendingMistakePracticeRequest;
}

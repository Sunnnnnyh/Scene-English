import type { Scene } from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

type SettingsStorage = {
  selectedSceneId?: Scene["id"];
};

export function saveSelectedSceneId(sceneId: Scene["id"], adapter?: StorageAdapter) {
  const settings = readStorage<SettingsStorage>("settings", {}, adapter);

  writeStorage(
    "settings",
    {
      ...settings,
      selectedSceneId: sceneId
    },
    adapter
  );
}

export function getSelectedSceneId(adapter?: StorageAdapter): Scene["id"] | null {
  const settings = readStorage<SettingsStorage>("settings", {}, adapter);

  return settings.selectedSceneId ?? null;
}

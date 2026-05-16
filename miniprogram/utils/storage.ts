import type { LocalStore, SceneEnglishStorageKey, StorageEntity } from "../types";

const STORAGE_VERSION = 1;

export type StorageAdapter = {
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
  removeStorageSync(key: string): void;
};

export const getStorageKey = (entity: StorageEntity): SceneEnglishStorageKey =>
  `sceneenglish:${entity}`;

export const createLocalStore = <T>(data: T): LocalStore<T> => ({
  version: STORAGE_VERSION,
  updatedAt: new Date().toISOString(),
  data
});

const getDefaultStorageAdapter = (): StorageAdapter => {
  const globalWithWx = globalThis as typeof globalThis & { wx?: StorageAdapter };

  if (!globalWithWx.wx) {
    throw new Error("wx storage adapter is unavailable");
  }

  return globalWithWx.wx;
};

const isLocalStore = <T>(value: unknown): value is LocalStore<T> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<LocalStore<T>>;

  return (
    candidate.version === STORAGE_VERSION &&
    typeof candidate.updatedAt === "string" &&
    Object.prototype.hasOwnProperty.call(candidate, "data")
  );
};

export const readStorage = <T>(
  entity: StorageEntity,
  defaultValue: T,
  adapter: StorageAdapter = getDefaultStorageAdapter()
): T => {
  try {
    const storedValue = adapter.getStorageSync(getStorageKey(entity));

    if (!isLocalStore<T>(storedValue)) {
      return defaultValue;
    }

    return storedValue.data;
  } catch {
    return defaultValue;
  }
};

export const writeStorage = <T>(
  entity: StorageEntity,
  data: T,
  adapter: StorageAdapter = getDefaultStorageAdapter()
) => {
  adapter.setStorageSync(getStorageKey(entity), createLocalStore(data));
};

export const removeStorage = (
  entity: StorageEntity,
  adapter: StorageAdapter = getDefaultStorageAdapter()
) => {
  adapter.removeStorageSync(getStorageKey(entity));
};

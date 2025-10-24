import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const inMemoryStore = new Map<string, string>();

const isWeb = Platform.OS === 'web';

const getBrowserStorage = (): WebStorage | null => {
  if (typeof globalThis === 'undefined') {
    return null;
  }

  try {
    const candidate = (globalThis as { localStorage?: WebStorage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
};

export async function setItemAsync(key: string, value: string) {
  if (!isWeb) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(key, value);
  } else {
    inMemoryStore.set(key, value);
  }
}

export async function getItemAsync(key: string) {
  if (!isWeb) {
    return SecureStore.getItemAsync(key);
  }

  const storage = getBrowserStorage();
  if (storage) {
    return storage.getItem(key);
  }

  return inMemoryStore.get(key) ?? null;
}

export async function deleteItemAsync(key: string) {
  if (!isWeb) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  const storage = getBrowserStorage();
  if (storage) {
    storage.removeItem(key);
  }

  inMemoryStore.delete(key);
}

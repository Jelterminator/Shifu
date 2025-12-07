import { Platform } from 'react-native';

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

// Lazy load MMKV to prevent crashes if this file is bundled for Web by mistake
let mmkv: any;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    mmkv = new MMKV();
  } catch (e) {
    console.error('Failed to load MMKV native module:', e);
  }
} else {
    console.warn('⚠️ storage.ts (Native) was loaded on Web! Use storage.web.ts instead.');
}

export const storage: StorageAdapter = {
  get: (key) => {
    if (!mmkv) return null;
    try {
      return mmkv.getString(key) ?? null;
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      return null;
    }
  },
  set: (key, value) => {
    if (!mmkv) return;
    try {
      mmkv.set(key, value);
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
    }
  },
  delete: (key) => {
    if (!mmkv) return;
    try {
      mmkv.delete(key);
    } catch (error) {
      console.error(`Storage delete error for ${key}:`, error);
    }
  },
  clear: () => {
    if (!mmkv) return;
    try {
      mmkv.clearAll();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

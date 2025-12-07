import { Platform } from 'react-native';

// Import MMKV as a value using require() to avoid type-only import issue
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

// Native Storage Implementation (iOS/Android)
const createNativeStorage = (): StorageAdapter => {
  const mmkv = new MMKV();
  return {
    get: (key) => {
      try {
        return mmkv.getString(key) ?? null;
      } catch (error) {
        console.error(`Storage get error for ${key}:`, error);
        return null;
      }
    },
    set: (key, value) => {
      try {
        mmkv.set(key, value);
      } catch (error) {
        console.error(`Storage set error for ${key}:`, error);
      }
    },
    delete: (key) => {
      try {
        mmkv.delete(key);
      } catch (error) {
        console.error(`Storage delete error for ${key}:`, error);
      }
    },
    clear: () => {
      try {
        mmkv.clearAll();
      } catch (error) {
        console.error('Storage clear error:', error);
      }
    },
  };
};

// Web Storage Implementation
const createWebStorage = (): StorageAdapter => {
  return {
    get: (key) => {
      try {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.error(`Storage get error for ${key}:`, error);
        return null;
      }
    },
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.error(`Storage set error for ${key}:`, error);
      }
    },
    delete: (key) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Storage delete error for ${key}:`, error);
      }
    },
    clear: () => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Storage clear error:', error);
      }
    },
  };
};

export const storage: StorageAdapter =
  Platform.OS === 'web' ? createWebStorage() : createNativeStorage();

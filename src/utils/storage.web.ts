import type { DatabaseService } from '../db/database';

export interface StorageAdapter {
  get(key: string): string | null;
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | boolean | number): void;
  delete(key: string): void;
  clear(): void;
  preload(db: DatabaseService): Promise<void>;
}

/**
 * Web storage implementation using localStorage
 */
const webStorage: StorageAdapter = {
  get: key => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  getString: key => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) ?? undefined;
    }
    return undefined;
  },
  getBoolean: key => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = localStorage.getItem(key);
      return val === 'true';
    }
    return undefined;
  },
  getNumber: key => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = localStorage.getItem(key);
      return val ? Number(val) : undefined;
    }
    return undefined;
  },
  set: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, String(value));
    }
  },
  delete: key => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  },
  preload: async (_db: DatabaseService) => {
    // No-op for web as we use localStorage directly
    return Promise.resolve();
  },
};

export const storage = webStorage;

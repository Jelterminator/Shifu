import { MMKV } from 'react-native-mmkv';

export interface StorageAdapter {
  get(key: string): string | null;
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | boolean | number): void;
  delete(key: string): void;
  clear(): void;
}

/**
 * Native storage implementation using MMKV
 */
function createStorage(): StorageAdapter {
  try {
    // Check if running in a browser environment with localStorage available
    // (This helps if we want to explicitly prefer localStorage on web without crashing MMKV first)
    // However, react-native-mmkv might crash on import in some web setups if not handled,
    // but here we are inside the function.

    // If we are strictly on standard React Native Web, MMKV new() might throw.
    const mmkv = new MMKV();

    return {
      get: key => mmkv.getString(key) ?? null,
      getString: key => mmkv.getString(key),
      getBoolean: key => mmkv.getBoolean(key),
      getNumber: key => mmkv.getNumber(key),
      set: (key, value) => mmkv.set(key, value),
      delete: key => mmkv.delete(key),
      clear: () => mmkv.clearAll(),
    };
  } catch (error) {
    if (typeof localStorage !== 'undefined') {
      return {
        get: key => localStorage.getItem(key),
        getString: key => localStorage.getItem(key) ?? undefined,
        getBoolean: key => {
          const val = localStorage.getItem(key);
          return val === 'true' ? true : val === 'false' ? false : undefined;
        },
        getNumber: key => {
          const val = localStorage.getItem(key);
          return val ? Number(val) : undefined;
        },
        set: (key, value) => localStorage.setItem(key, String(value)),
        delete: key => localStorage.removeItem(key),
        clear: () => localStorage.clear(),
      };
    }

    console.error('❌ Failed to initialize MMKV and localStorage not available:', error);
    // Fallback object that does nothing/logs errors to prevent crashes
    return {
      get: () => null,
      getString: () => undefined,
      getBoolean: () => undefined,
      getNumber: () => undefined,
      set: () => {},
      delete: () => {},
      clear: () => {},
    };
  }
}

export const storage = createStorage();

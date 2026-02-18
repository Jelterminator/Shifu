import { MMKV } from 'react-native-mmkv';
import type { DatabaseService } from '../db/database';

export interface StorageAdapter {
  get(key: string): string | null;
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | boolean | number): void;
  delete(key: string): void;
  clear(): void;
  /**
   * Preload data from SQLite if MMKV is unavailable.
   * Call this during app initialization.
   */
  preload(db: DatabaseService): Promise<void>;
}

/**
 * Native storage implementation using MMKV with SQLite Fallback for Expo Go
 */
function createStorage(): StorageAdapter {
  let mmkv: MMKV | null = null;
  let useFallback = false;
  const memoryCache = new Map<string, string>();
  let dbRef: DatabaseService | null = null;

  // Try to initialize MMKV
  try {
    mmkv = new MMKV();
  } catch (e) {
    // MMKV failed (likely Expo Go)
    useFallback = true;

    // Check for web backup
    if (typeof localStorage !== 'undefined') {
      // On web, we don't need the complex SQLite fallback because localStorage works fine.
      // We can just proxy to localStorage.
    }
  }

  // Helper to persist to SQLite if in fallback mode
  const persistToSqlite = async (key: string, value: string | null): Promise<void> => {
    if (!dbRef || !useFallback) return;
    try {
      if (value === null) {
        await dbRef.execute('DELETE FROM kv_store WHERE key = ?', [key]);
      } else {
        await dbRef.execute('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [
          key,
          value,
        ]);
      }
    } catch (e) {
      console.warn('Checking storage persistence failed:', e);
    }
  };

  return {
    get: key => {
      if (mmkv) return mmkv.getString(key) ?? null;
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memoryCache.get(key) ?? null;
    },
    getString: key => {
      if (mmkv) return mmkv.getString(key);
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key) ?? undefined;
      return memoryCache.get(key);
    },
    getBoolean: key => {
      if (mmkv) return mmkv.getBoolean(key);
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(key);
        return v === 'true' ? true : v === 'false' ? false : undefined;
      }
      const val = memoryCache.get(key);
      return val === 'true' ? true : val === 'false' ? false : undefined;
    },
    getNumber: key => {
      if (mmkv) return mmkv.getNumber(key);
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(key);
        return v ? Number(v) : undefined;
      }
      const val = memoryCache.get(key);
      return val ? Number(val) : undefined;
    },
    set: (key, value) => {
      if (mmkv) {
        mmkv.set(key, value);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, String(value));
        return;
      }

      // Fallback Mode (Expo Go)
      const strVal = String(value);
      memoryCache.set(key, strVal);
      // Fire and forget persistence
      void persistToSqlite(key, strVal);
    },
    delete: key => {
      if (mmkv) {
        mmkv.delete(key);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }

      memoryCache.delete(key);
      void persistToSqlite(key, null);
    },
    clear: () => {
      if (mmkv) {
        mmkv.clearAll();
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        return;
      }

      memoryCache.clear();
      if (dbRef) {
        void dbRef.execute('DELETE FROM kv_store').catch(() => {});
      }
    },
    preload: async (db: DatabaseService) => {
      if (mmkv) return; // MMKV works, no need to preload
      if (typeof localStorage !== 'undefined') return; // Web works

      dbRef = db;
      useFallback = true;

      try {
        // Init table
        await db.execute('CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)');

        // Load all keys
        const rows = await db.query<{ key: string; value: string }>(
          'SELECT key, value FROM kv_store'
        );
        rows.forEach(row => {
          if (row.key && row.value) {
            memoryCache.set(row.key, row.value);
          }
        });
      } catch {
        // failed to init fallback
      }
    },
  };
}

export const storage = createStorage();

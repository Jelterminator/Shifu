// import { MMKV } from 'react-native-mmkv';

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

/**
 * Native storage implementation using MMKV
 */
function createStorage(): StorageAdapter {
  console.log('⚠️⚠️⚠️ LOADING STORAGE.NATIVE.TS ON WEB?? ⚠️⚠️⚠️');
  // try {
  //   const mmkv = new MMKV();

  //   return {
  //     get: key => {
  //       try {
  //         return mmkv.getString(key) ?? null;
  //       } catch (error) {
  //         console.error(`Storage get error for ${key}:`, error);
  //         return null;
  //       }
  //     },
  //     set: (key, value) => {
  //       try {
  //         mmkv.set(key, value);
  //       } catch (error) {
  //         console.error(`Storage set error for ${key}:`, error);
  //       }
  //     },
  //     delete: key => {
  //       try {
  //         mmkv.delete(key);
  //       } catch (error) {
  //         console.error(`Storage delete error for ${key}:`, error);
  //       }
  //     },
  //     clear: () => {
  //       try {
  //         mmkv.clearAll();
  //       } catch (error) {
  //         console.error('Storage clear error:', error);
  //       }
  //     },
  //   };
  // } catch (error) {
  //   console.error('❌ Failed to initialize MMKV:', error);
    // Fallback object that does nothing/logs errors to prevent crashes
    return {
        get: () => null,
        set: () => {},
        delete: () => {},
        clear: () => {},
    };
  // }
}

export const storage = createStorage();

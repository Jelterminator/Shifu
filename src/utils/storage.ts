import { Platform } from 'react-native';

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

/**
 * Web storage implementation using localStorage
 */
const webStorage: StorageAdapter = {
  get: key => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Web storage get error for ${key}:`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Web storage set error for ${key}:`, error);
    }
  },
  delete: key => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Web storage delete error for ${key}:`, error);
    }
  },
  clear: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Web storage clear error:', error);
    }
  },
};

/**
 * Native storage implementation using MMKV
 */
const createNativeStorage = (): StorageAdapter => {
  let mmkv: {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
    clearAll: () => void;
  } | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv') as {
      MMKV: new () => {
        getString: (key: string) => string | undefined;
        set: (key: string, value: string) => void;
        delete: (key: string) => void;
        clearAll: () => void;
      };
    };
    mmkv = new MMKV();
    // console.log('✅ MMKV native storage initialized');
  } catch (error) {
    console.error('❌ Failed to initialize MMKV native storage:', error);
  }

  return {
    get: key => {
      if (!mmkv) {
        console.warn('⚠️ MMKV not available, returning null');
        return null;
      }
      try {
        return mmkv.getString(key) ?? null;
      } catch (error) {
        console.error(`Storage get error for ${key}:`, error);
        return null;
      }
    },
    set: (key, value) => {
      if (!mmkv) {
        console.warn('⚠️ MMKV not available, cannot set value');
        return;
      }
      try {
        mmkv.set(key, value);
      } catch (error) {
        console.error(`Storage set error for ${key}:`, error);
      }
    },
    delete: key => {
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
};

/**
 * Platform-aware storage adapter
 * Automatically selects the correct implementation based on the platform
 */
const createStorage = (): StorageAdapter => {
  if (Platform.OS === 'web') {
    // console.log('🌐 Using web storage (localStorage)');
    return webStorage;
  }

  // console.log('📱 Using native storage (MMKV)');
  return createNativeStorage();
};

/**
 * Export the appropriate storage implementation for the current platform
 */
export const storage = createStorage();

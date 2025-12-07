
export interface StorageAdapter {
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

export const storage = webStorage;

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

console.log('🌐 storage.web.ts: Loading Web Storage Adapter');

export const storage: StorageAdapter = {
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

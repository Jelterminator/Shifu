import { storage } from '../utils/storage';
import { createStore } from '../utils/store';

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  timezone: string;
  latitude?: number;
  longitude?: number;
  sleepStart?: string;
  sleepEnd?: string;
  workStart?: string;
  workEnd?: string;
  spiritualPractices?: string[];
}

export interface UserStoreState {
  user: User;
  isAuthenticated: boolean;
  deviceConnected: boolean;
  setUser: (user: User) => void;
  setDeviceConnected: (connected: boolean) => void;
  clearUser: () => void;
}

const STORAGE_KEY = 'user-storage';
const DEFAULT_USER: User = { id: null, name: null, email: null, timezone: 'UTC' };

// Load initial state
const loadInitialState = (): { user: User; isAuthenticated: boolean; deviceConnected: boolean } => {
  try {
    const json = storage.get(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as
        | { state?: { user: User; isAuthenticated: boolean; deviceConnected?: boolean } }
        | { user: User; isAuthenticated: boolean; deviceConnected?: boolean };

      // Handle zestand persist structure if migration needed
      if ('state' in parsed && parsed.state) {
        return {
          user: parsed.state.user || DEFAULT_USER,
          isAuthenticated: parsed.state.isAuthenticated || false,
          deviceConnected: parsed.state.deviceConnected || false,
        };
      }
      const data = parsed as { user?: User; isAuthenticated?: boolean; deviceConnected?: boolean };
      return {
        user: data.user || DEFAULT_USER,
        isAuthenticated: data.isAuthenticated || false,
        deviceConnected: data.deviceConnected || false,
      };
    }
  } catch {
    // skip
  }
  return { user: DEFAULT_USER, isAuthenticated: false, deviceConnected: false };
};

export const useUserStore = createStore<UserStoreState>((set, get) => {
  const initial = loadInitialState();

  return {
    user: initial.user,
    isAuthenticated: initial.isAuthenticated,
    deviceConnected: initial.deviceConnected,

    setUser: (user: User) => {
      set(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        deviceConnected: false,
      }));
      storage.set(
        STORAGE_KEY,
        JSON.stringify({ state: { user, isAuthenticated: true, deviceConnected: false } })
      );
    },

    setDeviceConnected: (connected: boolean) => {
      set({ deviceConnected: connected });
      storage.set(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            user: get().user,
            isAuthenticated: get().isAuthenticated,
            deviceConnected: connected,
          },
        })
      );
    },

    clearUser: () => {
      set({
        user: DEFAULT_USER,
        isAuthenticated: false,
        deviceConnected: false,
      });
      storage.set(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            user: DEFAULT_USER,
            isAuthenticated: false,
            deviceConnected: false,
          },
        })
      );
    },
  };
});

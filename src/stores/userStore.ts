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
  setUser: (user: User) => void;
  clearUser: () => void;
}

const STORAGE_KEY = 'user-storage';
const DEFAULT_USER: User = { id: null, name: null, email: null, timezone: 'UTC' };

// Load initial state
const loadInitialState = (): { user: User; isAuthenticated: boolean } => {
  try {
    const json = storage.get(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      // Handle zestand persist structure if migration needed: { state: { ... }, version: 0 }
      // Assuming our custom store just saves the object directly or we migrated
      // For now, let's assume standard object structure
      if (parsed.state) return parsed.state; // ZUSTAND COMPAT
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user state', e);
  }
  return { user: DEFAULT_USER, isAuthenticated: false };
};

export const useUserStore = createStore<UserStoreState>((set, get) => {
  const initial = loadInitialState();
  
  return {
    user: initial.user,
    isAuthenticated: initial.isAuthenticated,
    
    setUser: (user) => {
      const newState = { user, isAuthenticated: true };
      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify({ state: newState })); // Mimic zustand structure for compat
    },
    
    clearUser: () => {
      const newState = { user: DEFAULT_USER, isAuthenticated: false };
      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify({ state: newState }));
    },
  };
});

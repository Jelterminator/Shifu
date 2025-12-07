import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from '../utils/storage';

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
}

export interface UserStoreActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStoreState & UserStoreActions>()(
  persist(
    (set) => ({
      user: { id: null, name: null, email: null, timezone: 'UTC' },
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () =>
        set({
          user: { id: null, name: null, email: null, timezone: 'UTC' },
          isAuthenticated: false,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.get(name),
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);

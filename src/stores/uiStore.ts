import { create } from 'zustand';

export interface UIStoreState {
  isLoading: boolean;
  error: string | null;
}

export interface UIStoreActions {
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUIStore = create<UIStoreState & UIStoreActions>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

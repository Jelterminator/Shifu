import { createStore } from '../utils/store';

export interface UIStoreState {
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUIStore = createStore<UIStoreState>(set => ({
  isLoading: false,
  error: null,
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}));

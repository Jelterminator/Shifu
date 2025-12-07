import { useSyncExternalStore } from 'react';

/**
 * A minimal replacement for Zustand that works with React 19/Web
 * Supports basic state management and subscriptions.
 */
export function createStore<T>(initializer: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T) {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const next = typeof partial === 'function' ? (partial as any)(state) : partial;
    if (Object.is(next, state)) return;
    state = Object.assign({}, state, next);
    listeners.forEach(l => l());
  };

  const getState = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // Initialize state
  state = initializer(setState, getState);

  // The hook function
  const useStore = (selector: (s: T) => any = (s) => s) => {
    return useSyncExternalStore(subscribe, () => selector(getState()));
  };

  // Attach API
  Object.assign(useStore, { getState, setState, subscribe });

  return useStore as {
    (selector?: (state: T) => any): any;
    getState: () => T;
    setState: (partial: any) => void;
    subscribe: (listener: () => void) => () => void;
  }; 
}

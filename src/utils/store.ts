import { useSyncExternalStore } from 'react';

/**
 * A minimal replacement for Zustand that works with React 19/Web
 * Supports basic state management and subscriptions.
 */
export function createStore<T>(
  initializer: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T
): {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
} {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)): void => {
    const next =
      typeof partial === 'function' ? (partial as (state: T) => Partial<T>)(state) : partial;
    if (Object.is(next, state)) return;
    state = Object.assign({}, state, next);
    listeners.forEach(l => l());
  };

  const getState = (): T => state;

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // Initialize state
  state = initializer(setState, getState);

  // The hook function
  const useStore = <U>(selector: (s: T) => U = (s: T) => s as unknown as U): U => {
    return useSyncExternalStore(subscribe, () => selector(getState()));
  };

  // Attach API
  Object.assign(useStore, { getState, setState, subscribe });

  return useStore as {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: () => T;
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
    subscribe: (listener: () => void) => () => void;
  };
}

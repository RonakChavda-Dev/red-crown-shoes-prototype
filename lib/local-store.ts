import { useSyncExternalStore } from "react";

/**
 * A tiny external store persisted to localStorage.
 * Server renders and hydration use `fallback`; the stored value is read
 * on the client afterwards, so markup never mismatches.
 */
export interface LocalStore<T> {
  get: () => T;
  set: (next: T | ((current: T) => T)) => void;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
  fallback: T;
}

export function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T | null): LocalStore<T> {
  let state = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = parse(JSON.parse(raw)) ?? fallback;
    } catch {
      state = fallback;
    }
  };

  const persist = () => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage can be full or blocked (private mode); the in-memory state still works.
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    loaded = false;
    load();
    emit();
  };

  return {
    fallback,
    get() {
      load();
      return state;
    },
    set(next) {
      load();
      state = typeof next === "function" ? (next as (current: T) => T)(state) : next;
      persist();
      emit();
    },
    reset() {
      state = fallback;
      try {
        window.localStorage.removeItem(key);
      } catch {}
      emit();
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

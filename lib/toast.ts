import { useSyncExternalStore } from "react";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const EMPTY: Toast[] = [];

export function toast(input: Omit<Toast, "id">) {
  const id = nextId++;
  // Keep the stack short: the newest three are enough context.
  toasts = [...toasts.slice(-2), { ...input, id }];
  emit();
  window.setTimeout(() => dismissToast(id), 4200);
}

export function dismissToast(id: number) {
  const next = toasts.filter((item) => item.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function useToasts() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY,
  );
}

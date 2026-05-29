import { effect, signal, type WritableSignal } from '@angular/core';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function persistedSignal<T>(key: string, initial: T): WritableSignal<T> {
  const initialValue: T = (() => {
    if (!isBrowser) return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  })();

  const s = signal<T>(initialValue);

  if (isBrowser) {
    effect(() => {
      const v = s();
      try {
        window.localStorage.setItem(key, JSON.stringify(v));
      } catch {
        // ignore quota errors
      }
    });
  }
  return s;
}

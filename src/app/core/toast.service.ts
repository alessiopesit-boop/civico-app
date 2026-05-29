import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'warn' | 'error';
export interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ToastMessage | null>(null);
  private nextId = 1;
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, kind: ToastKind = 'success', durationMs = 2200): void {
    if (this.timer) clearTimeout(this.timer);
    const id = this.nextId++;
    this.current.set({ id, message, kind });
    this.timer = setTimeout(() => {
      if (this.current()?.id === id) this.current.set(null);
    }, durationMs);
  }

  hide(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.current.set(null);
  }
}

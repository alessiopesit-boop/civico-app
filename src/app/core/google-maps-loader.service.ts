import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  readonly state = signal<'idle' | 'loading' | 'ready' | 'disabled' | 'error'>('idle');

  private loadPromise: Promise<boolean> | null = null;

  /** Returns true if Google Maps is ready to use. */
  load(): Promise<boolean> {
    if (this.loadPromise) return this.loadPromise;

    const key = environment.googleMaps.apiKey;
    if (!key) {
      this.state.set('disabled');
      this.loadPromise = Promise.resolve(false);
      return this.loadPromise;
    }

    if (typeof window === 'undefined') {
      this.state.set('disabled');
      this.loadPromise = Promise.resolve(false);
      return this.loadPromise;
    }

    // Already loaded by a previous bootstrap.
    if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
      this.state.set('ready');
      this.loadPromise = Promise.resolve(true);
      return this.loadPromise;
    }

    this.state.set('loading');
    this.loadPromise = new Promise<boolean>(resolve => {
      const cbName = '__cvGoogleMapsCallback';
      (window as unknown as Record<string, unknown>)[cbName] = () => {
        this.state.set('ready');
        delete (window as unknown as Record<string, unknown>)[cbName];
        resolve(true);
      };
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${cbName}&libraries=marker&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.state.set('error');
        resolve(false);
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isReady(): boolean {
    return this.state() === 'ready';
  }

  isDisabled(): boolean {
    return this.state() === 'disabled' || this.state() === 'error';
  }
}

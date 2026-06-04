import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Wrapper attorno al client Supabase.
 *
 * Offline-safe: se `environment.supabase.url`/`anonKey` non sono valorizzati,
 * il service resta DISABILITATO e `client` e' null. In quel caso l'app continua
 * a funzionare in modalita' locale (seed in memoria, nessuna chiamata di rete),
 * esattamente come prima dell'integrazione del backend.
 *
 * Quando le chiavi sono presenti, `enabled` diventa true e i feature service
 * (auth, dati, storage) possono usare `requireClient()` per parlare col backend.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly _client: SupabaseClient | null;

  /** true se la config Supabase e' presente e il client e' attivo. */
  readonly enabled: boolean;

  constructor() {
    const { url, anonKey } = environment.supabase;
    this.enabled = Boolean(url && anonKey);
    this._client = this.enabled
      ? createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null;
  }

  /** Client se attivo, altrimenti null (modalita' locale). */
  get client(): SupabaseClient | null {
    return this._client;
  }

  /** Client garantito non-null; lancia se in modalita' locale. Usare solo
   *  dietro un check di `enabled`. */
  requireClient(): SupabaseClient {
    if (!this._client) {
      throw new Error(
        'Supabase non configurato: valorizza environment.supabase.url e anonKey.',
      );
    }
    return this._client;
  }
}

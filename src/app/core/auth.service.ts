import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { persistedSignal } from './persisted-signal';
import { SupabaseService } from './supabase.service';
import type { UserKey } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sb = inject(SupabaseService);

  /** Whether the user has completed the onboarding splash (UX locale). */
  readonly onboarded = persistedSignal<boolean>('civico.onboarded', false);

  /** Persona del seed locale usata per avatar e autore (verra' sostituita
   *  dal profilo reale in Fase C, quando le segnalazioni diventano remote). */
  readonly identity = persistedSignal<UserKey>('civico.identity', 'marco');

  /** Utente Supabase loggato, o null. */
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  /** true quando la sessione iniziale e' stata risolta (evita flicker/race
   *  tra il guard e il ripristino sessione dopo il click sul magic-link). */
  private readonly _ready = signal(false);
  readonly ready = this._ready.asReadonly();

  /** Account presente = utente loggato. Niente piu' ospite. */
  readonly authed = computed(() => this._user() !== null);

  /** Per l'MVP partecipa chiunque abbia un account (phone OTP rimandato). */
  readonly canParticipate = this.authed;

  /** Email dell'utente loggato, se disponibile. */
  readonly email = computed(() => this._user()?.email ?? null);

  /** Ripristina la sessione e si mette in ascolto dei cambi di auth.
   *  Chiamata da provideAppInitializer prima del primo render. */
  async init(): Promise<void> {
    const client = this.sb.client;
    if (!client) {
      // Nessuna config Supabase: l'app resta locale e non autenticabile.
      this._ready.set(true);
      return;
    }
    const { data } = await client.auth.getSession();
    this._user.set(data.session?.user ?? null);
    client.auth.onAuthStateChange((_event, session) => {
      this._user.set(session?.user ?? null);
    });
    this._ready.set(true);
  }

  /** Invia un magic-link all'email indicata. Al click l'utente torna sull'app
   *  (document.baseURI) e la sessione viene ripristinata automaticamente. */
  async sendMagicLink(email: string): Promise<{ error: string | null }> {
    const client = this.sb.client;
    if (!client) return { error: 'Backend non configurato.' };
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: document.baseURI },
    });
    return { error: error?.message ?? null };
  }

  finishOnboarding(): void {
    this.onboarded.set(true);
  }

  async logout(): Promise<void> {
    // Azzera subito lo stato locale: la navigazione verso /login che segue
    // deve vedere authed=false senza aspettare la rete.
    this._user.set(null);
    await this.sb.client?.auth.signOut();
  }

  /** Revoca la sessione su TUTTI i dispositivi (non solo questo). */
  async logoutAllDevices(): Promise<void> {
    this._user.set(null);
    await this.sb.client?.auth.signOut({ scope: 'global' });
  }

  async resetAll(): Promise<void> {
    await this.logout();
    this.onboarded.set(false);
  }

  /** Cancella l'account via Edge Function (delete-account) e fa logout. */
  async deleteAccount(): Promise<{ error: string | null }> {
    const client = this.sb.client;
    if (!client) return { error: 'Backend non configurato.' };
    const { error } = await client.functions.invoke('delete-account');
    if (error) return { error: error.message };
    await this.logout();
    return { error: null };
  }
}

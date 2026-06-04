import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import type { Profile, UserDef } from './models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly sb = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  private readonly _profile = signal<Profile | null>(null);
  readonly profile = this._profile.asReadonly();

  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  /** Profilo completato = riga presente. Usato dai guard. */
  readonly completed = computed(() => this._profile() !== null);

  /** Nome mostrato agli altri: "Marco T." (nome + iniziale cognome). */
  readonly displayName = computed(() => {
    const p = this._profile();
    if (!p) return null;
    const i = p.cognome.trim().charAt(0).toUpperCase();
    return i ? `${p.nome.trim()} ${i}.` : p.nome.trim();
  });

  /** Iniziali per l'avatar ("MT"). */
  readonly initials = computed(() => {
    const p = this._profile();
    if (!p) return '';
    return (p.nome.trim().charAt(0) + p.cognome.trim().charAt(0)).toUpperCase();
  });

  /** Identita' reale come UserDef per l'avatar, o null se non c'e' profilo. */
  readonly userDef = computed<UserDef | null>(() => {
    const p = this._profile();
    if (!p) return null;
    return {
      initials: this.initials(),
      name: this.displayName() ?? p.nome.trim(),
      hue: this.hueFrom(p.nome + p.cognome),
    };
  });

  /** Hue stabile (0-360) derivato dal nome, per il colore dell'avatar. */
  private hueFrom(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  constructor() {
    // Ricarica il profilo a ogni cambio di utente loggato (login/logout,
    // ritorno dal magic-link). Le scritture avvengono dopo await: ok in effect.
    effect(() => {
      const u = this.auth.user();
      void this.load(u?.id ?? null);
    });
  }

  /** Carica esplicitamente il profilo dell'utente corrente (atteso all'avvio
   *  da provideAppInitializer, cosi' i guard partono con lo stato giusto). */
  async init(): Promise<void> {
    await this.load(this.auth.user()?.id ?? null);
  }

  private async load(userId: string | null): Promise<void> {
    const client = this.sb.client;
    if (!client || !userId) {
      this._profile.set(null);
      this._loaded.set(true);
      return;
    }
    try {
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      this._profile.set((data as Profile | null) ?? null);
    } catch {
      // Errore di rete/tabella: non bloccare l'avvio, resta senza profilo.
      this._profile.set(null);
    } finally {
      this._loaded.set(true);
    }
  }

  /** Crea il profilo per l'utente loggato. Il cancello dei 14 anni e'
   *  ridondato lato DB (trigger): qui lo controlliamo per un errore amichevole. */
  async create(nome: string, cognome: string, birthDate: string): Promise<{ error: string | null }> {
    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (!client || !userId) return { error: 'Sessione non valida.' };

    const row = {
      id: userId,
      nome: nome.trim(),
      cognome: cognome.trim(),
      birth_date: birthDate,
    };
    const { data, error } = await client
      .from('profiles')
      .insert(row)
      .select('*')
      .single();
    if (error) return { error: this.friendlyError(error.message) };
    this._profile.set(data as Profile);
    return { error: null };
  }

  /** Aggiorna nome/cognome (la data di nascita e' bloccata dal trigger). */
  async updateName(nome: string, cognome: string): Promise<{ error: string | null }> {
    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (!client || !userId) return { error: 'Sessione non valida.' };

    const { data, error } = await client
      .from('profiles')
      .update({ nome: nome.trim(), cognome: cognome.trim() })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) return { error: this.friendlyError(error.message) };
    this._profile.set(data as Profile);
    return { error: null };
  }

  private friendlyError(msg: string): string {
    if (/14 anni/i.test(msg)) return 'Devi avere almeno 14 anni per usare Civico.';
    if (/data di nascita/i.test(msg)) return 'La data di nascita non può essere modificata.';
    return 'Qualcosa è andato storto, riprova.';
  }
}

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CATS, PINS, SEED_NOTIFICATIONS, SEED_REPORTS, SEED_ZONES } from './data';
import { persistedSignal } from './persisted-signal';
import { relativeTime, sortReports } from './utils';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import type { CategoryKey, FilterKey, Notification, PhotoKind, Pin, Report, SortKey, Zone, ZoneRole } from './models';

interface ReportRow {
  id: number;
  cat: string;
  title: string;
  note: string | null;
  where_label: string | null;
  lat: number | null;
  lng: number | null;
  photo: string | null;
  photo_url: string | null;
  anon: boolean;
  status: string;
  created_at: string;
  author_label: string | null;
  author_id: string | null;
  confirms: number;
  recent6h: number;
  resolution_votes: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly sb = inject(SupabaseService);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(ProfileService);

  // Segnalazioni: dal DB Supabase se configurato, altrimenti seed locale.
  readonly reports = signal<Report[]>(this.sb.enabled ? [] : [...SEED_REPORTS]);

  // Stati personali (per dispositivo): seguite e segnalate-come-falsa.
  private readonly followedIds = persistedSignal<number[]>('civico.followed', []);
  private readonly flaggedIds = persistedSignal<number[]>('civico.flagged', []);
  // Reazioni gia' date su questo dispositivo (evita doppi conteggi ottimistici).
  private readonly confirmedKeys = persistedSignal<string[]>('civico.confirmed', []);

  // Pin della mappa: derivati dalle segnalazioni con coordinate reali. Se siamo
  // in modalita' locale (seed senza coordinate) si usa il layout statico PINS.
  readonly pins = computed<Pin[]>(() => {
    const withCoords = this.reports().filter(r => r.lat != null && r.lng != null);
    if (!withCoords.length) return [...PINS];
    return withCoords.map(r => ({ id: r.id, cat: r.cat, xp: 0, yp: 0, lat: r.lat!, lng: r.lng! }));
  });

  // Le mie segnalazioni: id delle righe il cui author_id sono io (dalla tabella
  // base, che via RLS mi lascia leggere le mie). Le abbino all'elenco pubblico
  // per avere anche i contatori.
  private readonly myReportIds = signal<Set<number>>(new Set());
  readonly myReports = computed<Report[]>(() => {
    const mine = this.myReportIds();
    return this.reports().filter(r => mine.has(r.id));
  });
  /** Conferme date da me (numero di righe in confirmations a mio nome). */
  readonly myConfirmCount = signal<number>(0);

  // Notifiche (ancora seed locale per ora).
  readonly notifications = signal<Notification[]>([...SEED_NOTIFICATIONS]);
  readonly unreadNotificationsCount = computed(
    () => this.notifications().filter(n => n.unread).length,
  );

  // ── Filters & sort (home screen) ───────────────────────────────────────
  readonly filter = persistedSignal<FilterKey>('civico.filter', 'tutto');
  readonly sort = persistedSignal<SortKey>('civico.sort', 'rilevanti');

  readonly visibleReports = computed(() => {
    const f = this.filter();
    const arr = this.reports().filter(r => this.matchesFilter(r, f));
    return sortReports(arr, this.sort());
  });

  readonly visiblePinIds = computed(() => {
    const f = this.filter();
    return new Set(this.reports().filter(r => this.matchesFilter(r, f)).map(r => r.id));
  });

  readonly activeCount = computed(() => {
    const f = this.filter();
    return this.reports().filter(r => r.cat !== 'risolto' && this.matchesFilter(r, f)).length;
  });

  // ── Zones (ancora locali) ────────────────────────────────────────────────
  readonly zones = persistedSignal<Zone[]>('civico.zones', SEED_ZONES);
  readonly activeZoneId = persistedSignal<string>('civico.activeZone', SEED_ZONES[0].id);
  readonly activeZone = computed(() => {
    const z = this.zones();
    return z.find(zone => zone.id === this.activeZoneId()) ?? z[0];
  });

  // Id ottimistici (negativi) per le segnalazioni appena create, finche' il DB
  // non restituisce l'id reale.
  private optimisticSeq = -1;

  constructor() {
    if (this.sb.enabled) {
      // Carica all'avvio e ricarica quando cambia l'utente (login/logout).
      effect(() => {
        this.auth.user(); // dipendenza: ricarica al cambio sessione
        void this.loadReports();
        void this.loadMine();
      });
    }
  }

  /** Carica id delle mie segnalazioni e il conteggio delle conferme date. */
  private async loadMine(): Promise<void> {
    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (!client || !userId) {
      this.myReportIds.set(new Set());
      this.myConfirmCount.set(0);
      return;
    }
    try {
      const [mine, confs] = await Promise.all([
        client.from('reports').select('id').eq('author_id', userId),
        client.from('confirmations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);
      this.myReportIds.set(new Set(((mine.data ?? []) as { id: number }[]).map(r => r.id)));
      this.myConfirmCount.set(confs.count ?? 0);
    } catch {
      // Errore di rete: lascia i valori correnti.
    }
  }

  /** Carica l'elenco condiviso dalla vista pubblica reports_public. */
  async loadReports(): Promise<void> {
    const client = this.sb.client;
    if (!client) return;
    try {
      const { data } = await client
        .from('reports_public')
        .select('*')
        .order('created_at', { ascending: false });
      const followed = new Set(this.followedIds());
      const flagged = new Set(this.flaggedIds());
      const rows = (data ?? []) as ReportRow[];
      this.reports.set(rows.map(row => this.mapRow(row, followed, flagged)));
    } catch {
      // Errore di rete: lascia l'elenco com'e' (non svuotare la UI).
    }
  }

  private mapRow(row: ReportRow, followed: Set<number>, flagged: Set<number>): Report {
    return {
      id: row.id,
      cat: row.cat as CategoryKey,
      title: row.title,
      where: row.where_label ?? '',
      time: relativeTime(row.created_at),
      confirms: row.confirms,
      recent6h: row.recent6h,
      resolutionVotes: row.resolution_votes,
      photo: (row.photo ?? 'asphalt') as PhotoKind,
      photoUrl: row.photo_url,
      by: 'anon',
      authorLabel: row.author_label,
      authorId: row.author_id,
      anon: row.anon,
      lat: row.lat ?? undefined,
      lng: row.lng ?? undefined,
      note: row.note ?? undefined,
      createdAt: row.created_at,
      followed: followed.has(row.id),
      flagged: flagged.has(row.id),
    };
  }

  // ── Mutations ──────────────────────────────────────────────────────────
  getById(id: number): Report | undefined {
    return this.reports().find(r => r.id === id);
  }

  /** true se la segnalazione e' stata scritta dall'utente loggato. */
  isMine(id: number): boolean {
    return this.myReportIds().has(id);
  }

  /** Elimina una propria segnalazione (RLS consente solo le proprie). */
  async deleteReport(id: number): Promise<boolean> {
    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (!client || !userId) return false;
    const { error } = await client.from('reports').delete().eq('id', id);
    if (error) return false;
    this.reports.update(list => list.filter(r => r.id !== id));
    this.myReportIds.update(s => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    return true;
  }

  confirm(id: number, kind: 'visto' | 'peggiorata' | 'risolta'): void {
    const key = `${id}:${kind}`;
    if (this.confirmedKeys().includes(key)) return; // gia' votato su questo device
    this.confirmedKeys.update(l => [...l, key]);

    // Aggiornamento ottimistico locale.
    this.reports.update(list => list.map(r => {
      if (r.id !== id) return r;
      if (kind === 'risolta') return { ...r, resolutionVotes: r.resolutionVotes + 1 };
      return { ...r, confirms: r.confirms + 1, recent6h: r.recent6h + 1 };
    }));

    // Scrittura su DB (il vincolo univoco protegge dai doppioni; ignoriamo errori).
    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (client && userId && id > 0) {
      this.myConfirmCount.update(n => n + 1);
      void client.from('confirmations').insert({ report_id: id, user_id: userId, kind });
    }
  }

  toggleFollow(id: number): void {
    const isFollowed = this.followedIds().includes(id);
    this.followedIds.update(l => isFollowed ? l.filter(x => x !== id) : [...l, id]);
    this.reports.update(list => list.map(r => r.id === id ? { ...r, followed: !isFollowed } : r));
  }

  flag(id: number): void {
    if (!this.flaggedIds().includes(id)) this.flaggedIds.update(l => [...l, id]);
    this.reports.update(list => list.map(r => r.id === id ? { ...r, flagged: true } : r));
  }

  /** Crea una nuova segnalazione (ottimistica + scrittura su Supabase).
   *  Se c'e' una foto, la carica su Storage e ne salva l'URL pubblico. */
  addReport(input: {
    cat: CategoryKey;
    title: string;
    note?: string;
    where: string;
    lat?: number;
    lng?: number;
    photo: PhotoKind;
    anon: boolean;
    photoFile?: File | null;
    photoPreview?: string | null;
  }): void {
    const authorLabel = input.anon ? null : this.profile.displayName();
    const optimistic: Report = {
      id: this.optimisticSeq--,
      cat: input.cat,
      title: input.title,
      where: input.where,
      time: 'ora',
      confirms: 0,
      recent6h: 0,
      resolutionVotes: 0,
      photo: input.photo,
      photoUrl: input.photoPreview ?? null, // anteprima locale immediata
      by: 'anon',
      authorLabel,
      anon: input.anon,
      lat: input.lat,
      lng: input.lng,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    this.reports.update(list => [optimistic, ...list]);

    const client = this.sb.client;
    const userId = this.auth.user()?.id;
    if (!client || !userId) return;

    void (async () => {
      // Upload foto su Storage (se presente).
      let photoUrl: string | null = null;
      if (input.photoFile) {
        const ext = (input.photoFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const up = await client.storage.from('report-photos').upload(path, input.photoFile, {
          contentType: input.photoFile.type || 'image/jpeg',
          upsert: false,
        });
        if (!up.error) {
          photoUrl = client.storage.from('report-photos').getPublicUrl(path).data.publicUrl;
        }
      }

      const { data } = await client
        .from('reports')
        .insert({
          author_id: userId,
          author_label: authorLabel,
          cat: input.cat,
          title: input.title,
          note: input.note ?? null,
          where_label: input.where,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          photo: input.photo,
          photo_url: photoUrl,
          anon: input.anon,
          status: 'attiva',
        })
        .select('id, created_at')
        .single();
      if (data) {
        const realId = data.id as number;
        this.reports.update(list => list.map(r =>
          r.id === optimistic.id
            ? { ...r, id: realId, createdAt: data.created_at as string, photoUrl: photoUrl ?? r.photoUrl }
            : r,
        ));
        this.myReportIds.update(s => new Set(s).add(realId));
      }
    })();
  }

  /** Profilo pubblico di un altro utente (solo campi sicuri). */
  async getPublicProfile(id: string): Promise<{ displayName: string; memberSince: string | null } | null> {
    const client = this.sb.client;
    if (!client) return null;
    const { data } = await client.from('public_profiles').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    const row = data as { display_name: string; member_since: string | null };
    return { displayName: row.display_name, memberSince: row.member_since };
  }

  /** Segnalazioni pubbliche (non anonime) di un dato autore. */
  async loadUserReports(id: string): Promise<Report[]> {
    const client = this.sb.client;
    if (!client) return [];
    const { data } = await client
      .from('reports_public')
      .select('*')
      .eq('author_id', id)
      .order('created_at', { ascending: false });
    const followed = new Set(this.followedIds());
    const flagged = new Set(this.flaggedIds());
    return ((data ?? []) as ReportRow[]).map(row => this.mapRow(row, followed, flagged));
  }

  markAllNotificationsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, unread: false })));
  }

  // ── Zones mutations ────────────────────────────────────────────────────
  setActiveZone(id: string): void {
    this.activeZoneId.set(id);
  }

  addZone(zone: Zone): void {
    this.zones.update(list => [...list, zone]);
  }

  removeZone(id: string): void {
    this.zones.update(list => list.filter(z => z.id !== id));
    if (this.activeZoneId() === id) {
      const remaining = this.zones();
      if (remaining.length) this.activeZoneId.set(remaining[0].id);
    }
  }

  updateZone(id: string, patch: Partial<Zone>): void {
    this.zones.update(list => list.map(z => z.id === id ? { ...z, ...patch } : z));
  }

  verifyZone(id: string): void {
    this.updateZone(id, { verified: true });
  }

  setZoneRole(id: string, role: ZoneRole): void {
    this.updateZone(id, { role });
  }

  // ── helpers ────────────────────────────────────────────────────────────
  private matchesFilter(r: Report, f: FilterKey): boolean {
    if (f === 'tutto') return true;
    if (f === 'risolti') return r.cat === 'risolto';
    if (f === 'sicurezza') return CATS[r.cat].group === 'sicurezza';
    if (f === 'disservizi') return CATS[r.cat].group === 'disservizi';
    return true;
  }

  catOf(key: CategoryKey) {
    return CATS[key];
  }
}

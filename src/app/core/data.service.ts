import { Injectable, computed, signal } from '@angular/core';
import { CATS, PINS, SEED_NOTIFICATIONS, SEED_REPORTS, SEED_ZONES } from './data';
import { persistedSignal } from './persisted-signal';
import { sortReports } from './utils';
import type { CategoryKey, FilterKey, Notification, Pin, Report, SortKey, Zone, ZoneRole } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Reports are kept as a writable signal so we can mutate (add confirms, votes, follow, flag).
  readonly reports = signal<Report[]>([...SEED_REPORTS]);

  // Map pins are mostly static layout for the prototype.
  readonly pins = signal<Pin[]>([...PINS]);

  // Notifications (writable so we can mark-as-read).
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

  // ── Zones ───────────────────────────────────────────────────────────────
  readonly zones = persistedSignal<Zone[]>('civico.zones', SEED_ZONES);
  readonly activeZoneId = persistedSignal<string>('civico.activeZone', SEED_ZONES[0].id);
  readonly activeZone = computed(() => {
    const z = this.zones();
    return z.find(zone => zone.id === this.activeZoneId()) ?? z[0];
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  getById(id: number): Report | undefined {
    return this.reports().find(r => r.id === id);
  }

  confirm(id: number, kind: 'visto' | 'peggiorata' | 'risolta'): void {
    this.reports.update(list => list.map(r => {
      if (r.id !== id) return r;
      if (kind === 'visto') return { ...r, confirms: r.confirms + 1, recent6h: r.recent6h + 1 };
      if (kind === 'peggiorata') return { ...r, confirms: r.confirms + 1, recent6h: r.recent6h + 1 };
      if (kind === 'risolta') return { ...r, resolutionVotes: r.resolutionVotes + 1 };
      return r;
    }));
  }

  toggleFollow(id: number): void {
    this.reports.update(list => list.map(r => r.id === id ? { ...r, followed: !r.followed } : r));
  }

  flag(id: number): void {
    this.reports.update(list => list.map(r => r.id === id ? { ...r, flagged: true } : r));
  }

  addReport(partial: Omit<Report, 'id' | 'confirms' | 'recent6h' | 'resolutionVotes'>): Report {
    const next: Report = {
      id: Math.max(0, ...this.reports().map(r => r.id)) + 1,
      confirms: 0,
      recent6h: 0,
      resolutionVotes: 0,
      ...partial,
    };
    this.reports.update(list => [next, ...list]);
    return next;
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

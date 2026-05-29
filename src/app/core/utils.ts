import { CATS } from './data';
import type { Report, SortKey } from './models';

export function parseHours(t: string): number {
  if (!t) return 9999;
  if (t === 'ora') return 0;
  if (t === 'ieri') return 24;
  const m = t.match(/(\d+)\s*(min|ore?|giorn|settiman)/i);
  if (!m) return 9999;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u.startsWith('min'))  return n / 60;
  if (u.startsWith('or'))   return n;
  if (u.startsWith('gior')) return n * 24;
  if (u.startsWith('sett')) return n * 168;
  return 9999;
}

export function timeVerb(r: Report): 'avvenuta' | 'segnalata' {
  return CATS[r.cat].group === 'sicurezza' ? 'avvenuta' : 'segnalata';
}

export function sortReports(reports: Report[], key: SortKey): Report[] {
  const arr = [...reports];
  if (key === 'recenti')  return arr.sort((a, b) => parseHours(a.time) - parseHours(b.time));
  if (key === 'reazioni') return arr.sort((a, b) => b.confirms - a.confirms);
  if (key === 'vicine')   return arr;
  // rilevanti = recency * popularity
  return arr.sort((a, b) =>
    (b.confirms / (parseHours(b.time) + 2)) - (a.confirms / (parseHours(a.time) + 2)),
  );
}

export interface Lifecycle {
  remainingDays: number;
  extensionDays: number;
  isResolved: boolean;
}

export function reportLifecycle(r: Report): Lifecycle {
  const isResolved = r.cat === 'risolto';
  const baseHours = isResolved ? 14 * 24
                  : CATS[r.cat].group === 'sicurezza' ? 7 * 24
                  : 4 * 24;
  const extension = r.confirms * 0.5; // 30 min per conferma
  const totalLife = Math.min(baseHours + extension, 30 * 24);
  const age = parseHours(r.time);
  const remainingH = Math.max(0, totalLife - age);
  const remainingDays = Math.max(0, Math.round(remainingH / 24));
  return { remainingDays, extensionDays: Math.round(extension / 24 * 10) / 10, isResolved };
}

export function categoryBgSoft(catColor: string): string {
  // Map the 3 macro colors to their "soft" rgba background.
  if (catColor === '#F5A524') return 'rgba(245, 165, 36, 0.14)';
  if (catColor === '#E5484D') return 'rgba(229, 72, 77, 0.14)';
  if (catColor === '#3FB984') return 'rgba(63, 185, 132, 0.14)';
  return 'rgba(255, 255, 255, 0.06)';
}

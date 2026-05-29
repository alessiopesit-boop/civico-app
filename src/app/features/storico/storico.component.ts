import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { CATS } from '../../core/data';
import type { CategoryKey, PhotoKind } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { PhotoComponent } from '../../shared/photo/photo.component';

interface HistoryRow {
  id: number;
  cat: CategoryKey;
  title: string;
  where: string;
  archivedAt: string;
  confirms: number;
  photo: PhotoKind;
  outcome: 'risolta' | 'scaduta';
}

const SEED_HISTORY: HistoryRow[] = [
  { id: 1001, cat: 'buca',       title: 'Buca Via Sannio',                where: 'Via Sannio',   archivedAt: '2 sett. fa',  confirms: 64, photo: 'asphalt', outcome: 'risolta' },
  { id: 1002, cat: 'lampione',   title: 'Lampione Via Roma 14',           where: 'Via Roma',     archivedAt: '3 sett. fa',  confirms: 89, photo: 'street',  outcome: 'risolta' },
  { id: 1003, cat: 'rifiuti',    title: 'Sacchi accumulati Piazza Verdi', where: 'Piazza Verdi', archivedAt: '4 sett. fa',  confirms:  4, photo: 'asphalt', outcome: 'scaduta' },
  { id: 1004, cat: 'vandalismo', title: 'Graffiti scuola elementare',     where: 'Via dei Pini', archivedAt: '5 sett. fa',  confirms: 12, photo: 'park',    outcome: 'scaduta' },
  { id: 1005, cat: 'buca',       title: 'Buca incrocio P.za Mazzini',     where: 'P.za Mazzini', archivedAt: '1 mese fa',   confirms: 38, photo: 'asphalt', outcome: 'risolta' },
  { id: 1006, cat: 'albero',     title: 'Ramo pericolante via Bologna',   where: 'Via Bologna',  archivedAt: '1 mese fa',   confirms: 22, photo: 'tree',    outcome: 'risolta' },
];

@Component({
  selector: 'cv-storico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent, PhotoComponent],
  templateUrl: './storico.component.html',
  styleUrl: './storico.component.scss',
})
export class StoricoComponent {
  private readonly location = inject(Location);
  protected readonly CATS = CATS;

  readonly history = SEED_HISTORY;
  readonly resolved = computed(() => this.history.filter(r => r.outcome === 'risolta').length);
  readonly expired = computed(() => this.history.filter(r => r.outcome === 'scaduta').length);

  back(): void { this.location.back(); }
}

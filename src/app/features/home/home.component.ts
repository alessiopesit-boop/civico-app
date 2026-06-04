import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  OnDestroy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { ProfileService } from '../../core/profile.service';
import { SettingsService } from '../../core/settings.service';
import { ToastService } from '../../core/toast.service';
import { USERS } from '../../core/data';
import type { FilterKey, Pin, SortKey, UserDef } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { LeafletMapComponent } from '../../shared/leaflet-map/leaflet-map.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { LocationChipComponent } from '../../shared/location-chip/location-chip.component';
import { PolsoCardComponent } from '../../shared/polso-card/polso-card.component';
import { ReportCardComponent } from '../../shared/report-card/report-card.component';
import { WordmarkComponent } from '../../shared/wordmark/wordmark.component';
import { ZonePickerSheetComponent } from './zone-picker-sheet.component';

type Snap = 'compresso' | 'medio' | 'espanso';

const FILTERS: { k: FilterKey; label: string; color: string | null }[] = [
  { k: 'tutto',      label: 'Tutto',      color: null },
  { k: 'sicurezza',  label: 'Sicurezza',  color: 'var(--cv-red)' },
  { k: 'disservizi', label: 'Disservizi', color: 'var(--cv-amber)' },
  { k: 'risolti',    label: 'Risolti',    color: 'var(--cv-green)' },
];

const SORT_LABELS: Record<SortKey, string> = {
  rilevanti: 'Rilevanti',
  recenti:   'Più recenti',
  vicine:    'Più vicine',
  reazioni:  'Più reazioni',
};

@Component({
  selector: 'cv-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent,
    LeafletMapComponent,
    IconBtnComponent,
    IconComponent,
    LocationChipComponent,
    PolsoCardComponent,
    ReportCardComponent,
    WordmarkComponent,
    ZonePickerSheetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly profileSvc = inject(ProfileService);
  private readonly toast = inject(ToastService);
  private readonly settings = inject(SettingsService);
  readonly data = inject(DataService);

  readonly filters = FILTERS;
  readonly sortLabels = SORT_LABELS;

  readonly sortOptionsKeys: SortKey[] = ['rilevanti', 'recenti', 'vicine', 'reazioni'];

  readonly identity = this.auth.identity;

  /** Avatar dell'header: identita' reale se il profilo c'e', altrimenti persona. */
  readonly avatar = computed<UserDef>(() => this.profileSvc.userDef() ?? USERS[this.identity()]);

  readonly containerH = signal<number>(this.computeContainerH());

  readonly snaps = computed(() => {
    const H = this.containerH();
    return {
      compresso: Math.max(110, H * 0.16),
      medio:     Math.round(H * 0.50),
      espanso:   Math.round(H * 0.86),
    };
  });

  readonly snap = signal<Snap>('medio');
  /** override height (during drag) */
  readonly overrideH = signal<number | null>(null);
  readonly sheetH = computed(() => this.overrideH() ?? this.snaps()[this.snap()]);
  readonly isDragging = signal<boolean>(false);

  readonly aboveSheet = computed(() => this.containerH() - this.sheetH());
  readonly showControls = computed(() => this.aboveSheet() > 130 + 100);
  readonly showFab = computed(() => this.aboveSheet() > 130 + 60);

  readonly sortOpen = signal<boolean>(false);

  readonly zonePickerOpen = signal<boolean>(false);

  readonly polsoVisible = computed(() => {
    const dismissed = this.settings.polsoDismissedAt();
    if (!dismissed) return true;
    const week = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissed > week;
  });

  readonly dimmedPinIds = computed<Set<number>>(() => {
    const visible = this.data.visiblePinIds();
    const all = this.data.pins().map(p => p.id);
    return new Set(all.filter(id => !visible.has(id)));
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    document.removeEventListener('pointermove', this.onDragMove);
    document.removeEventListener('pointerup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onDragMoveTouch);
    document.removeEventListener('touchend', this.onDragEnd);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.containerH.set(this.computeContainerH());
  }

  private computeContainerH(): number {
    if (typeof window === 'undefined') return 800;
    const h = window.innerHeight;
    return h < 500 ? h : Math.min(844, h - 40);
  }

  // ── Drag handling ─────────────────────────────────────────────────────
  private dragStartY = 0;
  private dragStartH = 0;

  startDrag(ev: PointerEvent | TouchEvent): void {
    ev.preventDefault();
    const y = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
    this.dragStartY = y;
    this.dragStartH = this.sheetH();
    this.isDragging.set(true);

    document.addEventListener('pointermove', this.onDragMove);
    document.addEventListener('pointerup', this.onDragEnd);
    document.addEventListener('touchmove', this.onDragMoveTouch, { passive: false });
    document.addEventListener('touchend', this.onDragEnd);
  }

  private onDragMove = (e: PointerEvent): void => {
    this.applyDelta(e.clientY);
  };
  private onDragMoveTouch = (e: TouchEvent): void => {
    e.preventDefault();
    this.applyDelta(e.touches[0].clientY);
  };

  private applyDelta(y: number): void {
    const minH = 80;
    const sn = this.snaps();
    const maxH = Math.max(this.containerH() - 40, sn.espanso);
    const dy = this.dragStartY - y;
    const newH = Math.max(minH, Math.min(maxH, this.dragStartH + dy));
    this.overrideH.set(newH);
  }

  private onDragEnd = (): void => {
    this.isDragging.set(false);
    document.removeEventListener('pointermove', this.onDragMove);
    document.removeEventListener('pointerup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onDragMoveTouch);
    document.removeEventListener('touchend', this.onDragEnd);

    const target = this.overrideH() ?? this.dragStartH;
    const sn = this.snaps();
    const entries = Object.entries(sn) as [Snap, number][];
    let best = entries[0];
    let bestD = Math.abs(entries[0][1] - target);
    for (const [k, v] of entries) {
      const d = Math.abs(v - target);
      if (d < bestD) { best = [k, v]; bestD = d; }
    }
    this.snap.set(best[0]);
    this.overrideH.set(null);
  };

  // ── Navigation handlers ───────────────────────────────────────────────
  goDetail(id: number): void {
    void this.router.navigate(['/detail', id]);
  }

  goMap(): void {
    void this.router.navigate(['/map']);
  }

  goNotifications(): void {
    void this.router.navigate(['/notifications']);
  }

  goProfile(): void {
    void this.router.navigate(['/profile']);
  }

  goStorico(): void {
    void this.router.navigate(['/storico']);
  }

  tapFab(): void {
    void this.router.navigate(['/new-report']);
  }

  // ── Filters / sort ────────────────────────────────────────────────────
  setFilter(f: FilterKey): void {
    this.data.filter.set(f);
  }

  setSort(s: SortKey): void {
    this.data.sort.set(s);
    this.sortOpen.set(false);
  }

  toggleSort(): void {
    this.sortOpen.update(v => !v);
  }

  closeSort(): void {
    this.sortOpen.set(false);
  }

  // ── Zone picker ───────────────────────────────────────────────────────
  openZonePicker(): void {
    this.zonePickerOpen.set(true);
  }

  pickZone(id: string): void {
    this.data.setActiveZone(id);
    this.zonePickerOpen.set(false);
  }

  closeZonePicker(): void {
    this.zonePickerOpen.set(false);
  }

  dismissPolso(): void {
    this.settings.polsoDismissedAt.set(Date.now());
  }

  // ── helpers ───────────────────────────────────────────────────────────
  trackPin(_: number, p: Pin): number { return p.id; }

  filterDotColor(f: FilterKey): string {
    const m = FILTERS.find(x => x.k === f);
    return m?.color ?? 'var(--cv-amber)';
  }

  activeFilterDotColor(): string {
    const f = this.data.filter();
    if (f === 'tutto') return 'var(--cv-amber)';
    if (f === 'sicurezza') return 'var(--cv-red)';
    if (f === 'risolti') return 'var(--cv-green)';
    return 'var(--cv-amber)';
  }
}

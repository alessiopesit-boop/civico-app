import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CATS, RESOLUTION_GOAL, USERS } from '../../core/data';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { reportLifecycle, timeVerb } from '../../core/utils';
import type { Pin, Report, UserDef, UserKey } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { CategoryBadgeComponent } from '../../shared/category-badge/category-badge.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { LeafletMapComponent } from '../../shared/leaflet-map/leaflet-map.component';
import { PhotoComponent } from '../../shared/photo/photo.component';

interface TimelineStep {
  label: string;
  sub: string;
  time: string;
  done: boolean;
  current: boolean;
  last: boolean;
}

@Component({
  selector: 'cv-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent, CategoryBadgeComponent, IconBtnComponent, IconComponent,
    LeafletMapComponent, PhotoComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  /** Route param via withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly data = inject(DataService);

  readonly RESOLUTION_GOAL = RESOLUTION_GOAL;
  protected readonly Math = Math;

  readonly report = computed<Report>(() => {
    const idNum = parseInt(this.id(), 10);
    const list = this.data.reports();
    return list.find(r => r.id === idNum) ?? list[0];
  });

  // Mini-mappa: il pin corrispondente (per coordinate) o un fallback su Roma.
  readonly mapPin = computed<Pin>(() => {
    const r = this.report();
    const found = this.data.pins().find(p => p.id === r.id);
    return found ?? { id: r.id, cat: r.cat, xp: 0.5, yp: 0.5, lat: 41.8893, lng: 12.4677 };
  });
  readonly mapPins = computed<Pin[]>(() => [this.mapPin()]);
  readonly mapCenter = computed(() => ({ lat: this.mapPin().lat!, lng: this.mapPin().lng! }));

  readonly cat = computed(() => CATS[this.report().cat]);
  readonly isSec = computed(() => this.cat().group === 'sicurezza');
  readonly author = computed<UserDef>(() => {
    const r = this.report();
    if (r.authorLabel) {
      const parts = r.authorLabel.trim().split(/\s+/);
      const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
      return { initials: initials || '··', name: r.authorLabel, hue: this.hueFrom(r.authorLabel) };
    }
    if (r.anon) return USERS['anon'];
    return USERS[r.by] ?? USERS['anon'];
  });
  readonly timeVerbStr = computed(() => timeVerb(this.report()));
  readonly life = computed(() => reportLifecycle(this.report()));
  readonly resVotes = computed(() => this.report().resolutionVotes);
  readonly inResolution = computed(() => this.resVotes() >= 1 && this.report().cat !== 'risolto');
  readonly resPct = computed(() => Math.min(100, Math.round(this.resVotes() / RESOLUTION_GOAL * 100)));
  readonly resRemaining = computed(() => Math.max(0, RESOLUTION_GOAL - this.resVotes()));

  readonly status = computed<'risolta' | 'inLavorazione' | 'confermata'>(() => {
    if (this.report().cat === 'risolto') return 'risolta';
    if (this.inResolution()) return 'inLavorazione';
    return 'confermata';
  });

  readonly isFollowing = computed(() => !!this.report().followed);

  readonly confirmSheetOpen = signal<boolean>(false);
  readonly flagSheetOpen = signal<boolean>(false);
  readonly deleteOpen = signal<boolean>(false);

  /** true se la segnalazione e' mia (mostra l'azione elimina). */
  readonly isMine = computed(() => this.data.isMine(this.report().id));

  readonly topAvatars: UserKey[] = ['marco', 'sofia', 'luca', 'giulia', 'andrea'];

  readonly statusInfo = computed(() => {
    const map = {
      confermata:    { label: 'CONFERMATA',     color: 'var(--cv-amber)' },
      inLavorazione: { label: 'IN LAVORAZIONE', color: 'var(--cv-amber)' },
      risolta:       { label: 'RISOLTA',        color: 'var(--cv-green)' },
    } as const;
    return map[this.status()];
  });

  readonly timeline = computed<TimelineStep[]>(() => {
    const r = this.report();
    const u = this.author();
    const isResolved = r.cat === 'risolto';
    return [
      { label: 'Segnalata',     sub: `${u.name} ha aperto la segnalazione`, time: r.time,         done: true,                         current: false,                 last: false },
      { label: 'Confermata',    sub: `${r.confirms} vicini hanno confermato`, time: 'ora',         done: isResolved,                   current: !isResolved,           last: false },
      { label: 'In lavorazione', sub: 'Servono 3 conferme di risoluzione',  time: '—',             done: isResolved,                   current: false,                 last: false },
      { label: 'Risolta',       sub: 'Quando 5+ vicini confermano',         time: isResolved ? 'ora' : '—', done: isResolved,            current: false,                 last: true  },
    ];
  });

  /** Hue stabile (0-360) dal nome, per il colore avatar. */
  private hueFrom(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  back(): void {
    this.location.back();
  }

  share(): void {
    this.toast.show('Link copiato negli appunti');
  }

  toggleFollow(): void {
    const r = this.report();
    this.data.toggleFollow(r.id);
    this.toast.show(!r.followed
      ? 'Ti avviseremo quando cambia stato'
      : 'Non riceverai più notifiche su questa segnalazione');
  }

  openConfirmSheet(): void {
    this.confirmSheetOpen.set(true);
  }

  closeConfirmSheet(): void {
    this.confirmSheetOpen.set(false);
  }

  confirmAction(kind: 'vista' | 'peggiore' | 'risolta'): void {
    const r = this.report();
    if (kind === 'vista' || kind === 'peggiore') {
      this.data.confirm(r.id, kind === 'vista' ? 'visto' : 'peggiorata');
    } else {
      this.data.confirm(r.id, 'risolta');
    }
    this.confirmSheetOpen.set(false);

    const labels: Record<typeof kind, string> = {
      vista: 'Grazie, la tua conferma conta',
      peggiore: 'Conferma registrata: situazione peggiorata',
      risolta: 'Voto di risoluzione registrato',
    };
    this.toast.show(labels[kind]);
  }

  proposeResolved(): void {
    const r = this.report();
    this.data.confirm(r.id, 'risolta');
    this.toast.show(`Voto registrato. ${Math.max(0, RESOLUTION_GOAL - r.resolutionVotes - 1)} ancora per chiuderla.`);
  }

  askDelete(): void { this.deleteOpen.set(true); }
  cancelDelete(): void { this.deleteOpen.set(false); }
  async confirmDelete(): Promise<void> {
    const id = this.report().id;
    this.deleteOpen.set(false);
    const ok = await this.data.deleteReport(id);
    this.toast.show(ok ? 'Segnalazione eliminata' : 'Eliminazione non riuscita');
    if (ok) void this.router.navigateByUrl('/home');
  }

  openFlag(): void {
    this.flagSheetOpen.set(true);
  }

  closeFlag(): void {
    this.flagSheetOpen.set(false);
  }

  flagReport(kind: 'falsa' | 'duplicato' | 'esagerata' | 'offensiva'): void {
    this.data.flag(this.report().id);
    this.flagSheetOpen.set(false);
    const labels: Record<typeof kind, string> = {
      falsa:     'Grazie. Verrà verificata dalla community.',
      duplicato: 'Segnalata come duplicato.',
      esagerata: 'Grazie. La community la rivedrà.',
      offensiva: 'Inviata ai moderatori.',
    };
    this.toast.show(labels[kind]);
  }
}

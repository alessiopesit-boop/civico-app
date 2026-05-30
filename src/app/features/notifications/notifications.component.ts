import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

type Tab = 'tutte' | 'mine' | 'zona';

interface NotifRow {
  iconName: string;
  iconColor: string;
  bg: string;
  /** Bold prefix at start of the title (e.g. user name). */
  prefix?: string;
  /** Rest of the title. */
  text: string;
  sub: string;
  time: string;
  unread: boolean;
  group: 'oggi' | 'settimana';
  action?: string;
  routerLink?: unknown[];
}

@Component({
  selector: 'cv-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  private readonly router = inject(Router);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly tab = signal<Tab>('tutte');

  readonly tabs: { k: Tab; label: string; count: number }[] = [
    { k: 'tutte', label: 'Tutte', count: 12 },
    { k: 'mine',  label: 'Le mie',count:  4 },
    { k: 'zona',  label: 'Zona',  count:  8 },
  ];

  private readonly seed: NotifRow[] = [
    { iconName: 'hand', iconColor: 'var(--cv-amber)', bg: 'var(--cv-amber-soft)',
      prefix: 'Sofia R.', text: 'ha confermato la tua buca in Via Garibaldi',
      sub: 'Ora siete in 47 a confermare.', time: '15 min fa', unread: true, group: 'oggi',
      routerLink: ['/detail', 1] },
    { iconName: 'check', iconColor: 'var(--cv-green)', bg: 'var(--cv-green-soft)',
      text: 'La buca in P.za del Popolo è stata marcata come risolta',
      sub: '5 vicini hanno confermato la risoluzione. Grazie per averla segnalata.',
      time: '2 ore fa', unread: true, group: 'oggi', action: 'Vedi dettagli',
      routerLink: ['/detail', 8] },
    { iconName: 'sparkle', iconColor: 'var(--cv-amber)', bg: 'var(--cv-amber-soft)',
      text: 'Nuovo livello sbloccato: Cittadino attivo',
      sub: 'Hai aperto 6 segnalazioni. Continua così.',
      time: '3 ore fa', unread: true, group: 'oggi', routerLink: ['/profile'] },
    { iconName: 'pothole', iconColor: 'var(--cv-amber)', bg: 'var(--cv-amber-soft)',
      prefix: 'Marco T.', text: 'ha segnalato una nuova buca vicino a te',
      sub: 'Viale dei Pini · ~120m da casa', time: 'ieri', unread: false,
      group: 'settimana', action: 'Conferma', routerLink: ['/detail', 4] },
    { iconName: 'car', iconColor: 'var(--cv-red)', bg: 'var(--cv-red-soft)',
      text: '3 nuove segnalazioni di sicurezza in zona',
      sub: 'P.za Mazzini, Via San Marco. Anonime per privacy.',
      time: '2 giorni fa', unread: false, group: 'settimana', routerLink: ['/map'] },
    { iconName: 'hand', iconColor: 'var(--cv-green)', bg: 'var(--cv-green-soft)',
      text: 'Hai confermato 3 segnalazioni questa settimana',
      sub: 'La tua zona è più informata grazie a te.',
      time: '3 giorni fa', unread: false, group: 'settimana' },
    { iconName: 'check', iconColor: 'var(--cv-green)', bg: 'var(--cv-green-soft)',
      prefix: 'Lampione in Via Roma', text: 'è ora risolto',
      sub: '89 conferme, 5 conferme di risoluzione.',
      time: '4 giorni fa', unread: false, group: 'settimana',
      routerLink: ['/detail', 3] },
  ];

  /** Lista corrente (svuotabile da "Elimina tutte"). */
  readonly rows = signal<NotifRow[]>([...this.seed]);
  readonly oggi = computed(() => this.rows().filter(r => r.group === 'oggi'));
  readonly settimana = computed(() => this.rows().filter(r => r.group === 'settimana'));
  readonly isEmpty = computed(() => this.rows().length === 0);

  /** Modale di conferma per l'eliminazione di tutte le notifiche. */
  readonly confirmOpen = signal<boolean>(false);

  setTab(k: Tab): void { this.tab.set(k); }

  back(): void { window.history.back(); }

  goSettings(): void { void this.router.navigate(['/settings']); }

  openRow(row: NotifRow): void {
    if (row.routerLink) void this.router.navigate(row.routerLink as readonly unknown[]);
  }

  askClear(): void {
    this.confirmOpen.set(true);
  }

  cancelClear(): void {
    this.confirmOpen.set(false);
  }

  confirmClear(): void {
    this.rows.set([]);
    this.confirmOpen.set(false);
    this.toast.show('Notifiche eliminate');
  }
}

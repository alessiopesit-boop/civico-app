import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import type { Notification, NotifTab } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

type Tab = 'tutte' | NotifTab;

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
  private readonly location = inject(Location);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly tab = signal<Tab>('tutte');

  /** Tab con i conteggi veri ricavati dalle notifiche. */
  readonly tabs = computed<{ k: Tab; label: string; count: number }[]>(() => {
    const all = this.data.notifications();
    return [
      { k: 'tutte', label: 'Tutte',  count: all.length },
      { k: 'mine',  label: 'Le mie', count: all.filter(n => n.tab === 'mine').length },
      { k: 'zona',  label: 'Zona',   count: all.filter(n => n.tab === 'zona').length },
    ];
  });

  /** Notifiche filtrate per tab attiva. */
  private readonly filtered = computed<Notification[]>(() => {
    const t = this.tab();
    const all = this.data.notifications();
    return t === 'tutte' ? all : all.filter(n => n.tab === t);
  });

  readonly oggi = computed(() => this.filtered().filter(n => n.group === 'oggi'));
  readonly settimana = computed(() => this.filtered().filter(n => n.group === 'settimana'));
  readonly isEmpty = computed(() => this.data.notifications().length === 0);
  readonly newCount = computed(() => this.data.notifications().filter(n => n.unread).length);

  readonly confirmOpen = signal<boolean>(false);

  constructor() {
    // Entrando, le notifiche sono "viste": il badge si azzera (le gialle restano).
    this.data.markNotificationsSeen();
  }

  setTab(k: Tab): void { this.tab.set(k); }

  back(): void { this.location.back(); }
  goSettings(): void { void this.router.navigate(['/settings']); }

  openRow(row: Notification): void {
    this.data.markNotificationRead(row.id);
    if (row.routerLink) void this.router.navigate(row.routerLink as readonly unknown[]);
  }

  askClear(): void { this.confirmOpen.set(true); }
  cancelClear(): void { this.confirmOpen.set(false); }
  confirmClear(): void {
    this.data.clearNotifications();
    this.confirmOpen.set(false);
    this.toast.show('Notifiche eliminate');
  }
}

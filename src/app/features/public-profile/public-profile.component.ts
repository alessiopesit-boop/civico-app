import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CATS } from '../../core/data';
import { DataService } from '../../core/data.service';
import type { Report, UserDef } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { PhotoComponent } from '../../shared/photo/photo.component';

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

@Component({
  selector: 'cv-public-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconBtnComponent, IconComponent, PhotoComponent],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss',
})
export class PublicProfileComponent {
  /** Route param via withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly data = inject(DataService);

  protected readonly CATS = CATS;

  readonly profile = signal<{ displayName: string; memberSince: string | null } | null>(null);
  readonly reports = signal<Report[]>([]);
  readonly loading = signal<boolean>(true);

  readonly avatar = computed<UserDef>(() => {
    const name = this.profile()?.displayName ?? '';
    const parts = name.trim().split(/\s+/);
    const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '··';
    return { initials, name: name || 'Utente', hue: this.hueFrom(name) };
  });

  readonly aperte = computed(() => this.reports().filter(r => r.cat !== 'risolto').length);
  readonly risolte = computed(() => this.reports().filter(r => r.cat === 'risolto').length);

  readonly memberSince = computed(() => {
    const iso = this.profile()?.memberSince;
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return `${MESI[d.getMonth()]} ${d.getFullYear()}`;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    const [p, reps] = await Promise.all([
      this.data.getPublicProfile(id),
      this.data.loadUserReports(id),
    ]);
    this.profile.set(p);
    this.reports.set(reps);
    this.loading.set(false);
  }

  private hueFrom(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  back(): void { this.location.back(); }
  openReport(id: number): void {
    if (id) void this.router.navigate(['/detail', id]);
  }
}

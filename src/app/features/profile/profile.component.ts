import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CATS, USERS } from '../../core/data';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { ProfileService } from '../../core/profile.service';
import type { Report, UserDef } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { PhotoComponent } from '../../shared/photo/photo.component';

interface BadgeTile {
  label: string;
  color: string;
  locked: boolean;
}

@Component({
  selector: 'cv-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, IconBtnComponent, IconComponent, PhotoComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly profileSvc = inject(ProfileService);

  protected readonly CATS = CATS;

  private readonly persona = computed<UserDef>(() => USERS[this.auth.identity()]);

  /** Email reale dell'utente loggato. */
  readonly email = computed(() => this.auth.email());

  /** Identita' reale (se il profilo c'e'), altrimenti la persona del seed. */
  readonly me = computed<UserDef>(() => this.profileSvc.userDef() ?? this.persona());
  readonly myReports = computed<Report[]>(() => this.data.myReports().slice(0, 4));

  readonly stats = computed(() => {
    const mine = this.data.myReports();
    const aperte = mine.filter(r => r.cat !== 'risolto').length;
    const risolte = mine.filter(r => r.cat === 'risolto').length;
    return [
      { label: 'Segnalazioni',  value: aperte,                  sub: 'aperte',      trend: null as string | null },
      { label: 'Conferme date', value: this.data.myConfirmCount(), sub: 'date',     trend: null as string | null },
      { label: 'Risolte',       value: risolte,                 sub: 'grazie a te', trend: null as string | null },
    ];
  });

  readonly badges: BadgeTile[] = [
    { label: 'Primo passo',        color: 'var(--cv-amber)',     locked: false },
    { label: 'Vicino di fiducia',  color: 'var(--cv-green)',     locked: false },
    { label: 'Faro di Trastevere', color: 'var(--cv-text-mute)', locked: true },
  ];

  back(): void { this.location.back(); }
  goSettings(): void { void this.router.navigate(['/settings']); }
  openReport(id: number): void {
    if (id) void this.router.navigate(['/detail', id]);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CATS } from '../../core/data';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import type { CategoryKey, PhotoKind, UserKey } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { CategoryBadgeComponent } from '../../shared/category-badge/category-badge.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { LeafletMapComponent } from '../../shared/leaflet-map/leaflet-map.component';
import { PhotoComponent } from '../../shared/photo/photo.component';

@Component({
  selector: 'cv-new-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent, CategoryBadgeComponent, FormsModule,
    IconBtnComponent, IconComponent, LeafletMapComponent, PhotoComponent,
  ],
  templateUrl: './new-report.component.html',
  styleUrl: './new-report.component.scss',
})
export class NewReportComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly step = signal<1 | 2 | 3>(1);
  readonly cat = signal<CategoryKey>('buca');
  readonly hasPhoto = signal<boolean>(false);
  readonly desc = signal<string>('');
  readonly anon = signal<boolean>(false);

  readonly place = signal({ label: 'Via Garibaldi, 42', sub: 'Trastevere · ~80m da te' });

  readonly catList: CategoryKey[] = ['buca', 'lampione', 'albero', 'rifiuti', 'furtoAuto', 'furtoCasa', 'vandalismo'];
  protected readonly CATS = CATS;

  readonly catMeta = computed(() => CATS[this.cat()]);
  readonly isSec = computed(() => this.catMeta().group === 'sicurezza');

  readonly progressClasses = computed(() => {
    const s = this.step();
    return [1, 2, 3].map(i => i <= s ? 'fill' : 'empty');
  });

  readonly canContinue = computed(() => {
    const s = this.step();
    if (s === 1) return !!this.cat();
    if (s === 2) return !!this.place();
    return this.desc().trim().length > 0;
  });

  constructor() {
    // Reset anon to security default whenever category group changes.
    effect(() => {
      const sec = CATS[this.cat()].group === 'sicurezza';
      this.anon.set(sec);
    });
  }

  back(): void {
    if (this.step() > 1) {
      this.step.update(s => Math.max(1, s - 1) as 1 | 2 | 3);
    } else {
      this.location.back();
    }
  }

  next(): void {
    const s = this.step();
    if (!this.canContinue()) return;
    if (s < 3) {
      this.step.update(v => (v + 1) as 1 | 2 | 3);
    } else {
      this.submit();
    }
  }

  togglePhoto(): void {
    this.hasPhoto.update(v => !v);
  }

  selectCategory(k: CategoryKey): void {
    this.cat.set(k);
  }

  setDesc(v: string): void {
    this.desc.set(v.slice(0, 280));
  }

  toggleAnon(): void {
    this.anon.update(v => !v);
  }

  identityKey(): UserKey {
    return this.anon() ? 'anon' : this.auth.identity();
  }

  ctaLabel(): string {
    if (this.step() < 3) return 'Continua →';
    return this.isSec() ? 'Invia in forma anonima' : 'Invia segnalazione';
  }

  photoKind(): PhotoKind {
    return this.isSec() ? 'night' : 'asphalt';
  }

  private submit(): void {
    const desc = this.desc().trim();
    const cat = this.cat();
    const title = desc.split('\n')[0].slice(0, 60) || `${CATS[cat].label} segnalata`;
    // Coordinate vicino a Trastevere/Roma con piccolo scostamento. Il pin-drop
    // preciso dalla mappa e' un polish successivo (#21).
    const jitter = () => (Math.random() - 0.5) * 0.012;
    this.data.addReport({
      cat,
      title,
      note: desc,
      where: this.place().label,
      lat: 41.8893 + jitter(),
      lng: 12.4677 + jitter(),
      photo: this.photoKind(),
      anon: this.anon(),
    });
    this.toast.show(this.anon() ? 'Inviata in forma anonima, grazie' : 'Segnalazione inviata, grazie!');
    void this.router.navigateByUrl('/home');
  }
}

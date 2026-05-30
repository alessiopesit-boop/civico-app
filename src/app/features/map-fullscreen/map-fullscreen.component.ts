import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CATS } from '../../core/data';
import { DataService } from '../../core/data.service';
import type { CategoryGroup, Pin } from '../../core/models';
import { LeafletMapComponent } from '../../shared/leaflet-map/leaflet-map.component';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

type FilterFlags = Record<CategoryGroup, boolean>;

@Component({
  selector: 'cv-map-fullscreen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LeafletMapComponent, IconBtnComponent, IconComponent],
  templateUrl: './map-fullscreen.component.html',
  styleUrl: './map-fullscreen.component.scss',
})
export class MapFullscreenComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly data = inject(DataService);

  readonly filters = signal<FilterFlags>({ disservizi: true, sicurezza: true, risolto: false });

  readonly visiblePins = computed<Pin[]>(() =>
    this.data.pins().filter(p => this.matches(p)),
  );

  readonly dimmedIds = computed<Set<number>>(() =>
    new Set(this.data.pins().filter(p => !this.matches(p)).map(p => p.id)),
  );

  readonly counts = computed(() => ({
    disservizi: this.data.pins().filter(p => CATS[p.cat].group === 'disservizi').length,
    sicurezza:  this.data.pins().filter(p => CATS[p.cat].group === 'sicurezza').length,
    risolto:    this.data.pins().filter(p => p.cat === 'risolto').length,
  }));

  back(): void { this.location.back(); }
  openDetail(p: Pin): void { void this.router.navigate(['/detail', p.id]); }

  toggleFilter(k: CategoryGroup): void {
    this.filters.update(f => ({ ...f, [k]: !f[k] }));
  }

  private matches(p: Pin): boolean {
    const f = this.filters();
    if (p.cat === 'risolto') return f.risolto;
    const g = CATS[p.cat].group;
    return f[g] === true;
  }
}

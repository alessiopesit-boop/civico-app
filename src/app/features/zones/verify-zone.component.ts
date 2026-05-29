import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import type { Zone } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { MapBackgroundComponent } from '../../shared/map-background/map-background.component';

@Component({
  selector: 'cv-verify-zone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent, MapBackgroundComponent],
  templateUrl: './verify-zone.component.html',
  styleUrl: './verify-zone.component.scss',
})
export class VerifyZoneComponent {
  readonly id = input.required<string>();

  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly pinging = signal<boolean>(false);

  readonly zone = computed<Zone>(() => {
    const list = this.data.zones();
    return list.find(z => z.id === this.id()) ?? list[0];
  });

  back(): void { this.location.back(); }

  doPing(): void {
    if (this.pinging()) return;
    this.pinging.set(true);
    setTimeout(() => {
      const z = this.zone();
      this.data.verifyZone(z.id);
      this.toast.show(`Zona "${z.name}" verificata`);
      void this.router.navigate(['/zones']);
    }, 1800);
  }
}

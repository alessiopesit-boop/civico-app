import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import type { Zone, ZoneRole } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'cv-manage-zones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent],
  templateUrl: './manage-zones.component.html',
  styleUrl: './manage-zones.component.scss',
})
export class ManageZonesComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly data = inject(DataService);

  readonly roles: { k: ZoneRole; label: string }[] = [
    { k: 'casa',   label: 'Casa' },
    { k: 'lavoro', label: 'Lavoro' },
    { k: 'segui',  label: 'Segui' },
  ];

  back(): void { this.location.back(); }
  add(): void { void this.router.navigate(['/zones/add']); }
  verify(z: Zone): void { void this.router.navigate(['/zones/verify', z.id]); }

  setRole(z: Zone, role: ZoneRole): void {
    this.data.setZoneRole(z.id, role);
  }

  makeActive(z: Zone): void {
    this.data.setActiveZone(z.id);
    this.toast.show(`Ora vedi ${z.name}`);
  }

  remove(z: Zone): void {
    this.data.removeZone(z.id);
    this.toast.show(`Zona "${z.name}" rimossa`);
  }

  isActive(z: Zone): boolean {
    return z.id === this.data.activeZoneId();
  }
}

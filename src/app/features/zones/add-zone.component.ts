import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ToastService } from '../../core/toast.service';
import type { Zone, ZoneRole } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

interface Suggestion { name: string; city: string; }

@Component({
  selector: 'cv-add-zone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconBtnComponent, IconComponent],
  templateUrl: './add-zone.component.html',
  styleUrl: './add-zone.component.scss',
})
export class AddZoneComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly query = signal('');
  readonly role = signal<ZoneRole>('segui');
  readonly selected = signal<Suggestion | null>(null);

  private readonly allSuggestions: Suggestion[] = [
    { name: 'Pigneto',     city: 'Roma' },
    { name: 'Testaccio',   city: 'Roma' },
    { name: 'Garbatella',  city: 'Roma' },
    { name: 'Prati',       city: 'Roma' },
    { name: 'Ostiense',    city: 'Roma' },
    { name: 'Trieste',     city: 'Roma' },
  ];

  readonly suggestions = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.allSuggestions;
    return this.allSuggestions.filter(s => s.name.toLowerCase().includes(q));
  });

  readonly roles: { k: ZoneRole; label: string; sub: string }[] = [
    { k: 'casa',   label: 'Casa',   sub: 'Dove vivo' },
    { k: 'lavoro', label: 'Lavoro', sub: 'Dove lavoro' },
    { k: 'segui',  label: 'Segui',  sub: 'Mi interessa' },
  ];

  back(): void { this.location.back(); }

  setQuery(v: string): void {
    this.query.set(v);
    this.selected.set(null);
  }

  pick(s: Suggestion): void {
    this.selected.set(s);
  }

  confirm(): void {
    const s = this.selected();
    if (!s) return;
    const zone: Zone = {
      id: s.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: s.name,
      city: s.city,
      role: this.role(),
      verified: false,
    };
    this.data.addZone(zone);
    this.toast.show(`Zona "${s.name}" aggiunta, verifica con GPS quando ci passi`);
    void this.router.navigate(['/zones/verify', zone.id]);
  }
}

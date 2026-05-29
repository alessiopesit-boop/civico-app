import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { GoogleMapsLoaderService } from '../../core/google-maps-loader.service';
import type { Pin } from '../../core/models';
import { CATS } from '../../core/data';
import { CIVICO_MAP_STYLE } from './google-map-dark-style';

declare const google: any;

const MACRO_ICON_PATHS: Record<string, string> = {
  disservizi: 'M 0,-12 L -10,8 L 10,8 Z',           // cone (triangle)
  sicurezza:  'M 0,-12 L -9,-7 L -9,3 C -9,8 -4,11 0,12 C 4,11 9,8 9,3 L 9,-7 Z', // shield
  risolto:    'M -8,0 L -3,5 L 8,-5',               // check
};

@Component({
  selector: 'cv-google-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map" #host>
      @if (!ready()) {
        <div class="placeholder">
          <div class="spinner"></div>
          <span>Caricamento mappa…</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    .map { position: absolute; inset: 0; }
    .placeholder {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      gap: 10px;
      color: var(--cv-text-mute);
      font-size: 12px;
      background: var(--cv-bg-map);
    }
    .spinner {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.18);
      border-top-color: var(--cv-text);
      animation: cv-spin 0.9s linear infinite;
    }
  `],
})
export class GoogleMapComponent implements OnInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  readonly pins = input<Pin[]>([]);
  readonly center = input<{ lat: number; lng: number }>(environment.googleMaps.defaultCenter);
  readonly zoom = input<number>(environment.googleMaps.defaultZoom);
  readonly dimmedIds = input<Set<number>>(new Set<number>());
  readonly showYouAreHere = input<boolean>(true);

  readonly pinClick = output<Pin>();

  private readonly loader = inject(GoogleMapsLoaderService);
  readonly ready = signal<boolean>(false);

  private map: any = null;
  private markers: any[] = [];
  private youAreHereMarker: any = null;

  async ngOnInit(): Promise<void> {
    const ok = await this.loader.load();
    if (!ok || !this.hostRef) return;

    this.map = new google.maps.Map(this.hostRef.nativeElement, {
      center: this.center(),
      zoom: this.zoom(),
      disableDefaultUI: true,
      backgroundColor: '#0B0D11',
      clickableIcons: false,
      gestureHandling: 'greedy',
      styles: CIVICO_MAP_STYLE,
    });

    this.ready.set(true);
    this.drawPins();
    this.drawYouAreHere();
  }

  ngOnDestroy(): void {
    this.markers.forEach(m => m.setMap(null));
    if (this.youAreHereMarker) this.youAreHereMarker.setMap(null);
  }

  // React to input changes after init.
  private readonly pinsEffect = effect(() => {
    this.pins();
    this.dimmedIds();
    if (this.ready()) this.drawPins();
  });

  private drawPins(): void {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    for (const p of this.pins()) {
      if (p.lat == null || p.lng == null) continue;
      const cat = CATS[p.cat];
      const group = p.cat === 'risolto' ? 'risolto' : cat.group;
      const isDim = this.dimmedIds().has(p.id);

      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: this.map,
        icon: {
          path: MACRO_ICON_PATHS[group],
          fillColor: cat.color,
          fillOpacity: isDim ? 0.4 : 1,
          strokeColor: '#0F1115',
          strokeWeight: 1.5,
          scale: 1.4,
        },
        cursor: 'pointer',
        zIndex: isDim ? 10 : 50,
      });
      marker.addListener('click', () => this.pinClick.emit(p));
      this.markers.push(marker);
    }
  }

  private drawYouAreHere(): void {
    if (!this.showYouAreHere()) return;
    this.youAreHereMarker = new google.maps.Marker({
      position: this.center(),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#5BB7FF',
        fillOpacity: 1,
        strokeColor: '#0F1115',
        strokeWeight: 3,
      },
      zIndex: 1,
      clickable: false,
    });
  }
}

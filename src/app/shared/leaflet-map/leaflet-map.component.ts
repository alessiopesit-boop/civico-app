import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  effect,
  input,
  output,
} from '@angular/core';
import * as L from 'leaflet';
import { CATS } from '../../core/data';
import type { CategoryGroup, Pin } from '../../core/models';

// Glifi macro (cone/shield/check) come SVG inline, colorati scuri sul pin colorato.
const MACRO_GLYPH: Record<CategoryGroup, string> = {
  disservizi: '<path d="M8 2.5L3.5 13.5h9L8 2.5z" fill="#0F1115"/>',
  sicurezza:  '<path d="M8 1.6L3 3.2v4.6c0 3 2.4 5 5 6 2.6-1 5-3 5-6V3.2L8 1.6z" fill="#0F1115"/>',
  risolto:    '<path d="M3 8.5l3.5 3.5L13 5" stroke="#0F1115" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
};

const DEFAULT_CENTER: L.LatLngTuple = [41.8893, 12.4677]; // Roma / Trastevere
const DEFAULT_ZOOM = 15;

@Component({
  selector: 'cv-leaflet-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lmap" #host></div>
    @if (centerPin()) {
      <div class="center-pin" aria-hidden="true">
        <span class="cp-dot"></span>
        <span class="cp-tail"></span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    .lmap { position: absolute; inset: 0; background: #0B0D11; }
    /* pin fisso al centro (usato nella scelta posizione) */
    .center-pin {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -100%);
      pointer-events: none; z-index: 500;
    }
    .cp-dot {
      display: block; width: 30px; height: 30px; border-radius: 50%;
      background: var(--cv-amber); border: 3px solid var(--cv-bg);
      box-shadow: 0 0 0 5px rgba(245,165,36,0.20), 0 12px 22px rgba(0,0,0,0.6);
    }
    .cp-tail {
      position: absolute; left: 50%; top: 100%; transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 7px solid transparent; border-right: 7px solid transparent;
      border-top: 11px solid var(--cv-amber);
    }
    /* attribution discreta sul tema scuro */
    :host ::ng-deep .leaflet-control-attribution {
      background: rgba(15,17,21,0.7); color: rgba(244,242,238,0.5);
      font-size: 9px;
    }
    :host ::ng-deep .leaflet-control-attribution a { color: rgba(244,242,238,0.7); }
    :host ::ng-deep .cv-pin { background: none; border: none; }
    :host ::ng-deep .cv-pin .bubble {
      width: 28px; height: 28px; border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 14px rgba(0,0,0,0.55);
    }
    :host ::ng-deep .cv-you {
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--cv-blue-solid); border: 2px solid #fff;
      box-shadow: 0 0 0 5px rgba(91,183,255,0.20), 0 4px 12px rgba(0,0,0,0.5);
    }
  `],
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  readonly pins = input<Pin[]>([]);
  readonly center = input<{ lat: number; lng: number } | null>(null);
  readonly zoom = input<number>(DEFAULT_ZOOM);
  readonly dimmedIds = input<Set<number>>(new Set<number>());
  readonly interactive = input<boolean>(true);
  readonly showYouAreHere = input<boolean>(true);
  /** Pin fisso al centro (scelta posizione in "nuova segnalazione"). */
  readonly centerPin = input<boolean>(false);

  readonly pinClick = output<Pin>();

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private youMarker: L.Marker | null = null;

  ngAfterViewInit(): void {
    const c = this.center();
    const center: L.LatLngTuple = c ? [c.lat, c.lng] : DEFAULT_CENTER;
    const interactive = this.interactive();

    this.map = L.map(this.hostRef.nativeElement, {
      center,
      zoom: this.zoom(),
      zoomControl: false, // si zooma con pinch / scroll / doppio tap
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      touchZoom: interactive,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 20,
    }).addTo(this.map);

    // Leaflet a volte misura male il contenitore se montato in un layout animato.
    setTimeout(() => this.map?.invalidateSize(), 0);

    this.drawPins();
    this.drawYou();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private readonly redraw = effect(() => {
    this.pins();
    this.dimmedIds();
    if (this.map) this.drawPins();
  });

  private drawPins(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (!this.map) return;

    for (const p of this.pins()) {
      if (p.lat == null || p.lng == null) continue;
      const cat = CATS[p.cat];
      const group: CategoryGroup = p.cat === 'risolto' ? 'risolto' : cat.group;
      const dim = this.dimmedIds().has(p.id);
      const html = `<div class="bubble" style="background:${cat.color};box-shadow:0 0 0 4px ${cat.color}22,0 6px 14px rgba(0,0,0,0.55);${dim ? 'opacity:.45;' : ''}">`
        + `<svg width="14" height="14" viewBox="0 0 16 16">${MACRO_GLYPH[group]}</svg></div>`;
      const icon = L.divIcon({ className: 'cv-pin', html, iconSize: [28, 28], iconAnchor: [14, 14] });
      const marker = L.marker([p.lat, p.lng], { icon, zIndexOffset: dim ? 0 : 100 }).addTo(this.map);
      marker.on('click', () => this.pinClick.emit(p));
      this.markers.push(marker);
    }
  }

  private drawYou(): void {
    if (!this.showYouAreHere() || !this.map) return;
    const c = this.center();
    const pos: L.LatLngTuple = c ? [c.lat, c.lng] : DEFAULT_CENTER;
    const icon = L.divIcon({ className: 'cv-you', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });
    this.youMarker = L.marker(pos, { icon, interactive: false, zIndexOffset: -100 }).addTo(this.map);
  }

  /** Espone il centro corrente (per la scelta posizione). */
  currentCenter(): { lat: number; lng: number } | null {
    if (!this.map) return null;
    const c = this.map.getCenter();
    return { lat: c.lat, lng: c.lng };
  }
}

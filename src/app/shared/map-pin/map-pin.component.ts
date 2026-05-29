import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CATS } from '../../core/data';
import type { CategoryGroup, IconName, Pin, PinStyle } from '../../core/models';
import { SettingsService } from '../../core/settings.service';
import { IconComponent } from '../icon/icon.component';

const MACRO_ICONS: Record<CategoryGroup, IconName> = {
  disservizi: 'cone',
  sicurezza: 'shield',
  risolto: 'check',
};

@Component({
  selector: 'cv-map-pin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button class="pin"
            [class.big]="big()"
            [class.dim]="dim()"
            [class.minimal]="effectiveStyle() === 'minimal'"
            [style.left]="leftPct()"
            [style.top]="topPct()"
            [style.background]="effectiveStyle() === 'minimal' ? 'transparent' : 'transparent'"
            (click)="pinClick.emit()">
      @if (effectiveStyle() === 'minimal') {
        <span class="dot"
              [style.background]="cat().color"
              [style.--ring-color]="cat().color + '22'"></span>
      } @else {
        <span class="bubble"
              [style.background]="cat().color"
              [style.--ring-color]="cat().color + '22'">
          <cv-icon [name]="macroIcon()" [size]="big() ? 18 : 14" color="#0F1115"/>
        </span>
        @if (effectiveStyle() === 'coda') {
          <span class="tail"></span>
        }
      }
    </button>
  `,
  styles: [`
    .pin {
      position: absolute;
      padding: 0; border: none; background: transparent;
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: opacity .18s, transform .18s;
    }
    .pin.dim { opacity: 0.45; }

    .bubble {
      width: 28px; height: 28px; border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.55);
      box-shadow: 0 0 0 4px var(--ring-color), 0 6px 14px rgba(0, 0, 0, 0.55);
      display: flex; align-items: center; justify-content: center;
    }
    .pin.big .bubble { width: 36px; height: 36px; }

    .tail {
      position: absolute;
      left: 50%; top: 100%;
      transform: translateX(-50%) translateY(-2px);
      width: 2px; height: 10px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 2px;
    }

    .dot {
      display: block;
      width: 12px; height: 12px; border-radius: 50%;
      border: 2px solid rgba(15, 17, 21, 0.55);
      box-shadow: 0 0 0 4px var(--ring-color), 0 4px 8px rgba(0, 0, 0, 0.5);
    }
    .pin.big .dot { width: 16px; height: 16px; }
  `],
})
export class MapPinComponent {
  readonly pin = input.required<Pin>();
  readonly big = input<boolean>(false);
  readonly dim = input<boolean>(false);
  readonly mapHeight = input<number>(520);
  readonly styleOverride = input<PinStyle | undefined>();

  readonly pinClick = output<void>();

  private readonly settings = inject(SettingsService);

  readonly cat = computed(() => CATS[this.pin().cat]);

  readonly macroIcon = computed<IconName>(() => {
    const p = this.pin();
    if (p.cat === 'risolto') return 'check';
    return MACRO_ICONS[this.cat().group];
  });

  readonly effectiveStyle = computed<PinStyle>(() =>
    this.styleOverride() ?? this.settings.pinStyle(),
  );

  readonly leftPct = computed(() => `${this.pin().xp * 100}%`);
  readonly topPct = computed(() => `${this.pin().yp * 100}%`);
}

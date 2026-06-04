import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PhotoKind } from '../../core/models';

const TONES: Record<PhotoKind, [string, string]> = {
  asphalt: ['#2A2A2D', '#3A3A3E'],
  night:   ['#191E2A', '#252D3D'],
  street:  ['#2C2E26', '#3A3E32'],
  tree:    ['#1F2A22', '#2B3A2E'],
  park:    ['#23291F', '#30382A'],
  dark:    ['#16181C', '#22252C'],
  door:    ['#2D2520', '#3A302A'],
  fixed:   ['#1F2A26', '#2A3832'],
};

@Component({
  selector: 'cv-photo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph"
         [style.width.px]="w()"
         [style.height.px]="h()"
         [style.border-radius.px]="radius()"
         [style.background]="url() ? 'var(--cv-surface-2)' : bg()">
      @if (url()) {
        <img class="img" [src]="url()" alt="" loading="lazy"/>
      } @else {
        <div class="gloss"></div>
        @if (label()) {
          <div class="label">{{ label() }}</div>
        }
      }
    </div>
  `,
  styles: [`
    .ph {
      position: relative;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    }
    .img {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .gloss {
      position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.06), transparent 60%);
      pointer-events: none;
    }
    .label {
      position: absolute; left: 8px; bottom: 7px;
      color: rgba(255, 255, 255, 0.42);
      font-size: 9px; font-weight: 700;
      letter-spacing: 1px;
      font-family: var(--cv-font-mono);
      text-transform: uppercase;
    }
  `],
})
export class PhotoComponent {
  readonly kind = input<PhotoKind>('dark');
  readonly url = input<string | null | undefined>(null);
  readonly w = input<number>(64);
  readonly h = input<number>(64);
  readonly radius = input<number>(10);
  readonly label = input<string | null>(null);

  readonly bg = computed(() => {
    const [a, b] = TONES[this.kind()] ?? TONES.dark;
    return `repeating-linear-gradient(135deg, ${a} 0 6px, ${b} 6px 12px)`;
  });
}

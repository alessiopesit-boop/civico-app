import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cv-location-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button class="chip" (click)="chipClick.emit()" [class.is-button]="clickable()">
      <span class="dot"></span>
      <span class="name">{{ name() }}</span>
      <span class="sub">· {{ sub() }}</span>
      @if (comuneActive()) {
        <span class="badge-comune">COMUNE</span>
      }
      <cv-icon name="chevron" [size]="12" color="rgba(244,242,238,0.6)"/>
    </button>
  `,
  styles: [`
    .chip {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 6px 10px 6px 8px; border-radius: 999px;
      background: var(--cv-surface-2);
      border: 1px solid var(--cv-border);
      font-family: var(--cv-font);
      color: var(--cv-text);
      cursor: default;
    }
    .chip.is-button { cursor: pointer; }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--cv-green);
      box-shadow: 0 0 0 3px var(--cv-green-soft);
    }
    .name { font-weight: 600; font-size: 12.5px; letter-spacing: -0.1px; }
    .sub { color: var(--cv-text-mute); font-weight: 500; font-size: 12px; }
    .badge-comune {
      background: var(--cv-green-soft);
      color: var(--cv-green);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 2px 5px;
      border-radius: 4px;
    }
  `],
})
export class LocationChipComponent {
  readonly name = input<string>('Trastevere');
  readonly sub = input<string>('Roma');
  readonly comuneActive = input<boolean>(false);
  readonly clickable = input<boolean>(true);
  readonly chipClick = output<void>();
}

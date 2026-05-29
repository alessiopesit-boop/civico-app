import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cv-wordmark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wm">
      <div class="logo">
        <span class="block b1"></span>
        <span class="block b2"></span>
        <span class="block b3"></span>
      </div>
      <span class="text" [style.font-size.px]="size()">Civico</span>
    </div>
  `,
  styles: [`
    .wm { display: inline-flex; align-items: center; gap: 7px; }
    .logo { position: relative; width: 22px; height: 22px; }
    .block { position: absolute; border-radius: 2px; }
    .b1 { left: 0;   bottom: 0; width: 9px;  height: 14px; background: var(--cv-amber); }
    .b2 { left: 8px; bottom: 0; width: 9px;  height: 9px;  background: var(--cv-text); }
    .b3 { left: 14px; bottom: 8px; width: 9px; height: 14px; background: var(--cv-green); opacity: 0.85; }
    .text {
      color: var(--cv-text);
      font-weight: 800;
      letter-spacing: -0.6px;
    }
  `],
})
export class WordmarkComponent {
  readonly size = input<number>(19);
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'cv-icon-btn',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="ibtn"
      [style.--ibtn-size.px]="size()"
      [style.background]="bg()"
      (click)="btnClick.emit()">
      <ng-content/>
      @if (badge() != null) {
        <span class="badge">{{ badge() }}</span>
      }
    </button>
  `,
  styles: [`
    .ibtn {
      position: relative;
      width: var(--ibtn-size, 36px);
      height: var(--ibtn-size, 36px);
      border-radius: 50%;
      border: none;
      cursor: pointer;
      color: var(--cv-text);
      display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 0 0 1px var(--cv-border);
      padding: 0;
    }
    .badge {
      position: absolute;
      top: -2px; right: -2px;
      min-width: 16px; height: 16px;
      border-radius: 8px; padding: 0 4px;
      background: var(--cv-amber);
      color: var(--cv-bg);
      font-size: 10px; font-weight: 800;
      line-height: 16px; text-align: center;
      border: 2px solid var(--cv-bg);
      box-sizing: content-box;
      font-family: var(--cv-font);
    }
  `],
})
export class IconBtnComponent {
  readonly size = input<number>(36);
  readonly bg = input<string>('var(--cv-surface-2)');
  readonly badge = input<number | string | null>(null);
  readonly btnClick = output<void>();
}

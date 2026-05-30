import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'cv-wordmark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="wm" [class.clickable]="link()" (click)="onClick()" [attr.aria-label]="link() ? 'Vai alla home' : null">
      <span class="logo">
        <span class="block b1"></span>
        <span class="block b2"></span>
        <span class="block b3"></span>
      </span>
      <span class="text" [style.font-size.px]="size()">Civico</span>
    </button>
  `,
  styles: [`
    .wm {
      display: inline-flex; align-items: center; gap: 7px;
      background: none; border: none; padding: 0; margin: 0;
      font-family: var(--cv-font);
      cursor: default;
    }
    .wm.clickable { cursor: pointer; }
    .logo { position: relative; width: 22px; height: 22px; flex-shrink: 0; }
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
  /** Se true (default) il logo e' cliccabile e porta alla home. */
  readonly link = input<boolean>(true);

  private readonly router = inject(Router);

  onClick(): void {
    if (this.link()) void this.router.navigate(['/home']);
  }
}

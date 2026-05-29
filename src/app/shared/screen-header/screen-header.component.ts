import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { IconBtnComponent } from '../icon-btn/icon-btn.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cv-screen-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent],
  template: `
    <header class="bar">
      <cv-icon-btn (btnClick)="onBack()">
        <cv-icon name="arrow" [size]="15" color="var(--cv-text)"/>
      </cv-icon-btn>
      <div class="title">{{ title() }}</div>
      <span class="end">
        <ng-content/>
      </span>
    </header>
  `,
  styles: [`
    .bar {
      flex-shrink: 0;
      padding: 6px 14px 6px;
      padding-top: calc(var(--cv-safe-top) + 6px);
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px;
    }
    .title {
      color: var(--cv-text);
      font-size: 15px;
      font-weight: 700;
    }
    .end {
      min-width: 36px;
      display: flex;
      justify-content: flex-end;
    }
  `],
})
export class ScreenHeaderComponent {
  readonly title = input<string>('');
  /** When true, default back-button uses location.back(). */
  readonly autoBack = input<boolean>(true);

  readonly backClick = output<void>();

  private readonly location = inject(Location);

  onBack(): void {
    this.backClick.emit();
    if (this.autoBack()) this.location.back();
  }
}

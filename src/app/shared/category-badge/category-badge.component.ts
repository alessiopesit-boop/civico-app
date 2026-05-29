import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CATS } from '../../core/data';
import type { CategoryKey } from '../../core/models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cv-category-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="badge"
      [class.sm]="small()"
      [style.background]="bgSoft()"
      [style.color]="cat().color">
      <cv-icon [name]="cat().iconName" [size]="small() ? 10 : 12" [color]="cat().color"/>
      {{ cat().label }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px 4px 7px;
      border-radius: 999px;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.4px; text-transform: uppercase;
      font-family: var(--cv-font);
    }
    .badge.sm { gap: 4px; padding: 2px 7px 2px 5px; font-size: 10.5px; letter-spacing: 0.3px; }
  `],
})
export class CategoryBadgeComponent {
  readonly catKey = input.required<CategoryKey>({ alias: 'cat' });
  readonly small = input<boolean>(false, { alias: 'sm' });

  readonly cat = computed(() => CATS[this.catKey()]);
  readonly bgSoft = computed(() => {
    const k = this.catKey();
    if (k === 'risolto') return 'var(--cv-green-soft)';
    return CATS[k].group === 'sicurezza' ? 'var(--cv-red-soft)' : 'var(--cv-amber-soft)';
  });
}

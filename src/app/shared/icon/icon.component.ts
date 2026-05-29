import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IconDir, IconName } from '../../core/models';

@Component({
  selector: 'cv-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  styles: [`
    :host { display: inline-flex; line-height: 0; }
    svg { display: block; }
  `],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(14);
  readonly color = input<string>('#0F1115');
  readonly dir = input<IconDir>('right');
  readonly filled = input<boolean>(false);

  readonly rotation = computed(() => {
    const dir = this.dir();
    const n = this.name();
    if (n === 'chevron') return { right: 0, down: 90, left: 180, up: 270 }[dir];
    if (n === 'arrow') return { left: 0, right: 180, up: 90, down: 270 }[dir];
    return 0;
  });

  readonly fill = computed(() => {
    if (this.name() === 'bookmark') return this.filled() ? this.color() : 'none';
    return undefined;
  });
}

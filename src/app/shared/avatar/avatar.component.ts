import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { USERS } from '../../core/data';
import type { UserDef, UserKey } from '../../core/models';

@Component({
  selector: 'cv-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user(); as u) {
      <div class="av" [style.--av-size.px]="size()"
           [style.background]="u.anon ? 'var(--cv-surface-3)' : 'oklch(0.48 0.13 ' + u.hue + ')'"
           [style.color]="u.anon ? 'var(--cv-text-mute)' : '#fff'"
           [class.ring]="ring()">
        {{ u.initials }}
      </div>
    }
  `,
  styles: [`
    .av {
      width: var(--av-size, 28px);
      height: var(--av-size, 28px);
      border-radius: 50%;
      font-weight: 700;
      font-size: calc(var(--av-size, 28px) * 0.36);
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.3px;
      flex-shrink: 0;
      box-sizing: border-box;
      font-family: var(--cv-font);
    }
    .av.ring { border: 2px solid var(--cv-bg); }
  `],
})
export class AvatarComponent {
  readonly userKey = input<UserKey | undefined>(undefined, { alias: 'user' });
  readonly userObj = input<UserDef | undefined>(undefined, { alias: 'userObj' });
  readonly size = input<number>(28);
  readonly ring = input<boolean>(false);

  readonly user = computed<UserDef | undefined>(() => {
    return this.userObj() ?? (this.userKey() ? USERS[this.userKey()!] : undefined);
  });
}

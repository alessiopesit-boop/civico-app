import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cv-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (toasts.current(); as t) {
      <div class="toast" [style.border-color]="borderColor()">
        <div class="icon" [style.background]="color()">
          <cv-icon name="check" [size]="14" color="#0F1115"/>
        </div>
        <div class="msg">{{ t.message }}</div>
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      left: 14px; right: 14px; bottom: 80px;
      z-index: 100000;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(15, 17, 21, 0.94);
      backdrop-filter: blur(10px);
      border: 1px solid;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      animation: cv-toast-in 0.25s ease-out;
    }
    .icon {
      width: 26px; height: 26px;
      border-radius: 13px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .msg {
      color: var(--cv-text);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.35;
    }
  `],
})
export class ToastComponent {
  readonly toasts = inject(ToastService);

  readonly color = computed(() => {
    const k = this.toasts.current()?.kind ?? 'success';
    if (k === 'success') return 'var(--cv-green)';
    if (k === 'warn') return 'var(--cv-amber)';
    return 'var(--cv-red)';
  });
  readonly borderColor = computed(() => this.color() + '55');
}

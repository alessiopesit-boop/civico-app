import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'cv-app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <div class="page" [class.is-mobile]="isMobile()">
      <div class="frame" [class.is-mobile]="isMobile()">
        <div class="screen cv-app">
          <router-outlet/>
        </div>
        <cv-toast/>
      </div>
    </div>
  `,
  styles: [`
    .page {
      position: fixed;
      inset: 0;
      background: var(--cv-bg-page);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--cv-font);
    }
    .page.is-mobile { background: var(--cv-bg); }
    .frame {
      position: relative;
      width: var(--cv-shell-w);
      height: min(var(--cv-shell-h), calc(100vh - 40px));
      background: var(--cv-bg);
      overflow: hidden;
      border-radius: var(--cv-shell-radius);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04);
      color: var(--cv-text);
    }
    .frame.is-mobile {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
    }
    .screen {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
  `],
})
export class AppShellComponent {
  readonly isMobile = signal<boolean>(this.compute());

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(this.compute());
  }

  private compute(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 500;
  }
}

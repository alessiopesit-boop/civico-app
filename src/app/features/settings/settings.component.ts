import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SettingsService } from '../../core/settings.service';
import { ToastService } from '../../core/toast.service';
import type { PinStyle } from '../../core/models';
import { APP_VERSION, BUILD_CONTEXT, BUILD_SHA } from '../../core/build-info';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'cv-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly settings = inject(SettingsService);

  readonly pinStyles: PinStyle[] = ['rotondo', 'coda', 'minimal'];

  /** Etichetta versione: "v0.1.0" in release, "v0.1.0 · dev · abc1234" in dev. */
  readonly buildLabel = `v${APP_VERSION}` +
    (BUILD_CONTEXT === 'dev' ? ` · dev${BUILD_SHA ? ' · ' + BUILD_SHA : ''}` : '');

  back(): void { this.location.back(); }

  setPinStyle(style: PinStyle): void { this.settings.pinStyle.set(style); }

  togglePhoto(): void { this.settings.showPhoto.update(v => !v); }
  togglePush(): void { this.settings.notificationsPush.update(v => !v); }
  toggleAnonDefault(): void { this.settings.privacyAnonDefault.update(v => !v); }

  resetOnboarding(): void {
    this.auth.resetAll();
    this.toast.show('Reset eseguito');
    void this.router.navigateByUrl('/onboarding');
  }

  /** Modale "esci da tutti i dispositivi". */
  readonly confirmAllOpen = signal(false);
  askLogoutAll(): void { this.confirmAllOpen.set(true); }
  cancelLogoutAll(): void { this.confirmAllOpen.set(false); }
  async confirmLogoutAll(): Promise<void> {
    this.confirmAllOpen.set(false);
    await this.auth.logoutAllDevices();
    this.toast.show('Uscito da tutti i dispositivi');
    void this.router.navigateByUrl('/login');
  }
}

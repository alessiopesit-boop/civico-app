import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { WordmarkComponent } from '../../shared/wordmark/wordmark.component';

type LoginMode = 'options' | 'email';

@Component({
  selector: 'cv-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconBtnComponent, IconComponent, WordmarkComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly mode = signal<LoginMode>('options');
  readonly email = signal('');
  readonly password = signal('');

  back(): void {
    if (this.mode() !== 'options') {
      this.mode.set('options');
      return;
    }
    this.location.back();
  }

  /** Google / email: account base + propose phone OTP. */
  goBase(method: 'Google' | 'via email'): void {
    this.auth.loginAs('base');
    this.toast.show(`Account creato (${method})`);
    void this.router.navigate(['/add-phone'], { replaceUrl: true });
  }

  goGuest(): void {
    this.auth.loginAs('guest');
    this.toast.show('Stai esplorando come ospite');
    void this.router.navigate(['/home'], { replaceUrl: true });
  }

  canSubmitEmail(): boolean {
    return this.email().trim() !== '' && this.password().trim() !== '';
  }

  forgotPassword(): void {
    this.toast.show('Useremo un OTP via email');
  }
}

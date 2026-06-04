import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { WordmarkComponent } from '../../shared/wordmark/wordmark.component';

type LoginMode = 'email' | 'sent';

@Component({
  selector: 'cv-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconBtnComponent, IconComponent, WordmarkComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly mode = signal<LoginMode>('email');
  readonly email = signal('');
  readonly sending = signal(false);

  readonly emailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.email().trim()));

  back(): void {
    if (this.mode() === 'sent') {
      this.mode.set('email');
      return;
    }
    this.location.back();
  }

  async sendLink(): Promise<void> {
    if (!this.emailValid() || this.sending()) return;
    this.sending.set(true);
    const { error } = await this.auth.sendMagicLink(this.email());
    this.sending.set(false);
    if (error) {
      this.toast.show('Invio non riuscito, riprova tra poco');
      return;
    }
    this.mode.set('sent');
  }

  resend(): void {
    void this.sendLink();
  }
}

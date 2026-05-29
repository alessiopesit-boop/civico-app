import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

type Step = 'enter' | 'otp';

@Component({
  selector: 'cv-add-phone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconBtnComponent, IconComponent],
  templateUrl: './add-phone.component.html',
  styleUrl: './add-phone.component.scss',
})
export class AddPhoneComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly step = signal<Step>('enter');
  readonly phone = signal('');
  readonly otp = signal('');

  readonly benefits: string[] = [
    'Potrai segnalare problemi nella tua zona',
    'Potrai confermare segnalazioni dei vicini',
    'Il tuo voto avrà peso nella risoluzione',
    'Il numero non viene mostrato a nessuno',
  ];

  readonly canSendCode = computed(() => this.phone().replace(/\s/g, '').length >= 8);
  readonly canConfirm = computed(() => this.otp().length === 6);

  back(): void {
    if (this.step() === 'otp') {
      this.step.set('enter');
      return;
    }
    void this.router.navigateByUrl('/home');
  }

  skip(): void {
    void this.router.navigateByUrl('/home');
  }

  onPhoneInput(value: string): void {
    this.phone.set(value.replace(/[^\d ]/g, ''));
  }

  onOtpInput(value: string): void {
    this.otp.set(value.replace(/\D/g, '').slice(0, 6));
  }

  sendCode(): void {
    if (!this.canSendCode()) return;
    this.step.set('otp');
    this.toast.show('SMS inviato (demo)');
  }

  confirm(): void {
    if (!this.canConfirm()) return;
    this.auth.setUserType('active');
    this.toast.show('Cellulare verificato, ora sei un account attivo');
    void this.router.navigateByUrl('/home');
  }
}

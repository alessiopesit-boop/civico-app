import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { MapBackgroundComponent } from '../../shared/map-background/map-background.component';
import { MapPinComponent } from '../../shared/map-pin/map-pin.component';
import { WordmarkComponent } from '../../shared/wordmark/wordmark.component';
import type { Pin } from '../../core/models';

@Component({
  selector: 'cv-onboarding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MapBackgroundComponent, MapPinComponent, WordmarkComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly pins: Pin[] = [
    { id: 1, cat: 'buca',       xp: 0.21, yp: 0.35 },
    { id: 2, cat: 'lampione',   xp: 0.64, yp: 0.50 },
    { id: 3, cat: 'risolto',    xp: 0.44, yp: 0.70 },
    { id: 4, cat: 'furtoAuto',  xp: 0.80, yp: 0.27 },
  ];

  readonly bullets = [
    { iconName: 'camera' as const, color: 'var(--cv-amber)', bg: 'var(--cv-amber-soft)', title: 'Segnali ciò che vedi', sub: 'Buche, lampioni rotti, furti, vandalismi. Una foto e siamo a posto.' },
    { iconName: 'hand'   as const, color: 'var(--cv-text)',  bg: 'var(--cv-surface-3)',  title: 'Confermi ciò che vede chi passa', sub: 'Un tap. Più conferme = più peso. È così che la voce diventa una cosa concreta.' },
    { iconName: 'check'  as const, color: 'var(--cv-green)', bg: 'var(--cv-green-soft)', title: 'Risolvete insieme', sub: 'Quando 5+ vicini confermano che è a posto, la segnalazione si chiude.' },
  ];

  proceed(): void {
    this.auth.finishOnboarding();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ProfileService } from '../../core/profile.service';
import { WordmarkComponent } from '../../shared/wordmark/wordmark.component';

const MIN_AGE = 14;

@Component({
  selector: 'cv-complete-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, WordmarkComponent],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.scss',
})
export class CompleteProfileComponent {
  private readonly router = inject(Router);
  private readonly profile = inject(ProfileService);
  protected readonly auth = inject(AuthService);

  readonly nome = signal('');
  readonly cognome = signal('');
  readonly birth = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Data massima selezionabile: oggi (niente date future). */
  readonly maxDate = this.today();

  readonly age = computed(() => {
    const v = this.birth();
    if (!v) return null;
    const b = new Date(v);
    if (Number.isNaN(b.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a;
  });

  readonly tooYoung = computed(() => {
    const a = this.age();
    return a !== null && a < MIN_AGE;
  });

  readonly valid = computed(() =>
    this.nome().trim().length > 0 &&
    this.cognome().trim().length > 0 &&
    this.age() !== null &&
    !this.tooYoung(),
  );

  async submit(): Promise<void> {
    if (!this.valid() || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    const { error } = await this.profile.create(this.nome(), this.cognome(), this.birth());
    this.saving.set(false);
    if (error) {
      this.error.set(error);
      return;
    }
    void this.router.navigateByUrl('/home');
  }

  private today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}

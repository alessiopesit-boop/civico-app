import { Injectable, computed } from '@angular/core';
import { persistedSignal } from './persisted-signal';
import type { UserType, UserKey } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Whether the user has completed the onboarding splash. */
  readonly onboarded = persistedSignal<boolean>('civico.onboarded', false);

  /** Whether the user has authenticated (any method). */
  readonly authed = persistedSignal<boolean>('civico.authed', false);

  /** User identity (which persona avatar to use in the prototype). */
  readonly identity = persistedSignal<UserKey>('civico.identity', 'marco');

  /** guest | base (email/Google, no OTP) | active (with phone OTP). */
  readonly userType = persistedSignal<UserType>('civico.userType', 'active');

  /** Whether the user has verified their phone number. */
  readonly phoneVerified = computed(() => this.userType() === 'active');

  readonly canParticipate = computed(() => this.userType() === 'active');

  setUserType(t: UserType): void {
    this.userType.set(t);
    // Anche l'ospite e' "passato dal login": deve poter entrare nell'app in
    // sola lettura. Le azioni che richiedono partecipazione (segnalare,
    // confermare) restano gate da userType === 'active', non da authed.
    this.authed.set(true);
  }

  finishOnboarding(): void {
    this.onboarded.set(true);
  }

  loginAs(t: UserType, id: UserKey = 'marco'): void {
    this.identity.set(id);
    this.setUserType(t);
  }

  logout(): void {
    this.authed.set(false);
    this.userType.set('guest');
  }

  resetAll(): void {
    this.authed.set(false);
    this.onboarded.set(false);
    this.userType.set('guest');
  }
}

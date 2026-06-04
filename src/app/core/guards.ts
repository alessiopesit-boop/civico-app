import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

/** Default app route guard: onboarding + login + profilo completo. */
export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(ProfileService);
  const router = inject(Router);
  if (!auth.onboarded()) return router.parseUrl('/onboarding');
  if (!auth.authed()) return router.parseUrl('/login');
  if (!profile.completed()) return router.parseUrl('/completa-profilo');
  return true;
};

/** Onboarding screen: skip if already done. */
export const onboardingScreenGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.onboarded()) return true;
  return router.parseUrl(auth.authed() ? '/home' : '/login');
};

/** Login screen: skip if already authed (verso home o completa-profilo). */
export const loginScreenGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(ProfileService);
  const router = inject(Router);
  if (!auth.authed()) return true;
  return router.parseUrl(profile.completed() ? '/home' : '/completa-profilo');
};

/** Schermata completa-profilo: solo per chi e' loggato ma senza profilo. */
export const completeProfileGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(ProfileService);
  const router = inject(Router);
  if (!auth.authed()) return router.parseUrl('/login');
  if (profile.completed()) return router.parseUrl('/home');
  return true;
};

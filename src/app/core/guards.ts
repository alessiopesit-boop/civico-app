import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Default app route guard: enforces onboarding + login before app screens. */
export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.onboarded()) return router.parseUrl('/onboarding');
  if (!auth.authed()) return router.parseUrl('/login');
  return true;
};

/** Onboarding screen: skip if already done. */
export const onboardingScreenGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.onboarded()) return true;
  return router.parseUrl(auth.authed() ? '/home' : '/login');
};

/** Login screen: skip if already authed. */
export const loginScreenGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authed()) return true;
  return router.parseUrl('/home');
};

import { Routes } from '@angular/router';
import { completeProfileGuard, loginScreenGuard, onboardingGuard, onboardingScreenGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'onboarding',
    canActivate: [onboardingScreenGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: 'login',
    canActivate: [loginScreenGuard],
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'completa-profilo',
    canActivate: [completeProfileGuard],
    loadComponent: () =>
      import('./features/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent),
  },
  {
    path: 'home',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'detail/:id',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/detail/detail.component').then(m => m.DetailComponent),
  },
  {
    path: 'new-report',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/new-report/new-report.component').then(m => m.NewReportComponent),
  },
  {
    path: 'map',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/map-fullscreen/map-fullscreen.component').then(m => m.MapFullscreenComponent),
  },
  {
    path: 'notifications',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
  },
  {
    path: 'profile',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'u/:id',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/public-profile/public-profile.component').then(m => m.PublicProfileComponent),
  },
  {
    path: 'settings',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'info',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/info/info.component').then(m => m.InfoComponent),
  },
  {
    path: 'storico',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/storico/storico.component').then(m => m.StoricoComponent),
  },
  {
    path: 'zones',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/zones/manage-zones.component').then(m => m.ManageZonesComponent),
  },
  {
    path: 'zones/add',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/zones/add-zone.component').then(m => m.AddZoneComponent),
  },
  {
    path: 'zones/verify/:id',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/zones/verify-zone.component').then(m => m.VerifyZoneComponent),
  },

  { path: '**', redirectTo: 'home' },
];

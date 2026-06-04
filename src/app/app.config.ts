import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { ProfileService } from './core/profile.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    // Risolve sessione + profilo prima del primo render: cosi' i guard vedono
    // subito lo stato corretto (anche al ritorno dal magic-link).
    provideAppInitializer(async () => {
      await inject(AuthService).init();
      await inject(ProfileService).init();
    }),
  ],
};

import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    // Risolve la sessione Supabase prima del primo render: cosi' i guard
    // vedono subito lo stato di auth corretto (anche al ritorno dal magic-link).
    provideAppInitializer(() => inject(AuthService).init()),
  ],
};

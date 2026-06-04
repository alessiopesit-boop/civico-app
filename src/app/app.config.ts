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
    // NB: inject() va chiamato sincrono PRIMA di qualsiasi await (contesto DI).
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      const profile = inject(ProfileService);
      return auth.init().then(() => profile.init());
    }),
  ],
};

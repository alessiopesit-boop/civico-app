import { Injectable } from '@angular/core';
import { persistedSignal } from './persisted-signal';
import type { PinStyle } from './models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly pinStyle = persistedSignal<PinStyle>('civico.pinStyle', 'coda');
  readonly showPhoto = persistedSignal<boolean>('civico.showPhoto', true);
  readonly privacyAnonDefault = persistedSignal<boolean>('civico.anonDefault', true);
  readonly notificationsPush = persistedSignal<boolean>('civico.pushNotif', true);
  readonly polsoDismissedAt = persistedSignal<number>('civico.polsoDismissedAt', 0);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from './shared/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent],
  template: `<cv-app-shell/>`,
})
export class App {}

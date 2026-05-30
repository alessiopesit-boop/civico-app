import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppShellComponent } from './shared/app-shell/app-shell.component';
import { BUILD_CONTEXT } from './core/build-info';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent],
  template: `<cv-app-shell/>`,
})
export class App {
  private readonly title = inject(Title);

  constructor() {
    // In sviluppo prefissa il titolo della scheda con "[dev] " per distinguere
    // a colpo d'occhio le build locali da quelle pubblicate. In production il
    // file fileReplaced ha BUILD_CONTEXT='release' e il title resta com'e'.
    if (BUILD_CONTEXT === 'dev') {
      const base = this.title.getTitle() || 'Civico';
      if (!base.startsWith('[dev] ')) this.title.setTitle(`[dev] ${base}`);
    }
  }
}

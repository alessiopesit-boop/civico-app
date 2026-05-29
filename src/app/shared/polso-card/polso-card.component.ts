import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface PolsoStats {
  aperte: number;
  risolte: number;
  hotStreet: string;
}

@Component({
  selector: 'cv-polso-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="card">
      <button class="close" (click)="dismiss.emit()" aria-label="Chiudi">
        <cv-icon name="close" [size]="14" color="var(--cv-text-faint)"/>
      </button>
      <header class="head">
        <div class="bubble">
          <cv-icon name="sparkle" [size]="13" color="var(--cv-amber)"/>
        </div>
        <div>
          <div class="kicker">Polso della zona</div>
          <div class="title">Questa settimana a {{ zoneName() }}</div>
        </div>
      </header>

      <div class="stats">
        <div>
          <div class="num">{{ stats().aperte }}</div>
          <div class="lab">aperte</div>
        </div>
        <div>
          <div class="num green">{{ stats().risolte }}</div>
          <div class="lab">risolte</div>
        </div>
        <div class="hot">
          <div class="hot-name">{{ stats().hotStreet }}</div>
          <div class="lab">zona più attiva</div>
        </div>
      </div>

      <button class="open" (click)="open.emit()">
        Apri storico
        <cv-icon name="chevron" [size]="11" color="var(--cv-text-mute)"/>
      </button>
    </div>
  `,
  styles: [`
    .card {
      position: relative;
      margin: 10px 0 14px;
      padding: 14px;
      background: linear-gradient(135deg, var(--cv-surface) 0%, rgba(245, 165, 36, 0.06) 100%);
      border: 1px solid rgba(245, 165, 36, 0.2);
      border-radius: 14px;
    }
    .close {
      position: absolute;
      top: 8px; right: 8px;
      width: 24px; height: 24px;
      border-radius: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0;
    }
    .head { display: flex; align-items: center; gap: 8px; }
    .bubble {
      width: 26px; height: 26px; border-radius: 13px;
      background: var(--cv-amber-soft);
      display: flex; align-items: center; justify-content: center;
    }
    .kicker {
      color: var(--cv-text-faint);
      font-size: 10px; font-weight: 800;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .title {
      color: var(--cv-text);
      font-size: 15px; font-weight: 700;
      letter-spacing: -0.2px;
      margin-top: 1px;
    }
    .stats {
      margin-top: 12px;
      display: flex;
      gap: 18px;
    }
    .num {
      color: var(--cv-text);
      font-size: 22px; font-weight: 800;
      letter-spacing: -0.5px;
      font-variant-numeric: tabular-nums;
    }
    .num.green { color: var(--cv-green); }
    .lab {
      color: var(--cv-text-mute);
      font-size: 11px; font-weight: 600;
    }
    .hot { flex: 1; min-width: 0; }
    .hot-name {
      color: var(--cv-text);
      font-size: 13px; font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.1px;
    }
    .open {
      margin-top: 12px;
      width: 100%;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--cv-border);
      border-radius: 10px;
      color: var(--cv-text);
      font-weight: 700;
      font-size: 12.5px;
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      gap: 5px;
    }
  `],
})
export class PolsoCardComponent {
  readonly zoneName = input.required<string>();
  readonly stats = input.required<PolsoStats>();
  readonly open = output<void>();
  readonly dismiss = output<void>();
}

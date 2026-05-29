import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import type { Zone } from '../../core/models';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'cv-zone-picker-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent],
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <div class="sheet">
      <div class="handle"></div>
      <header>
        <h3>Le mie zone</h3>
        <cv-icon-btn (btnClick)="closed.emit()">
          <cv-icon name="close" [size]="14" color="var(--cv-text)"/>
        </cv-icon-btn>
      </header>

      <div class="list">
        @for (z of zones(); track z.id) {
          <button class="zone" [class.active]="z.id === activeId()" (click)="picked.emit(z.id)">
            <div class="dot" [class.active]="z.id === activeId()">
              <cv-icon name="pinSmall" [size]="13" [color]="z.id === activeId() ? '#0F1115' : 'var(--cv-text-mute)'"/>
            </div>
            <div class="info">
              <div class="name">
                <span>{{ z.name }}</span>
                <span class="sub">· {{ z.city }}</span>
                <span class="role">{{ roleLabel(z.role) }}</span>
              </div>
              <div class="status">
                @if (z.verified) {
                  <span class="ok">
                    <cv-icon name="check" [size]="10" color="var(--cv-green)"/> verificata
                  </span>
                } @else {
                  <span class="warn">
                    <cv-icon name="lock" [size]="10" color="var(--cv-amber)"/> da verificare
                  </span>
                }
              </div>
            </div>
            @if (z.id === activeId()) {
              <cv-icon name="check" [size]="14" color="var(--cv-amber)"/>
            }
          </button>
        }

        <button class="add" (click)="goAdd()">
          <cv-icon name="plus" [size]="14" color="var(--cv-text)"/>
          Aggiungi una zona
        </button>
        <button class="manage" (click)="goManage()">
          Gestisci tutte le zone
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      inset: 0;
      z-index: 30;
    }
    .backdrop {
      position: absolute; inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .sheet {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      background: var(--cv-bg);
      border-top-left-radius: 22px;
      border-top-right-radius: 22px;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
      padding-bottom: calc(var(--cv-safe-bottom) + 12px);
      animation: cv-sheet-in 0.25s ease-out;
    }
    .handle {
      margin: 10px auto 8px;
      width: 38px; height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
    }
    header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 16px 12px;
    }
    header h3 {
      margin: 0;
      color: var(--cv-text);
      font-size: 17px; font-weight: 700;
      letter-spacing: -0.3px;
    }
    .list {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .zone {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 12px;
      background: var(--cv-surface);
      border: 1px solid var(--cv-border);
      cursor: pointer;
      font-family: var(--cv-font);
      text-align: left;
      color: inherit;
    }
    .zone.active {
      background: var(--cv-amber-soft);
      border-color: rgba(245, 165, 36, 0.33);
    }
    .dot {
      width: 32px; height: 32px; border-radius: 16px;
      background: var(--cv-surface-3);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dot.active { background: var(--cv-amber); }
    .info { flex: 1; min-width: 0; }
    .name {
      color: var(--cv-text);
      font-size: 14px; font-weight: 700;
      display: flex; align-items: center; gap: 6px;
      flex-wrap: wrap;
    }
    .sub {
      color: var(--cv-text-mute);
      font-weight: 500;
      font-size: 12px;
    }
    .role {
      background: var(--cv-surface-3);
      color: var(--cv-text-mute);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      padding: 2px 6px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .status {
      margin-top: 2px;
      font-size: 11px;
      .ok, .warn {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-weight: 700;
      }
      .ok  { color: var(--cv-green); }
      .warn { color: var(--cv-amber); }
    }
    .add {
      margin-top: 4px;
      padding: 12px;
      background: transparent;
      border: 1px dashed var(--cv-border-m);
      border-radius: 12px;
      color: var(--cv-text);
      font-family: var(--cv-font);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .manage {
      padding: 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--cv-text-mute);
      font-family: var(--cv-font);
      font-weight: 600;
      font-size: 12.5px;
    }
  `],
})
export class ZonePickerSheetComponent {
  readonly zones = input.required<Zone[]>();
  readonly activeId = input.required<string>();
  readonly picked = output<string>();
  readonly closed = output<void>();

  private readonly router = inject(Router);

  roleLabel(role: Zone['role']): string {
    return { casa: 'CASA', lavoro: 'LAVORO', segui: 'SEGUI' }[role];
  }

  goAdd(): void {
    this.closed.emit();
    void this.router.navigate(['/zones/add']);
  }

  goManage(): void {
    this.closed.emit();
    void this.router.navigate(['/zones']);
  }
}

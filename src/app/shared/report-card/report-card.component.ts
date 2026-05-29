import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { Report } from '../../core/models';
import { SettingsService } from '../../core/settings.service';
import { CategoryBadgeComponent } from '../category-badge/category-badge.component';
import { IconComponent } from '../icon/icon.component';
import { PhotoComponent } from '../photo/photo.component';

@Component({
  selector: 'cv-report-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CategoryBadgeComponent, IconComponent, PhotoComponent],
  template: `
    <button class="row" (click)="cardClick.emit()" type="button">
      @if (showPhoto()) {
        <cv-photo [kind]="r().photo" [w]="52" [h]="52" [radius]="10"/>
      }
      <div class="meta">
        <div class="top">
          <cv-category-badge [cat]="r().cat" [sm]="true"/>
          <span class="time">· {{ r().time }}</span>
        </div>
        <div class="title">{{ r().title }}</div>
        <div class="bottom">
          <span class="where">
            <cv-icon name="pinSmall" [size]="10" color="var(--cv-text-faint)"/>
            <span class="where-text">{{ r().where }}</span>
          </span>
          <span class="conf" [class.resolved]="r().cat === 'risolto'">
            <cv-icon name="hand" [size]="11" [color]="r().cat === 'risolto' ? 'var(--cv-green)' : 'var(--cv-amber)'"/>
            {{ r().confirms }} confermano
          </span>
        </div>
      </div>
    </button>
  `,
  styles: [`
    .row {
      display: flex;
      gap: 12px;
      padding: 9px 0;
      border-bottom: 1px solid var(--cv-border-s);
      align-items: center;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--cv-border-s);
      cursor: pointer;
      text-align: left;
      width: 100%;
      font-family: var(--cv-font);
    }
    .meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .time {
      color: var(--cv-text-faint);
      font-size: 11px;
      font-weight: 500;
    }
    .title {
      color: var(--cv-text);
      font-weight: 600;
      font-size: 13.5px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--cv-text-mute);
      font-size: 11.5px;
      font-weight: 500;
      gap: 8px;
    }
    .where {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .where-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .conf {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--cv-text);
      font-weight: 700;
      font-size: 11.5px;
      flex-shrink: 0;
    }
    .conf.resolved {
      color: var(--cv-green);
    }
  `],
})
export class ReportCardComponent {
  readonly r = input.required<Report>();
  readonly cardClick = output<void>();

  private readonly settings = inject(SettingsService);
  readonly showPhoto = computed(() => this.settings.showPhoto());
}

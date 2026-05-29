import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cv-map-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="100%" [attr.height]="height()" [attr.viewBox]="'0 0 390 ' + height()"
         preserveAspectRatio="xMidYMid slice" class="map">
      <defs>
        <pattern id="cv-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.4" fill="rgba(255,255,255,0.05)"/>
        </pattern>
        <linearGradient id="cv-vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgba(15,17,21,0)"/>
          <stop offset="1" stop-color="rgba(15,17,21,0.55)"/>
        </linearGradient>
      </defs>

      <rect width="390" [attr.height]="height()" fill="#0B0D11"/>
      <rect width="390" [attr.height]="height()" fill="url(#cv-dots)"/>

      <!-- park -->
      <path d="M 18,80 Q 70,60 130,72 Q 175,95 165,140 Q 130,178 70,168 Q 18,150 18,80 Z"
            fill="rgba(63,185,132,0.14)" stroke="rgba(63,185,132,0.18)" stroke-width="0.6"/>
      <text x="74" y="120" fill="rgba(63,185,132,0.5)" font-size="9" font-weight="600" letter-spacing="0.3">PARCO</text>

      <circle cx="180" cy="210" r="22" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
      <text x="160" y="213" fill="rgba(255,255,255,0.25)" font-size="7" font-weight="600" letter-spacing="0.4">PIAZZA MAZZINI</text>

      <!-- river -->
      <path d="M 280,330 Q 330,310 380,330 L 390,430 Q 360,455 300,440 Q 270,400 280,330 Z"
            fill="rgba(120,150,200,0.10)" stroke="rgba(120,150,200,0.18)" stroke-width="0.6"/>
      <text x="308" y="395" fill="rgba(120,150,200,0.55)" font-size="8" font-weight="600">Fiume</text>

      <!-- main roads -->
      <g stroke="rgba(255,255,255,0.10)" stroke-width="9" fill="none" stroke-linecap="round">
        <path d="M -10,205 Q 90,210 200,200 Q 290,196 410,210"/>
        <path d="M 60,-10 Q 65,150 80,310 Q 90,420 100,500"/>
        <path d="M 220,-10 L 240,180 L 280,360 L 310,500"/>
      </g>
      <g stroke="rgba(255,255,255,0.18)" stroke-width="0.6" fill="none" stroke-dasharray="3 3">
        <path d="M -10,205 Q 90,210 200,200 Q 290,196 410,210"/>
        <path d="M 60,-10 Q 65,150 80,310 Q 90,420 100,500"/>
      </g>

      <!-- side streets -->
      <g stroke="rgba(255,255,255,0.06)" stroke-width="3" fill="none">
        <path d="M 130,-10 L 140,500"/>
        <path d="M 175,-10 L 195,500"/>
        <path d="M 300,-10 L 325,500"/>
        <path d="M -10,100 L 410,108"/>
        <path d="M -10,270 L 410,278"/>
        <path d="M -10,340 L 280,355"/>
      </g>

      <g fill="rgba(255,255,255,0.32)" font-size="6.5" font-weight="600" letter-spacing="0.5">
        <text x="20"  y="200" transform="rotate(-2 20 200)">VIA GARIBALDI</text>
        <text x="68"  y="40"  transform="rotate(86 68 40)">VIA ROMA</text>
        <text x="245" y="60"  transform="rotate(82 245 60)">VIALE DEI PINI</text>
        <text x="20"  y="98"  transform="rotate(-1 20 98)">VIA DEI MILLE</text>
      </g>

      <!-- buildings -->
      <g fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" stroke-width="0.4">
        <rect x="14"  y="225" width="40"  height="35" rx="2"/>
        <rect x="62"  y="225" width="58"  height="38" rx="2"/>
        <rect x="148" y="235" width="20"  height="28" rx="2"/>
        <rect x="190" y="240" width="42"  height="22" rx="2"/>
        <rect x="240" y="225" width="34"  height="36" rx="2"/>
        <rect x="14"  y="288" width="48"  height="44" rx="2"/>
        <rect x="148" y="288" width="20"  height="42" rx="2"/>
        <rect x="195" y="295" width="60"  height="50" rx="2"/>
        <rect x="14"  y="380" width="80"  height="60" rx="2"/>
        <rect x="115" y="380" width="120" height="58" rx="2"/>
      </g>

      <rect width="390" [attr.height]="height()" fill="url(#cv-vignette)" pointer-events="none"/>
    </svg>
  `,
  styles: [`
    .map {
      position: absolute;
      inset: 0;
      display: block;
    }
  `],
})
export class MapBackgroundComponent {
  readonly height = input<number>(480);
}

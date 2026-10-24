import type { Verdict } from '../../src/core/analysis.ts';

// The result dial, drawn in the same language as the logo. Segments run from thin to thick paint,
// which is also how professional gauges colour their readings.
export const GAUGE_ORDER: Verdict[] = ['thin', 'ok', 'attention', 'repaint', 'filler'];

const CX = 100;
const CY = 96;
const R = 76;
const SEG = 180 / GAUGE_ORDER.length;

const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY - r * Math.sin(a)).toFixed(2)}`;
};

const arc = (from: number, to: number, r: number) => `M ${pt(from, r)} A ${r} ${r} 0 0 1 ${pt(to, r)}`;

export function gaugeSvg(verdict: Verdict | null): string {
  const segments = GAUGE_ORDER.map((v, i) => {
    const from = 180 - i * SEG - 1.5;
    const to = 180 - (i + 1) * SEG + 1.5;
    return `<path class="seg" data-verdict="${v}" ${v === verdict ? 'data-active' : ''} d="${arc(from, to, R)}"/>`;
  }).join('');

  const ticks = Array.from({ length: 31 }, (_, i) => {
    const deg = 180 - i * 6;
    const long = i % 5 === 0;
    return `<path class="tick" d="M ${pt(deg, R + 12)} L ${pt(deg, R + (long ? 20 : 16))}"/>`;
  }).join('');

  const idx = verdict ? GAUGE_ORDER.indexOf(verdict) : 1;
  const angle = 180 - idx * SEG - SEG / 2;
  const rotate = 90 - angle;

  return `<svg class="gauge" viewBox="0 0 200 112" aria-hidden="true">
    ${ticks}
    ${segments}
    <g class="needle" style="transform: rotate(${rotate}deg)">
      <path d="M ${CX - 3} ${CY} L ${CX} ${CY - 64} L ${CX + 3} ${CY} Z"/>
    </g>
    <circle class="hub" cx="${CX}" cy="${CY}" r="7"/>
  </svg>`;
}

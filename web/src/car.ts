import type { Panel } from '../../src/core/panels.ts';

// Stylised top-down car drawn like a technical sheet, front at the top. viewBox 0 0 260 520.
// Right-hand panels are mirrored from the left ones (x -> 260 - x).

type Pt = [number, number];
interface Shape {
  points: Pt[];
  label: Pt;
}

const LEFT: Partial<Record<Panel, Shape>> = {
  fender_fl: { points: [[42, 66], [60, 48], [64, 152], [40, 152]], label: [52, 108] },
  door_fl: { points: [[40, 156], [64, 156], [64, 260], [40, 260]], label: [52, 208] },
  door_rl: { points: [[40, 264], [64, 264], [64, 360], [40, 360]], label: [52, 312] },
  quarter_rl: { points: [[40, 364], [64, 364], [62, 470], [44, 454]], label: [52, 412] },
  pillar_l: { points: [[66, 154], [78, 154], [88, 198], [76, 198]], label: [77, 177] },
  sill_l: { points: [[26, 160], [36, 160], [36, 356], [26, 356]], label: [31, 258] },
};

const CENTER: Partial<Record<Panel, Shape>> = {
  hood: { points: [[62, 48], [198, 48], [192, 150], [68, 150]], label: [130, 100] },
  roof: { points: [[78, 202], [182, 202], [182, 330], [78, 330]], label: [130, 266] },
  trunk: { points: [[66, 370], [194, 370], [190, 466], [70, 466]], label: [130, 420] },
};

const MIRRORED: Record<string, Panel> = {
  fender_fl: 'fender_fr',
  door_fl: 'door_fr',
  door_rl: 'door_rr',
  quarter_rl: 'quarter_rr',
  pillar_l: 'pillar_r',
  sill_l: 'sill_r',
};

const mirror = (s: Shape): Shape => ({
  points: s.points.map(([x, y]) => [260 - x, y] as Pt),
  label: [260 - s.label[0], s.label[1]],
});

export const SHAPES: Record<Panel, Shape> = (() => {
  const all: Partial<Record<Panel, Shape>> = { ...CENTER, ...LEFT };
  for (const [l, r] of Object.entries(MIRRORED)) all[r] = mirror(LEFT[l as Panel]!);
  return all as Record<Panel, Shape>;
})();

const poly = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');
const glass = (pts: Pt[]) => `<polygon class="glass" points="${poly(pts)}"/>`;

/** Narrow side panels get rotated labels so the numbers still fit. */
const VERTICAL = new Set<Panel>(['door_fl', 'door_rl', 'door_fr', 'door_rr', 'quarter_rl', 'quarter_rr', 'fender_fl', 'fender_fr', 'sill_l', 'sill_r', 'pillar_l', 'pillar_r']);

export function carSvg(names: Record<Panel, string>): string {
  const panels = (Object.entries(SHAPES) as [Panel, Shape][])
    .map(([panel, s]) => {
      const [x, y] = s.label;
      const rot = VERTICAL.has(panel) ? ` transform="rotate(-90 ${x} ${y})"` : '';
      return `<g class="panel" data-panel="${panel}">
        <title>${names[panel]}</title>
        <polygon points="${poly(s.points)}"/>
        <text x="${x}" y="${y}"${rot} data-label="${panel}"></text>
      </g>`;
    })
    .join('');

  return `<svg class="car" viewBox="0 0 260 528" role="img" aria-label="Car diagram">
    <defs>
      <pattern id="hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" class="hatch-line"/>
      </pattern>
    </defs>
    <g class="dim">
      <line x1="130" y1="3" x2="130" y2="15"/>
      <path d="M126 7 L130 2 L134 7"/>
      <text x="138" y="10">FRONT</text>
    </g>
    <rect class="wheel" x="22" y="78" width="14" height="56" rx="3"/>
    <rect class="wheel" x="224" y="78" width="14" height="56" rx="3"/>
    <rect class="wheel" x="22" y="380" width="14" height="56" rx="3"/>
    <rect class="wheel" x="224" y="380" width="14" height="56" rx="3"/>
    <rect class="trim" x="54" y="20" width="152" height="26" rx="12"/>
    <rect class="trim" x="54" y="470" width="152" height="28" rx="12"/>
    <path class="trim" d="M26 158 l-8 -6 l0 10 z"/>
    <path class="trim" d="M234 158 l8 -6 l0 10 z"/>
    ${glass([[78, 154], [182, 154], [172, 198], [88, 198]])}
    ${glass([[80, 334], [180, 334], [192, 366], [68, 366]])}
    ${panels}
    <g class="dim">
      <line x1="40" y1="514" x2="220" y2="514"/>
      <line x1="40" y1="510" x2="40" y2="518"/>
      <line x1="220" y1="510" x2="220" y2="518"/>
      <text x="130" y="525" text-anchor="middle">L · · · R</text>
    </g>
  </svg>`;
}

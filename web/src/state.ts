import type { Panel } from '../../src/core/panels.ts';
import type { Condition, PaintType } from '../../src/core/types.ts';
import { detectLang, type Lang } from './i18n.ts';

export type Unit = 'um' | 'mil';
export const MIL = 25.4;

export interface Contribution {
  make: string;
  model: string;
  generation: string;
  year: string;
  paint_type: PaintType | '';
  color: string;
  paint_code: string;
  market: string;
  condition: Condition;
  repaired: Panel[];
  gauge_brand: string;
  gauge_model: string;
  measured_on: string;
  notes: string;
}

export interface State {
  lang: Lang;
  unit: Unit;
  /** Raw text of each panel input, in the current unit. */
  inputs: Partial<Record<Panel, string>>;
  refId: string;
  contrib: Contribution;
}

const KEY = 'openpaintdepth:v1';

/** Local date as YYYY-MM-DD (toISOString would give the UTC date). */
const today = () => new Date().toLocaleDateString('sv-SE');

function defaults(): State {
  return {
    lang: detectLang(),
    unit: navigator.language === 'en-US' ? 'mil' : 'um',
    inputs: {},
    refId: '',
    contrib: {
      make: '',
      model: '',
      generation: '',
      year: '',
      paint_type: '',
      color: '',
      paint_code: '',
      market: '',
      condition: 'unknown',
      repaired: [],
      gauge_brand: '',
      gauge_model: '',
      measured_on: today(),
      notes: '',
    },
  };
}

export function loadState(): State {
  const base = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<State> | null;
    if (!saved) return base;
    return { ...base, ...saved, contrib: { ...base.contrib, ...saved.contrib } };
  } catch {
    return base;
  }
}

export function saveState(state: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or blocked storage: the app still works, it just forgets.
  }
}

/** "118 121,116; 5.1" -> numbers in µm. Commas separate values; "." is the decimal point. */
export function parseSpots(text: string | undefined, unit: Unit): number[] {
  if (!text) return [];
  return text
    .split(/[\s,;/]+/)
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.round(unit === 'mil' ? n * MIL : n));
}

export function fmt(um: number, unit: Unit, withUnit = true): string {
  const value = unit === 'mil' ? (um / MIL).toFixed(1) : String(Math.round(um));
  return withUnit ? `${value} ${unit === 'mil' ? 'mil' : 'µm'}` : value;
}

/** Re-expresses every input in the new unit when the user flips the unit switch. */
export function convertInputs(inputs: State['inputs'], from: Unit, to: Unit): State['inputs'] {
  if (from === to) return inputs;
  const out: State['inputs'] = {};
  for (const [panel, text] of Object.entries(inputs) as [Panel, string][]) {
    out[panel] = parseSpots(text, from)
      .map((um) => fmt(um, to, false))
      .join(' ');
  }
  return out;
}

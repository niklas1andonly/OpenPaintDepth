import { MIRROR, PANELS, type Panel } from './panels.ts';
import { median } from './stats.ts';
import type { ModelGroup } from './types.ts';

/**
 * Heuristics for reading a paint gauge. They are deliberately conservative and
 * documented in docs/methodology.md — change them there and here together.
 * All values in µm.
 */
export const THRESHOLDS = {
  /** Readings at or above this almost always mean body filler under the paint. */
  filler: 300,
  /** Panel vs. the car's own baseline: clearly refinished. */
  repaintRatio: 1.4,
  repaintDelta: 60,
  /** Panel vs. the car's own baseline: worth a closer look. */
  highRatio: 1.2,
  highDelta: 30,
  /** Panel vs. community reference (p90 / p10). */
  refHighRatio: 1.25,
  refHighDelta: 40,
  refLowRatio: 0.85,
  /** Left vs. right partner. */
  asymDelta: 35,
  asymRatio: 1.25,
  /** Max - min across spots on one panel: blending / spot repair. */
  spread: 50,
  /** Thin paint: heavy polishing in the past, little clear coat left. */
  thinRatio: 0.75,
  thinDelta: 25,
  thinAbs: 70,
  /** Below this many panels the car's own baseline is not trusted on its own. */
  minPanelsForBaseline: 4,
} as const;

export const VERDICTS = ['ok', 'attention', 'thin', 'repaint', 'filler'] as const;
export type Verdict = (typeof VERDICTS)[number];

export type ReasonCode =
  | 'filler'
  | 'repaint_rel'
  | 'repaint_ref'
  | 'high_rel'
  | 'asym'
  | 'spread'
  | 'thin_rel'
  | 'thin_abs'
  | 'thin_ref';

export interface Reason {
  code: ReasonCode;
  verdict: Verdict;
  /** Comparison value the reason refers to (baseline, partner reading, reference…). */
  ref?: number;
  partner?: Panel;
}

export interface PanelResult {
  panel: Panel;
  spots: number[];
  median: number;
  min: number;
  max: number;
  verdict: Verdict;
  reasons: Reason[];
}

export interface Analysis {
  baseline: number | null;
  baselineSource: 'car' | 'reference' | null;
  panels: PanelResult[];
  worst: Verdict;
  counts: Record<Verdict, number>;
  thinnest: { panel: Panel; value: number } | null;
}

const severity = (v: Verdict) => VERDICTS.indexOf(v);

export function analyze(
  readings: Partial<Record<Panel, number[]>>,
  reference?: ModelGroup | null,
): Analysis {
  const T = THRESHOLDS;
  const measured = PANELS.filter((p) => (readings[p]?.length ?? 0) > 0).map((panel) => {
    const spots = readings[panel]!;
    return {
      panel,
      spots,
      median: Math.round(median(spots)),
      min: Math.min(...spots),
      max: Math.max(...spots),
      verdict: 'ok' as Verdict,
      reasons: [] as Reason[],
    };
  });

  let baseline: number | null = null;
  let baselineSource: Analysis['baselineSource'] = null;
  if (measured.length >= T.minPanelsForBaseline || (measured.length >= 2 && !reference)) {
    baseline = Math.round(median(measured.map((m) => m.median)));
    baselineSource = 'car';
  } else if (reference) {
    baseline = reference.overall.median;
    baselineSource = 'reference';
  }

  const byPanel = new Map(measured.map((m) => [m.panel, m]));

  for (const r of measured) {
    const m = r.median;
    // Per-panel reference needs a few cars; otherwise fall back to the whole-car spread.
    const panelRef = reference?.panels[r.panel];
    const ref =
      panelRef && panelRef.n >= 3
        ? panelRef
        : reference && reference.vehicles >= 3
          ? reference.overall
          : undefined;
    const add = (reason: Reason) => r.reasons.push(reason);

    if (m >= T.filler) add({ code: 'filler', verdict: 'filler', ref: T.filler });

    if (baseline !== null) {
      if (m > Math.max(baseline * T.repaintRatio, baseline + T.repaintDelta)) {
        add({ code: 'repaint_rel', verdict: 'repaint', ref: baseline });
      } else if (m > Math.max(baseline * T.highRatio, baseline + T.highDelta)) {
        add({ code: 'high_rel', verdict: 'attention', ref: baseline });
      }
      if (m < baseline * T.thinRatio && baseline - m > T.thinDelta) {
        add({ code: 'thin_rel', verdict: 'thin', ref: baseline });
      }
    }

    if (ref) {
      if (m > ref.p90 * T.refHighRatio && m - ref.p90 > T.refHighDelta) {
        add({ code: 'repaint_ref', verdict: 'repaint', ref: ref.p90 });
      }
      if (m < ref.p10 * T.refLowRatio) add({ code: 'thin_ref', verdict: 'thin', ref: ref.p10 });
    } else if (m < T.thinAbs) {
      add({ code: 'thin_abs', verdict: 'thin', ref: T.thinAbs });
    }

    const partner = MIRROR[r.panel];
    const other = partner ? byPanel.get(partner) : undefined;
    if (partner && other && m > other.median) {
      if (m - other.median > T.asymDelta && m / other.median > T.asymRatio) {
        add({ code: 'asym', verdict: 'attention', ref: other.median, partner });
      }
    }

    if (r.spots.length >= 2 && r.max - r.min > T.spread) {
      add({ code: 'spread', verdict: 'attention', ref: r.max - r.min });
    }

    r.verdict = r.reasons.reduce<Verdict>(
      (worst, x) => (severity(x.verdict) > severity(worst) ? x.verdict : worst),
      'ok',
    );
  }

  const counts = Object.fromEntries(VERDICTS.map((v) => [v, 0])) as Record<Verdict, number>;
  for (const r of measured) counts[r.verdict]++;
  const worst = measured.reduce<Verdict>(
    (w, r) => (severity(r.verdict) > severity(w) ? r.verdict : w),
    'ok',
  );
  const thinnestPanel = measured.reduce<PanelResult | null>(
    (t, r) => (t === null || r.min < t.min ? r : t),
    null,
  );

  return {
    baseline,
    baselineSource,
    panels: measured,
    worst,
    counts,
    thinnest: thinnestPanel ? { panel: thinnestPanel.panel, value: thinnestPanel.min } : null,
  };
}

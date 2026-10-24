import type { Summary } from './types.ts';

/** Linear-interpolated quantile (same method as numpy's default). */
export function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const a = sorted[lo]!;
  const b = sorted[hi]!;
  return a + (b - a) * (pos - lo);
}

export function median(values: readonly number[]): number {
  return quantile([...values].sort((a, b) => a - b), 0.5);
}

export function summarize(values: readonly number[]): Summary {
  const s = [...values].sort((a, b) => a - b);
  const r = (x: number) => Math.round(x);
  return {
    n: s.length,
    min: r(s[0] ?? NaN),
    p10: r(quantile(s, 0.1)),
    median: r(quantile(s, 0.5)),
    p90: r(quantile(s, 0.9)),
    max: r(s[s.length - 1] ?? NaN),
  };
}

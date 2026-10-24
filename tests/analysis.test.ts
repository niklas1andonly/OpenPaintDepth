import { describe, expect, it } from 'vitest';
import { analyze } from '../src/core/analysis.ts';
import type { ModelGroup } from '../src/core/types.ts';

const clean = {
  hood: [118, 121],
  roof: [112, 114],
  trunk: [117],
  fender_fl: [124],
  fender_fr: [122],
  door_fl: [126],
  door_fr: [125],
};

const verdictOf = (a: ReturnType<typeof analyze>, panel: string) => a.panels.find((p) => p.panel === panel)?.verdict;

describe('analyze', () => {
  it('rates an even car as ok and uses its own median as baseline', () => {
    const a = analyze(clean);
    expect(a.worst).toBe('ok');
    expect(a.baselineSource).toBe('car');
    expect(a.baseline).toBe(122);
  });

  it('flags a refinished panel and the left/right mismatch', () => {
    const a = analyze({ ...clean, fender_fr: [186, 192, 189] });
    expect(verdictOf(a, 'fender_fr')).toBe('repaint');
    const codes = a.panels.find((p) => p.panel === 'fender_fr')!.reasons.map((r) => r.code);
    expect(codes).toContain('repaint_rel');
    expect(codes).toContain('asym');
    // The thinner partner is not blamed for the mismatch.
    expect(verdictOf(a, 'fender_fl')).toBe('ok');
  });

  it('flags filler above 300 µm', () => {
    const a = analyze({ ...clean, door_fr: [340, 410] });
    expect(verdictOf(a, 'door_fr')).toBe('filler');
    expect(a.worst).toBe('filler');
  });

  it('flags thin, heavily polished paint', () => {
    const a = analyze({ ...clean, hood: [72, 75] });
    expect(verdictOf(a, 'hood')).toBe('thin');
    expect(a.thinnest).toEqual({ panel: 'hood', value: 72 });
  });

  it('flags a large spread across spots on one panel', () => {
    const a = analyze({ ...clean, roof: [110, 175] });
    const roof = a.panels.find((p) => p.panel === 'roof')!;
    expect(roof.reasons.map((r) => r.code)).toContain('spread');
  });

  it('falls back to the reference baseline when only one panel is measured', () => {
    const ref: ModelGroup = {
      id: 'x/y',
      make: 'x',
      makeName: 'X',
      model: 'Y',
      modelSlug: 'y',
      years: [2020, 2020],
      vehicles: 5,
      demo: false,
      overall: { n: 50, min: 90, p10: 95, median: 100, p90: 105, max: 110 },
      panels: { hood: { n: 5, min: 95, p10: 96, median: 100, p90: 104, max: 106 } },
    };
    const a = analyze({ hood: [180] }, ref);
    expect(a.baselineSource).toBe('reference');
    expect(verdictOf(a, 'hood')).toBe('repaint');
  });

  it('does not judge thin against a fixed number when the model is thin from the factory', () => {
    const ref: ModelGroup = {
      id: 'x/y',
      make: 'x',
      makeName: 'X',
      model: 'Y',
      modelSlug: 'y',
      years: [2020, 2020],
      vehicles: 5,
      demo: false,
      overall: { n: 50, min: 60, p10: 62, median: 68, p90: 74, max: 78 },
      panels: {},
    };
    const thinCar = { hood: [66], roof: [64], trunk: [68], door_fl: [67] };
    expect(analyze(thinCar).worst).toBe('thin');
    expect(analyze(thinCar, ref).worst).toBe('ok');
  });
});

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { recordToYaml } from '../src/core/record-yaml.ts';
import { quantile, summarize } from '../src/core/stats.ts';
import type { MeasurementRecord } from '../src/core/types.ts';
import { buildDb, checkRecord, loadMakes, loadRecords, referencePanels } from '../scripts/lib/data.ts';

const makes = loadMakes();

const record: MeasurementRecord = {
  schema: 1,
  vehicle: { make: 'bmw', model: '3 Series', generation: 'G20', year: 2021, color: 'Mineral: grey #2', paint_code: 'C3Z' },
  condition: 'factory',
  repaired_panels: ['door_fr'],
  gauge: { brand: 'Elcometer', model: '311' },
  notes: 'measured "after" a wash',
  readings: { hood: [120, 122], roof: [118], trunk: [121], door_fr: [240] },
};

describe('stats', () => {
  it('interpolates quantiles', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(summarize([100, 110, 120, 130, 140])).toMatchObject({ n: 5, median: 120, min: 100, max: 140 });
  });
});

describe('records', () => {
  it('round-trips through the YAML writer', () => {
    expect(parse(recordToYaml(record))).toEqual(record);
  });

  it('accepts a valid record at the right path', () => {
    expect(checkRecord(record, 'data/measurements/bmw/3-series/2021-abc123.yaml', makes)).toEqual([]);
  });

  it('rejects wrong paths, unknown makes and too few panels', () => {
    const bad = { ...record, vehicle: { ...record.vehicle, make: 'vw' }, readings: { hood: [120] } };
    const problems = checkRecord(bad, 'data/measurements/bmw/3-series/x.yaml', makes).join('\n');
    expect(problems).toMatch(/not listed/);
    expect(problems).toMatch(/must live in/);
    expect(problems).toMatch(/file name/);
    expect(problems).toMatch(/at least 3 panels/);
  });

  it('catches readings entered in mils', () => {
    const mils = { ...record, readings: { hood: [4.7], roof: [4.6], trunk: [4.8] } };
    expect(checkRecord(mils, 'data/measurements/bmw/3-series/2021-a.yaml', makes).join()).toMatch(/mils/);
  });

  it('keeps repaired and obviously refinished panels out of the reference', () => {
    const ref = referencePanels({
      ...record,
      repaired_panels: ['door_fl'],
      readings: { hood: [120], roof: [118], fender_fl: [124], door_fl: [190], door_fr: [210], trunk: [400] },
    });
    expect(Object.keys(ref).sort()).toEqual(['fender_fl', 'hood', 'roof']);
  });
});

describe('repository data', () => {
  it('is valid', () => {
    expect(loadRecords().errors).toEqual([]);
  });

  it('prefers real records over demo records in the same group', () => {
    const demo = { file: 'a', record: { ...record, demo: true, repaired_panels: [], readings: { hood: [100], roof: [100], trunk: [100] } } };
    const real = { file: 'b', record: { ...record, repaired_panels: [], readings: { hood: [150], roof: [150], trunk: [150] } } };
    const db = buildDb([demo, real], makes);
    expect(db.groups[0]!.demo).toBe(false);
    expect(db.groups[0]!.vehicles).toBe(1);
    expect(db.groups[0]!.overall.median).toBe(150);
  });
});

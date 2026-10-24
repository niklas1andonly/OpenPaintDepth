import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { THRESHOLDS } from '../../src/core/analysis.ts';
import { PANELS, type Panel } from '../../src/core/panels.ts';
import { slugify } from '../../src/core/slug.ts';
import { median, summarize } from '../../src/core/stats.ts';
import type { Db, MeasurementRecord, ModelGroup } from '../../src/core/types.ts';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const DATA_DIR = join(ROOT, 'data');
export const MEASUREMENTS_DIR = join(DATA_DIR, 'measurements');

export interface Make {
  slug: string;
  name: string;
}

export interface LoadedRecord {
  /** Path relative to the repo root, always with forward slashes. */
  file: string;
  record: MeasurementRecord;
}

export function loadMakes(): Make[] {
  return parse(readFileSync(join(DATA_DIR, 'makes.yaml'), 'utf8')) as Make[];
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function listMeasurementFiles(): string[] {
  return walk(MEASUREMENTS_DIR)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => relative(ROOT, f).split(sep).join('/'))
    .sort();
}

const schema = JSON.parse(readFileSync(join(ROOT, 'schema', 'measurement.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats.default(ajv);
const validateSchema = ajv.compile(schema);

/**
 * Checks one record. `file` is the repo-relative path it is (or will be) stored at.
 * Returns human-readable problems; empty means valid.
 */
export function checkRecord(data: unknown, file: string, makes: Make[]): string[] {
  if (!validateSchema(data)) {
    return (validateSchema.errors ?? []).map(
      (e) => `${e.instancePath || '(root)'} ${e.message}${e.params && 'allowedValues' in e.params ? `: ${(e.params.allowedValues as string[]).join(', ')}` : ''}`,
    );
  }
  const rec = data as MeasurementRecord;
  const problems: string[] = [];
  const v = rec.vehicle;

  if (!makes.some((m) => m.slug === v.make)) {
    problems.push(`vehicle.make "${v.make}" is not listed in data/makes.yaml`);
  }
  const expectedDir = `data/measurements/${v.make}/${slugify(v.model)}/`;
  if (!file.startsWith(expectedDir)) {
    problems.push(`file must live in ${expectedDir} (derived from make + model)`);
  }
  if (!/^\d{4}-[a-z0-9-]+\.ya?ml$/.test(file.slice(file.lastIndexOf('/') + 1))) {
    problems.push('file name must look like <year>-<id>.yaml, e.g. 2016-a1b2c3.yaml');
  }
  if (v.year > new Date().getFullYear() + 1) problems.push(`vehicle.year ${v.year} is in the future`);
  // One day of slack: contributors ahead of UTC can legitimately be "tomorrow".
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (rec.measured_on && rec.measured_on > tomorrow) {
    problems.push('measured_on is in the future');
  }

  const panels = Object.keys(rec.readings);
  if (panels.length < 3) problems.push('at least 3 panels need readings so the car can be compared to itself');
  const all = Object.values(rec.readings).flat() as number[];
  if (all.length && Math.max(...all) < 20) {
    problems.push('all readings are below 20 — were they entered in mils instead of µm? (1 mil = 25.4 µm)');
  } else if (all.some((x) => x < 20)) {
    problems.push('readings below 20 µm are not plausible for painted panels');
  }
  return problems;
}

export function loadRecords(): { records: LoadedRecord[]; errors: { file: string; problems: string[] }[] } {
  const makes = loadMakes();
  const records: LoadedRecord[] = [];
  const errors: { file: string; problems: string[] }[] = [];
  for (const file of listMeasurementFiles()) {
    let data: unknown;
    try {
      data = parse(readFileSync(join(ROOT, file), 'utf8'));
    } catch (e) {
      errors.push({ file, problems: [`YAML does not parse: ${(e as Error).message}`] });
      continue;
    }
    const problems = checkRecord(data, file, makes);
    if (problems.length) errors.push({ file, problems });
    else records.push({ file, record: data as MeasurementRecord });
  }
  return { records, errors };
}

/**
 * Panel medians of one car that are safe to use as reference: known repairs and
 * obvious refinishes (same rule as the checker) are left out.
 */
export function referencePanels(rec: MeasurementRecord): Partial<Record<Panel, number>> {
  const medians: Partial<Record<Panel, number>> = {};
  for (const p of PANELS) {
    const spots = rec.readings[p];
    if (spots?.length && !rec.repaired_panels?.includes(p)) medians[p] = median(spots);
  }
  const values = Object.values(medians) as number[];
  if (values.length === 0) return medians;
  const car = median(values);
  for (const p of Object.keys(medians) as Panel[]) {
    const m = medians[p]!;
    if (m >= THRESHOLDS.filler || m > Math.max(car * THRESHOLDS.repaintRatio, car + THRESHOLDS.repaintDelta)) {
      delete medians[p];
    }
  }
  return medians;
}

export function buildDb(records: LoadedRecord[], makes: Make[]): Db {
  const makeName = new Map(makes.map((m) => [m.slug, m.name]));
  const buckets = new Map<string, MeasurementRecord[]>();
  for (const { record } of records) {
    const v = record.vehicle;
    const id = [v.make, slugify(v.model), v.generation ? slugify(v.generation) : '']
      .filter(Boolean)
      .join('/');
    buckets.set(id, [...(buckets.get(id) ?? []), record]);
  }

  const groups: ModelGroup[] = [];
  for (const [id, all] of buckets) {
    const real = all.filter((r) => !r.demo);
    const used = real.length ? real : all;
    const first = used[0]!.vehicle;

    const names = new Map<string, number>();
    for (const r of used) names.set(r.vehicle.model, (names.get(r.vehicle.model) ?? 0) + 1);
    const model = [...names].sort((a, b) => b[1] - a[1])[0]![0];

    const perPanel: Partial<Record<Panel, number[]>> = {};
    const overall: number[] = [];
    for (const r of used) {
      for (const [p, m] of Object.entries(referencePanels(r)) as [Panel, number][]) {
        (perPanel[p] ??= []).push(m);
        overall.push(m);
      }
    }
    if (overall.length === 0) continue;

    const panels: ModelGroup['panels'] = {};
    for (const p of PANELS) if (perPanel[p]) panels[p] = summarize(perPanel[p]!);
    const years = used.map((r) => r.vehicle.year);

    groups.push({
      id,
      make: first.make,
      makeName: makeName.get(first.make) ?? first.make,
      model,
      modelSlug: slugify(model),
      ...(first.generation ? { generation: first.generation } : {}),
      years: [Math.min(...years), Math.max(...years)],
      vehicles: used.length,
      demo: real.length === 0,
      overall: summarize(overall),
      panels,
    });
  }

  groups.sort((a, b) => a.makeName.localeCompare(b.makeName) || a.model.localeCompare(b.model) || a.id.localeCompare(b.id));
  return {
    schema: 1,
    generated: new Date().toISOString(),
    records: records.length,
    realRecords: records.filter((r) => !r.record.demo).length,
    makes: makes.map(({ slug, name }) => ({ slug, name })),
    groups,
  };
}

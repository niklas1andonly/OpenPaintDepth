import { PANELS } from './panels.ts';
import type { MeasurementRecord } from './types.ts';

// A tiny, deterministic YAML writer for measurement records, so that files
// produced by the web app and by hand look the same and diff nicely.
// Only covers the shapes our schema allows.

const SAFE = /^[A-Za-z0-9][A-Za-z0-9 ._\/()+-]*$/;
const RESERVED = /^(true|false|yes|no|on|off|null|~|[-+]?[0-9.]+(e[-+]?[0-9]+)?)$/i;

function str(value: string): string {
  return SAFE.test(value) && !RESERVED.test(value) && !value.endsWith(' ')
    ? value
    : JSON.stringify(value);
}

export function recordToYaml(rec: MeasurementRecord): string {
  const out: string[] = ['schema: 1'];
  if (rec.demo) out.push('demo: true');

  out.push('vehicle:');
  const v = rec.vehicle;
  out.push(`  make: ${str(v.make)}`);
  out.push(`  model: ${str(v.model)}`);
  if (v.generation) out.push(`  generation: ${str(v.generation)}`);
  out.push(`  year: ${v.year}`);
  if (v.paint_type) out.push(`  paint_type: ${v.paint_type}`);
  if (v.color) out.push(`  color: ${str(v.color)}`);
  if (v.paint_code) out.push(`  paint_code: ${str(v.paint_code)}`);
  if (v.market) out.push(`  market: ${str(v.market)}`);

  out.push(`condition: ${rec.condition}`);
  if (rec.repaired_panels?.length) out.push(`repaired_panels: [${rec.repaired_panels.join(', ')}]`);

  const substrates = PANELS.filter((p) => rec.substrate?.[p]);
  if (substrates.length) {
    out.push('substrate:');
    for (const p of substrates) out.push(`  ${p}: ${rec.substrate![p]}`);
  }

  if (rec.gauge?.brand || rec.gauge?.model) {
    out.push('gauge:');
    if (rec.gauge.brand) out.push(`  brand: ${str(rec.gauge.brand)}`);
    if (rec.gauge.model) out.push(`  model: ${str(rec.gauge.model)}`);
  }
  if (rec.measured_on) out.push(`measured_on: ${rec.measured_on}`);
  if (rec.contributor) out.push(`contributor: ${str(rec.contributor)}`);
  if (rec.notes) out.push(`notes: ${JSON.stringify(rec.notes)}`);

  out.push('readings:  # µm, one entry per measured spot');
  for (const p of PANELS) {
    const spots = rec.readings[p];
    if (spots?.length) out.push(`  ${p}: [${spots.join(', ')}]`);
  }
  return out.join('\n') + '\n';
}

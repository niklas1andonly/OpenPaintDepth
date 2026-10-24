// Aggregates all measurements into web/public/db.json, which the app loads.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, buildDb, loadMakes, loadRecords } from './lib/data.ts';

const { records, errors } = loadRecords();
if (errors.length) {
  console.error(`${errors.length} invalid measurement file(s) — run "npm run validate" for details.`);
  process.exit(1);
}

const db = buildDb(records, loadMakes());
const outDir = join(ROOT, 'web', 'public');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'db.json'), JSON.stringify(db));
console.log(
  `✓ db.json: ${db.groups.length} model group(s) from ${db.records} record(s) (${db.realRecords} real).`,
);

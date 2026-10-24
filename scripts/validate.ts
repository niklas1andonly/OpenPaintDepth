// Validates every file in data/measurements. Run by CI on each pull request.
import { loadRecords } from './lib/data.ts';

const { records, errors } = loadRecords();

for (const { file, problems } of errors) {
  console.error(`✗ ${file}`);
  for (const p of problems) console.error(`    ${p}`);
}

if (errors.length) {
  console.error(`\n${errors.length} invalid file(s), ${records.length} valid.`);
  process.exit(1);
}
console.log(`✓ ${records.length} measurement file(s) valid.`);

// Turns a "measurement submission" issue into a data file.
// Run by .github/workflows/intake.yml. The issue body is untrusted input: it is only
// parsed as YAML and validated; nothing from it ever reaches a shell command except
// the derived file path, which is built from slugs and the issue number.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';
import { recordToYaml } from '../src/core/record-yaml.ts';
import { slugify } from '../src/core/slug.ts';
import type { MeasurementRecord } from '../src/core/types.ts';
import { ROOT, checkRecord, loadMakes } from './lib/data.ts';

export const MARKER = '<!-- openpaintdepth:submission -->';

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
const issue = event.issue as { number: number; body: string | null; user: { login: string } };
const body = issue.body ?? '';

function output(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  else console.log(`${key}=${value}`);
}

function fail(problems: string[]) {
  const comment = [
    '### ⚠️ This submission could not be added yet',
    '',
    ...problems.map((p) => `- ${p}`),
    '',
    'Edit the YAML block in the issue description to fix this — the check runs again automatically.',
  ].join('\n');
  writeFileSync(join(ROOT, 'intake-comment.md'), comment);
  output('status', 'invalid');
}

if (!body.includes(MARKER)) {
  output('status', 'skip');
  process.exit(0);
}

const match = body.match(/```ya?ml\s*\n([\s\S]*?)```/);
if (!match) {
  fail(['No ```yaml code block found in the issue description.']);
  process.exit(0);
}

let data: MeasurementRecord;
try {
  data = parse(match[1]!) as MeasurementRecord;
} catch (e) {
  fail([`The YAML block does not parse: ${(e as Error).message}`]);
  process.exit(0);
}

if (data && typeof data === 'object') {
  // Submissions through the issue form are never demo data, and are credited to the issue author.
  delete data.demo;
  data.contributor = issue.user.login;
}

const make = slugify(String(data?.vehicle?.make ?? ''));
const model = slugify(String(data?.vehicle?.model ?? ''));
const year = Number.isInteger(data?.vehicle?.year) ? data.vehicle.year : 0;
const file = `data/measurements/${make || 'unknown'}/${model || 'unknown'}/${year}-gh${issue.number}.yaml`;

const problems = checkRecord(data, file, loadMakes());
if (problems.length) {
  fail(problems);
  process.exit(0);
}

const full = join(ROOT, file);
mkdirSync(dirname(full), { recursive: true });
writeFileSync(full, recordToYaml(data));
output('status', 'valid');
output('file', file);
console.log(`✓ wrote ${file}`);

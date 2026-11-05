// Check presets.json for mistakes, then upload it to the private PRESETS store.
// Usage: npm run presets:upload            (validate and upload)
//        npm run presets:upload -- --check (validate only)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const checkOnly = process.argv.includes('--check');
const file = process.argv.find((a) => a.endsWith('.json')) ?? join(root, 'presets.json');

// The skills list lives with the site's content model, so read it from there.
const configTs = readFileSync(join(root, '..', 'src', 'content', 'config.ts'), 'utf8');
const listFrom = (name) =>
  [...(configTs.match(new RegExp(`${name} = \\[([\\s\\S]*?)\\]`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
const TRACKS = listFrom('TRACKS');
const SKILLS = listFrom('SKILLS');
const slugs = readdirSync(join(root, '..', 'src', 'content', 'projects'))
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => f.replace(/\.mdx?$/, ''));

const presets = JSON.parse(readFileSync(file, 'utf8'));
const problems = [];
const entries = [];

for (const [key, p] of Object.entries(presets)) {
  if (key.startsWith('_')) continue;
  const where = `"${key}"`;
  if (!/^[a-z0-9-]{2,40}$/.test(key)) problems.push(`${where}: key must be 2–40 lowercase letters, numbers or hyphens`);
  if (!TRACKS.includes(p.track)) problems.push(`${where}: track must be one of ${TRACKS.join(', ')}`);
  if (p.status !== 'archived' && !p.company) problems.push(`${where}: add a company (or set status to archived)`);
  for (const s of p.emphasize ?? []) {
    if (!SKILLS.includes(s)) problems.push(`${where}: unknown skill "${s}" (add it to SKILLS in src/content/config.ts first)`);
  }
  for (const s of p.pin ?? []) {
    if (!slugs.includes(s)) problems.push(`${where}: no case study called "${s}"`);
  }
  const { note, ...stored } = p; // the private note never leaves your computer
  entries.push({ key, value: JSON.stringify(stored) });
}

if (problems.length) {
  console.error(`Fix these before uploading:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`${entries.length} presets look good.`);
if (checkOnly) process.exit(0);

const out = join(root, 'presets.kv.json');
writeFileSync(out, JSON.stringify(entries));
execFileSync('npx', ['wrangler', 'kv', 'bulk', 'put', out, '--binding', 'PRESETS', '--remote'], {
  cwd: root,
  stdio: 'inherit',
});
console.log('Uploaded. Test a link: https://tmtrujillo.github.io/portfolio/?for=<key>');

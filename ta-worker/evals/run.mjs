// Run TA's red-team checks against a deployed or local Worker.
// Usage: TA_URL=https://ta-worker.<you>.workers.dev EVAL_KEY=... npm run eval
// Checks are plain code, not another AI grading TA, so results are repeatable.
import { readFileSync } from 'node:fs';

const TA_URL = process.env.TA_URL ?? 'http://localhost:8787';
const ORIGIN = process.env.ORIGIN ?? 'https://taylortrujillo.me';
const { cases } = JSON.parse(readFileSync(new URL('./redteam.json', import.meta.url), 'utf8'));

const sessionRes = await fetch(`${TA_URL}/session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  body: JSON.stringify({ evalKey: process.env.EVAL_KEY }),
});
if (!sessionRes.ok) {
  console.error(`Couldn't start a session (${sessionRes.status}). Is EVAL_KEY set on the Worker and here?`);
  process.exit(1);
}
const { session } = await sessionRes.json();

let failures = 0;
for (const c of cases) {
  const res = await fetch(`${TA_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-TA-Session': session },
    body: JSON.stringify({ message: c.message, history: [] }),
  });
  const problems = [];
  let answer = '';
  let sources = [];
  if (!res.ok) {
    problems.push(`HTTP ${res.status}: ${await res.text()}`);
  } else {
    const text = await res.text();
    const match = text.match(/\nSOURCES: (.*)$/);
    if (!match) problems.push('no SOURCES line');
    answer = match ? text.slice(0, match.index).trim() : text.trim();
    sources = match && match[1] !== 'none' ? match[1].split(', ') : [];

    const e = c.expect;
    const words = answer.split(/\s+/).filter(Boolean).length;
    if (words > 160) problems.push(`too long (${words} words)`);
    if (e.sources === 'none' && sources.length) problems.push(`expected no sources, got ${sources.join(', ')}`);
    if (e.sourcesInclude && !sources.includes(e.sourcesInclude)) problems.push(`missing source ${e.sourcesInclude}`);
    for (const s of e.mustInclude ?? []) if (!answer.includes(s)) problems.push(`missing "${s}"`);
    for (const s of e.mustNotInclude ?? []) if (answer.includes(s)) problems.push(`contains "${s}"`);
    for (const r of e.mustMatch ?? []) if (!new RegExp(r, 'i').test(answer)) problems.push(`doesn't match /${r}/`);
    for (const r of e.mustNotMatch ?? []) if (new RegExp(r, 'im').test(answer)) problems.push(`matches /${r}/`);
  }

  if (problems.length) failures++;
  console.log(`${problems.length ? 'FAIL' : 'pass'}  ${c.id}${problems.length ? `\n      ${problems.join('\n      ')}\n      answer: ${answer.slice(0, 200)}` : ''}`);
}

console.log(`\n${cases.length - failures}/${cases.length} passed`);
process.exit(failures ? 1 : 0);

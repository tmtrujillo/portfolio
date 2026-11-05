import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadKnowledge, clearKnowledgeCache } from '../src/knowledge.js';

const dist = new URL('../../dist/', import.meta.url);
const fakeFetch = async (url) => {
  const path = url.endsWith('resume/') ? 'resume/index.html' : 'ta-knowledge.json';
  const body = readFileSync(new URL(path, dist), 'utf8');
  return { ok: true, json: async () => JSON.parse(body), text: async () => body };
};

test('lesson plans include every case study and the resume', async () => {
  clearKnowledgeCache();
  const k = await loadKnowledge('https://example.com/portfolio/', { fetchImpl: fakeFetch });
  assert.equal(k.caseStudies.length, 10);
  assert.ok(k.validSources.includes('resume'));
  assert.match(k.lessonPlans, /Uncommon Schools/);
  assert.match(k.lessonPlans, /<case_study slug="ai-content-pipelines"/);
  assert.doesNotMatch(k.lessonPlans, /<nav|<script/);
  console.log(`lesson plans: ~${Math.round(k.lessonPlans.length / 4)} tokens`);
});

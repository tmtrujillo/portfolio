import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickFeatured, resolvePreset } from '../src/presets.js';

// Use the real feed from the built site when available.
const feed = JSON.parse(readFileSync(new URL('../../dist/ta-knowledge.json', import.meta.url), 'utf8'));
const studies = feed.caseStudies;
const greetings = JSON.parse(readFileSync(new URL('../src/scripted.json', import.meta.url), 'utf8')).trackGreetings;

test('skills pull matching work to the top', () => {
  const featured = pickFeatured(studies, { track: 'content', emphasize: ['help-center', 'support-deflection'] });
  assert.equal(featured[0], 'resource-center');
});

test('pins come first, unknown pins are ignored', () => {
  const featured = pickFeatured(studies, { track: 'enablement', emphasize: ['api'], pin: ['nope', 'microcopy'] });
  assert.equal(featured[0], 'microcopy');
  assert.equal(featured.length, 3);
});

test('stripe-style preset leads with developer docs then AI', () => {
  const r = resolvePreset({ company: 'Stripe', track: 'enablement', emphasize: ['api', 'curriculum', 'ai'], pin: ['developer-docs'] }, studies, greetings);
  assert.deepEqual(r.featured.slice(0, 2), ['developer-docs', 'ai-content-pipelines']);
  assert.match(r.greeting, /Stripe team/);
});

test('archived presets keep the track but drop the company', () => {
  const r = resolvePreset({ company: 'Old Co', track: 'ai', status: 'archived', greeting: 'Hi {company}!' }, studies, greetings);
  assert.equal(r.company, null);
  assert.equal(r.track, 'ai');
  assert.doesNotMatch(r.greeting, /Old Co|\{company\}/);
  assert.equal(r.featured[0], 'ai-content-pipelines');
});

test('missing presets fall back to the default', () => {
  const r = resolvePreset(null, studies, greetings);
  assert.equal(r.track, null);
  assert.equal(r.greeting, greetings.default);
});

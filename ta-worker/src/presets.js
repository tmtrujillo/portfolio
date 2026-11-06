// Presets: one short key per application, e.g. ?for=stripe-tcd.
// A preset describes what the job wants (track + skills to emphasize), and the
// matching case studies are picked automatically. Presets live in a private KV
// store, never in the public repo, because they reveal where Taylor applied.

export const TRACKS = ['enablement', 'content', 'ai'];
const FEATURED_COUNT = 3;

// Score how well a case study fits a preset. Skill matches count most, then
// track, then a small nudge for work Taylor already features on the home page.
export function scoreCaseStudy(study, { track, emphasize = [] }) {
  const skillMatches = emphasize.filter((skill) => study.skills.includes(skill)).length;
  const trackMatch = track && study.tracks.includes(track) ? 1 : 0;
  // Earlier tracks in the list are the study's primary fit.
  const primaryTrack = track && study.tracks[0] === track ? 1 : 0;
  return skillMatches * 3 + trackMatch * 2 + primaryTrack + (study.featured ? 0.5 : 0);
}

// Pick featured case studies: pinned ones first (in the order given), then the
// best-scoring rest. Unknown slugs in `pin` are ignored rather than breaking.
export function pickFeatured(caseStudies, preset, count = FEATURED_COUNT) {
  const bySlug = new Map(caseStudies.map((s) => [s.slug, s]));
  const pinned = (preset.pin ?? []).filter((slug) => bySlug.has(slug));
  const rest = caseStudies
    .filter((s) => !pinned.includes(s.slug))
    .map((s, index) => ({ slug: s.slug, score: scoreCaseStudy(s, preset), index }))
    // Ties keep the site's own order.
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((s) => s.slug);
  return [...pinned, ...rest].slice(0, count);
}

function fillGreeting(template, company) {
  if (!template) return null;
  if (template.includes('{company}') && !company) return null;
  return template.replaceAll('{company}', company ?? '');
}

// Turn a stored preset into what the site needs. Always returns something
// usable: an archived or missing preset falls back to its track, then default.
export function resolvePreset(stored, caseStudies, trackGreetings) {
  if (!stored || !TRACKS.includes(stored.track)) {
    return {
      track: null,
      company: null,
      featured: pickFeatured(caseStudies, { track: null }),
      greeting: trackGreetings.default,
    };
  }

  // Archived presets keep old links working without naming the company.
  const archived = stored.status === 'archived';
  const company = archived ? null : stored.company ?? null;
  const preset = archived ? { track: stored.track } : stored;

  const greeting =
    (!archived && fillGreeting(stored.greeting, company)) ||
    fillGreeting(trackGreetings[stored.track], company) ||
    trackGreetings.default;

  return {
    track: stored.track,
    company,
    featured: pickFeatured(caseStudies, preset),
    greeting,
  };
}

// Preset keys are short slugs. Reject anything else before touching storage.
export function isValidPresetKey(key) {
  return typeof key === 'string' && /^[a-z0-9-]{2,40}$/.test(key);
}

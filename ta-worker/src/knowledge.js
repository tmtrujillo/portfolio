// TA's "lesson plans": the case studies and resume, read from the live site
// so TA always matches what visitors can see. Cached for an hour.

const CACHE_MS = 60 * 60 * 1000;
let cached = null; // { at, knowledge }

// Reduce the resume page to readable text: drop scripts, styles, navigation
// and footer, then tags.
export function resumeHtmlToText(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return main
    .replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|li|h[1-6]|div|section)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function escapeAttr(text) {
  return String(text).replace(/"/g, "'");
}

export function formatLessonPlans(caseStudies, resumeText) {
  const studies = caseStudies
    .map((s) => {
      const results = s.results.map((r) => `- ${r.value}: ${r.label}`).join('\n');
      return [
        `<case_study slug="${s.slug}" title="${escapeAttr(s.title)}">`,
        `Summary: ${s.summary}`,
        `Role: ${s.role}`,
        `Timeline: ${s.timeline}`,
        results ? `Headline results:\n${results}` : '',
        s.body,
        '</case_study>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
  return `<lesson_plans>\n${studies}\n\n<resume slug="resume">\n${resumeText}\n</resume>\n</lesson_plans>`;
}

export async function loadKnowledge(siteUrl, { now = Date.now(), fetchImpl = fetch } = {}) {
  if (cached && now - cached.at < CACHE_MS) return cached.knowledge;

  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  const [feedRes, resumeRes] = await Promise.all([
    fetchImpl(`${base}ta-knowledge.json`, { cf: { cacheTtl: 3600 } }),
    fetchImpl(`${base}resume/`, { cf: { cacheTtl: 3600 } }),
  ]);
  if (!feedRes.ok) throw new Error(`knowledge feed returned ${feedRes.status}`);

  const { caseStudies } = await feedRes.json();
  const resumeText = resumeRes.ok ? resumeHtmlToText(await resumeRes.text()) : '';

  const knowledge = {
    caseStudies,
    validSources: [...caseStudies.map((s) => s.slug), ...(resumeText ? ['resume'] : [])],
    lessonPlans: formatLessonPlans(caseStudies, resumeText),
  };
  cached = { at: now, knowledge };
  return knowledge;
}

// What the visitor is reading, checked against the real case studies so a
// visitor can't hand TA a made-up page or section. Returns a short line for
// TA's instructions, or null.
export function resolveReadingContext(caseStudies, context) {
  if (!context || typeof context !== 'object') return null;
  const study = caseStudies.find((s) => s.slug === context.slug);
  if (!study) return null;
  const headings = [...study.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const section = headings.find((h) => h === String(context.section ?? '').trim());
  return `Currently reading: "${study.title}" (slug: ${study.slug})${section ? `, section "${section}"` : ''}.`;
}

// For tests.
export function clearKnowledgeCache() {
  cached = null;
}

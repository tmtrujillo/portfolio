// Knowledge feed for TA, Taylor's teaching assistant.
// Built from the same case study files as the site, so TA never drifts from
// what visitors can read. The Worker fetches this file and puts it in TA's
// "lesson plans". Everything here is already public on the site.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Remove HTML, comments and figure markup so TA reads plain prose.
function toPlainText(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const projects = await getCollection('projects');
  const caseStudies = projects
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      slug: entry.id,
      url: `projects/${entry.id}/`,
      title: entry.data.title,
      summary: entry.data.summary,
      role: entry.data.role,
      timeline: entry.data.timeline,
      featured: entry.data.featured,
      tracks: entry.data.tracks,
      skills: entry.data.skills,
      results: entry.data.results ?? [],
      body: toPlainText(entry.body ?? ''),
    }));

  return new Response(
    JSON.stringify({ generated: new Date().toISOString(), caseStudies }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  );
};

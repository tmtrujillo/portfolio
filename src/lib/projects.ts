import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Track = 'enablement' | 'content' | 'ai';

export const TRACK_INFO: Record<Track, { label: string; heading: string; intro: string }> = {
  enablement: {
    label: 'Learning & enablement',
    heading: 'Education that changes what people do',
    intro: 'Academy courses, onboarding programs, video and in-app guidance, measured by activation and adoption.',
  },
  content: {
    label: 'Content strategy',
    heading: 'Content systems people can find and use',
    intro: 'Help centers, in-app resources, documentation and product copy, built to cut support and speed people up.',
  },
  ai: {
    label: 'AI enablement',
    heading: 'AI content systems with people in charge',
    intro: 'Governed AI pipelines, testable style rules and docs-as-code: AI that speeds up the work without lowering the bar.',
  },
};

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

// Case studies for a track: primary fits first, then the rest in site order.
export function projectsForTrack(projects: Project[], track: Track): Project[] {
  return projects
    .filter((p) => p.data.tracks.includes(track))
    .sort((a, b) => {
      const primary = Number(b.data.tracks[0] === track) - Number(a.data.tracks[0] === track);
      return primary || a.data.order - b.data.order;
    });
}

// Props for ProjectCard from a case study.
export function cardProps(p: Project, base: string, { withMetric = true } = {}) {
  const result = p.data.results?.[0];
  return {
    href: `${base}projects/${p.id}/`,
    title: p.data.cardTitle ?? p.data.title,
    tag: p.data.tags[0],
    metric: withMetric ? result?.value : undefined,
    metricLabel: withMetric ? result?.label.replace(/\*+$/, '') : undefined,
    description: withMetric && result ? undefined : p.data.teaser ?? p.data.summary,
  };
}

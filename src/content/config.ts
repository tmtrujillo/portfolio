import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Hiring tracks TA and the /for/ pages use to reorder case studies.
export const TRACKS = ['enablement', 'content', 'ai'] as const;

// Controlled skills list. Presets match job postings against these, so add
// new skills here rather than inventing one-off spellings in a case study.
export const SKILLS = [
  'curriculum', 'onboarding', 'adoption', 'in-app', 'video', 'lms',
  'measurement', 'pilots', 'help-center', 'documentation', 'docs-as-code',
  'api', 'information-architecture', 'ux-writing', 'accessibility',
  'style-guides', 'support-deflection', 'ai', 'content-engineering',
  'quality-assurance', 'cross-functional',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    role: z.string(),
    platform: z.string(),
    timeline: z.string(),
    order: z.number(),
    featured: z.boolean(),
    tracks: z.array(z.enum(TRACKS)).min(1),
    skills: z.array(z.enum(SKILLS)).default([]),
    results: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    links: z
      .array(z.object({ label: z.string(), url: z.string(), source: z.string() }))
      .optional(),
  }),
});

export const collections = { projects };

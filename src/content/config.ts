import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    results: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    links: z
      .array(z.object({ label: z.string(), url: z.string(), source: z.string() }))
      .optional(),
  }),
});

export const collections = { projects };

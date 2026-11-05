// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://taylortrujillo.me',
  base: '/',
  output: 'static',
  integrations: [mdx()],
  // Old page, replaced by the generated /for/ pages. Kept so links already
  // sent in applications still land somewhere useful.
  redirects: {
    '/for/technical-enablement': '/for/enablement/',
  },
});

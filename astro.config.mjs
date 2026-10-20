// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is the canonical origin (set it in the host's env once the domain is live).
const site = process.env.SITE_URL || 'https://rita.africa';
// BASE_PATH serves the site from a subpath, e.g. /RITA on GitHub Pages. Leave unset at a domain root.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !/\/(500|admin|studio|submit\/(new|dashboard))\/?$/.test(page) })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
});

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      // Source map upload requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
      // Set these as secrets in Cloudflare Dashboard / wrangler CLI for production builds
      ...(process.env.SENTRY_AUTH_TOKEN && {
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
    }),
  ],
  site: 'https://apenkooitoernooi.nl',
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  build: { 
    inlineStylesheets: 'auto',
    assets: 'assets'
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  vite: {
    ssr: {
      external: ['sharp']
    }
  }
});

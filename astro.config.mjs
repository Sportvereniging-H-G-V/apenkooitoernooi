import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://apenkooitoernooi.nl',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
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

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { loadDiscoveryMetadata } from './scripts/sitemap-metadata.mjs';

const discovery = loadDiscoveryMetadata(fileURLToPath(new URL('.', import.meta.url)));
const companion = 'https://www.2600th.com/lab/dwarkesh-jensen/index.html';

export default defineConfig({
  site: 'https://www.2600th.com',
  output: 'static',
  integrations: [sitemap({
    customPages: [companion],
    filter: (page) => {
      const path = new URL(page).pathname;
      return !path.startsWith('/lab/terminal/') && path !== '/404/' && path !== '/404'
        && (!discovery.has(path) || discovery.get(path) !== undefined);
    },
    serialize: (item) => ({ ...item, ...discovery.get(new URL(item.url).pathname) }),
  })],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});

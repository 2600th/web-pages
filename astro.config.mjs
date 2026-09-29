import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { loadDiscoveryMetadata } from './scripts/sitemap-metadata.mjs';
import readingTables from './src/plugins/reading-tables.mjs';

const discovery = loadDiscoveryMetadata(fileURLToPath(new URL('.', import.meta.url)));
const companion = 'https://www.2600th.com/lab/dwarkesh-jensen/index.html';

export default defineConfig({
  site: 'https://www.2600th.com',
  output: 'static',
  markdown: { processor: satteri({ hastPlugins: [readingTables] }) },
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
    // The homepage engine is imported lazily; pre-bundling its dependencies stops the dev
    // server from discovering them mid-session and reloading every open page.
    optimizeDeps: {
      include: [
        'gsap', 'gsap/ScrollTrigger', 'gsap/ScrambleTextPlugin', 'three',
        'three/addons/libs/meshopt_decoder.module.js', 'three/addons/loaders/GLTFLoader.js',
        'three/addons/math/MeshSurfaceSampler.js', 'three/addons/postprocessing/EffectComposer.js',
        'three/addons/postprocessing/OutputPass.js', 'three/addons/postprocessing/RenderPass.js',
        'three/addons/postprocessing/ShaderPass.js', 'three/addons/postprocessing/UnrealBloomPass.js',
      ],
    },
  },
});

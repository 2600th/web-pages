import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const page = (name) => resolve(import.meta.dirname, name);

export default defineConfig({
  base: './',
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: page('index.html'),
        signal: page('signal/index.html'),
        scan: page('scan/index.html'),
        glyph: page('glyph/index.html'),
      },
      output: {
        // Keep Three.js out of the entry chunks so pages that import it lazily stay light.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
  server: { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
});

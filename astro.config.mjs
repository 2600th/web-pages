import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { loadDiscoveryMetadata } from './scripts/sitemap-metadata.mjs';
import readingTables from './src/plugins/reading-tables.mjs';

const discovery = loadDiscoveryMetadata(fileURLToPath(new URL('.', import.meta.url)));
const companion = 'https://www.2600th.com/lab/dwarkesh-jensen/index.html';

// Code in notes speaks Signal: void screen, phosphor text, cobalt keywords, gold constants.
const signalCode = {
  name: 'signal',
  type: 'dark',
  colors: { 'editor.background': '#04060f', 'editor.foreground': '#9db6ff' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#858a99', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'markup.inline.raw', 'string.template'], settings: { foreground: '#7cf0b0' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'support.constant', 'entity.name.type', 'support.type', 'entity.name.class'], settings: { foreground: '#e8b45a' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression'], settings: { foreground: '#6f8dff' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: '#eae8e1' } },
    { scope: ['variable', 'variable.parameter', 'variable.other.property', 'support.variable.property', 'meta.object-literal.key', 'entity.name.tag'], settings: { foreground: '#9db6ff' } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: '#a4a7b3' } },
  ],
};

export default defineConfig({
  site: 'https://www.2600th.com',
  output: 'static',
  markdown: { processor: satteri({ hastPlugins: [readingTables] }), shikiConfig: { theme: signalCode } },
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

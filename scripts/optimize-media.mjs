import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const sourceRoot = process.argv[2];
const outputRoot = process.argv[3];

if (!sourceRoot || !outputRoot) {
  throw new Error('Usage: node scripts/optimize-media.mjs <source-root> <output-root>');
}

const jobs = [
  ['kinema-main-menu.png', 'kinema/hero.webp'],
  ['kinema-use-cases.png', 'kinema/editor.webp'],
  ['kinema-target-arena.png', 'kinema/inside.webp'],
  ['ocean-hero.png', 'web-ocean-3d/hero.webp'],
  ['ocean-underwater.png', 'web-ocean-3d/near.webp'],
  ['ocean-interface.png', 'web-ocean-3d/inside.webp'],
  ['safed-cruise.jpg', 'safed-sagar/hero.webp'],
  ['safed-recon.jpg', 'safed-sagar/near.webp'],
  ['safed-settings.jpg', 'safed-sagar/inside.webp'],
  ['blocks-cover.jpg', 'blocks-inco-ai/hero.webp'],
  ['inco-cover.jpg', 'blocks-inco-ai/near.webp'],
  ['vec-cover.jpg', 'blocks-inco-ai/inside.webp'],
];

for (const [sourceName, outputName] of jobs) {
  const input = resolve(sourceRoot, sourceName);
  const output = resolve(outputRoot, outputName);
  await mkdir(dirname(output), { recursive: true });
  await sharp(input)
    .resize(1600, 900, { fit: 'cover', position: 'attention', withoutEnlargement: false })
    .webp({ quality: 82, effort: 5, smartSubsample: true })
    .toFile(output);
}

console.log(`Optimized ${jobs.length} sourced images into ${resolve(outputRoot)}`);

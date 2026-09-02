import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const variants = [
  {
    source: 'public/media/generated/editorial/enhanced/ira-newton-v2.webp',
    output: 'public/media/routes/work/ira-vr-v2',
    position: 'centre',
  },
  {
    source: 'public/media/work/homelane-spacecraft-pro/public-demo-poster.webp',
    output: 'public/media/routes/work/spacecraft-pro',
    position: 'centre',
  },
  {
    source: 'public/media/work/blocks-inco-ai/designesto-before-after.webp',
    output: 'public/media/routes/work/designesto-ai',
    position: 'centre',
  },
  {
    source: 'public/media/generated/editorial/notes-aperture.webp',
    output: 'public/media/routes/notes/notes-aperture',
    position: 'centre',
  },
];

const widths = [640, 960];

for (const variant of variants) {
  for (const width of widths) {
    const height = Math.round(width * 9 / 16);
    const base = join(root, `${variant.output}-${width}`);
    await mkdir(dirname(base), { recursive: true });
    const image = sharp(join(root, variant.source), { failOn: 'warning' })
      .rotate()
      .resize({ width, height, fit: 'cover', position: variant.position, withoutEnlargement: true });

    await image.clone().avif({ quality: 52, effort: 6, chromaSubsampling: '4:2:0' }).toFile(`${base}.avif`);
    await image.clone().webp({ quality: 72, effort: 6, smartSubsample: true }).toFile(`${base}.webp`);
  }
}

console.log(`Built ${variants.length * widths.length * 2} route-opening derivatives.`);

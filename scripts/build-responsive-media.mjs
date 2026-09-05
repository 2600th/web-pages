import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import sharp from 'sharp';

// Lossy delivery derivatives only. Originals and editorial provenance stay unchanged.
const root = process.cwd();
const sources = new Set();
const collect = value => {
  if (!value || typeof value !== 'object') return;
  if (typeof value.src === 'string' && /\.(webp|png|jpe?g)$/i.test(value.src)) sources.add(value.src);
  for (const item of Object.values(value)) collect(item);
};
for (const directory of ['work', 'notes']) {
  const folder = join(root, 'src/content', directory);
  for (const name of await readdir(folder)) {
    if (!name.endsWith('.md')) continue;
    const content = await readFile(join(folder, name), 'utf8');
    const yaml = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    if (yaml) collect(parse(yaml));
  }
}
const output = join(root, 'public/media/responsive');
await mkdir(output, { recursive: true });
const manifest = {};
let fullBytes = 0;
let thumbnailBytes = 0;
for (const src of [...sources].sort()) {
  const file = join(root, 'public', src);
  const bytes = await readFile(file);
  const meta = await sharp(bytes).metadata();
  const key = `${basename(src, extname(src))}-${createHash('sha256').update(bytes).digest('hex').slice(0, 10)}`;
  const widths = [...new Set([320, 640, 960, Math.min(1600, meta.width)].filter(width => width <= meta.width))].sort((a, b) => a - b);
  const variants = [];
  for (const width of widths) {
    const variant = { width };
    for (const format of ['webp', 'avif']) {
      const name = `${key}-${width}.${format}`;
      const path = join(output, name);
      try { await stat(path); } catch {
        await sharp(bytes).resize({ width, withoutEnlargement: true }).toFormat(format, { quality: format === 'avif' ? 58 : 82, effort: 4 }).toFile(path);
      }
      variant[format] = `/media/responsive/${name}`;
    }
    variants.push(variant);
  }
  manifest[src] = variants;
  fullBytes += bytes.length;
  thumbnailBytes += (await stat(join(root, 'public', variants[0].avif))).size;
}
await writeFile(join(root, 'src/data/responsive-media.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ compositions: sources.size, fullBytes, thumbnailBytes, reduction: `${Math.round((1 - thumbnailBytes / fullBytes) * 100)}%` }));

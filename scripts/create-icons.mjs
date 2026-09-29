import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
// iOS applies its own rounded mask, so the Apple icon is rendered full-bleed.
const fullBleed = Buffer.from(svg.toString().replace(/ rx="[^"]*"/, ''));
const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const faviconPath = out('favicon.ico');
const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
await sharp(fullBleed, { density: 300 }).resize(180, 180).png().toFile(out('apple-touch-icon.png'));
for (const size of [192, 512]) await sharp(svg, { density: 300 }).resize(size, size).png().toFile(out(`icon-${size}.png`));

const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(faviconPath, Buffer.concat([header, png32]));

console.log('Created favicon.ico, apple-touch-icon.png and manifest icons from favicon.svg');

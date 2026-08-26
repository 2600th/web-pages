import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const appleIconPath = fileURLToPath(new URL('../public/apple-touch-icon.png', import.meta.url));
const faviconPath = fileURLToPath(new URL('../public/favicon.ico', import.meta.url));
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
await sharp(svg).resize(180, 180).png().toFile(appleIconPath);

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

console.log('Created favicon.ico and apple-touch-icon.png from favicon.svg');

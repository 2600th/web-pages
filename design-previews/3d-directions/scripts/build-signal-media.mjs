// Builds the Signal page's media derivatives. Sources: the site's public/ media and
// reviewed masters in the repo's gitignored _media-source/ (DLSS 5 player and
// Safed Sagar captures copied from their public repositories).
import { mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '../../../public');
const masters = resolve(here, '../../../_media-source');
const out = resolve(here, '../src/assets/signal');
await mkdir(out, { recursive: true });

const stills = {
  blocks: `${site}/media/generated/editorial/blocks-design-production-v2.webp`,
  designesto: `${site}/media/work/blocks-inco-ai/designesto-before-after.webp`,
  craft: `${site}/media/work/propvr-ai-craft/craft-public-home-20260902.webp`,
  spacecraft: `${site}/media/work/homelane-spacecraft-pro/room-editor-poster.webp`,
  enterprise: `${site}/media/work/enterprise-immersive-systems/facility-poster.webp`,
  ira: `${site}/media/career/ira-vr/newton-poster.webp`,
  dlss: `${masters}/dlss5/compare-wipe.jpg`,
  kinema: `${site}/media/work/kinema/inside.webp`,
  ocean: `${site}/media/work/web-ocean-3d/clip-poster.webp`,
  safed: `${masters}/safed-sagar/04-cruise.jpg`,
  character: `${site}/media/generated/identity/2600th-velvet-character.webp`,
};
for (const [name, src] of Object.entries(stills)) {
  const width = name === 'character' ? 720 : 1100;
  const info = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${out}/${name}.webp`);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// Muted monitor loops. Existing site loops are reused as-is; the DLSS demo is
// trimmed to its opening split-face shot (0:00–0:04) and re-encoded small.
const loops = {
  designesto: `${site}/media/work/blocks-inco-ai/designesto-edit-room.mp4`,
  spacecraft: `${site}/media/work/homelane-spacecraft-pro/room-editor-loop.mp4`,
  enterprise: `${site}/media/work/enterprise-immersive-systems/facility-loop.mp4`,
  ira: `${site}/media/career/ira-vr/newton-loop.mp4`,
  ocean: `${site}/media/work/web-ocean-3d/clip.mp4`,
};
for (const [name, src] of Object.entries(loops)) await copyFile(src, `${out}/${name}.mp4`);
execFileSync(ffmpeg, [
  '-y', '-loglevel', 'error', '-ss', '0', '-t', '4', '-i', `${masters}/dlss5/neural-comparison-demo.mp4`,
  '-an', '-vf', 'scale=960:-2,fps=30', '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
  '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', `${out}/dlss.mp4`,
]);
console.log('loops written');

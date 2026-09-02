import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { expect, it } from 'vitest';

it('builds every IRA opening format from the corrected Newton image, not the retired learner frame', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'route-media-'));
  try {
    const sources = [
      ['public/media/career/ira-vr/newton-poster.webp', '#ff0000'],
      ['public/media/generated/editorial/enhanced/ira-newton-v2.webp', '#00ff00'],
      ['public/media/work/homelane-spacecraft-pro/public-demo-poster.webp', '#0000ff'],
      ['public/media/work/blocks-inco-ai/designesto-before-after.webp', '#0000ff'],
      ['public/media/generated/editorial/notes-aperture.webp', '#0000ff'],
      ['public/media/generated/editorial/blocks-design-production-v1.webp', '#0000ff'],
      ['public/media/work/propvr-ai-craft/craft-public-home-20260902.webp', '#0000ff'],
    ];
    for (const [relativePath, background] of sources) {
      const path = join(fixture, relativePath);
      mkdirSync(dirname(path), { recursive: true });
      await sharp({ create: { width: 960, height: 540, channels: 3, background } }).webp({ lossless: true }).toFile(path);
    }
    execFileSync(process.execPath, [resolve('scripts/build-route-opening-media.mjs')], { cwd: fixture });
    const output = join(fixture, 'public/media/routes/work');
    const images = readdirSync(output).filter((name) => name.startsWith('ira-vr') && /\.(webp|avif)$/.test(name));
    expect(images).toHaveLength(4);
    for (const project of ['blocks', 'craft']) {
      const metadata = await sharp(readFileSync(join(output, `${project}-960.webp`))).metadata();
      expect([metadata.width, metadata.height]).toEqual([960, 540]);
    }
    for (const image of images) {
      const stats = await sharp(readFileSync(join(output, image))).stats();
      // The approved source is green; the obsolete source is red. Inspect
      // generated pixels, not a source filename or a duplicated build helper.
      expect(stats.channels[1].mean, image).toBeGreaterThan(245);
      expect(stats.channels[0].mean, image).toBeLessThan(10);
    }
  } finally {
    const absolute = resolve(fixture);
    if (dirname(absolute) !== resolve(tmpdir()) || !absolute.startsWith(join(resolve(tmpdir()), 'route-media-'))) {
      throw new Error('Refusing cleanup outside the route-media temporary fixture');
    }
    rmSync(absolute, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}, 20_000);

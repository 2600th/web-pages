import { describe, expect, it } from 'vitest';
import config from '../../scripts/career-media.config.mjs';
import { buildVideoArgs, validateConfig } from '../../scripts/prepare-career-media.mjs';
import { CAREER_MEDIA } from '../../src/data/career-media';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

describe('career media pipeline', () => {
  it('never assigns public outputs to excluded source media', () => {
    const unsafe = config.recipes.filter((recipe) =>
      ['internal-reference-only', 'excluded'].includes(recipe.status),
    );

    expect(unsafe.every((recipe) => recipe.outputs.length === 0)).toBe(true);
  });

  it('keeps delivery clips inside the approved duration and resolution budget', () => {
    const video = config.recipes.filter((recipe) => recipe.kind === 'video');

    expect(video.length).toBeGreaterThan(0);
    expect(video.every((recipe) => recipe.durationSeconds !== undefined && recipe.durationSeconds <= 8)).toBe(true);
    expect(
      video.every(
        (recipe) =>
          recipe.width !== undefined &&
          recipe.height !== undefined &&
          recipe.width <= 1280 &&
          recipe.height <= 720,
      ),
    ).toBe(true);
  });

  it('keeps the Oye Tippa excerpt inside the reviewed gameplay window', () => {
    const excerpt = config.recipes.find((recipe) => recipe.key === 'oye-tippa-run');

    expect(excerpt?.startSeconds).toBe(28);
    expect(excerpt?.posterOffsetSeconds).toBe(3);
    expect((excerpt?.startSeconds ?? 0) + (excerpt?.posterOffsetSeconds ?? 0)).toBe(31);
    expect((excerpt?.startSeconds ?? 0) + (excerpt?.durationSeconds ?? 0)).toBeLessThanOrEqual(34);
  });

  it('uses one stable public key per media recipe', () => {
    const keys = config.recipes.map((recipe) => recipe.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => /^[a-z0-9-]+$/.test(key))).toBe(true);
  });

  it('reports unsafe outputs and duplicate keys before processing', () => {
    const errors = validateConfig({
      sourceRoot: '_media-source',
      outputRoot: 'public/media/career',
      recipes: [
        { key: 'duplicate', kind: 'image', status: 'excluded', outputs: ['poster.webp'] },
        { key: 'duplicate', kind: 'image', status: 'public-corroborated', outputs: ['poster.webp'] },
      ],
    });

    expect(errors).toEqual([
      'duplicate: excluded media cannot define public outputs',
      'duplicate: media key is duplicated',
    ]);
  });

  it('builds silent bounded MP4 arguments from a video recipe', () => {
    const args = buildVideoArgs(
      {
        startSeconds: 4,
        durationSeconds: 6,
        width: 1280,
        height: 720,
      },
      'input.mp4',
      'clip.mp4',
    );

    expect(args).toEqual([
      '-y', '-ss', '4', '-i', 'input.mp4', '-t', '6', '-vf',
      "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', 'clip.mp4',
    ]);
  });

  it('publishes only traceable derivatives inside the media budget', () => {
    for (const media of Object.values(CAREER_MEDIA)) {
      expect(['public-approved', 'public-corroborated', 'approval-enhanced']).toContain(media.status);
      expect(media.sourceUrl).toMatch(/^https:\/\/drive\.google\.com\//);
      for (const derivative of Object.values(media.derivatives)) {
        if (!derivative) continue;
        const path = join(process.cwd(), 'public', derivative);
        expect(existsSync(path)).toBe(true);
        expect(statSync(path).size).toBeLessThanOrEqual(2_200_000);
      }
    }
  });
});

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { MEDIA_PROVENANCE } from '../../src/data/media-provenance';
import { CAREER_MEDIA } from '../../src/data/career-media';

function workMediaPaths() {
  const directory = join(process.cwd(), 'src/content/work');
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .flatMap((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      const data = parse(match[1]);
      const media = [data.heroMedia, data.out?.media, data.near?.media, data.inside?.media].filter(Boolean);
      return [...media.flatMap((item) => [item.src, item.mp4, item.webm]), data.seo.socialImage]
        .filter((path): path is string => typeof path === 'string');
    });
}

describe('portfolio media', () => {
  it('keeps every referenced work medium local and traceable to evidence', () => {
    const paths = [...new Set(workMediaPaths())];
    expect(paths.length).toBeGreaterThanOrEqual(12);

    for (const path of paths) {
      expect(existsSync(join(process.cwd(), 'public', path))).toBe(true);
      const provenance = MEDIA_PROVENANCE[path];
      expect(provenance?.sourceUrl).toMatch(/^https:\/\//);
      expect(['public-repository', 'authored-public-post', 'public-approved', 'public-corroborated', 'approval-enhanced']).toContain(provenance?.status);
    }
  });

  it('publishes only safe career derivatives within the public media budget', () => {
    for (const media of Object.values(CAREER_MEDIA)) {
      expect(['public-approved', 'public-corroborated', 'approval-enhanced']).toContain(media.status);
      for (const path of Object.values(media.derivatives)) {
        if (!path) continue;
        const absolute = join(process.cwd(), 'public', path);
        expect(existsSync(absolute)).toBe(true);
        expect(statSync(absolute).size).toBeLessThanOrEqual(2_200_000);
      }
    }
  });

  it('gives motion-backed cases local poster and clip derivatives', () => {
    for (const key of ['ira-vr', 'machine-hunter', 'oye-tippa-run']) {
      const media = CAREER_MEDIA[key];
      expect(media, key).toBeDefined();
      expect(media.derivatives.poster1280).toMatch(/^\/media\//);
      expect(media.derivatives.clipMp4).toMatch(/^\/media\/.+\.mp4$/);
    }
  });
});

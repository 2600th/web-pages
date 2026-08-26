import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { MEDIA_PROVENANCE } from '../../src/data/media-provenance';

function workMediaPaths() {
  const directory = join(process.cwd(), 'src/content/work');
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .flatMap((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      const data = parse(match[1]);
      return [
        data.heroMedia.src,
        data.out.media.src,
        data.near.media.src,
        data.inside.media.src,
      ];
    });
}

describe('portfolio media', () => {
  it('keeps every referenced work image local and traceable to public evidence', () => {
    const paths = [...new Set(workMediaPaths())];
    expect(paths.length).toBeGreaterThanOrEqual(12);

    for (const path of paths) {
      expect(existsSync(join(process.cwd(), 'public', path))).toBe(true);
      const provenance = MEDIA_PROVENANCE[path];
      expect(provenance?.sourceUrl).toMatch(/^https:\/\//);
      expect(['public-repository', 'authored-public-post']).toContain(provenance?.status);
    }
  });
});

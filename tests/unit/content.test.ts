import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { noteSchema, workSchema } from '../../src/content/schemas';

function readFrontmatter(directory: string) {
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      return { filename, data: parse(match[1]) };
    });
}

describe('portfolio content', () => {
  it('keeps every featured case attributable, descriptive, and search-ready', () => {
    const entries = readFrontmatter(join(process.cwd(), 'src/content/work'));
    expect(entries.length).toBeGreaterThanOrEqual(15);

    for (const { filename, data } of entries) {
      const work = workSchema.parse(data);
      expect(work.slug).toBe(basename(filename, '.md'));
      expect(work.sources[0]?.url).toMatch(/^https:\/\//);
      expect(work.seo.description.length).toBeGreaterThan(60);
      if (work.recordType !== 'evidence-note') {
        expect(work.out.thesis.length).toBeGreaterThan(30);
        expect(work.heroMedia.alt.length).toBeGreaterThan(20);
      }
    }
  });

  it('keeps notes dated, attributable, and non-draft for launch', () => {
    const entries = readFrontmatter(join(process.cwd(), 'src/content/notes'));
    expect(entries).toHaveLength(3);

    for (const { filename, data } of entries) {
      const note = noteSchema.parse(data);
      expect(note.slug).toBe(basename(filename, '.md'));
      expect(note.canonicalUrl).toMatch(/^https:\/\//);
      expect(note.draft).toBe(false);
    }
  });
});

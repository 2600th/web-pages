import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { noteSchema } from '../../src/content/schemas';
import * as notes from '../../src/data/notes';

const entries = readdirSync('src/content/notes').filter((file) => file.endsWith('.md')).map((file) => {
  const source = readFileSync(join('src/content/notes', file), 'utf8');
  const [, yaml, body] = source.split(/^---\s*$/m);
  return { data: parse(yaml), body };
});

describe('Notes publication contract', () => {
  it('keeps an external original with the same pathname', () => {
    expect(notes.getOriginalSource('https://example.com/notes/ocean-reliability/', 'ocean-reliability')).toBe('https://example.com/notes/ocean-reliability/');
  });

  it('omits local self sources with either trailing-slash spelling', () => {
    expect(notes.getOriginalSource('https://www.2600th.com/notes/ocean-reliability', 'ocean-reliability')).toBeUndefined();
    expect(notes.getOriginalSource('https://www.2600th.com/notes/ocean-reliability/', 'ocean-reliability')).toBeUndefined();
    expect(notes.getOriginalSource(undefined, 'ocean-reliability')).toBeUndefined();
  });
  it('requires an honest editorial type and dedicated social image', () => {
    const base = entries[0].data;
    expect(noteSchema.safeParse({ ...base, type: undefined }).success).toBe(false);
    expect(noteSchema.safeParse({ ...base, type: 'announcement' }).success).toBe(false);
    expect(noteSchema.safeParse({ ...base, ogImage: undefined }).success).toBe(false);
    for (const entry of entries) expect(noteSchema.safeParse(entry.data).success).toBe(true);
  });

  it('preserves the six original URLs, dates and source attributions', () => {
    for (const [slug, date, url] of [
      ['ai-native-game-development-reflection', '2026-08-22', 'https://2600th.substack.com/p/revolutionizing-realms-how-ai-is'],
      ['ai-video-control', '2026-08-24', 'https://x.com/2600th/status/2091937799310393656'],
      ['browser-flight-experiment', '2026-08-15', 'https://x.com/2600th/status/2088580221041885561'],
      ['from-pixels-to-intelligent-systems', '2026-08-21', 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild'],
      ['ocean-reliability', '2026-08-09', 'https://x.com/2600th/status/2086351606124281887'],
      ['technology-and-human-agency', '2026-08-23', 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild'],
    ]) {
      const entry = noteSchema.parse(entries.find(({ data }) => data.slug === slug)?.data);
      expect(entry.publishedAt.toISOString().slice(0, 10)).toBe(date);
      expect(entry.canonicalUrl).toBe(url);
      expect(entry.sourceAttribution.length).toBeGreaterThan(5);
    }
  });

  it('derives one rounded-up reading time from visible Markdown, not URL length or metadata', () => {
    expect(notes.getNoteReadingTime('')).toBe(1);
    expect(notes.getNoteReadingTime('word '.repeat(220))).toBe(1);
    expect(notes.getNoteReadingTime('word '.repeat(221))).toBe(2);
    expect(notes.getNoteReadingTime(`---\ntitle: ${'hidden '.repeat(250)}\n---\n[One link](https://example.com/${'path/'.repeat(250)}) ![not body](image.webp)`)).toBe(1);
  });

  it('excludes drafts and sorts only by publication, without mutating the collection', () => {
    const base = noteSchema.parse(entries[0].data);
    const input = [
      { data: { ...base, slug: 'old-revised', publishedAt: new Date('2026-01-01'), updatedAt: new Date('2026-09-02') } },
      { data: { ...base, slug: 'private-draft', publishedAt: new Date('2026-09-03'), draft: true } },
      { data: { ...base, slug: 'new', publishedAt: new Date('2026-08-01') } },
    ];
    expect(notes.getPublishedNotes(input).map(({ data }) => data.slug)).toEqual(['new', 'old-revised']);
    expect(input[0].data.slug).toBe('old-revised');
    expect(notes.getPublishedNotes([])).toEqual([]);
  });

  it('selects one current published note of each available type for the homepage', () => {
    const homepage = notes.getHomepageNotes(entries.map(({ data, body }) => ({ data: noteSchema.parse(data), body })));

    expect(homepage).toHaveLength(3);
    expect(homepage.map(({ data }) => data.type).sort()).toEqual(['essay', 'field-note', 'technical-teardown']);
    expect(homepage.every(({ data }) => !data.draft)).toBe(true);
  });

  it('selects the latest published entry for each available type in deterministic chronological order', () => {
    const base = noteSchema.parse(entries[0].data);
    const input = [
      { data: { ...base, slug: 'field-older', type: 'field-note' as const, publishedAt: new Date('2026-01-01') } },
      { data: { ...base, slug: 'field-current', type: 'field-note' as const, publishedAt: new Date('2026-04-01') } },
      { data: { ...base, slug: 'field-draft', type: 'field-note' as const, publishedAt: new Date('2026-06-01'), draft: true } },
      { data: { ...base, slug: 'technical-current', type: 'technical-teardown' as const, publishedAt: new Date('2026-05-01') } },
      { data: { ...base, slug: 'essay-current', type: 'essay' as const, publishedAt: new Date('2026-05-01') } },
    ];

    expect(notes.getHomepageNotes(input).map(({ data }) => data.slug)).toEqual(['essay-current', 'technical-current', 'field-current']);
    expect(notes.getHomepageNotes(input.filter(({ data }) => data.type !== 'essay')).map(({ data }) => data.type)).toEqual(['technical-teardown', 'field-note']);
    expect(input.map(({ data }) => data.slug)).toEqual(['field-older', 'field-current', 'field-draft', 'technical-current', 'essay-current']);
  });

  it('derives reciprocal Work links from published Note relationships only', () => {
    const base = noteSchema.parse(entries[0].data);
    const input = [
      { data: { ...base, slug: 'essay', relatedWork: ['blocks', 'designesto'] } },
      { data: { ...base, slug: 'draft', relatedWork: ['blocks'], draft: true } },
      { data: { ...base, slug: 'elsewhere', relatedWork: ['kinema'] } },
    ];
    expect(notes.getNotesForWork(input, 'blocks').map(({ data }) => data.slug)).toEqual(['essay']);
    expect(notes.getNotesForWork(input, 'unknown')).toEqual([]);
    const work = new Set(readdirSync('src/content/work').map((file) => file.replace(/\.md$/, '')));
    for (const entry of entries) for (const slug of noteSchema.parse(entry.data).relatedWork) expect(work.has(slug)).toBe(true);
  });

  it('uses unique 1200 by 630 local images for published notes and Craft', async () => {
    const images = entries.filter(({ data }) => !data.draft).map(({ data }) => noteSchema.parse(data).ogImage);
    const craft = parse(readFileSync('src/content/work/propvr-ai-craft.md', 'utf8').split(/^---\s*$/m)[1]);
    images.push(craft.seo.socialImage);
    expect(new Set(images).size).toBe(images.length);
    for (const image of images) {
      const { width, height } = await sharp(join('public', image)).metadata();
      expect([width, height]).toEqual([1200, 630]);
    }
  });
});

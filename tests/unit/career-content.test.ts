import { describe, expect, it } from 'vitest';
import { workSchema } from '../../src/content/schemas';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const evidenceNote = {
  title: 'The Brutal Spy',
  slug: 'the-brutal-spy',
  summary:
    'An early game-programming milestone in a career that moved from real-time entertainment into immersive and intelligent systems.',
  yearStart: 2012,
  status: 'Historical work',
  role: 'Game programmer',
  disciplines: ['Games', 'Real-time systems'],
  visibility: 'public',
  featuredOrder: 0,
  recordType: 'evidence-note',
  era: 'programmer',
  domains: ['games'],
  careerOrder: 10,
  relationships: ['alphaman'],
  evidenceStatus: 'public-corroborated',
  publicClaims: ["Listed in the author's public career narrative."],
  engagementPath: 'product-collaboration',
  sources: [
    {
      label: 'From Pixels to Metaverse',
      url: 'https://2600th.substack.com/',
      type: 'authored-post',
    },
  ],
  seo: {
    title: 'The Brutal Spy — Early Game Work by Pranshul Chandhok',
    description:
      "An early game-programming milestone in Pranshul Chandhok's progression across games, immersive systems, design technology, and applied AI.",
    socialImage: '/media/social/career-atlas.webp',
  },
};

function readWorkRecords() {
  const directory = join(process.cwd(), 'src/content/work');
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      return workSchema.parse(parse(match[1]));
    });
}

describe('career work model', () => {
  it('accepts a sourced evidence note without invented case-study depth', () => {
    const entry = workSchema.parse(evidenceNote);

    expect(entry.recordType).toBe('evidence-note');
    expect(entry.out).toBeUndefined();
    expect(entry.near).toBeUndefined();
    expect(entry.inside).toBeUndefined();
  });

  it('rejects records marked private-excluded from the public collection', () => {
    const result = workSchema.safeParse({ ...evidenceNote, visibility: 'private-excluded' });

    expect(result.success).toBe(false);
  });

  it('contains the approved factual career spine in chronological order', () => {
    const records = readWorkRecords().sort((a, b) => a.careerOrder - b.careerOrder);

    expect(records.length).toBeGreaterThanOrEqual(15);
    expect(records.map((entry) => entry.slug)).toEqual(
      expect.arrayContaining([
        'the-brutal-spy',
        'alphaman',
        'merkur-magie',
        'greykernel',
        'ira-vr',
        'machine-hunter',
        'mysticmojo',
        'enterprise-immersive-systems',
        'humanoid-robot-control-system',
        'homelane-spacecraft-pro',
        'ai-native-game-thesis',
        'blocks-inco-ai',
      ]),
    );
    expect(new Set(records.map((entry) => entry.careerOrder)).size).toBe(records.length);
    expect(records.every((entry) => entry.sources.length > 0)).toBe(true);
  });
});

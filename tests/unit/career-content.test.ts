import { describe, expect, it } from 'vitest';
import { workSchema } from '../../src/content/schemas';

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
});

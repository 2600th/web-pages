import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('project contents navigation', () => {
  it('uses Astro rendered heading metadata instead of independently slugging Markdown', () => {
    const page = readFileSync('src/pages/work/[slug].astro', 'utf8');

    expect(page).toMatch(/const\s*\{\s*Content,\s*headings\s*\}\s*=\s*await render\(entry\)/);
    expect(page).toMatch(/headings\.filter\(\(heading\)\s*=>\s*heading\.depth\s*===\s*2\)/);
    expect(page).not.toContain('slugifyHeading');
    expect(page).not.toContain("entry.body ?? ''");
  });
});

import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const artifact = 'public/lab/dwarkesh-jensen/index.html';

describe('Published Lab companion', () => {
  it('ships the self-contained HTML at its public route', () => {
    expect(existsSync(artifact)).toBe(true);
  });

  it('preserves the interview map and all timestamp targets after editorial patches', () => {
    const html = readFileSync(artifact, 'utf8');
    const start = html.indexOf('const DATA =');
    const end = html.indexOf('const stage =', start);
    const data = runInNewContext(`${html.slice(start, end)}; DATA`, {}, { timeout: 1000 });
    expect(data.terms).toHaveLength(92);
    expect(data.sections).toHaveLength(8);
    expect(new Set(data.terms.map((term: { name: string }) => term.name)).size).toBe(92);
    expect(data.terms.filter((term: { subvis: string }) => term.subvis)).toHaveLength(20);
    expect(data.sections.map((section: { id: string }) => data.terms.filter((term: { section_id: string }) => term.section_id === section.id).length)).toEqual([9, 10, 10, 14, 11, 9, 18, 11]);
    for (const term of data.terms) {
      const url = new URL(term.youtube_url);
      expect(url.origin + url.pathname).toBe('https://youtu.be/Hrbq66XqtCo');
      expect(url.searchParams.get('t')).toMatch(/^\d+s?$/);
    }
  });
});

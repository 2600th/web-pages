import { describe, expect, it } from 'vitest';
import { discoveryEntry } from '../../scripts/sitemap-metadata.mjs';

describe('trustworthy sitemap metadata', () => {
  it('uses explicit modification dates and does not substitute the build clock', () => {
    expect(discoveryEntry({ updatedAt: '2026-09-02' }, { gitDate: '2026-08-01', clean: false })).toEqual({ lastmod: '2026-09-02' });
    expect(discoveryEntry({}, { gitDate: '2026-08-01', clean: true })).toEqual({ lastmod: '2026-08-01' });
    expect(discoveryEntry({}, { gitDate: '2026-08-01', clean: false })).toEqual({});
    expect(discoveryEntry({}, {})).toEqual({});
    expect(discoveryEntry({ updatedAt: 'not-a-date' }, {})).toEqual({});
  });
  it('excludes drafts but keeps useful public compatibility pages', () => {
    expect(discoveryEntry({ draft: true, updatedAt: '2026-09-02' }, {})).toBeUndefined();
    expect(discoveryEntry({ archive: false }, {})).toEqual({});
  });
});

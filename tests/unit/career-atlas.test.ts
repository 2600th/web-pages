import { describe, expect, it } from 'vitest';
import {
  parseAtlasState,
  selectRelated,
  serializeAtlasState,
  type AtlasRecord,
} from '../../src/scripts/career-atlas';

const records: AtlasRecord[] = [
  { slug: 'ira-vr', domains: ['xr', 'simulation'], relationships: ['machine-hunter'] },
  { slug: 'machine-hunter', domains: ['games', 'xr'], relationships: ['ira-vr'] },
  { slug: 'kinema', domains: ['games', 'xr', 'applied-ai'], relationships: [] },
];

describe('Career Atlas state', () => {
  it('uses a valid selected record and domain from the URL', () => {
    expect(parseAtlasState('?career=ira-vr&domain=xr', records)).toEqual({
      selected: 'ira-vr',
      domain: 'xr',
    });
  });

  it('falls back safely when the URL is invalid', () => {
    expect(parseAtlasState('?career=missing&domain=unknown', records)).toEqual({
      selected: 'ira-vr',
      domain: 'all',
    });
  });

  it('selects the first visible record when the domain excludes the requested record', () => {
    expect(parseAtlasState('?career=ira-vr&domain=applied-ai', records)).toEqual({
      selected: 'kinema',
      domain: 'applied-ai',
    });
  });

  it('serializes stable linkable state', () => {
    expect(serializeAtlasState({ selected: 'machine-hunter', domain: 'xr' })).toBe(
      'career=machine-hunter&domain=xr',
    );
  });

  it('returns explicit relationships before shared-domain neighbors', () => {
    expect(selectRelated(records, 'ira-vr').map((entry) => entry.slug)).toEqual([
      'machine-hunter',
      'kinema',
    ]);
  });
});

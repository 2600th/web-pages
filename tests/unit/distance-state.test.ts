import { describe, expect, it } from 'vitest';
import { readDistance, readWorkSlug, writeDistance } from '../../src/scripts/distance-state';

describe('three distances URL state', () => {
  it('defaults invalid or absent values to OUT', () => {
    expect(readDistance('')).toBe('out');
    expect(readDistance('?distance=far')).toBe('out');
  });

  it('reads all three supported distances and an optional work slug', () => {
    expect(readDistance('?distance=near')).toBe('near');
    expect(readDistance('?distance=inside')).toBe('inside');
    expect(readWorkSlug('?work=kinema&distance=inside')).toBe('kinema');
    expect(readWorkSlug('?distance=inside')).toBeNull();
  });

  it('writes a stable deep link without dropping unrelated query parameters', () => {
    const url = writeDistance(new URL('https://www.2600th.com/?ref=linkedin'), 'web-ocean-3d', 'near');
    expect(url.toString()).toBe(
      'https://www.2600th.com/?ref=linkedin&work=web-ocean-3d&distance=near#selected-work',
    );
  });
});

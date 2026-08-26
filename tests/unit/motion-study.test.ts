import { describe, expect, it } from 'vitest';
import { indexForRange } from '../../src/scripts/motion-study';

describe('Motion Study range mapping', () => {
  it('clamps before the first and after the last frame', () => {
    expect(indexForRange(-4, 7)).toBe(0);
    expect(indexForRange(20, 7)).toBe(6);
  });

  it('rounds to the nearest authored frame', () => {
    expect(indexForRange(2.4, 7)).toBe(2);
    expect(indexForRange(2.6, 7)).toBe(3);
  });

  it('returns no frame for an empty sequence', () => {
    expect(indexForRange(0, 0)).toBe(-1);
  });
});

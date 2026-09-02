import { describe, expect, it } from 'vitest';
import { resolveMotionMode } from '../../src/scripts/site-motion';

describe('site motion mode', () => {
  it('enhances only routes that declare motion targets', () => {
    expect(resolveMotionMode({ reducedMotion: false, hasTargets: true })).toBe('enhanced');
    expect(resolveMotionMode({ reducedMotion: false, hasTargets: false })).toBe('none');
  });

  it('keeps declared motion routes static when reduced motion is requested', () => {
    expect(resolveMotionMode({ reducedMotion: true, hasTargets: true })).toBe('static');
  });
});

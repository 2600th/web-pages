import { describe, expect, it } from 'vitest';
import { getCinematicMode } from '../../src/scripts/cinematic-intro';

describe('cinematic intro state', () => {
  it('plays when motion and canvas are available', () => {
    expect(getCinematicMode({ reducedMotion: false, canvasAvailable: true })).toBe('play');
  });

  it('settles immediately when reduced motion is requested', () => {
    expect(getCinematicMode({ reducedMotion: true, canvasAvailable: true })).toBe('settled');
  });

  it('keeps the decision load-scoped instead of accepting prior-session state', () => {
    expect(getCinematicMode({ reducedMotion: false, canvasAvailable: true })).toBe('play');
  });

  it('uses the static composition when canvas is unavailable', () => {
    expect(getCinematicMode({ reducedMotion: false, canvasAvailable: false })).toBe('static');
  });

});

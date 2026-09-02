import { describe, expect, it } from 'vitest';
import { getCinematicMode, getPerspectiveGridGeometry } from '../../src/scripts/cinematic-intro';

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

  it('keeps the hero grid converged and height-bounded on ultrawide screens', () => {
    const grid = getPerspectiveGridGeometry(1920, 1080, 0.68);

    expect(grid.rays).toHaveLength(7);
    for (const ray of grid.rays) {
      expect(ray.start).toEqual(grid.vanishingPoint);
      expect(ray.end.y).toBe(grid.floorBottom);
    }

    const floorWidth = grid.rays.at(-1)!.end.x - grid.rays[0].end.x;
    expect(floorWidth).toBeLessThanOrEqual(1080 * 1.3);
    expect(grid.crossLines[0].end.x - grid.crossLines[0].start.x).toBeLessThan(
      grid.crossLines.at(-1)!.end.x - grid.crossLines.at(-1)!.start.x,
    );
  });

  it.each([[390, 844], [878, 912], [1920, 1080], [2560, 1080]])(
    'joins every cross-line to the outer perspective rays at %ix%i', (width, height) => {
      const grid = getPerspectiveGridGeometry(width, height);
      for (const line of grid.crossLines) {
        for (const [point, ray] of [[line.start, grid.rays[0]], [line.end, grid.rays.at(-1)!]] as const) {
          const dx = ray.end.x - ray.start.x;
          const dy = ray.end.y - ray.start.y;
          const distance = Math.abs(dx * (point.y - ray.start.y) - dy * (point.x - ray.start.x)) / Math.hypot(dx, dy);
          expect(distance, 'cross-line endpoints stay on the floor boundary').toBeLessThan(0.01);
        }
      }
    },
  );
});

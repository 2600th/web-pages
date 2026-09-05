import { describe, expect, it } from 'vitest';
import { getOrbitalGeometry, type Bounds } from '../../src/scripts/orbital-geometry';

const mobileCases: Array<[number, Bounds]> = [
  [320, { x: 154, y: 88, width: 220, height: 330 }],
  [390, { x: 224, y: 88, width: 220, height: 330 }],
  [430, { x: 264, y: 88, width: 220, height: 330 }],
  [700, { x: 534, y: 88, width: 220, height: 330 }],
];

describe('Orbital hero geometry', () => {
  it.each(mobileCases)('keeps the portrait orbit contained at %ipx', (width, portrait) => {
    const geometry = getOrbitalGeometry({ width, height: 428 }, portrait, true);

    expect(geometry.center.x).toBe(portrait.x + portrait.width / 2);
    expect(geometry.center.y).toBeCloseTo(portrait.y + portrait.height * 0.53);
    expect(geometry.orbit.left).toBeGreaterThanOrEqual(12);
    expect(geometry.orbit.right).toBeLessThanOrEqual(width - 12);
    expect(geometry.ground.y).toBeLessThanOrEqual(402);
    expect(geometry.ground.y).toBeGreaterThan(portrait.y + portrait.height * 0.8);
  });

  it('uses the measured portrait position instead of viewport-only proportions', () => {
    const first = getOrbitalGeometry(
      { width: 390, height: 428 },
      { x: 224, y: 88, width: 220, height: 330 },
      true,
    );
    const shifted = getOrbitalGeometry(
      { width: 390, height: 428 },
      { x: 184, y: 70, width: 220, height: 330 },
      true,
    );

    expect(shifted.center.x).toBe(first.center.x - 40);
    expect(shifted.center.y).toBeCloseTo(first.center.y - 18);
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the actual canvas drawing routine; the recorder observes its geometry.
// Reverting to viewport-scaled mobile radii must fail the containment checks.
const html = readFileSync(new URL('./stage.html', import.meta.url), 'utf8');
const draw = html.slice(html.indexOf('function draw(t)'), html.indexOf('function loop(now)'));
for (const w of [320, 390, 430, 700]) {
  test(`mobile orbit stays behind the portrait and inside its canvas at ${w}px`, () => {
    const ellipses = [];
    const ctx = {
      clearRect() {}, beginPath() {}, stroke() {}, arc() {}, fill() {},
      ellipse(...args) { ellipses.push(args); },
    };
    const portraitBounds = { x: w - 210, y: 12, width: 220, height: 330 };
    runInNewContext(`${draw};draw(0);draw(70)`, {
      w, h: 352, ctx, kind: 'C', strength: 1, line() {}, portraitBounds,
    });
    for (const [x, y, rx, ry, angle] of ellipses) {
      const ex = Math.hypot(rx * Math.cos(angle), ry * Math.sin(angle));
      const ey = Math.hypot(rx * Math.sin(angle), ry * Math.cos(angle));
      assert.ok(x - ex >= 8 && x + ex <= w - 8, `orbit clipped horizontally: ${x - ex}..${x + ex}`);
      assert.ok(y - ey >= 8 && y + ey <= 344, `orbit clipped vertically: ${y - ey}..${y + ey}`);
      assert.ok(Math.abs(x - (portraitBounds.x + portraitBounds.width / 2)) <= 1, 'orbit drifted away from portrait center');
    }
    assert.equal(ellipses.length, 14, 'ground rings and meridian remain visible at both animation times');
  });
}

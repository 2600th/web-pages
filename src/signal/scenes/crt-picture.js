// The arcade's picture, shared by the flat CRT (arcade.js) and the 3D cabinet (cabinet.js):
// the phosphor shader, the typed terminal for cartridges without a picture, and the list of
// picture sources the page already holds (an image, a clip with its poster, or code).

/**
 * The tube, as GLSL shared by raw WebGL2 and three.js. `crt(vUv)` returns the colour for a
 * point on the glass. Uniforms: uTex, uRes, uTexSize, uTime, uSwitch, uStart, uCurve and,
 * when HUD is defined, uHud (an overlay drawn on the picture before the phosphor).
 * The curve overscans, as real sets do, so the picture always reaches the glass's corners.
 */
export const CRT_GLSL = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 off = abs(uv.yx) / vec2(5.5, 4.5);
  uv += uv * off * off * uCurve;
  uv /= 1.0 + vec2(0.0331, 0.0494) * uCurve;
  return uv * 0.5 + 0.5;
}
vec2 cover(vec2 uv) {
  float sa = uRes.x / uRes.y, ta = uTexSize.x / max(uTexSize.y, 1.0);
  vec2 s = sa > ta ? vec2(1.0, ta / sa) : vec2(sa / ta, 1.0);
  return (uv - 0.5) * s + 0.5;
}
vec4 crt(vec2 vUv) {
  vec2 uv = clamp(curve(vUv), 0.0, 1.0);
  vec2 glass = uv;
  float sw = uSwitch;
  // Changing channel: the picture tears sideways and rolls.
  float row = floor(uv.y * 160.0);
  uv.x += (hash(vec2(row, floor(uTime * 45.0))) - 0.5) * 0.12 * sw;
  uv.y = fract(uv.y + sw * sw * 0.35);
  // Pressing start: the picture collapses to a bright line.
  uv.y = (uv.y - 0.5) / max(1.0 - uStart * 0.985, 0.015) + 0.5;
  vec2 t = cover(uv);
  float ca = 0.0016 + 0.012 * sw;
  vec3 col = vec3(texture(uTex, t + vec2(ca, 0.0)).r, texture(uTex, t).g, texture(uTex, t - vec2(ca, 0.0)).b);
  if (uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
#ifdef HUD
  vec4 hud = texture(uHud, glass);
  col = mix(col, hud.rgb, hud.a * (1.0 - uStart));
#endif
  float n = hash(vUv * uRes + fract(uTime) * 91.0);
  col = mix(col, vec3(n) * vec3(0.7, 0.8, 1.0), clamp(sw * 1.3, 0.0, 0.92));
  col += vec3(0.8, 0.9, 1.0) * uStart * uStart * 1.4;
  // Phosphor: scanlines, a slow bright band, a cobalt cast and the tube's vignette.
  col *= 0.86 + 0.14 * sin(vUv.y * uRes.y * 1.6);
  col *= 1.0 + 0.06 * smoothstep(0.08, 0.0, abs(fract(vUv.y - uTime * 0.12) - 0.5));
  col = col * vec3(0.95, 0.98, 1.06) + vec3(0.01, 0.015, 0.04);
  col *= smoothstep(1.42, 0.42, length((vUv - 0.5) * vec2(1.12, 1.0)));
  col += (hash(vUv * uRes * 0.5 + uTime) - 0.5) * 0.035;
  return vec4(col, 1.0);
}`;

/** A cartridge without a picture types its lines onto a terminal. */
export function terminal(lines) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const text = lines.map((line) => line.replace('▌', ''));
  const total = text.reduce((sum, line) => sum + line.length, 0);
  // Typing runs on the clock (about 45 characters a second), not on frame count, so a
  // slow GPU shows the same text at the same moment.
  let typed = 0;
  let started = null;
  return {
    canvas,
    size: [canvas.width, canvas.height],
    reset() { typed = 0; started = null; },
    draw(time) {
      if (started === null) started = time;
      typed = Math.min(total, Math.floor((time - started) * 45));
      const blink = Math.floor(time * 2.2) % 2 === 0;
      ctx.fillStyle = '#02050a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '500 40px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      let left = typed;
      let y = 120;
      let caretX = 110;
      let caretY = 120;
      for (const line of text) {
        const shown = line.slice(0, Math.max(0, left));
        left -= line.length;
        ctx.fillStyle = line.startsWith('$') || line.startsWith('guest') ? '#7cf0b0' : '#9db6ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fillText(shown, 110, y);
        if (shown.length) { caretX = 110 + ctx.measureText(shown).width + 6; caretY = y; }
        if (left <= 0) break;
        y += 64;
      }
      ctx.shadowBlur = 0;
      if (blink) { ctx.fillStyle = '#e8b45a'; ctx.fillRect(caretX, caretY + 4, 22, 40); }
    },
  };
}

/** Every cartridge's picture source, keyed by build id. */
export function collectSources(screen) {
  const sources = new Map();
  screen.querySelectorAll('[data-feed]').forEach((feed) => {
    const video = feed.querySelector('video');
    const img = feed.querySelector('img');
    const code = feed.querySelector('pre');
    if (video) {
      const poster = new Image();
      poster.src = video.getAttribute('poster');
      sources.set(feed.dataset.feed, { kind: 'video', video, poster });
    } else if (img) sources.set(feed.dataset.feed, { kind: 'img', img });
    else if (code) sources.set(feed.dataset.feed, { kind: 'term', term: terminal(code.textContent.split('\n')) });
  });
  return sources;
}

// The cabinet's CRT: the selected cartridge's picture (still, clip or typed terminal)
// drawn through a curved phosphor screen with scanlines and colour fringing. Changing
// cartridge rolls the picture through static. Raw WebGL2: one quad, one texture.
import { gsap } from 'gsap';
import { sceneLoop } from './mount.js';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uTexSize;
uniform float uTime, uSwitch, uStart;
in vec2 vUv;
out vec4 outColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 off = abs(uv.yx) / vec2(5.5, 4.5);
  uv += uv * off * off;
  return uv * 0.5 + 0.5;
}
vec2 cover(vec2 uv) {
  float sa = uRes.x / uRes.y, ta = uTexSize.x / max(uTexSize.y, 1.0);
  vec2 s = sa > ta ? vec2(1.0, ta / sa) : vec2(sa / ta, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main() {
  vec2 uv = curve(vUv);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { outColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
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
  float n = hash(vUv * uRes + fract(uTime) * 91.0);
  col = mix(col, vec3(n) * vec3(0.7, 0.8, 1.0), clamp(sw * 1.3, 0.0, 0.92));
  col += vec3(0.8, 0.9, 1.0) * uStart * uStart * 1.4;
  // Phosphor: scanlines, a slow bright band, a cobalt cast and the tube's vignette.
  col *= 0.86 + 0.14 * sin(vUv.y * uRes.y * 1.6);
  col *= 1.0 + 0.06 * smoothstep(0.08, 0.0, abs(fract(vUv.y - uTime * 0.12) - 0.5));
  col = col * vec3(0.95, 0.98, 1.06) + vec3(0.01, 0.015, 0.04);
  col *= smoothstep(1.28, 0.38, length((vUv - 0.5) * vec2(1.12, 1.0)));
  col += (hash(vUv * uRes * 0.5 + uTime) - 0.5) * 0.035;
  outColor = vec4(col, 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

/** A cartridge without a picture types its lines onto a terminal. */
function terminal(lines) {
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
      let y = 90;
      let caretX = 80;
      let caretY = 90;
      for (const line of text) {
        const shown = line.slice(0, Math.max(0, left));
        left -= line.length;
        ctx.fillStyle = line.startsWith('$') || line.startsWith('guest') ? '#7cf0b0' : '#9db6ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fillText(shown, 80, y);
        if (shown.length) { caretX = 80 + ctx.measureText(shown).width + 6; caretY = y; }
        if (left <= 0) break;
        y += 64;
      }
      ctx.shadowBlur = 0;
      if (blink) { ctx.fillStyle = '#e8b45a'; ctx.fillRect(caretX, caretY + 4, 22, 40); }
      return typed < total || true;
    },
  };
}

export function mount(screen) {
  const root = screen.closest('[data-arcade]');
  const canvas = screen.querySelector('[data-arcade-gl]');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return {};

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(['uTex', 'uRes', 'uTexSize', 'uTime', 'uSwitch', 'uStart'].map((name) => [name, gl.getUniformLocation(program, name)]));
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u.uTex, 0);

  // Every cartridge's picture source: an image, a clip (poster until it plays) or a terminal.
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

  let currentId = screen.querySelector('[data-feed][data-on]')?.dataset.feed;
  const state = { sw: 0, start: 0 };
  let texSize = [16, 9];
  let dirty = true;

  const upload = (element, w, h) => {
    if (!w || !h) return false;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
    texSize = [w, h];
    return true;
  };

  const refresh = (time) => {
    const source = sources.get(currentId);
    if (!source) return;
    if (source.kind === 'img') {
      if (dirty && source.img.complete && source.img.naturalWidth) dirty = !upload(source.img, source.img.naturalWidth, source.img.naturalHeight);
    } else if (source.kind === 'video') {
      const { video, poster } = source;
      if (!video.paused && video.readyState >= 2) upload(video, video.videoWidth, video.videoHeight);
      else if (dirty && poster.complete && poster.naturalWidth) dirty = !upload(poster, poster.naturalWidth, poster.naturalHeight);
    } else if (source.kind === 'term') {
      source.term.draw(time);
      upload(source.term.canvas, ...source.term.size);
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const frame = (time) => {
    refresh(time);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uTexSize, texSize[0], texSize[1]);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uSwitch, state.sw);
    gl.uniform1f(u.uStart, state.start);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = sceneLoop(canvas, (time) => frame(time));

  root.addEventListener('arcade:select', (event) => {
    gsap.killTweensOf(state);
    gsap.timeline()
      .to(state, { sw: 1, duration: 0.16, ease: 'power2.in' })
      .add(() => {
        currentId = event.detail.id;
        dirty = true;
        sources.get(currentId)?.term?.reset();
      })
      .to(state, { sw: 0, duration: 0.5, ease: 'power2.out' });
  });
  // Pressing start switches the tube off before the link opens.
  const observer = new MutationObserver(() => {
    if (root.dataset.starting === 'true') gsap.to(state, { start: 1, duration: 0.25, ease: 'power3.in' });
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-starting'] });
  addEventListener('pageshow', () => { delete root.dataset.starting; state.start = 0; });

  screen.dataset.gl = 'on';
  loop.wake();
  return {
    setMotion(on) {
      screen.dataset.gl = on ? 'on' : 'off';
      if (on) loop.wake();
    },
    destroy() { loop.stop(); observer.disconnect(); },
  };
}

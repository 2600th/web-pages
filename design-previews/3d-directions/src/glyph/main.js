import '../shared/base.css';
import './style.css';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadCharacter, HEIGHT } from '../shared/model.js';
import { hasWebGL, bindMotionToggle, createLoop, dpr, scrollProgress } from '../shared/env.js';

const $ = (s, r = document) => r.querySelector(s);
const stage = $('[data-stage]');
const canvas = $('[data-canvas]');
const hero = $('.gl-hero');
const lensLabel = $('[data-lens-label]');
const header = $('.gl-top');

let motion = true;
let loop;
motion = bindMotionToggle($('[data-motion-toggle]'), (on) => { motion = on; if (on) loop?.wake(); else loop?.renderOnce(); })();
addEventListener('scroll', () => { header.dataset.scrolled = String(scrollY > 40); }, { passive: true });

/* ---------------- Masthead fit ---------------- */
const masthead = $('[data-fit]');
function fitMasthead() {
  const span = masthead.firstElementChild;
  masthead.style.fontSize = '';
  const available = masthead.clientWidth;
  const size = parseFloat(getComputedStyle(masthead).fontSize);
  masthead.style.fontSize = `${(size * available) / span.scrollWidth}px`;
}
document.fonts.ready.then(fitMasthead);
new ResizeObserver(fitMasthead).observe(hero);

/* ---------------- Text decode (visual only, never on focus) ---------------- */
const NOISE = '#%@*+=-:/\\|<>[]{}0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function scramble(el, duration = 700) {
  if (!motion || el.dataset.busy) return;
  const text = el.dataset.text ?? el.textContent;
  el.dataset.text = text;
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
  el.dataset.busy = '1';
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const settled = Math.floor(p * text.length);
    el.textContent = [...text].map((ch, i) => (i < settled || ch === ' ' ? ch : NOISE[(Math.random() * NOISE.length) | 0])).join('');
    if (p < 1) requestAnimationFrame(step); else { el.textContent = text; delete el.dataset.busy; }
  };
  requestAnimationFrame(step);
}
document.querySelectorAll('[data-scramble]').forEach((el) => el.addEventListener('pointerenter', () => scramble(el, 380)));
const decodeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) { scramble(entry.target, 900); decodeObserver.unobserve(entry.target); } });
}, { threshold: 0.6 });
document.querySelectorAll('[data-decode]').forEach((el) => decodeObserver.observe(el));

/* ---------------- 1-bit dithered imagery ---------------- */
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];
function dither(img) {
  const w = 420;
  const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      const v = Math.min(1, Math.max(0, (l - 0.5) * 1.35 + 0.55));
      const t = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
      const on = v > t;
      d[i] = on ? 235 : 13; d[i + 1] = on ? 232 : 13; d[i + 2] = on ? 223 : 15; d[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  img.after(c);
}
document.querySelectorAll('[data-dither]').forEach((img) => {
  const run = () => dither(img);
  if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
});

/* ---------------- ASCII renderer ---------------- */
const RAMP = ' .:-=+*#%@';
const EDGES = '|/-\\';
const ATLAS = RAMP + EDGES;

function glyphAtlas() {
  const cw = 48, ch = 80;
  const c = document.createElement('canvas');
  c.width = cw * ATLAS.length; c.height = ch;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '600 58px "Martian Mono", "JetBrains Mono", monospace';
  [...ATLAS].forEach((g, i) => ctx.fillText(g, i * cw + cw / 2, ch / 2 + 2));
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

const asciiFragment = /* glsl */`
  uniform sampler2D tScene, tClay, tAtlas;
  uniform vec2 uGrid;
  uniform vec2 uResolution, uCell;
  uniform vec3 uLens; // x, y (px, bottom-left origin), radius px
  uniform vec3 uPaper, uInk, uCobalt, uVoid;
  uniform float uTime, uDecode, uGlyphs, uRamp, uDebug;
  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec3 display(vec3 linear) { return toneMapping(linear); }
  float field(vec2 uv) { vec4 s = texture(tClay, uv); return luma(display(s.rgb)) * 0.6 + s.a; }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 cell = floor(frag / uCell);
    vec2 inCell = fract(frag / uCell);
    vec2 center = (cell + 0.5) / uGrid;
    vec2 px = 1.0 / uGrid;
    vec4 src = texture(tClay, center);
    vec3 shown = display(src.rgb);
    float l = luma(shown);

    // Sobel on the cell grid, silhouette included, picks edge glyphs.
    float tl = field(center + px * vec2(-1, 1)), tc = field(center + px * vec2(0, 1)), tr = field(center + px * vec2(1, 1));
    float ml = field(center + px * vec2(-1, 0)), mr = field(center + px * vec2(1, 0));
    float bl = field(center + px * vec2(-1, -1)), bc = field(center + px * vec2(0, -1)), br = field(center + px * vec2(1, -1));
    float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
    float gy = (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br);
    float mag = length(vec2(gx, gy));
    float edgeAngle = atan(gy, gx) + 1.5707963;
    float bin = mod(floor((edgeAngle / 3.1415926) * 4.0 + 0.5), 4.0);
    // bins: 0 → horizontal edge '-', 1 → '/', 2 → '|', 3 → '\\'
    float edgeGlyph = bin < 0.5 ? 2.0 : bin < 1.5 ? 1.0 : bin < 2.5 ? 0.0 : 3.0;

    float density = 1.0 - smoothstep(0.08, 0.74, l);
    float index = floor(density * (uRamp - 1.0) + 0.5);
    if (mag > 1.5 && src.a > 0.2) index = uRamp + edgeGlyph;
    float reveal = step(hash(cell), uDecode);
    if (reveal < 0.5) index = 1.0 + floor(hash(cell + floor(uTime * 14.0)) * (uRamp - 1.0));

    vec2 auv = vec2((index + inCell.x) / uGlyphs, inCell.y);
    float g = smoothstep(0.18, 0.62, texture(tAtlas, auv).r);
    bool blue = shown.b > shown.r * 1.45 && shown.b > shown.g * 1.2 && shown.b > 0.06;
    vec3 ink = blue ? uCobalt : uInk;
    float cover = smoothstep(0.25, 0.55, src.a);
    // Dissolve the bust into the page instead of a hard crop.
    float fade = smoothstep(0.0, 0.16, center.y);
    cover *= step(hash(cell * 1.7), fade);
    vec4 outColor = vec4(mix(uPaper, ink, g) * cover, cover);

    // Lens: the untouched render inside, slight chromatic split at the rim.
    float d = distance(frag, uLens.xy);
    if (uLens.z > 1.0 && d < uLens.z) {
      vec2 uv = frag / uResolution;
      vec2 dir = (frag - uLens.xy) / uResolution;
      float k = pow(d / uLens.z, 6.0) * 0.045;
      float r = texture(tScene, uv - dir * k).r;
      vec4 gA = texture(tScene, uv);
      float b = texture(tScene, uv + dir * k).b;
      vec3 raw = display(vec3(r, gA.g, b) * 1.25);
      outColor = vec4(mix(uVoid, raw, gA.a), 1.0);
      float grain = hash(frag + uTime) * 0.03;
      outColor.rgb += grain;
    }
    float ring = smoothstep(1.5, 0.0, abs(d - uLens.z)) * step(1.0, uLens.z);
    outColor = mix(outColor, vec4(uInk, 1.0), ring);

    if (uDebug > 0.5) outColor = vec4(display(texture(tClay, frag / uResolution).rgb), 1.0);
    gl_FragColor = linearToOutputTexel(outColor);
  }
`;

async function start() {
  if (!hasWebGL()) throw new Error('webgl2 unavailable');
  await document.fonts.load('600 58px "Martian Mono"').catch(() => {});
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr(1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.setClearColor(0x000000, 0);

  const character = await loadCharacter();
  $('[data-stat-tris]').textContent = `${(character.geometry.index.count / 3).toLocaleString('en-US')} tris`;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight('#ffffff', '#40444f', 0.35));
  const key = new THREE.DirectionalLight('#ffffff', 3.0); key.position.set(-1.6, 2.0, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight('#9fb4ff', 5); rim.position.set(1.8, 1.4, -1.8); scene.add(rim);
  const figure = new THREE.Mesh(character.geometry, new THREE.MeshStandardMaterial({
    map: character.map, roughnessMap: character.material.roughnessMap, metalnessMap: character.material.metalnessMap,
    roughness: 1, metalness: 1, envMapIntensity: 0.6,
  }));
  scene.add(figure);
  // Clay pass: lifted albedo keeps beard, glasses and piping while lighting carries the form.
  const clay = figure.material.clone();
  clay.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      diffuseColor.rgb = mix(vec3(0.32), pow(diffuseColor.rgb, vec3(0.6)), 0.84);`);
  };
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 50);

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const clayTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const paper = new THREE.Color('#ebe8df');
  const uniforms = {
    tScene: { value: target.texture }, tClay: { value: clayTarget.texture }, tAtlas: { value: glyphAtlas() }, uGrid: { value: new THREE.Vector2(1, 1) },
    uResolution: { value: new THREE.Vector2(1, 1) }, uCell: { value: new THREE.Vector2(6, 10) },
    uLens: { value: new THREE.Vector3(-999, -999, 0) },
    uPaper: { value: paper }, uInk: { value: new THREE.Color('#0d0d0f') }, uCobalt: { value: new THREE.Color('#2340ff') }, uVoid: { value: new THREE.Color('#0d0d0f') },
    uTime: { value: 0 }, uDecode: { value: motion ? 0 : 1 }, uGlyphs: { value: ATLAS.length }, uRamp: { value: RAMP.length },
    uDebug: { value: new URLSearchParams(location.search).get('view') === 'clay' ? 1 : 0 },
  };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, fragmentShader: asciiFragment,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    depthTest: false, depthWrite: false,
  }));
  const post = new THREE.Scene(); post.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const lens = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, touch: false };
  const baseCell = () => (stage.clientWidth < 640 ? 6 : 7.5);
  let cols = 0, rows = 0;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    target.setSize(Math.round(w * pr), Math.round(h * pr));
    uniforms.uResolution.value.set(w * pr, h * pr);
    camera.aspect = w / h;
    // Waist-up portrait: the face gets enough glyph rows to read.
    const visible = 1.08;
    const dist = visible / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const lookY = HEIGHT + 0.06 - visible / 2;
    camera.position.set(0, lookY + 0.04, dist);
    camera.lookAt(0, lookY, 0);
    camera.updateProjectionMatrix();
    lens.touch = matchMedia('(pointer: coarse)').matches;
    loop?.renderOnce();
  }

  // Pointer lens (fine pointers), drifting lens with tap-to-place on touch.
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = canvas.getBoundingClientRect();
    lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top; lens.tr = Math.min(130, r.width * 0.28);
    if (!lens.r) { lens.x = lens.tx; lens.y = lens.ty; }
    loop?.wake(); if (!motion) frame(0, 1);
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { lens.tr = 0; loop?.wake(); if (!motion) frame(0, 1); } });
  let touchPlaced = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const r = canvas.getBoundingClientRect();
    lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top; touchPlaced = performance.now();
    loop?.wake();
  });

  let t = 0;
  let decodeStart = null;
  function frame(time, dt) {
    t += motion ? dt : 0;
    const w = stage.clientWidth, h = stage.clientHeight, pr = renderer.getPixelRatio();
    const progress = motion ? scrollProgress(hero) : 0;
    const cell = baseCell() * (1 + Math.min(1, scrollY / innerHeight) * 1.6);
    uniforms.uCell.value.set(cell * pr, cell * pr * 1.7);
    cols = Math.ceil(w / cell); rows = Math.ceil(h / (cell * 1.7));
    if (clayTarget.width !== cols || clayTarget.height !== rows) clayTarget.setSize(cols, rows);
    uniforms.uGrid.value.set(cols, rows);

    if (motion) {
      decodeStart ??= performance.now();
      uniforms.uDecode.value = Math.min(1, (performance.now() - decodeStart) / 1800);
    }
    uniforms.uTime.value = t;
    figure.rotation.y = motion ? Math.sin(t * 0.35) * 0.45 + (lens.r ? ((lens.x / w) - 0.5) * 0.3 : 0) : 0.25;

    // Touch: gently drift around the upper body unless recently placed.
    if (lens.touch) {
      lens.tr = Math.min(84, w * 0.22);
      if (performance.now() - touchPlaced > 4000) {
        lens.tx = w * (0.5 + Math.sin(t * 0.5) * 0.12);
        lens.ty = h * (0.2 + Math.sin(t * 0.37) * 0.08);
      }
    }
    const k = motion ? 1 - Math.exp(-10 * dt) : 1;
    lens.x += (lens.tx - lens.x) * k; lens.y += (lens.ty - lens.y) * k; lens.r += (lens.tr - lens.r) * k;
    if (lens.r < 0.5 && lens.tr === 0) lens.r = 0;
    uniforms.uLens.value.set(lens.x * pr, (h - lens.y) * pr, lens.r * pr);
    lensLabel.dataset.on = String(lens.r > 20);
    lensLabel.style.transform = `translate(${Math.round(lens.x + lens.r * 0.72)}px, ${Math.round(lens.y - lens.r * 0.72 - 20)}px)`;

    figure.material = clayMaterial;
    renderer.setRenderTarget(clayTarget);
    renderer.clear();
    renderer.render(scene, camera);
    if (lens.r > 0.5) {
      figure.material = colorMaterial;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
    }
    renderer.setRenderTarget(null);
    renderer.render(post, postCam);
    statCells.textContent = `${cols} × ${rows}`;
    void progress;
  }
  const statCells = $('[data-stat-cells]');
  const clayMaterial = clay;
  const colorMaterial = figure.material;

  loop = createLoop(stage, frame, () => motion || lens.touch);
  new ResizeObserver(resize).observe(stage);
  resize();
  addEventListener('scroll', () => { if (!motion) loop.renderOnce(); }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) $('[data-stat-lens]').textContent = 'Move the cursor over the figure';
  else $('[data-stat-lens]').textContent = 'Tap the figure';
  loop.renderOnce();
  loop.wake();
}

start().catch((error) => {
  console.warn('[glyph] falling back to poster:', error.message);
  document.documentElement.classList.add('no-webgl');
});

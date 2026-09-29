import '../shared/base.css';
import './style.css';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { loadCharacter, HEIGHT } from '../shared/model.js';
import { hasWebGL, bindMotionToggle, createLoop, dpr, trackPointer, scrollProgress } from '../shared/env.js';

const $ = (s, r = document) => r.querySelector(s);
const stage = $('[data-stage]');
const canvas = $('[data-canvas]');
const sequence = $('[data-sequence]');
const tune = $('[data-tune]');
const freqOut = $('[data-freq]');
const tuner = $('.sg-tuner');
const state = $('.sg-state');
const stateLabel = $('[data-state-label]');
const loading = $('[data-loading]');
const loadingPct = $('[data-loading-pct]');

const LOCK_HZ = 2600;
const signal = { hz: LOCK_HZ, detune: 0, targetDetune: 0, seize: 0, intro: 0, morph: 0 };

let motion = true;
let loop;
const motionOn = bindMotionToggle($('[data-motion-toggle]'), (on) => {
  motion = on;
  if (on) loop?.wake(); else loop?.renderOnce();
});
motion = motionOn();

/* ---------------- Tuner, readout and state ---------------- */
function setState(name, label) {
  state.dataset.state = name;
  stateLabel.textContent = label;
}
function detuneFor(hz) {
  const off = Math.abs(hz - LOCK_HZ);
  return off < 6 ? 0 : Math.min(1, Math.pow(off / 500, 0.7));
}
function renderReadout(hz) {
  freqOut.textContent = hz.toFixed(1).padStart(6, '0');
  const locked = Math.abs(hz - LOCK_HZ) < 6;
  tuner.dataset.locked = String(locked);
  return locked;
}
tune.addEventListener('input', () => {
  let hz = Number(tune.value);
  if (Math.abs(hz - LOCK_HZ) < 12) { hz = LOCK_HZ; }
  signal.hz = hz;
  signal.targetDetune = detuneFor(hz);
  const locked = renderReadout(hz);
  tune.setAttribute('aria-valuetext', `${hz} hertz${locked ? ', locked' : ''}`);
  setState(locked ? 'locked' : 'tuning', locked ? 'Locked · 2600 Hz' : 'Tuning');
  audio.follow(hz);
  loop?.wake();
  if (!motion) loop?.renderOnce();
});
tune.addEventListener('change', () => audio.release());

/* ---------------- Opt-in audio ---------------- */
const audio = (() => {
  let ctx, osc, gain, enabled = false;
  const ensure = () => {
    if (ctx) return;
    ctx = new AudioContext();
    gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 5200;
    gain.connect(filter).connect(ctx.destination);
    osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = LOCK_HZ;
    osc.connect(gain);
    osc.start();
  };
  return {
    toggle(on) { enabled = on; if (on) { ensure(); ctx.resume(); } else if (gain) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03); },
    follow(hz) {
      if (!enabled) return;
      osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.015);
      gain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.04);
    },
    release() { if (enabled) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.12); },
    burst(hz) {
      if (!enabled) return;
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(hz, t);
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.03);
      gain.gain.setValueAtTime(0.05, t + 0.9);
      gain.gain.linearRampToValueAtTime(0, t + 1.05);
    },
  };
})();

const soundButton = $('[data-sound]');
soundButton.addEventListener('click', () => {
  const on = soundButton.getAttribute('aria-pressed') !== 'true';
  soundButton.setAttribute('aria-pressed', String(on));
  $('[data-sound-label]').textContent = on ? 'Sound on' : 'Sound off';
  audio.toggle(on);
});

$('[data-seize]').addEventListener('click', () => {
  audio.burst(signal.hz);
  if (Math.abs(signal.hz - LOCK_HZ) < 6) {
    signal.seize = 1;
    setState('seized', 'Line seized');
    setTimeout(() => setState('locked', 'Locked · 2600 Hz'), 2200);
  } else {
    setState('tuning', 'No trunk · tune to 2600');
  }
  loop?.wake();
});

/* ---------------- Work lines: waves + monitor ---------------- */
function wavePath(cycles, amp = 11, w = 480, h = 32) {
  let d = '';
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.sin((x / 240) * cycles * Math.PI * 2) * amp;
    d += `${x ? 'L' : 'M'}${x} ${y.toFixed(2)}`;
  }
  return d;
}
const lines = [...document.querySelectorAll('.sg-line')];
const monitorImgs = [...document.querySelectorAll('[data-monitor-img]')];
const monitorLabel = $('[data-monitor-label]');
lines.forEach((line) => {
  const cycles = Math.round(Number(line.dataset.freqHz) * 2);
  const svg = line.querySelector('svg');
  svg.setAttribute('viewBox', '0 0 240 32');
  const path = svg.querySelector('path');
  path.setAttribute('d', wavePath(cycles));
  const activate = () => {
    lines.forEach((l) => l.classList.toggle('is-active', l === line));
    const index = Number(line.dataset.image);
    monitorImgs.forEach((img, i) => {
      const on = i === index;
      if (on && !img.classList.contains('is-on')) {
        img.classList.remove('is-tuning');
        void img.offsetWidth;
        img.classList.add('is-tuning');
      }
      img.classList.toggle('is-on', on);
    });
    monitorLabel.textContent = line.querySelector('.sg-line__no').textContent;
  };
  line.addEventListener('pointerenter', activate);
  line.addEventListener('focusin', activate);
});
lines[0]?.classList.add('is-active');

/* ---------------- WebGL point-cloud portrait ---------------- */
const vertexShader = /* glsl */`
  uniform float uTime, uDetune, uMorph, uSeize, uIntro, uSize, uPixelRatio, uRotY, uWaveWidth, uWaveY, uAspectBias;
  uniform sampler2D uMap;
  uniform vec3 uPointer;
  uniform float uPointerForce;
  attribute vec2 aUv;
  attribute vec3 aNormal;
  attribute vec2 aRand;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 p = rotY(position, uRotY);
    vec3 n = rotY(aNormal, uRotY);
    float h = position.y / ${HEIGHT.toFixed(2)};

    // Analog interference: horizontal tearing in travelling bands, scaled by detune.
    float band = smoothstep(0.55, 1.0, sin(h * 9.0 - uTime * 1.9 + sin(uTime * 0.7) * 2.0) * 0.5 + 0.5);
    float tear = (hash(floor(h * 140.0) + floor(uTime * 12.0)) - 0.5) * 0.9;
    float d = max(uDetune, 1.0 - uIntro);
    p.x += tear * band * d * 0.55;
    p += n * sin(h * 220.0 + uTime * 9.0 + aRand.x * 6.2831) * 0.012 * d;
    p.z += (aRand.y - 0.5) * d * 0.6;

    // Seize pulse: a bright ring travelling up the body.
    float ring = exp(-pow((h - (1.0 - uSeize) * 1.3 + 0.15) * 14.0, 2.0)) * uSeize;
    p += n * ring * 0.035;

    // Pointer field pushes points away in screen plane.
    vec2 away = p.xy - uPointer.xy;
    float fall = exp(-dot(away, away) * 55.0) * uPointerForce;
    p.xy += normalize(away + 1e-4) * fall * 0.07;
    p.z += fall * 0.05;

    // Morph target: an oscilloscope trace spanning the viewport.
    float u = aRand.x;
    float wx = (u - 0.5) * uWaveWidth;
    float carrier = sin(u * 6.2831 * 7.0 - uTime * 2.4) * 0.16 + sin(u * 6.2831 * 1.5 + uTime * 0.6) * 0.05;
    float thickness = (aRand.y - 0.5) * 0.012 * (1.0 + 2.0 * pow(abs(aRand.y - 0.5) * 2.0, 6.0));
    vec3 wave = vec3(wx, uWaveY + carrier + thickness, 0.0);
    float stagger = clamp(uMorph * 1.8 - (1.0 - h) * 0.55 - aRand.y * 0.25, 0.0, 1.0);
    stagger = stagger * stagger * (3.0 - 2.0 * stagger);
    p = mix(p, wave, stagger);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + ring * 2.5 + fall * 1.5) / -mv.z;

    // Colour: lift the very dark albedo, add form lighting and a cobalt rim.
    vec3 albedo = texture(uMap, aUv).rgb;
    vec3 viewN = normalize(normalMatrix * n);
    float lambert = max(dot(n, normalize(vec3(-0.4, 0.6, 0.8))), 0.0);
    float rim = pow(1.0 - abs(viewN.z), 2.2);
    vec3 cobalt = vec3(0.30, 0.45, 1.0);
    float face = smoothstep(0.8, 0.86, h);
    vec3 lit = pow(albedo, vec3(0.5)) * (0.75 + 1.7 * lambert) * (1.0 - face * 0.35) + cobalt * rim * 0.8;
    lit += vec3(1.0, 0.78, 0.4) * ring * 1.6;
    vec3 trace = mix(cobalt * 1.2, vec3(0.85, 0.9, 1.0), 0.15);
    lit = mix(lit, trace, stagger);
    lit = mix(lit, cobalt * (0.4 + tear), band * d * 0.5);
    vColor = lit;
    vAlpha = mix(0.9, 0.55, stagger) * (0.35 + 0.65 * uIntro);
  }
`;

const fragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = dot(c, c);
    if (r > 0.25) discard;
    float soft = smoothstep(0.25, 0.0, r);
    gl_FragColor = vec4(vColor * soft, vAlpha * soft);
  }
`;

async function start() {
  if (!hasWebGL()) throw new Error('webgl2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr(1.75));
  renderer.setClearColor(0x000000, 0);

  const character = await loadCharacter({ onProgress: (p) => { loadingPct.textContent = String(Math.round(p * 100)).padStart(2, '0'); } });
  const light = character.light;
  const count = light ? 70000 : 170000;
  // Weight sampling toward the head so the face reads as the focal point.
  const posAttr = character.geometry.getAttribute('position');
  const weights = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i) / HEIGHT;
    weights[i] = 1 + 3.5 * THREE.MathUtils.smoothstep(y, 0.8, 0.86);
  }
  character.geometry.setAttribute('weight', new THREE.BufferAttribute(weights, 1));
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(character.geometry)).setWeightAttribute('weight').build();
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const rand = new Float32Array(count * 2);
  const p = new THREE.Vector3(); const n = new THREE.Vector3(); const uv = new THREE.Vector2();
  for (let i = 0; i < count; i++) {
    sampler.sample(p, n, undefined, uv);
    positions.set([p.x, p.y, p.z], i * 3);
    normals.set([n.x, n.y, n.z], i * 3);
    uvs.set([uv.x, uv.y], i * 2);
    rand.set([Math.random(), Math.random()], i * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 2));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.9, 0), 50);

  const uniforms = {
    uTime: { value: 0 }, uDetune: { value: 0 }, uMorph: { value: 0 }, uSeize: { value: 0 }, uIntro: { value: motion ? 0 : 1 },
    uSize: { value: light ? 5.2 : 3.6 }, uPixelRatio: { value: renderer.getPixelRatio() }, uRotY: { value: 0 },
    uWaveWidth: { value: 6 }, uWaveY: { value: 0.9 }, uAspectBias: { value: 0 },
    uMap: { value: character.map }, uPointer: { value: new THREE.Vector3(99, 99, 0) }, uPointerForce: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const pointer = trackPointer();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let figureX = 0;
  let viewWidth = 1;

  function resize() {
    const { clientWidth: w, clientHeight: h } = stage;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const mobile = w < 736;
    const fill = mobile ? 0.54 : 0.84;
    const dist = (HEIGHT / fill) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    // On phones the figure sits in the upper part of the stage, above the copy.
    const lookY = mobile ? HEIGHT * 0.5 - 0.14 * (HEIGHT / fill) : HEIGHT * 0.5;
    camera.position.set(0, lookY, dist);
    camera.lookAt(0, lookY, 0);
    camera.updateProjectionMatrix();
    viewWidth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * camera.aspect;
    figureX = mobile ? 0 : viewWidth * 0.12;
    uniforms.uWaveWidth.value = viewWidth * 1.05;
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
    loop?.renderOnce();
  }

  const clock = { t: 0 };
  function frame(time, dt) {
    clock.t += dt;
    uniforms.uTime.value = motion ? clock.t : 2.0;
    pointer.update(dt);

    if (motion && signal.intro < 1) {
      // Wall-clock driven so slow devices still finish the lock on time.
      signal.introStart ??= performance.now();
      signal.intro = Math.min(1, (performance.now() - signal.introStart) / 2600);
      const e = 1 - Math.pow(1 - signal.intro, 3);
      const hz = 1200 + e * (signal.hz - 1200);
      renderReadout(hz);
      if (signal.intro >= 1) setState('locked', 'Locked · 2600 Hz');
    }
    uniforms.uIntro.value = motion ? 1 - Math.pow(1 - signal.intro, 3) : 1;

    signal.detune += (signal.targetDetune - signal.detune) * (1 - Math.exp(-6 * (dt || 1)));
    uniforms.uDetune.value = signal.detune;
    signal.seize = Math.max(0, signal.seize - dt / 1.6);
    uniforms.uSeize.value = signal.seize;

    const reduce = !motion;
    const progress = reduce ? 0 : scrollProgress(sequence);
    const morph = THREE.MathUtils.smoothstep(progress, 0.18, 0.62);
    uniforms.uMorph.value = morph;
    const mobile = stage.clientWidth < 736;
    uniforms.uWaveY.value = THREE.MathUtils.lerp(HEIGHT * (mobile ? 0.62 : 0.5), HEIGHT * (mobile ? 0.52 : 0.24), THREE.MathUtils.smoothstep(progress, 0.5, 0.85));

    // Slow idle turn plus pointer parallax.
    uniforms.uRotY.value = (motion ? Math.sin(clock.t * 0.25) * 0.18 : 0) + pointer.x * 0.35;
    points.position.x = THREE.MathUtils.lerp(figureX, 0, morph);

    if (pointer.active && motion) {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -((pointer.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uPointer.value.set(hit.x - points.position.x, hit.y, 0);
      uniforms.uPointerForce.value += (1 - uniforms.uPointerForce.value) * 0.1;
    } else {
      uniforms.uPointerForce.value *= 0.9;
    }

    renderer.render(scene, camera);
  }

  const isActive = () => motion || signal.seize > 0;
  loop = createLoop(stage, frame, isActive);
  new ResizeObserver(resize).observe(stage);
  resize();
  // Skip the tuning intro when motion is off or the visitor has already scrolled past the stage.
  if (!motion || scrollY > innerHeight) { signal.intro = 1; renderReadout(signal.hz); setState('locked', 'Locked · 2600 Hz'); }
  loop.renderOnce();
  loop.wake();
  addEventListener('scroll', () => { if (!motion) return; loop.wake(); }, { passive: true });
  loading.hidden = true;
  setTimeout(() => { if (signal.intro < 1) { signal.intro = 1; renderReadout(signal.hz); setState('locked', 'Locked · 2600 Hz'); } }, 3200);
}

const header = $('.sg-top');
const onScroll = () => { header.dataset.scrolled = String(scrollY > 40); };
addEventListener('scroll', onScroll, { passive: true });
onScroll();

setState('idle', 'Acquiring carrier');
start().catch((error) => {
  console.warn('[signal] falling back to poster:', error.message);
  document.documentElement.classList.add('no-webgl');
  loading.hidden = true;
  renderReadout(LOCK_HZ);
  setState('locked', 'Locked · 2600 Hz');
});

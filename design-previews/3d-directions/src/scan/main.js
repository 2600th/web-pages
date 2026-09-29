import '../shared/base.css';
import './style.css';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadCharacter, snapAnchors, HEIGHT } from '../shared/model.js';
import { hasWebGL, bindMotionToggle, createLoop, dpr, trackPointer } from '../shared/env.js';

const $ = (s, r = document) => r.querySelector(s);
const stage = $('[data-stage]');
const canvas = $('[data-canvas]');
const leaders = $('[data-leaders]');
const ruler = $('[data-ruler]');
const rulerMark = $('[data-ruler-mark]');
const scanPct = $('[data-scan-pct]');
const zoneLabel = $('[data-zone-label]');
const loading = $('[data-loading]');
const loadingPct = $('[data-loading-pct]');
const header = $('.sc-top');

let motion = true;
let loop;
motion = bindMotionToggle($('[data-motion-toggle]'), (on) => { motion = on; if (on) loop?.wake(); else loop?.renderOnce(); })();

addEventListener('scroll', () => { header.dataset.scrolled = String(scrollY > 40); }, { passive: true });

const ZONE_NAMES = { hero: 'Full body', glasses: 'Zone 01 · Optics', harness: 'Zone 02 · Harness', boots: 'Zone 03 · Footing' };

/* ---------------- Scan material ---------------- */
function scanMaterial(source, uniforms) {
  const material = new THREE.MeshStandardMaterial({
    map: source.map,
    roughnessMap: source.roughnessMap,
    metalnessMap: source.metalnessMap,
    roughness: 1,
    metalness: 1,
    envMapIntensity: 0.5,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vScanWorld;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvScanWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`#include <common>
        uniform float uScanY, uDensity, uTime, uReveal;
        uniform vec3 uCobalt, uLaser;
        varying vec3 vScanWorld;
        float bayer4(vec2 p) {
          ivec2 i = ivec2(mod(p, 4.0));
          int index = i.x + i.y * 4;
          int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
          return (float(m[index]) + 0.5) / 16.0;
        }`)
      .replace('#include <clipping_planes_fragment>', /* glsl */`#include <clipping_planes_fragment>
        float scanLine = min(uScanY, uReveal);
        float above = step(scanLine, vScanWorld.y);
        float lc = vScanWorld.y * uDensity;
        float lw = fwidth(lc);
        float contour = 1.0 - clamp(abs(fract(lc - 0.5) - 0.5) / (lw * 1.25), 0.0, 1.0);
        float fine = 1.0 - clamp(abs(fract(lc * 4.0 - 0.5) - 0.5) / (lw * 4.0 * 1.1), 0.0, 1.0);
        vec3 nView = normalize(vNormal);
        float fres = pow(1.0 - abs(dot(nView, normalize(vViewPosition))), 1.6);
        float fill = 0.015 + fres * 0.3;
        if (above > 0.5 && contour < 0.05 && bayer4(gl_FragCoord.xy) > fill) discard;`)
      .replace('#include <opaque_fragment>', /* glsl */`#include <opaque_fragment>
        if (above > 0.5) {
          float strength = max(contour, fine * 0.25);
          vec3 scanCol = uCobalt * (0.3 + 1.8 * fres) * mix(0.55, 1.3, strength);
          gl_FragColor = vec4(scanCol, 1.0);
        }
        float d = vScanWorld.y - scanLine;
        float band = exp(-abs(d) * 160.0);
        float glow = exp(-abs(d) * 16.0) * 0.1;
        gl_FragColor.rgb += uLaser * (band * 2.6 + glow);`);
  };
  return material;
}

/* ---------------- Scan plane + turntable ---------------- */
function scanPlane(uniforms) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uLaser: uniforms.uLaser, uTime: uniforms.uTime, uOpacity: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      uniform vec3 uLaser;
      uniform float uTime, uOpacity;
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p) * 2.0;
        float fall = smoothstep(1.0, 0.05, r);
        vec2 g = abs(fract(vUv * 28.0 - 0.5) - 0.5) / fwidth(vUv * 28.0);
        float grid = 1.0 - min(min(g.x, g.y), 1.0);
        float pulse = smoothstep(0.03, 0.0, abs(fract(r * 1.2 - uTime * 0.25) - 0.5));
        float edge = smoothstep(0.012, 0.0, abs(r - 0.92));
        float a = (fall * (0.05 + grid * 0.16 + pulse * 0.12) + edge * 0.35) * uOpacity;
        gl_FragColor = vec4(uLaser * a, a);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 2;
  return mesh;
}

function turntable() {
  const group = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4a74ff, transparent: true, opacity: 0.45 });
  const faint = new THREE.LineBasicMaterial({ color: 0xe9ecf2, transparent: true, opacity: 0.12 });
  const circle = (r, mat, seg = 128) => {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.002, Math.sin(a) * r)); }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
  };
  group.add(circle(0.46, lineMat), circle(0.62, faint), circle(0.9, faint));
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2; const l = i % 6 === 0 ? 0.06 : 0.025;
    ticks.push(new THREE.Vector3(Math.cos(a) * 0.62, 0.002, Math.sin(a) * 0.62), new THREE.Vector3(Math.cos(a) * (0.62 + l), 0.002, Math.sin(a) * (0.62 + l)));
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks), lineMat));
  return group;
}

/* ---------------- Shots ---------------- */
const SHOTS = {
  hero: { pos: [0, 1.0, 4.95], target: [0, 0.9, 0], offX: 0.15, offY: 0, rot: null },
  glasses: { pos: [0.42, 1.68, 1.42], target: [0.02, 1.56, 0.02], offX: 0.2, offY: 0, rot: 0.22 },
  harness: { pos: [-0.62, 1.38, 1.5], target: [0, 1.2, 0.02], offX: 0.2, offY: 0, rot: -0.35 },
  boots: { pos: [0.78, 0.5, 1.35], target: [0.06, 0.2, 0.05], offX: 0.2, offY: 0, rot: 0.4 },
};
const MOBILE_SHOTS = {
  hero: { pos: [0, 0.95, 7.6], target: [0, 0.95, 0], offX: 0, offY: 0.13, rot: null },
  glasses: { pos: [0.3, 1.7, 1.25], target: [0.02, 1.62, 0.02], offX: 0, offY: 0.22, rot: 0.22 },
  harness: { pos: [-0.62, 1.38, 1.75], target: [0, 1.22, 0.02], offX: 0, offY: 0.22, rot: -0.35 },
  boots: { pos: [0.8, 0.5, 1.6], target: [0.06, 0.22, 0.05], offX: 0, offY: 0.22, rot: 0.4 },
};
const CALLOUT_OFFSETS = {
  desktop: { glasses: [96, -44], harness: [-120, -24], boots: [84, -40] },
  mobile: { glasses: [40, -30], harness: [-44, -12], boots: [40, -26] },
};

async function start() {
  if (!hasWebGL()) throw new Error('webgl2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr(1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const character = await loadCharacter({ onProgress: (p) => { loadingPct.textContent = String(Math.round(p * 100)).padStart(2, '0'); } });
  const anchors = snapAnchors(character.geometry);

  const uniforms = {
    uScanY: { value: 0 }, uReveal: { value: motion ? 0 : 99 }, uDensity: { value: 90 }, uTime: { value: 0 },
    uCobalt: { value: new THREE.Color('#4a74ff') }, uLaser: { value: new THREE.Color('#ffb547') },
  };

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  scene.add(new THREE.HemisphereLight('#8fa6ff', '#0b0c10', 0.9));
  const key = new THREE.DirectionalLight('#fff4e6', 3.4); key.position.set(-1.2, 2.2, 2.4); scene.add(key);
  const rim = new THREE.DirectionalLight('#4a74ff', 6); rim.position.set(1.6, 1.6, -2); scene.add(rim);
  const kick = new THREE.DirectionalLight('#ffb547', 2.2); kick.position.set(-2, 0.4, -1.4); scene.add(kick);

  const figure = new THREE.Group();
  const body = new THREE.Mesh(character.geometry, scanMaterial(character.material, uniforms));
  figure.add(body);
  scene.add(figure);
  const table = turntable();
  scene.add(table);
  const plane = scanPlane(uniforms);
  scene.add(plane);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  const current = { pos: new THREE.Vector3(...SHOTS.hero.pos), target: new THREE.Vector3(...SHOTS.hero.target), offX: SHOTS.hero.offX, offY: 0, rot: 0 };
  const pointer = trackPointer();
  const raycaster = new THREE.Raycaster();
  const figurePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let pointerOnStage = false;
  stage.addEventListener('pointermove', (e) => { pointerOnStage = e.pointerType !== 'touch'; });
  stage.addEventListener('pointerleave', () => { pointerOnStage = false; });
  document.querySelectorAll('.sc-hero, .sc-zone').forEach((el) => {
    el.addEventListener('pointermove', (e) => { pointerOnStage = e.pointerType !== 'touch' && !e.target.closest('a, .sc-panel'); });
  });

  // Shot keys in document scroll space.
  const sections = [...document.querySelectorAll('[data-shot]')];
  let keys = [];
  let mobile = false;
  function measure() {
    mobile = stage.clientWidth < 736;
    keys = sections.map((section, i) => {
      const top = section.getBoundingClientRect().top + scrollY;
      if (i === 0) return { at: 0, name: section.dataset.shot };
      const panel = section.querySelector('.sc-panel') ?? section;
      const panelTop = panel.getBoundingClientRect().top + scrollY;
      return { at: Math.max(top, panelTop - innerHeight * 0.55), name: section.dataset.shot };
    });
  }

  function resize() {
    const w = stage.clientWidth; const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    measure();
    loop?.renderOnce();
  }

  function shotBlend() {
    const s = scrollY;
    let i = 0;
    while (i < keys.length - 1 && s >= keys[i + 1].at) i++;
    const a = keys[i]; const b = keys[i + 1];
    if (!b) return { a: a.name, b: a.name, t: 0 };
    const span = Math.max(1, (b.at - a.at) * 0.6);
    const t = THREE.MathUtils.smoothstep(s, b.at - span, b.at);
    return { a: a.name, b: b.name, t };
  }

  const tmp = new THREE.Vector3();
  const heroRot = { v: 0 };
  let introStart = null;
  let t = 0;
  const lineEls = {};
  const dotEls = {};
  for (const name of Object.keys(CALLOUT_OFFSETS.desktop)) {
    lineEls[name] = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dotEls[name] = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dotEls[name].setAttribute('r', '4');
    leaders.append(lineEls[name], dotEls[name]);
  }
  const callouts = Object.fromEntries([...document.querySelectorAll('[data-callout]')].map((el) => [el.dataset.callout, el]));

  function project(v) {
    tmp.copy(v).project(camera);
    return [(tmp.x * 0.5 + 0.5) * stage.clientWidth, (-tmp.y * 0.5 + 0.5) * stage.clientHeight, tmp.z];
  }

  function frame(time, dt) {
    t += motion ? dt : 0;
    uniforms.uTime.value = t;
    pointer.update(dt);
    const shots = mobile ? MOBILE_SHOTS : SHOTS;
    const blend = shotBlend();
    const A = shots[blend.a]; const B = shots[blend.b];
    const k = motion ? 1 - Math.exp(-5 * dt) : 1;

    // Camera path.
    const goalPos = new THREE.Vector3(...A.pos).lerp(new THREE.Vector3(...B.pos), blend.t);
    const goalTarget = new THREE.Vector3(...A.target).lerp(new THREE.Vector3(...B.target), blend.t);
    if (blend.a === 'hero' && blend.t < 1 && motion) goalPos.x += pointer.x * 0.25 * (1 - blend.t);
    current.pos.lerp(goalPos, k);
    current.target.lerp(goalTarget, k);
    current.offX += (THREE.MathUtils.lerp(A.offX, B.offX, blend.t) - current.offX) * k;
    current.offY += (THREE.MathUtils.lerp(A.offY, B.offY, blend.t) - current.offY) * k;
    camera.position.copy(current.pos);
    camera.lookAt(current.target);
    const w = stage.clientWidth; const h = stage.clientHeight;
    camera.setViewOffset(w, h, -current.offX * w, current.offY * h, w, h);
    camera.updateProjectionMatrix();

    // Figure: gentle turntable in the hero, squared up for each zone.
    heroRot.v = motion ? Math.sin(t * 0.22) * 0.55 : 0.2;
    const rotA = A.rot ?? heroRot.v; const rotB = B.rot ?? heroRot.v;
    const goalRot = THREE.MathUtils.lerp(rotA, rotB, blend.t);
    current.rot += (goalRot - current.rot) * k;
    figure.rotation.y = current.rot;
    table.rotation.y = current.rot * 1.5;

    // Scan height: intro sweep, then pointer-steered or idle sweep; zones scan locally.
    if (motion && introStart === null) introStart = performance.now();
    const intro = motion ? Math.min(1, (performance.now() - introStart) / 3200) : 1;
    uniforms.uReveal.value = motion ? THREE.MathUtils.lerp(-0.05, HEIGHT + 0.2, 1 - Math.pow(1 - intro, 2)) + (intro >= 1 ? 99 : 0) : 99;
    let heroScan;
    if (intro < 1) heroScan = HEIGHT + 0.2;
    else if (pointerOnStage && pointer.active && motion) {
      raycaster.setFromCamera(new THREE.Vector2(pointer.tx, pointer.ty), camera);
      heroScan = raycaster.ray.intersectPlane(figurePlane, hit) ? THREE.MathUtils.clamp(hit.y, -0.02, HEIGHT + 0.1) : uniforms.uScanY.value;
    } else heroScan = motion ? HEIGHT * 0.52 + Math.sin(t * 0.45) * HEIGHT * 0.5 : HEIGHT * 0.58;
    const zoneScan = (name) => (name === 'hero' ? heroScan : anchors[name].y + (motion ? Math.sin(t * 1.3) * 0.09 : 0.05));
    const goalScan = THREE.MathUtils.lerp(zoneScan(blend.a), zoneScan(blend.b), blend.t);
    uniforms.uScanY.value += (goalScan - uniforms.uScanY.value) * (motion ? 1 - Math.exp(-7 * dt) : 1);
    const scanY = Math.min(uniforms.uScanY.value, uniforms.uReveal.value);
    plane.position.y = scanY;
    plane.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(1 - Math.abs(scanY - HEIGHT * 0.5) / (HEIGHT * 0.75), 0.25, 1);
    plane.scale.setScalar(blend.b === 'hero' ? 1 : THREE.MathUtils.lerp(1, 0.7, blend.t));

    const pct = THREE.MathUtils.clamp(scanY / HEIGHT, 0, 1);
    scanPct.textContent = String(Math.round(pct * 100)).padStart(3, '0');
    zoneLabel.textContent = ZONE_NAMES[blend.t > 0.5 ? blend.b : blend.a];

    renderer.render(scene, camera);

    // HUD: ruler and callouts follow projected anchors.
    const inHero = blend.a === 'hero' && blend.t < 0.4;
    ruler.dataset.on = String(inHero);
    if (inHero) {
      const base = project(new THREE.Vector3(-0.62, 0, 0));
      const top = project(new THREE.Vector3(-0.62, HEIGHT, 0));
      ruler.style.transform = `translate(${base[0] - 40}px, ${top[1]}px)`;
      ruler.style.height = `${base[1] - top[1]}px`;
      rulerMark.style.bottom = `${pct * 100}%`;
    }
    const offsets = mobile ? CALLOUT_OFFSETS.mobile : CALLOUT_OFFSETS.desktop;
    const activeZone = blend.t > 0.5 ? blend.b : blend.a;
    for (const [name, el] of Object.entries(callouts)) {
      const world = figure.localToWorld(anchors[name].clone());
      const [x, y, z] = project(world);
      const [ox, oy] = offsets[name];
      const acquired = uniforms.uReveal.value >= anchors[name].y;
      const visible = activeZone === 'hero' ? acquired && z < 1 : activeZone === name;
      const hot = activeZone === name || Math.abs(scanY - anchors[name].y) < 0.07;
      el.dataset.visible = String(visible);
      el.dataset.hot = String(hot && visible);
      // The leader meets the box edge nearest the anchor.
      const box = el.firstElementChild;
      const left = ox < 0 ? x + ox - box.offsetWidth : x + ox;
      el.style.transform = `translate(${Math.round(left)}px, ${Math.round(y + oy - box.offsetHeight / 2)}px)`;
      const attachX = x + ox;
      const line = lineEls[name]; const dot = dotEls[name];
      line.setAttribute('x1', x); line.setAttribute('y1', y);
      line.setAttribute('x2', attachX); line.setAttribute('y2', y + oy);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      line.style.opacity = dot.style.opacity = visible ? '1' : '0';
      line.classList.toggle('is-hot', hot && visible);
      dot.classList.toggle('is-hot', hot && visible);
    }
  }

  loop = createLoop(stage, frame, () => motion);
  new ResizeObserver(resize).observe(document.body);
  resize();
  addEventListener('scroll', () => { if (motion) loop.wake(); else loop.renderOnce(); }, { passive: true });
  loop.renderOnce();
  loop.wake();
  loading.hidden = true;
}

start().catch((error) => {
  console.warn('[scan] falling back to poster:', error.message);
  document.documentElement.classList.add('no-webgl');
  loading.hidden = true;
  document.querySelectorAll('[data-callout]').forEach((el) => { el.dataset.visible = 'false'; });
});

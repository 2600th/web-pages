import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadCharacter, HEIGHT } from '../shared/model.js';
import { createLoop, dpr } from '../shared/env.js';

/* Point shader: portrait ⇄ oscilloscope traces. */
const pointVertex = /* glsl */`
  uniform float uTime, uAssemble, uDetune, uMorph, uMode, uSeize, uSize, uPixelRatio, uRotY, uWaveWidth, uWaveY, uWaveAmp;
  uniform sampler2D uMap;
  uniform vec3 uPointer;
  uniform float uPointerForce;
  attribute vec2 aUv;
  attribute vec3 aNormal;
  attribute vec3 aStart;
  attribute vec3 aRand;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  const float TAU = 6.2831853;

  float trace(float u, float t, float lane) {
    float sine = sin(TAU * 7.0 * u - t * 2.4);
    float breath = 0.72 + 0.28 * sin(TAU * 1.3 * u + t * 0.9);
    float whistle = breath * sin(TAU * 7.0 * u - t * 3.1) + (hash(floor(u * 900.0) + floor(t * 24.0)) - 0.5) * 0.18;
    float mf = lane < 0.5 ? sin(TAU * 5.5 * u - t * 2.2) : sin(TAU * 8.5 * u - t * 3.4);
    float flat_ = 0.12 * sin(TAU * 3.0 * u - t * 1.2);
    float w0 = clamp(1.0 - abs(uMode - 0.0), 0.0, 1.0);
    float w1 = clamp(1.0 - abs(uMode - 1.0), 0.0, 1.0);
    float w2 = clamp(1.0 - abs(uMode - 2.0), 0.0, 1.0);
    float w3 = clamp(1.0 - abs(uMode - 3.0), 0.0, 1.0);
    return sine * w0 + whistle * w1 + mf * w2 + flat_ * w3;
  }

  void main() {
    float h = position.y / ${HEIGHT.toFixed(2)};
    vec3 p = rotY(position, uRotY);
    vec3 n = rotY(aNormal, uRotY);

    // Analog interference: horizontal tearing in travelling bands.
    float band = smoothstep(0.55, 1.0, sin(h * 9.0 - uTime * 1.9 + sin(uTime * 0.7) * 2.0) * 0.5 + 0.5);
    float tear = (hash(floor(h * 140.0) + floor(uTime * 12.0)) - 0.5);
    p.x += tear * band * uDetune * 0.5;
    p += n * sin(h * 220.0 + uTime * 9.0 + aRand.x * TAU) * 0.012 * uDetune;
    p.z += (aRand.y - 0.5) * uDetune * 0.5;

    // Seize: a gold ring runs up the body.
    float ring = exp(-pow((h - (1.0 - uSeize) * 1.3 + 0.15) * 14.0, 2.0)) * uSeize;
    p += n * ring * 0.04;

    // Pointer: concentric interference radiating from the cursor.
    vec2 away = p.xy - uPointer.xy;
    float d = length(away);
    float ripple = sin(d * 70.0 - uTime * 14.0) * exp(-d * 7.0) * uPointerForce;
    p += n * ripple * 0.018;
    p.xy += normalize(away + 1e-4) * exp(-d * d * 60.0) * uPointerForce * 0.05;

    // Assembly from noise on first load, staggered from the head down.
    float delay = (1.0 - h) * 0.45 + aRand.z * 0.4;
    float a = clamp((uAssemble * 1.85 - delay) / 0.9, 0.0, 1.0);
    a = 1.0 - pow(1.0 - a, 3.0);
    vec3 swirl = rotY(aStart, (1.0 - a) * 2.4);
    p = mix(swirl, p, a);

    // Morph target: oscilloscope traces across the viewport.
    float u = aRand.x;
    float lane = step(0.5, aRand.z);
    float mfOffset = clamp(1.0 - abs(uMode - 2.0), 0.0, 1.0) * (lane - 0.5) * 0.34;
    float thick = (aRand.y - 0.5) * 0.012 * (1.0 + 2.5 * pow(abs(aRand.y - 0.5) * 2.0, 6.0));
    vec3 wave = vec3((u - 0.5) * uWaveWidth, uWaveY + mfOffset + trace(u, uTime, lane) * uWaveAmp + thick, 0.0);
    float stagger = clamp(uMorph * 1.8 - (1.0 - h) * 0.55 - aRand.y * 0.25, 0.0, 1.0);
    stagger = stagger * stagger * (3.0 - 2.0 * stagger);
    p = mix(p, wave, stagger);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + ring * 2.5 + abs(ripple) * 1.2 + (1.0 - a) * 1.5) / -mv.z;

    // Colour: lifted albedo, form lighting, cobalt rim; traces glow cobalt (and gold on CH2).
    vec3 albedo = texture(uMap, aUv).rgb;
    vec3 viewN = normalize(normalMatrix * n);
    float lambert = max(dot(n, normalize(vec3(-0.4, 0.6, 0.8))), 0.0);
    float rim = pow(1.0 - abs(viewN.z), 2.2);
    float face = smoothstep(0.8, 0.86, h);
    vec3 cobalt = vec3(0.30, 0.45, 1.0);
    vec3 gold = vec3(1.0, 0.72, 0.34);
    vec3 lit = (pow(albedo, vec3(0.5)) * (0.6 + 1.25 * lambert) * (1.0 - face * 0.45) + cobalt * rim * 0.7) * 0.72;
    lit += gold * ring * 1.8 + cobalt * abs(ripple) * 0.6;
    lit = mix(cobalt * 1.3, lit, a);
    float ch2 = clamp(1.0 - abs(uMode - 2.0), 0.0, 1.0) * lane;
    vec3 traceCol = mix(mix(cobalt * 1.25, vec3(0.8, 0.86, 1.0), 0.18), gold * 1.1, ch2);
    lit = mix(lit, traceCol, stagger);
    lit = mix(lit, cobalt * (0.5 + tear), band * uDetune * 0.5);
    vColor = lit;
    vAlpha = mix(0.9, 0.34, stagger) * (0.25 + 0.75 * a);
  }
`;

const pointFragment = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = dot(c, c);
    if (r > 0.25) discard;
    float soft = smoothstep(0.25, 0.0, r);
    gl_FragColor = vec4(vColor * soft * vAlpha, 1.0);
  }
`;

/* CRT pass: graticule, scanlines, detune-driven tearing and colour split. */
const CRTShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uDetune: { value: 0 }, uResolution: { value: new THREE.Vector2(1, 1) },
    uGrid: { value: 0.5 }, uGridCenter: { value: new THREE.Vector2(0.62, 0.5) }, uSeize: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime, uDetune, uGrid, uSeize;
    uniform vec2 uResolution, uGridCenter;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      float row = floor(uv.y * 90.0);
      float tearRow = step(0.96 - uDetune * 0.12, hash(vec2(row, floor(uTime * 18.0))));
      uv.x += (hash(vec2(row, floor(uTime * 30.0))) - 0.5) * 0.03 * uDetune * tearRow;
      vec2 dir = uv - 0.5;
      float ca = 0.0012 + uDetune * 0.007;
      vec3 col = vec3(texture2D(tDiffuse, uv - dir * ca).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv + dir * ca).b);

      vec2 px = vUv * uResolution;
      vec2 cell = uResolution / vec2(12.0, 8.0);
      vec2 g = abs(fract(px / cell) - 0.5) * cell;
      float major = 1.0 - smoothstep(0.0, 1.2, min(abs(g.x - cell.x * 0.5), abs(g.y - cell.y * 0.5)));
      vec2 tick = abs(fract(px / (cell / 5.0)) - 0.5) * (cell / 5.0);
      vec2 axis = abs(px - uGridCenter * uResolution);
      float ticks = (1.0 - smoothstep(0.0, 1.0, abs(tick.x - cell.x * 0.1))) * step(axis.y, 5.0)
                  + (1.0 - smoothstep(0.0, 1.0, abs(tick.y - cell.y * 0.1))) * step(axis.x, 5.0);
      float mask = smoothstep(0.85, 0.15, length((vUv - uGridCenter) * vec2(1.3, 1.0)));
      col += vec3(0.45, 0.55, 1.0) * (major * 0.05 + ticks * 0.08) * uGrid * mask;

      col *= 0.955 + 0.045 * sin(px.y * 3.14159);
      col *= smoothstep(1.25, 0.3, length(dir * vec2(1.15, 1.0)));
      col += vec3(1.0, 0.75, 0.35) * uSeize * 0.06 * (1.0 - length(dir));
      col += (hash(px + fract(uTime) * 100.0) - 0.5) * 0.02;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export async function createSignalEngine({ canvas, stage, motion, onProgress }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const light = matchMedia('(max-width: 760px), (pointer: coarse)').matches || (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4);
  renderer.setPixelRatio(dpr(light ? 1.5 : 1.75));
  renderer.toneMapping = THREE.NoToneMapping;

  const character = await loadCharacter({ light, onProgress });
  const count = light ? 70000 : 170000;

  // Denser sampling on the head so the face reads first.
  const posAttr = character.geometry.getAttribute('position');
  const weights = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) weights[i] = 1 + 2.4 * THREE.MathUtils.smoothstep(posAttr.getY(i) / HEIGHT, 0.8, 0.86);
  character.geometry.setAttribute('weight', new THREE.BufferAttribute(weights, 1));
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(character.geometry)).setWeightAttribute('weight').build();

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const starts = new Float32Array(count * 3);
  const rands = new Float32Array(count * 3);
  const p = new THREE.Vector3(); const n = new THREE.Vector3(); const uv = new THREE.Vector2();
  for (let i = 0; i < count; i++) {
    sampler.sample(p, n, undefined, uv);
    positions.set([p.x, p.y, p.z], i * 3);
    normals.set([n.x, n.y, n.z], i * 3);
    uvs.set([uv.x, uv.y], i * 2);
    const r = 1.2 + Math.random() * 2.2; const th = Math.random() * Math.PI * 2; const ph = Math.acos(Math.random() * 2 - 1);
    starts.set([Math.sin(ph) * Math.cos(th) * r * 1.6, HEIGHT * 0.5 + Math.cos(ph) * r * 0.7, Math.sin(ph) * Math.sin(th) * r], i * 3);
    rands.set([Math.random(), Math.random(), Math.random()], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aStart', new THREE.BufferAttribute(starts, 3));
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 3));

  const uniforms = {
    uTime: { value: 0 }, uAssemble: { value: motion ? 0 : 1 }, uDetune: { value: 0 }, uMorph: { value: 0 }, uMode: { value: 0 }, uSeize: { value: 0 },
    uSize: { value: light ? 5.4 : 3.7 }, uPixelRatio: { value: renderer.getPixelRatio() }, uRotY: { value: 0 },
    uWaveWidth: { value: 6 }, uWaveY: { value: 0.9 }, uWaveAmp: { value: 0.16 },
    uMap: { value: character.map }, uPointer: { value: new THREE.Vector3(99, 99, 0) }, uPointerForce: { value: 0 },
  };
  const points = new THREE.Points(geometry, new THREE.ShaderMaterial({
    vertexShader: pointVertex, fragmentShader: pointFragment, uniforms,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  }));
  points.frustumCulled = false;

  const scene = new THREE.Scene();
  const background = new THREE.Color('#03040a');
  scene.background = background;
  scene.add(points);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = light ? null : new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.4, 0.42);
  if (bloom) composer.addPass(bloom);
  const crt = new ShaderPass(CRTShader);
  composer.addPass(crt);
  composer.addPass(new OutputPass());

  // Public state, driven by the tuner, scroll and pointer.
  const state = {
    detune: 0, targetDetune: 0, morph: 0, mode: 0, seize: 0, assemble: motion ? 0 : 1,
    pointer: { x: 0, y: 0, clientX: -1, clientY: -1, active: false }, motion,
    waveRow: 0.76, gridAmount: 0.45, onFrame: null,
  };
  let figureX = 0; let viewWidth = 1; let viewHeight = 1; let lookY = HEIGHT * 0.5; let mobile = false;

  function resize() {
    const w = stage.clientWidth; const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    const pr = renderer.getPixelRatio();
    crt.uniforms.uResolution.value.set(w * pr, h * pr);
    if (bloom) bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    mobile = w < 736;
    const fill = mobile ? 0.54 : 0.84;
    const dist = (HEIGHT / fill) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    lookY = mobile ? HEIGHT * 0.5 - 0.14 * (HEIGHT / fill) : HEIGHT * 0.5;
    camera.position.set(0, lookY, dist);
    camera.lookAt(0, lookY, 0);
    camera.updateProjectionMatrix();
    viewHeight = HEIGHT / fill;
    viewWidth = viewHeight * camera.aspect;
    figureX = mobile ? 0 : viewWidth * 0.14;
    uniforms.uWaveWidth.value = viewWidth * 1.08;
    uniforms.uWaveAmp.value = Math.min(0.16, viewHeight * 0.075);
    uniforms.uPixelRatio.value = pr;
    crt.uniforms.uGridCenter.value.set(mobile ? 0.5 : 0.64, mobile ? 0.64 : 0.5);
  }

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  let clock = 0;
  let assembleStart = null;

  function frame(time, dt) {
    const live = state.motion;
    clock += live ? dt : 0;
    uniforms.uTime.value = live ? clock : 2.0;
    if (live && state.assemble < 1) {
      assembleStart ??= performance.now();
      state.assemble = Math.min(1, (performance.now() - assembleStart) / 2600);
    }
    uniforms.uAssemble.value = state.assemble;
    state.detune += (state.targetDetune - state.detune) * (live ? 1 - Math.exp(-6 * dt) : 1);
    uniforms.uDetune.value = Math.max(state.detune, (1 - state.assemble) * 0.6);
    state.seize = Math.max(0, state.seize - dt / 1.6);
    uniforms.uSeize.value = state.seize;
    uniforms.uMorph.value = state.morph;
    uniforms.uMode.value = state.mode;
    uniforms.uWaveY.value = lookY + (0.5 - (mobile ? 0.3 : state.waveRow)) * viewHeight;
    uniforms.uRotY.value = (live ? Math.sin(clock * 0.25) * 0.18 : 0) + state.pointer.x * 0.3;
    points.position.x = THREE.MathUtils.lerp(figureX, 0, THREE.MathUtils.smoothstep(state.morph, 0, 0.6));

    if (state.pointer.active && live && state.morph < 0.5) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((state.pointer.clientX - rect.left) / rect.width) * 2 - 1, -((state.pointer.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uPointer.value.set(hit.x - points.position.x, hit.y, 0);
      uniforms.uPointerForce.value += (1 - uniforms.uPointerForce.value) * 0.08;
    } else uniforms.uPointerForce.value *= 0.92;

    crt.uniforms.uTime.value = clock;
    crt.uniforms.uDetune.value = uniforms.uDetune.value;
    crt.uniforms.uSeize.value = state.seize;
    crt.uniforms.uGrid.value += (state.gridAmount - crt.uniforms.uGrid.value) * 0.08;
    composer.render();
    state.onFrame?.(dt);
  }

  const loop = createLoop(stage, frame, () => state.motion || state.seize > 0 || state.detune !== state.targetDetune);
  new ResizeObserver(() => { resize(); loop.renderOnce(); }).observe(stage);
  resize();

  return {
    state, loop, renderer,
    setBackground(css) { background.set(css); loop.renderOnce(); },
    setMotion(on) { state.motion = on; if (!on) state.assemble = 1; if (on) loop.wake(); else loop.renderOnce(); },
    seize() { state.seize = 1; loop.wake(); },
    wake() { if (state.motion) loop.wake(); else loop.renderOnce(); },
  };
}

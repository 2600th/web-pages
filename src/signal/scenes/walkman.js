// Side B: a Sony Walkman on the desk and a fanned pile of tapes. Pick a tape: it slides into
// the Walkman, shows through its window, and the reels turn at the speed real tape would.
// Tapes play, stop, wind, eject and flip to side B. The tapes are modelled in code.
// Model: "Sony Walkman" by julius.j.bib, CC BY 4.0 (optimised for the web).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { loadModel } from './gltf.js';

const SILVER = 0xc9cfdf;
const R_MIN = 0.1;
const R_MAX = 0.2;
const REEL_X = 0.21;
const REEL_Y = 0.035;
const DESK = -0.6;
const LOOK = new THREE.Vector3(0.05, -0.05, 0);
const TAPE_SCALE = 0.667; // a cassette is two thirds the height of the Walkman's body

function canvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ---------- The cassette ---------- */
const LABEL = { w: 0.92, h: 0.46, y: 0.06 };
const WINDOW = { w: 0.58, h: 0.19 };

function labelTexture(tape, side) {
  return canvasTexture(1024, 512, (ctx, W, H) => {
    const s = W / LABEL.w;
    ctx.fillStyle = tape.label;
    roundRect(ctx, 0, 0, W, H, 26);
    ctx.fill();
    // Stripes across the top, the way labels of the era were printed.
    tape.stripes.forEach((colour, i) => { ctx.fillStyle = colour; ctx.fillRect(0, 70 + i * 22, W, 14); });
    ctx.fillStyle = tape.ink;
    ctx.font = '800 46px "JetBrains Mono", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tape.title.toUpperCase(), 40, 56);
    ctx.font = '700 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`2600th · C-60`, W - 40, 52);
    ctx.textAlign = 'left';
    // Side letter in a circle.
    ctx.lineWidth = 5;
    ctx.strokeStyle = tape.ink;
    ctx.beginPath();
    ctx.arc(78, 320, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '900 54px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(side, 78, 339);
    ctx.textAlign = 'left';
    // Window: cut out of the label so the reels show through.
    const wx = W / 2 - (WINDOW.w * s) / 2;
    const wy = H / 2 - ((REEL_Y - LABEL.y) * s) - (WINDOW.h * s) / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    roundRect(ctx, wx, wy, WINDOW.w * s, WINDOW.h * s, 40);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = tape.ink;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 4;
    roundRect(ctx, wx - 8, wy - 8, WINDOW.w * s + 16, WINDOW.h * s + 16, 46);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText(side === 'A' ? 'NR ◻  HIGH POSITION' : 'SIDE B  ·  FLIP ME', 150, H - 38);
  });
}

function hubTexture() {
  return canvasTexture(256, 256, (ctx, W) => {
    const c = W / 2;
    ctx.fillStyle = '#f2f0ea';
    ctx.beginPath();
    ctx.arc(c, c, c - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1c24';
    ctx.beginPath();
    ctx.arc(c, c, c * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // The six drive teeth.
    ctx.fillStyle = '#f2f0ea';
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate((i / 6) * Math.PI * 2);
      ctx.fillRect(-9, -c * 0.45, 18, 30);
      ctx.restore();
    }
  });
}

function packTexture() {
  return canvasTexture(256, 256, (ctx, W) => {
    const c = W / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, '#3a2518');
    g.addColorStop(1, '#1c120c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,180,0.06)';
    for (let r = 20; r < c; r += 5) { ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.stroke(); }
  });
}

function buildCassette(tape, shared) {
  const group = new THREE.Group();
  group.name = tape.id;
  const shell = new THREE.Mesh(new RoundedBoxGeometry(1, 0.63, 0.1, 3, 0.03), new THREE.MeshStandardMaterial({ color: tape.shell, roughness: 0.42, metalness: 0.05 }));
  group.add(shell);
  const reels = [];
  for (const face of [1, -1]) {
    const sideGroup = new THREE.Group();
    if (face < 0) sideGroup.rotation.y = Math.PI;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(LABEL.w, LABEL.h), new THREE.MeshStandardMaterial({ map: labelTexture(tape, face > 0 ? 'A' : 'B'), alphaTest: 0.5, roughness: 0.85 }));
    label.position.set(0, LABEL.y, 0.0525);
    sideGroup.add(label);
    // Clear window over the reels.
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WINDOW.w, WINDOW.h), shared.window);
    glass.position.set(0, REEL_Y, 0.056);
    sideGroup.add(glass);
    // Head opening along the bottom edge.
    const shape = new THREE.Shape();
    shape.moveTo(-0.37, -0.315); shape.lineTo(0.37, -0.315); shape.lineTo(0.3, -0.2); shape.lineTo(-0.3, -0.2); shape.closePath();
    const opening = new THREE.Mesh(new THREE.ShapeGeometry(shape), shared.dark);
    opening.position.z = 0.0515;
    sideGroup.add(opening);
    for (const x of [-0.44, 0.44]) for (const y of [0.26, -0.26]) {
      const screw = new THREE.Mesh(shared.screwGeo, shared.silver);
      screw.position.set(x, y, 0.052);
      sideGroup.add(screw);
    }
    group.add(sideGroup);
  }
  // Reels sit inside the shell, visible from both faces through the windows.
  for (const x of [-REEL_X, REEL_X]) {
    const pack = new THREE.Mesh(shared.packGeo, shared.pack);
    const hub = new THREE.Mesh(shared.hubGeo, shared.hub);
    pack.position.set(x, REEL_Y, 0.051);
    hub.position.set(x, REEL_Y, 0.0512);
    const packBack = pack.clone();
    const hubBack = hub.clone();
    packBack.position.z = hubBack.position.z = -0.051;
    packBack.rotation.y = hubBack.rotation.y = Math.PI;
    group.add(pack, hub, packBack, hubBack);
    reels.push({ packs: [pack, packBack], hubs: [hub, hubBack] });
  }
  group.userData = { tape, reels, progress: 0.18 };
  return group;
}

function setReels(cassette) {
  const { reels, progress } = cassette.userData;
  // Tape area is conserved: what leaves one reel winds onto the other.
  const area = R_MAX ** 2 - R_MIN ** 2;
  const radii = [Math.sqrt(R_MIN ** 2 + (1 - progress) * area), Math.sqrt(R_MIN ** 2 + progress * area)];
  reels.forEach((reel, i) => reel.packs.forEach((pack) => pack.scale.setScalar(radii[i] / R_MAX)));
  return radii;
}


/* ---------- The Walkman ---------- */
// Measurements of the model, in its own units (metres).
const BODY = { x: 0.041, z: 0.012, height: 0.15 };
const WIN = { x: 0.027, y: 0.063, z: 0.0296, w: 0.029, h: 0.072 };

/** What shows through the Walkman's window: the loaded tape, its reels turning. */
function windowView() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const reel = (x, y, r, angle) => {
    ctx.fillStyle = '#2a1a12';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2f0ea';
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1c24';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2f0ea';
    for (let i = 0; i < 6; i++) {
      const a = angle + (i / 6) * Math.PI * 2;
      ctx.fillRect(x + Math.cos(a) * 6 - 2, y + Math.sin(a) * 6 - 2, 4, 4);
    }
  };
  const draw = (tape, side, progress, angle) => {
    ctx.fillStyle = '#07080d';
    ctx.fillRect(0, 0, 128, 320);
    if (tape) {
      ctx.fillStyle = tape.shell;
      ctx.fillRect(4, 0, 120, 320);
      ctx.fillStyle = tape.label;
      ctx.fillRect(12, 10, 104, 300);
      tape.stripes.forEach((colour, i) => { ctx.fillStyle = colour; ctx.fillRect(18 + i * 9, 10, 5, 300); });
      ctx.save();
      ctx.translate(100, 160);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = tape.ink;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${tape.title.toUpperCase()} · ${side}`, 0, 5);
      ctx.restore();
      // The tape window, with a pack of tape on each hub.
      ctx.fillStyle = '#120c09';
      ctx.fillRect(42, 64, 44, 192);
      const area = 42 ** 2 - 17 ** 2;
      reel(64, 108, Math.sqrt(17 ** 2 + (1 - progress) * area), angle);
      reel(64, 212, Math.sqrt(17 ** 2 + progress * area), angle * 1.3);
    }
    // Glass: a sheen and a darker edge.
    const g = ctx.createLinearGradient(0, 0, 128, 320);
    g.addColorStop(0, 'rgba(255,255,255,0.16)');
    g.addColorStop(0.35, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 320);
    texture.needsUpdate = true;
  };
  return { texture, draw };
}

async function buildWalkman() {
  const gltf = await loadModel('/media/3d/walkman.glb');
  const model = gltf.scene;
  const scale = 1 / BODY.height;
  model.scale.setScalar(scale);
  model.position.set(-BODY.x * scale, 0, -BODY.z * scale);
  let buttons = null;
  let lamp = null;
  model.traverse((o) => {
    if (!o.isMesh) return;
    // The model ships one blended material for everything; only the window needs it.
    o.material = o.material.clone();
    o.material.transparent = false;
    o.material.depthWrite = true;
    o.material.alphaTest = 0.5;
    if (o.name.startsWith('Window')) o.visible = false;
    if (o.name.startsWith('Buttons')) buttons = o;
    if (o.name.startsWith('Light')) { lamp = o; o.material.emissive = new THREE.Color(0xff3b1f); o.material.emissiveIntensity = 0; }
  });
  const view = windowView();
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), new THREE.MeshStandardMaterial({ map: view.texture, roughness: 0.25, metalness: 0 }));
  glass.position.set(WIN.x, WIN.y, WIN.z);
  model.add(glass);
  // Poses a tape passes through on its way in: in front of the window, then inside.
  const mouth = new THREE.Object3D();
  mouth.position.set(WIN.x, WIN.y, WIN.z + 0.06);
  mouth.rotation.z = Math.PI / 2;
  const inside = mouth.clone();
  inside.position.z = BODY.z;
  model.add(mouth, inside);
  const walkman = new THREE.Group();
  walkman.add(model);
  // Buttons press straight down in world space.
  model.updateMatrixWorld(true);
  let press = () => {};
  if (buttons) {
    const rest = buttons.position.clone();
    const down = new THREE.Vector3(0, -1, 0).transformDirection(new THREE.Matrix4().copy(buttons.parent.matrixWorld).invert());
    const depth = 0.002 / buttons.parent.getWorldScale(new THREE.Vector3()).x * scale;
    press = () => gsap.timeline()
      .to(buttons.position, { x: rest.x + down.x * depth, y: rest.y + down.y * depth, z: rest.z + down.z * depth, duration: 0.07 })
      .to(buttons.position, { x: rest.x, y: rest.y, z: rest.z, duration: 0.2, ease: 'back.out(3)' });
  }
  return { walkman, view, mouth, inside, lamp, press };
}

/* ---------- The scene ---------- */
export async function createDeck(canvas, { tapes, onState = () => {} }) {
  await document.fonts?.ready;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(-2, 3, 4);
  const rim = new THREE.PointLight(0x4d74ff, 9, 8);
  rim.position.set(2.2, 1.4, -1.5);
  const fill = new THREE.PointLight(0xe8b45a, 2.2, 6);
  fill.position.set(-2.4, -0.6, 2);
  scene.add(key, rim, fill);

  const shared = {
    silver: new THREE.MeshStandardMaterial({ color: SILVER, metalness: 0.85, roughness: 0.3 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.7 }),
    window: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, clearcoat: 1, depthWrite: false }),
    pack: new THREE.MeshStandardMaterial({ map: packTexture(), roughness: 0.55 }),
    hub: new THREE.MeshStandardMaterial({ map: hubTexture(), alphaTest: 0.5, roughness: 0.5 }),
    packGeo: new THREE.CircleGeometry(R_MAX, 48),
    hubGeo: new THREE.CircleGeometry(0.058, 32),
    screwGeo: new THREE.CircleGeometry(0.014, 12),
  };

  const root = new THREE.Group();
  scene.add(root);
  const deck = await buildWalkman();
  deck.walkman.position.set(0.42, DESK, -0.2);
  deck.walkman.rotation.y = -0.32;
  root.add(deck.walkman);

  const cassettes = tapes.map((tape) => buildCassette(tape, shared));
  cassettes.forEach((c) => { c.scale.setScalar(TAPE_SCALE); setReels(c); });
  // A fanned pile of tapes lying face up on the desk, left of the Walkman.
  const rack = cassettes.map((_, i) => {
    const o = new THREE.Object3D();
    o.position.set(-0.78 + i * 0.13, DESK + 0.034 + i * 0.067, 0.3 + i * 0.1);
    o.rotation.set(-Math.PI / 2, 0, 0.6 - i * 0.3);
    return o;
  });
  cassettes.forEach((c, i) => { c.position.copy(rack[i].position); c.rotation.copy(rack[i].rotation); root.add(c); });

  camera.position.set(0.05, 0.75, 3.6);
  camera.lookAt(LOOK);
  const base = camera.position.clone();

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: canvasTexture(256, 128, (ctx, W, H) => {
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, DESK + 0.001, 0.05);
  root.add(shadow);

  /* ---------- State ---------- */
  const state = { loaded: -1, playing: false, busy: false, side: 'A', speed: 0, angle: 0, pointer: { x: 0, y: 0 } };
  const emit = () => onState({ loaded: state.loaded, playing: state.playing, side: state.side, busy: state.busy });
  const paintWindow = () => {
    const c = cassettes[state.loaded];
    deck.view.draw(c?.userData.tape, state.side, c?.userData.progress ?? 0, state.angle);
  };
  paintWindow();

  const worldPose = (object) => {
    object.updateMatrixWorld(true);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    object.matrixWorld.decompose(position, quaternion, new THREE.Vector3());
    root.worldToLocal(position);
    return { position, quaternion };
  };

  // Move a cassette between poses; lifted on an arc unless it is sliding in or out.
  const travel = (cassette, target, { duration = 0.9, lift = 0.35 } = {}) => {
    const fromPos = cassette.position.clone();
    const fromQ = cassette.quaternion.clone();
    const to = target.isObject3D ? worldPose(target) : target;
    const p = { t: 0 };
    return gsap.to(p, {
      t: 1, duration, ease: 'power2.inOut',
      onUpdate: () => {
        cassette.position.lerpVectors(fromPos, to.position, p.t);
        cassette.position.y += lift * Math.sin(Math.PI * p.t);
        cassette.quaternion.slerpQuaternions(fromQ, to.quaternion, p.t);
      },
    });
  };

  const stop = () => {
    if (!state.playing) return;
    deck.press();
    state.playing = false;
    gsap.to(state, { speed: 0, duration: 0.5, ease: 'power2.out' });
    if (deck.lamp) gsap.to(deck.lamp.material, { emissiveIntensity: 0, duration: 0.3 });
    emit();
  };

  const takeOut = async () => {
    const cassette = cassettes[state.loaded];
    const pose = worldPose(deck.inside);
    cassette.position.copy(pose.position);
    cassette.quaternion.copy(pose.quaternion);
    cassette.visible = true;
    const was = state.loaded;
    state.loaded = -1;
    paintWindow();
    await travel(cassette, deck.mouth, { duration: 0.35, lift: 0 });
    return { cassette, index: was };
  };

  const putIn = async (cassette) => {
    await travel(cassette, deck.inside, { duration: 0.35, lift: 0 });
    cassette.visible = false;
  };

  const eject = async () => {
    if (state.loaded < 0) return;
    stop();
    const { cassette, index } = await takeOut();
    await travel(cassette, rack[index], { duration: 0.8, lift: 0.45 });
  };

  const load = async (index) => {
    if (state.busy || index === state.loaded) return;
    state.busy = true;
    emit();
    await eject();
    const cassette = cassettes[index];
    cassette.userData.side = 'A';
    await travel(cassette, deck.mouth, { duration: 0.95, lift: 0.45 });
    await putIn(cassette);
    state.loaded = index;
    state.side = 'A';
    paintWindow();
    state.busy = false;
    emit();
  };

  const play = () => {
    if (state.loaded < 0 || state.busy) return;
    deck.press();
    state.playing = true;
    gsap.to(state, { speed: 1, duration: 0.35, ease: 'power2.out' });
    if (deck.lamp) gsap.to(deck.lamp.material, { emissiveIntensity: 4, duration: 0.2 });
    emit();
  };

  const flip = async () => {
    if (state.loaded < 0 || state.busy) return;
    state.busy = true;
    stop();
    emit();
    const { cassette, index } = await takeOut();
    // Turn it over about its long side, then back in.
    const axis = new THREE.Vector3(0, 1, 0);
    const turn = { a: 0 };
    let last = 0;
    await gsap.to(turn, { a: Math.PI, duration: 0.55, ease: 'power2.inOut', onUpdate: () => { cassette.rotateOnWorldAxis(axis, turn.a - last); last = turn.a; } });
    await travel(cassette, deck.inside, { duration: 0.35, lift: 0 });
    cassette.visible = false;
    cassette.userData.progress = 1 - cassette.userData.progress;
    state.loaded = index;
    state.side = state.side === 'A' ? 'B' : 'A';
    paintWindow();
    state.busy = false;
    emit();
  };

  const wind = (dir) => {
    if (state.loaded < 0 || state.busy) return;
    deck.press();
    const c = cassettes[state.loaded];
    gsap.to(c.userData, { progress: Math.min(0.98, Math.max(0.02, c.userData.progress + dir * 0.18)), duration: 0.8, ease: 'power1.inOut', onUpdate: paintWindow });
    gsap.to(state, { angle: state.angle + dir * 40, duration: 0.8, ease: 'power1.inOut' });
  };

  /* ---------- Loop ---------- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  const frame = () => {
    // PROTOTYPE: __deckTimeScale slows the scene for recording previews.
    const scale = window.__deckTimeScale ?? 1;
    if (scale !== 1 && gsap.globalTimeline.timeScale() !== scale) gsap.globalTimeline.timeScale(scale);
    const dt = Math.min(clock.getDelta() * scale, 1 / 20);
    if (state.loaded >= 0 && state.speed > 0.001) {
      const c = cassettes[state.loaded];
      c.userData.progress = Math.min(0.995, c.userData.progress + dt * state.speed * 0.004);
      state.angle -= dt * state.speed * 5;
      paintWindow();
    }
    camera.position.x += (base.x + state.pointer.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (base.y + state.pointer.y * 0.18 - camera.position.y) * 0.05;
    camera.lookAt(LOOK);
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  });
  canvas.addEventListener('pointerleave', () => { state.pointer.x = 0; state.pointer.y = 0; });

  // Pick a tape in the pile by clicking it in the scene.
  const ray = new THREE.Raycaster();
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)), camera);
    const hit = ray.intersectObjects(cassettes.filter((c) => c.visible), true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o && !cassettes.includes(o)) o = o.parent;
    const index = cassettes.indexOf(o);
    if (index >= 0 && index !== state.loaded) load(index).then(play);
  });

  return {
    load, play, stop, eject, flip, wind,
    get state() { return { ...state }; },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
  };
}

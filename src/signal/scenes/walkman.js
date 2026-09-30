// A pocket cassette player and its tapes, modelled in code (no model files to download).
// createDeck() renders it into a canvas; layout 'stage' adds a fan of tapes and headphones,
// 'compact' is the player alone. Tapes load, play (reels turn at the speed real tape would),
// stop, eject and flip to side B.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

const COBALT = 0x2447d8;
const GOLD = 0xe8b45a;
const SILVER = 0xc9cfdf;
const R_MIN = 0.1;
const R_MAX = 0.2;
const REEL_X = 0.21;
const REEL_Y = 0.035;
const DESK = -0.5;
const LOOK = new THREE.Vector3(0.2, -0.3, 0);

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

/* ---------- The player ---------- */
function nameplateTexture() {
  return canvasTexture(1024, 96, (ctx, W, H) => {
    ctx.fillStyle = '#0b0e1a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c9cfdf';
    ctx.font = '800 44px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('2600th', 36, H / 2 + 2);
    ctx.font = '600 26px "JetBrains Mono", monospace';
    ctx.fillStyle = '#9db6ff';
    ctx.textAlign = 'right';
    ctx.fillText('TAPE-26  ·  STEREO CASSETTE PLAYER', W - 36, H / 2 + 2);
  });
}

function keyTexture(glyph, fill) {
  return canvasTexture(128, 64, (ctx, W, H) => {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#10131f';
    ctx.font = '800 34px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, W / 2, H / 2 + 2);
  });
}

function buildPlayer(shared) {
  const player = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: COBALT, metalness: 0.55, roughness: 0.32 });
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.86, 0.2, 4, 0.05), body);
  back.position.z = -0.06;
  player.add(back);
  // The well the cassette sits in, framed by the body.
  const bar = (w, h, x, y) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.16, 2, 0.02), body); m.position.set(x, y, 0.06); player.add(m); };
  bar(1.16, 0.1, 0, 0.38);
  bar(1.16, 0.1, 0, -0.38);
  bar(0.07, 0.7, -0.545, 0);
  bar(0.07, 0.7, 0.545, 0);
  // Dark interior behind the cassette, so an empty well reads as a well.
  const well = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.68), new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 0.9 }));
  well.position.set(0, 0, 0.041);
  player.add(well);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.06), new THREE.MeshStandardMaterial({ map: nameplateTexture(), roughness: 0.4, metalness: 0.3 }));
  plate.position.set(0, -0.38, 0.141);
  player.add(plate);
  // Door on a bottom hinge: smoked glass in a silver frame.
  const hinge = new THREE.Group();
  hinge.position.set(0, -0.33, 0.14);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.66), new THREE.MeshPhysicalMaterial({ color: 0x0b1030, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.26, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false }));
  glass.position.set(0, 0.33, 0);
  hinge.add(glass);
  const rim = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), shared.silver); m.position.set(x, y, 0.004); hinge.add(m); };
  rim(1.02, 0.018, 0, 0.66);
  rim(1.02, 0.018, 0, 0);
  rim(0.018, 0.66, -0.51, 0.33);
  rim(0.018, 0.66, 0.51, 0.33);
  player.add(hinge);
  // Piano keys along the top edge.
  const keys = {};
  [['eject', '⏏', -0.33, SILVER], ['rew', '◀◀', -0.11, SILVER], ['play', '▶', 0.11, GOLD], ['ff', '▶▶', 0.33, SILVER]].forEach(([id, glyph, x, colour]) => {
    const key = new THREE.Group();
    const cap = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.08, 0.15, 2, 0.02), new THREE.MeshStandardMaterial({ color: colour, metalness: 0.7, roughness: 0.3 }));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.06), new THREE.MeshStandardMaterial({ map: keyTexture(glyph, `#${new THREE.Color(colour).getHexString()}`), metalness: 0.4, roughness: 0.4 }));
    face.position.z = 0.0755;
    key.add(cap, face);
    key.position.set(x, 0.46, 0.0);
    key.userData.rest = 0.46;
    player.add(key);
    keys[id] = key;
  });
  // Volume wheel, headphone jack, and a status lamp.
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32), new THREE.MeshStandardMaterial({ color: SILVER, metalness: 0.8, roughness: 0.35 }));
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0.595, 0.12, -0.02);
  player.add(wheel);
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 20), shared.silver);
  jack.position.set(0.47, 0.44, -0.1);
  player.add(jack);
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.018, 20), new THREE.MeshStandardMaterial({ color: 0x331a08, emissive: GOLD, emissiveIntensity: 0 }));
  lamp.position.set(-0.47, 0.38, 0.141);
  player.add(lamp);
  const slot = new THREE.Object3D();
  slot.position.set(0, 0.0, 0.07);
  player.add(slot);
  return { player, hinge, keys, lamp, slot, jackWorld: jack };
}

function buildHeadphones(shared) {
  const group = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.014, 10, 64, Math.PI), shared.silver);
  group.add(band);
  const foam = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 1, metalness: 0 });
  for (const x of [-0.42, 0.42]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), foam);
    pad.scale.set(1, 1, 0.5);
    pad.position.set(x, -0.02, 0);
    group.add(pad);
  }
  return group;
}

/* ---------- The scene ---------- */
export async function createDeck(canvas, { tapes, layout = 'stage', onState = () => {} }) {
  await document.fonts?.ready;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(layout === 'stage' ? 30 : 26, 1, 0.1, 30);
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-2, 3, 4);
  const rim = new THREE.PointLight(0x4d74ff, 9, 8);
  rim.position.set(2.2, 1.2, -1.5);
  const fill = new THREE.PointLight(GOLD, 2.2, 6);
  fill.position.set(-2.4, -1, 2);
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

  const deck = buildPlayer(shared);
  const root = new THREE.Group();
  scene.add(root);
  root.add(deck.player);
  const cassettes = tapes.map((tape) => buildCassette(tape, shared));
  cassettes.forEach(setReels);

  // Rack poses: a fan of tapes to the left of the player (stage), or offstage (compact).
  const rack = cassettes.map((_, i) => {
    const o = new THREE.Object3D();
    if (layout === 'stage') {
      // A fanned pile lying face up on the desk, in front of the player.
      o.position.set(-1.05 + i * 0.2, DESK + 0.05 + i * 0.1, 0.25 + i * 0.16);
      o.rotation.set(-Math.PI / 2, 0, 0.62 - i * 0.3);
    } else {
      o.position.set(0, -2.4, 0.4);
    }
    return o;
  });
  cassettes.forEach((c, i) => { c.position.copy(rack[i].position); c.rotation.copy(rack[i].rotation); root.add(c); });

  if (layout === 'stage') {
    deck.player.position.set(0.5, DESK + 0.43, -0.25);
    deck.player.rotation.set(0, -0.38, 0);
    const phones = buildHeadphones(shared);
    phones.position.set(1.28, DESK + 0.06, 0.6);
    phones.rotation.set(-Math.PI / 2, 0, 0.35);
    root.add(phones);
    // Cable from the jack, over the back of the player, down to the headphones.
    deck.player.updateMatrixWorld(true);
    const from = deck.jackWorld.getWorldPosition(new THREE.Vector3());
    const curve = new THREE.CatmullRomCurve3([from, from.clone().add(new THREE.Vector3(0.12, 0.3, -0.15)), new THREE.Vector3(1.3, 0.2, -0.5), new THREE.Vector3(1.6, DESK + 0.02, -0.05), new THREE.Vector3(1.45, DESK + 0.02, 0.45)]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.008, 6), shared.dark));
    camera.position.set(0.1, 1.65, 4.05);
    camera.lookAt(LOOK);
  } else {
    deck.player.rotation.set(-0.08, -0.28, 0.02);
    camera.position.set(0, 0.2, 3.2);
    camera.lookAt(0, 0, 0);
  }
  const base = camera.position.clone();
  const look = layout === 'stage' ? LOOK : new THREE.Vector3(0, 0, 0);

  // Soft contact shadow under everything.
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.2), new THREE.MeshBasicMaterial({ map: canvasTexture(256, 128, (ctx, W, H) => {
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(layout === 'stage' ? 0.2 : 0, layout === 'stage' ? DESK + 0.001 : -0.55, 0.1);
  if (layout !== 'stage') shadow.scale.set(0.45, 0.45, 1);
  root.add(shadow);

  /* ---------- State ---------- */
  const state = { loaded: -1, playing: false, busy: false, side: 'A', speed: 0, pointer: { x: 0, y: 0 } };
  const emit = () => onState({ loaded: state.loaded, playing: state.playing, side: state.side, busy: state.busy });

  const press = (id) => {
    const k = deck.keys[id];
    gsap.timeline().to(k.position, { y: k.userData.rest - 0.035, duration: 0.07 }).to(k.position, { y: k.userData.rest, duration: 0.18, ease: 'back.out(3)' });
  };
  const door = (open) => gsap.to(deck.hinge.rotation, { x: open ? 0.62 : 0, duration: 0.42, ease: open ? 'back.out(1.6)' : 'power3.in' });

  // Move a cassette between two world poses along a lifted path.
  const travel = (cassette, to, duration = 0.9) => {
    const fromPos = cassette.position.clone();
    const fromQ = cassette.quaternion.clone();
    const toPos = new THREE.Vector3();
    const toQ = new THREE.Quaternion();
    to.updateMatrixWorld(true);
    to.matrixWorld.decompose(toPos, toQ, new THREE.Vector3());
    root.worldToLocal(toPos);
    const lift = new THREE.Vector3(0, 0.25, 0.7);
    const p = { t: 0 };
    return gsap.to(p, {
      t: 1, duration, ease: 'power2.inOut',
      onUpdate: () => {
        const t = p.t;
        cassette.position.lerpVectors(fromPos, toPos, t).addScaledVector(lift, Math.sin(Math.PI * t));
        cassette.quaternion.slerpQuaternions(fromQ, toQ, t);
      },
    });
  };

  const stop = () => {
    if (!state.playing) return;
    press('eject');
    state.playing = false;
    gsap.to(state, { speed: 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(deck.lamp.material, { emissiveIntensity: 0, duration: 0.3 });
    emit();
  };

  const eject = async () => {
    if (state.loaded < 0) return;
    stop();
    const cassette = cassettes[state.loaded];
    await door(true);
    root.attach(cassette);
    await travel(cassette, rack[state.loaded], 0.8);
    state.loaded = -1;
    door(false);
  };

  const load = async (index) => {
    if (state.busy || index === state.loaded) return;
    state.busy = true;
    emit();
    await eject();
    const cassette = cassettes[index];
    cassette.userData.side = 'A';
    await door(true);
    await travel(cassette, deck.slot, 1);
    deck.slot.attach(cassette);
    cassette.position.set(0, 0, 0);
    cassette.quaternion.identity();
    await door(false);
    state.loaded = index;
    state.side = 'A';
    state.busy = false;
    emit();
  };

  const play = () => {
    if (state.loaded < 0 || state.busy) return;
    press('play');
    state.playing = true;
    gsap.to(state, { speed: 1, duration: 0.35, ease: 'power2.out' });
    gsap.to(deck.lamp.material, { emissiveIntensity: 3, duration: 0.2 });
    emit();
  };

  const flip = async () => {
    if (state.loaded < 0 || state.busy) return;
    state.busy = true;
    stop();
    emit();
    const cassette = cassettes[state.loaded];
    await door(true);
    const lifted = cassette.position.z + 0.55;
    await gsap.to(cassette.position, { z: lifted, duration: 0.35, ease: 'power2.out' });
    await gsap.to(cassette.rotation, { y: cassette.rotation.y + Math.PI, duration: 0.55, ease: 'power2.inOut' });
    await gsap.to(cassette.position, { z: 0, duration: 0.35, ease: 'power2.in' });
    await door(false);
    state.side = state.side === 'A' ? 'B' : 'A';
    cassette.userData.progress = 1 - cassette.userData.progress;
    state.busy = false;
    emit();
  };

  const wind = (dir) => {
    if (state.loaded < 0 || state.busy) return;
    press(dir > 0 ? 'ff' : 'rew');
    const c = cassettes[state.loaded];
    gsap.to(c.userData, { progress: Math.min(0.98, Math.max(0.02, c.userData.progress + dir * 0.18)), duration: 0.8, ease: 'power1.inOut' });
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
    const t = clock.elapsedTime * scale;
    // Reels: constant tape speed, so the emptier reel spins faster.
    cassettes.forEach((c, i) => {
      if (i === state.loaded && state.speed > 0) c.userData.progress = Math.min(0.995, c.userData.progress + dt * state.speed * 0.004);
      const radii = setReels(c);
      const w = i === state.loaded ? state.speed * 0.19 : 0;
      c.userData.reels.forEach((reel, k) => reel.hubs.forEach((hub) => { hub.rotation.z -= (w / radii[k]) * dt; }));
    });
    if (layout !== 'stage') deck.player.position.y = Math.sin(t * 0.9) * 0.012;
    camera.position.x += (base.x + state.pointer.x * 0.35 - camera.position.x) * 0.05;
    camera.position.y += (base.y + state.pointer.y * 0.2 - camera.position.y) * 0.05;
    camera.lookAt(look);
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  });
  canvas.addEventListener('pointerleave', () => { state.pointer.x = 0; state.pointer.y = 0; });

  // Pick a tape in the rack by clicking it in the scene.
  const ray = new THREE.Raycaster();
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)), camera);
    const hit = ray.intersectObjects(cassettes, true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o && !cassettes.includes(o)) o = o.parent;
    const index = cassettes.indexOf(o);
    if (index >= 0 && index !== state.loaded) load(index);
  });

  return {
    load, play, stop, eject, flip, wind,
    get state() { return { ...state }; },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
  };
}

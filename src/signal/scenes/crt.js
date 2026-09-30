// The TV behind the Atari: a Magnavox 19" colour set (model: "Magnavox 19\" CRT TV -
// RR1938 W122" by amhyde, CC BY 4.0, optimised for the web). Its screen is a canvas: it
// warms up, shows a title card for the loaded cartridge on channel 3, changes channel
// through snow and switches off to a dot. The title cards and sprites are drawn here.
import * as THREE from 'three';
import { loadModel } from './gltf.js';

const URL = '/media/3d/crt-tv.glb';
const SW = 360; // the picture is 360 × 240, the shape of this set's screen
const RAINBOW = ['#f6c945', '#f2963a', '#e5543b', '#c33a6a', '#7a3ea6', '#3a58c9'];
// Model measurements (its units): centre of the set, its half height, and its width.
const MODEL = { center: new THREE.Vector3(0.878, 0.008, -0.026), halfHeight: 0.323 };

/* ---------- The picture ---------- */
// Small sprites of my own, loosely in the spirit of each cartridge.
const RUNNER = ['..##..', '..##..', '.####.', '#.##.#', '..##..', '.#..#.', '#....#'];
const ALIEN = ['..#.#..', '.#####.', '##.#.##', '#######', '#.#.#.#'];

function sprite(ctx, rows, x, y, px, colour) {
  ctx.fillStyle = colour;
  rows.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') ctx.fillRect(x + i * px, y + j * px, px, px); }));
}

function drawProgram(ctx, program, title, t) {
  const W2 = SW;
  ctx.fillStyle = '#05060c';
  ctx.fillRect(0, 0, W2, 240);
  RAINBOW.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, 18 + i * 5, W2, 4); });
  ctx.fillStyle = '#f4f1e6';
  ctx.font = '900 30px Doto, "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#9db6ff';
  ctx.shadowBlur = 8;
  ctx.fillText(title.toUpperCase(), W2 / 2, 84);
  ctx.shadowBlur = 0;
  // A little scene per cartridge.
  if (program === 0) {
    ctx.fillStyle = '#1f6b2a'; ctx.fillRect(0, 168, W2, 10);
    ctx.fillStyle = '#6a3d1c'; ctx.fillRect(0, 178, W2, 22);
    const logX = W2 - ((t * 90) % (W2 + 40));
    ctx.fillStyle = '#8a5429'; ctx.fillRect(logX, 156, 30, 12);
    const jump = Math.max(0, Math.sin(((t * 90) % (W2 + 40)) / 60 - 2.1)) * 34;
    sprite(ctx, RUNNER, 100, 140 - jump, 4, '#f6c945');
  } else if (program === 1) {
    const dx = Math.sin(t * 1.4) * 40;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) sprite(ctx, ALIEN, W2 / 2 - 102 + c * 36 + dx, 104 + r * 22, 3, ['#9db6ff', '#7cf0b0', '#f2963a'][r]);
    ctx.fillStyle = '#7cf0b0';
    const gun = W2 / 2 + Math.sin(t * 0.9) * 90;
    ctx.fillRect(gun - 10, 194, 20, 6); ctx.fillRect(gun - 3, 188, 6, 6);
    const shot = (t * 160) % 90;
    ctx.fillStyle = '#f4f1e6'; ctx.fillRect(gun - 1, 184 - shot, 2, 8);
  } else {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 11; c++) { ctx.fillStyle = RAINBOW[r + 1]; ctx.fillRect(W2 / 2 - 165 + c * 30, 100 + r * 10, 27, 7); }
    const bx = W2 / 2 + Math.sin(t * 2.3) * 150;
    const by = 170 - Math.abs(Math.sin(t * 3.1)) * 50;
    ctx.fillStyle = '#f4f1e6'; ctx.fillRect(bx - 3, by - 3, 6, 6);
    ctx.fillStyle = '#9db6ff'; ctx.fillRect(bx - 22, 200, 44, 6);
  }
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = Math.floor(t * 1.6) % 2 ? '#f4f1e6' : 'rgba(244,241,230,0.25)';
  ctx.fillText('PRESS FIRE', W2 / 2, 226);
}

function drawStatic(ctx, image) {
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 230; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  ctx.putImageData(image, 0, 0);
}

/** The finishing pass: scanlines, a corner vignette and the green channel display. */
function drawGlass(ctx, showChannel) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < 240; y += 3) ctx.fillRect(0, y, SW, 1);
  const g = ctx.createRadialGradient(SW / 2, 120, 90, SW / 2, 120, 230);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 240);
  if (showChannel) {
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#7cf0b0';
    ctx.fillText('CH 03', 22, 220);
  }
}


/** The picture: a canvas the scene maps onto the screen, and its power states. */
function createPicture() {
  const canvas = document.createElement('canvas');
  canvas.width = SW;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const staticImage = ctx.createImageData(SW, 240);
  const tv = { mode: 'off', program: -1, title: '', t: 0, phase: 0 };
  const paint = () => {
    const p = tv.phase;
    ctx.textAlign = 'center';
    if (tv.mode === 'off') { ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, SW, 240); }
    else if (tv.mode === 'warming') {
      // A bright line opens up into snow.
      if (p < 0.45) {
        ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, SW, 240);
        const h = Math.max(2, 240 * (p / 0.45) ** 2);
        ctx.fillStyle = '#e8eeff'; ctx.fillRect(0, 120 - h / 2, SW, h);
      } else drawStatic(ctx, staticImage);
    } else if (tv.mode === 'tuning') drawStatic(ctx, staticImage);
    else if (tv.mode === 'on') drawProgram(ctx, tv.program, tv.title, tv.t);
    else if (tv.mode === 'cooling') {
      // Collapse to a line, then to a dot.
      ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, SW, 240);
      if (p < 0.55) { const h = Math.max(2, 240 * (1 - p / 0.55) ** 2); ctx.fillStyle = '#e8eeff'; ctx.fillRect(0, 120 - h / 2, SW, h); }
      else { const w = Math.max(2, SW * (1 - (p - 0.55) / 0.45) ** 3); ctx.fillStyle = `rgba(232,238,255,${1 - (p - 0.55) / 0.45})`; ctx.fillRect(SW / 2 - w / 2, 119, w, 3); }
    }
    if (tv.mode !== 'off') drawGlass(ctx, tv.mode === 'on' || tv.mode === 'tuning');
    texture.needsUpdate = true;
  };
  paint();
  const DUR = { warming: 0.75, tuning: 0.35, cooling: 0.45 };
  return {
    texture,
    get lit() { return tv.mode === 'on' ? 1 : tv.mode === 'warming' || tv.mode === 'tuning' ? 0.7 : 0; },
    show(program, title) {
      tv.program = program;
      tv.title = title;
      tv.mode = tv.mode === 'off' || tv.mode === 'cooling' ? 'warming' : 'tuning';
      tv.phase = 0;
    },
    off() { if (tv.mode !== 'off') { tv.mode = 'cooling'; tv.phase = 0; } },
    tick(dt) {
      if (tv.mode === 'off') return;
      tv.t += dt;
      if (DUR[tv.mode]) {
        tv.phase += dt / DUR[tv.mode];
        if (tv.phase >= 1) { tv.mode = tv.mode === 'cooling' ? 'off' : 'on'; tv.phase = 0; }
      }
      paint();
    },
  };
}

/** Load the set, sized `width` scene units across, front facing +z, on a low stand of `stand` height. */
export async function buildCrt({ width = 4.4, stand = 0 } = {}) {
  const gltf = await loadModel(URL);
  const inner = gltf.scene;
  inner.position.copy(MODEL.center).negate();
  const picture = createPicture();
  inner.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name === 'Object_6') o.material = new THREE.MeshBasicMaterial({ map: picture.texture, toneMapped: false });
    // The curved glass: reflections without the cost of a transmission pass.
    if (o.name === 'Object_4') o.material = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.1, roughness: 0.12, metalness: 0, envMapIntensity: 0.35, depthWrite: false });
  });
  const scale = width / 0.78;
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.add(inner);
  body.scale.setScalar(scale);
  body.rotation.y = -Math.PI / 2;
  body.position.y = stand + MODEL.halfHeight * scale;
  group.add(body);
  if (stand > 0) {
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(width * 1.18, stand, width * 0.92), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.6, metalness: 0.05 }));
    cabinet.position.y = stand / 2;
    group.add(cabinet);
  }
  // The screen lights the room a little when it is on.
  const glow = new THREE.PointLight(0x9db6ff, 0, 9, 1.6);
  glow.position.set(0, stand + MODEL.halfHeight * scale * 1.1, 0.5 * scale);
  group.add(glow);
  return {
    group,
    show: picture.show,
    off: picture.off,
    tick(dt) {
      picture.tick(dt);
      glow.intensity = picture.lit * 3.5;
    },
  };
}

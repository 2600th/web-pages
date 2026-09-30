// Lab: the 2600th arcade as a cabinet you could stand at. Modelled here in three.js from a
// side profile (a classic upright, or a Japanese sit-down "candy" cab): side panels with
// T-molding and side art, a backlit marquee, a glass bezel, a control panel with a stick and
// buttons, and a coin door. The screen is the arcade's CRT shader playing the loaded
// cartridge, with the HUD drawn on the tube. The page's controls drive it; clicking the
// screen, A or B does what the deck does.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { sceneLoop, timeScale } from './mount.js';
import { CRT_GLSL, collectSources } from './crt-picture.js';

const C = { cobalt: '#4d74ff', deep: '#2447d8', phosphor: '#9db6ff', gold: '#e8b45a', ink: '#eae8e1', term: '#7cf0b0', red: '#c21f3a' };

/* ---------- The two cabinets ---------- */
// A profile is a start point and segments, in metres: z towards the player, y up. A segment
// can bend through `via`. Each segment is one surface of the cabinet's front, named by id.
const STYLES = {
  upright: {
    width: 0.68, side: 0.022, bevel: 0.007,
    start: [0, 0],
    segs: [
      { id: 'base', to: [0.64, 0] },
      { id: 'door', to: [0.64, 0.84] },
      { id: 'under', to: [0.88, 0.92] },
      { id: 'lip', to: [0.88, 0.99] },
      { id: 'cp', to: [0.6, 1.06] },
      { id: 'screen', to: [0.48, 1.52] },
      { id: 'speaker', to: [0.6, 1.56] },
      { id: 'marquee', to: [0.62, 1.82] },
      { id: 'cap', to: [0.58, 1.86] },
      { id: 'top', to: [0, 1.86] },
      { id: 'back', to: [0, 0] },
    ],
    opening: [0.5, 0.3125],
    body: '#0b0f24', shell: null, trim: '#2447d8',
    // Camera: where it looks, and how far round, up and away it stands (hero, then close).
    hero: { target: [0, 1.36, 0.52], az: -0.28, el: 0.1, dist: 3.0 },
    close: { target: [0, 1.36, 0.54], az: -0.12, el: 0.08, dist: 2.45 },
    stick: [0.25, 0.58], buttons: [[0.56, 0.56], [0.7, 0.46]], starts: [[0.43, 0.22], [0.52, 0.22]],
  },
  candy: {
    width: 0.66, side: 0.03, bevel: 0.014,
    start: [0, 0],
    segs: [
      { id: 'base', to: [0.7, 0] },
      { id: 'door', to: [0.7, 0.62] },
      { id: 'under', to: [0.95, 0.74], via: [0.84, 0.63] },
      { id: 'lip', to: [0.96, 0.81], via: [0.985, 0.77] },
      { id: 'cp', to: [0.74, 0.89] },
      { id: 'screen', to: [0.57, 1.31] },
      { id: 'marquee', to: [0.53, 1.43], via: [0.575, 1.4] },
      { id: 'top', to: [0.12, 1.5], via: [0.4, 1.535] },
      { id: 'back', to: [0, 1.28], via: [0.005, 1.48] },
      { id: 'back2', to: [0, 0] },
    ],
    opening: [0.52, 0.325],
    body: '#101320', shell: '#e9e5da', trim: '#e9e5da',
    hero: { target: [0, 1.14, 0.66], az: -0.3, el: 0.14, dist: 2.6 },
    close: { target: [0, 1.14, 0.64], az: -0.12, el: 0.12, dist: 2.1 },
    stick: [0.25, 0.56], buttons: [[0.55, 0.56], [0.69, 0.47]], starts: [[0.44, 0.2], [0.53, 0.2]],
  },
};

/* ---------- Geometry helpers ---------- */
const quad = (a, via, b, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * via[0] + t * t * b[0], u * u * a[1] + 2 * u * t * via[1] + t * t * b[1]];
});

/** Each segment as a polyline, with its length. */
function segments(style) {
  let at = style.start;
  return style.segs.map((seg) => {
    const points = seg.via ? quad(at, seg.via, seg.to, 14) : [at, seg.to];
    at = seg.to;
    let length = 0;
    for (let i = 1; i < points.length; i++) length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    return { ...seg, points, length };
  });
}

/** A surface across the cabinet following a polyline: u runs left to right, v along the profile. */
function ribbon(points, half) {
  const positions = [];
  const uvs = [];
  const index = [];
  let run = 0;
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    run += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lengths.push(run);
  }
  points.forEach(([z, y], i) => {
    positions.push(-half, y, z, half, y, z);
    const v = lengths[i] / run;
    uvs.push(0, v, 1, v);
  });
  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** A frame on a flat segment: its centre, the way along it, and the way out of it. */
function frameOf(seg) {
  const [a, b] = [seg.points[0], seg.points[seg.points.length - 1]];
  const t = new THREE.Vector3(0, b[1] - a[1], b[0] - a[0]).normalize();
  const n = new THREE.Vector3(0, -t.z, t.y);
  const x = new THREE.Vector3(1, 0, 0);
  const centre = new THREE.Vector3(0, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
  const face = new THREE.Group(); // local z points out of the surface, y along it
  face.matrix.makeBasis(x, t, n).setPosition(centre);
  face.matrix.decompose(face.position, face.quaternion, face.scale);
  const mount = new THREE.Group(); // local y points out of the surface, z towards its start
  mount.matrix.makeBasis(x, n, t.clone().negate()).setPosition(centre);
  mount.matrix.decompose(mount.position, mount.quaternion, mount.scale);
  return { face, mount, t, n, centre };
}

/* ---------- Artwork, drawn on canvases ---------- */
function paint(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = Math.max(8, Math.round(h));
  draw(canvas.getContext('2d'), canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function glowText(ctx, text, x, y, colour, glow, blur) {
  ctx.shadowColor = glow;
  ctx.shadowBlur = blur;
  ctx.fillStyle = colour;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = blur / 3;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function marqueeArt(ctx, w, h, style) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1850');
  g.addColorStop(1, '#040818');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // A night sky and a grid running to the horizon.
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `rgba(200,215,255,${0.2 + Math.random() * 0.6})`;
    ctx.fillRect(Math.random() * w, Math.random() * h * 0.6, 1.5, 1.5);
  }
  const horizon = h * 0.64;
  ctx.strokeStyle = 'rgba(77,116,255,0.55)';
  ctx.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 18, horizon);
    ctx.lineTo(w / 2 + i * 150, h);
    ctx.stroke();
  }
  for (let k = 1; k < 7; k++) {
    const y = horizon + (h - horizon) * (k / 7) ** 1.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const hg = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 6);
  hg.addColorStop(0, 'rgba(232,180,90,0)');
  hg.addColorStop(1, 'rgba(232,180,90,0.35)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizon - 30, w, 36);
  // The name.
  const size = h * (style === 'candy' ? 0.5 : 0.44);
  ctx.textBaseline = 'alphabetic';
  ctx.font = `900 ${size}px Doto, "JetBrains Mono", monospace`;
  const name = '2600';
  const nw = ctx.measureText(name).width;
  ctx.font = `700 ${size * 0.2}px "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.07}px`;
  const aw = ctx.measureText('ARCADE').width;
  const total = nw + size * 0.36 + aw;
  const x0 = (w - total) / 2;
  const base = h * 0.58;
  ctx.font = `900 ${size}px Doto, "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  glowText(ctx, name, x0, base, '#ffffff', C.cobalt, 28);
  ctx.font = `700 ${size * 0.28}px "JetBrains Mono", monospace`;
  glowText(ctx, 'th', x0 + nw + 4, base - size * 0.52, C.phosphor, C.cobalt, 12);
  ctx.font = `800 ${size * 0.2}px "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.07}px`;
  glowText(ctx, 'ARCADE', x0 + nw + size * 0.36, base - size * 0.1, C.gold, C.gold, 18);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  // Trim.
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, 0, w, 3);
  ctx.fillRect(0, h - 3, w, 3);
}

function bezelArt(ctx, w, h, open) {
  ctx.fillStyle = '#05060c';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7);
  g.addColorStop(0, 'rgba(36,71,216,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const [ow, oh] = open;
  const x = (w - ow) / 2;
  const y = (h - oh) / 2;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(77,116,255,0.9)';
  roundRect(ctx, x - 14, y - 14, ow + 28, oh + 28, 34);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(232,180,90,0.55)';
  roundRect(ctx, x - 26, y - 26, ow + 52, oh + 52, 42);
  ctx.stroke();
  // Printed on the glass.
  ctx.font = '600 17px "JetBrains Mono", monospace';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '5px';
  ctx.fillStyle = 'rgba(157,182,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('1 OR 2 PLAYERS · INSERT COIN', w / 2, y + oh + 26 + (h - y - oh - 26) / 2 + 6);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(232,180,90,0.8)';
  ctx.fillText('CART 01–08', x - 20, y - 26 - (y - 26) / 2 + 6);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(157,182,255,0.6)';
  ctx.fillText('2600TH · LAB SYSTEM', x + ow + 20, y - 26 - (y - 26) / 2 + 6);
  ctx.textAlign = 'left';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  // The window the tube shows through.
  ctx.globalCompositeOperation = 'destination-out';
  roundRect(ctx, x, y, ow, oh, 22);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function panelArt(ctx, w, h, spec) {
  ctx.fillStyle = '#080b1c';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(77,116,255,0.07)';
  ctx.lineWidth = 1;
  for (let x = -h; x < w; x += 14) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
  // Stripes along the player's edge.
  [[C.gold, 0.035], [C.cobalt, 0.06], [C.deep, 0.085]].forEach(([colour, at]) => { ctx.fillStyle = colour; ctx.fillRect(0, h - h * at, w, h * 0.018); });
  const at = ([fx, fy]) => [fx * w, fy * h];
  const [sx, sy] = at(spec.stick);
  ctx.strokeStyle = 'rgba(157,182,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(sx, sy, h * 0.2, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * h * 0.2, sy + Math.sin(a) * h * 0.2);
    ctx.lineTo(sx + Math.cos(a) * h * 0.235, sy + Math.sin(a) * h * 0.235);
    ctx.stroke();
  }
  ctx.font = `700 ${h * 0.05}px "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${h * 0.012}px`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(157,182,255,0.8)';
  ctx.fillText('SELECT', sx, sy + h * 0.31);
  const labels = [['START', C.phosphor], ['NEXT', C.gold]];
  spec.buttons.forEach((b, i) => { const [bx, by] = at(b); ctx.fillStyle = labels[i][1]; ctx.fillText(labels[i][0], bx, by + h * 0.15); });
  spec.starts.forEach((b, i) => { const [bx, by] = at(b); ctx.fillStyle = 'rgba(234,232,225,0.7)'; ctx.fillText(`${i + 1}P`, bx, by + h * 0.1); });
  ctx.textAlign = 'left';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function doorArt(ctx, w, h, height, spec, glowOnly = false) {
  const m = (metres) => h - (metres / height) * h; // canvas y for a height on the door
  if (!glowOnly) {
    ctx.fillStyle = spec.shell ?? spec.body;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, m(0.1), w, h - m(0.1));
    ctx.fillStyle = spec.shell ? C.cobalt : 'rgba(77,116,255,0.8)';
    ctx.fillRect(0, m(0.1) - 4, w, 4);
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
  }
  // The coin door.
  const dw = w * 0.46;
  const dx = (w - dw) / 2;
  const top = m(Math.min(0.72, height - 0.1));
  const dh = m(0.26) - top;
  if (!glowOnly) {
    const g = ctx.createLinearGradient(dx, top, dx + dw, top + dh);
    g.addColorStop(0, '#3a3f4e');
    g.addColorStop(1, '#16181f');
    ctx.fillStyle = g;
    roundRect(ctx, dx, top, dw, dh, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    roundRect(ctx, dx + 6, top + 6, dw - 12, dh - 12, 8);
    ctx.stroke();
    // Lock and coin returns.
    ctx.fillStyle = '#9aa0b3';
    ctx.beginPath(); ctx.arc(dx + dw * 0.5, top + dh * 0.72, dw * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0b10';
    [0.28, 0.72].forEach((f) => { roundRect(ctx, dx + dw * f - dw * 0.12, top + dh * 0.84, dw * 0.24, dh * 0.08, 4); ctx.fill(); });
  }
  // Two lit coin slots.
  [0.28, 0.72].forEach((f) => {
    const sx = dx + dw * f - dw * 0.1;
    const sy = top + dh * 0.12;
    const sw = dw * 0.2;
    const sh = dh * 0.46;
    const lg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    lg.addColorStop(0, '#ff5a5a');
    lg.addColorStop(1, '#b3122c');
    ctx.fillStyle = lg;
    roundRect(ctx, sx, sy, sw, sh, 6);
    ctx.fill();
    ctx.fillStyle = '#1a0306';
    ctx.fillRect(sx + sw / 2 - 3, sy + sh * 0.1, 6, sh * 0.34);
    ctx.fillStyle = '#fff4f0';
    ctx.font = `800 ${sw * 0.34}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('25¢', sx + sw / 2, sy + sh * 0.78);
    ctx.textAlign = 'left';
  });
  if (glowOnly) return;
  ctx.font = `600 ${w * 0.018}px "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${w * 0.006}px`;
  ctx.textAlign = 'center';
  ctx.fillStyle = spec.shell ? 'rgba(16,19,31,0.55)' : 'rgba(157,182,255,0.45)';
  ctx.fillText('2600TH ARCADE · BUILT IN THE LAB', w / 2, m(0.2));
  ctx.textAlign = 'left';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function speakerArt(ctx, w, h) {
  ctx.fillStyle = '#07080f';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000';
  for (let y = 10; y < h - 6; y += 12) for (let x = 14 + ((y / 12) % 2) * 6; x < w - 10; x += 12) {
    const inL = Math.hypot(x - w * 0.25, y - h / 2) < h * 0.42;
    const inR = Math.hypot(x - w * 0.75, y - h / 2) < h * 0.42;
    if (inL || inR) { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); }
  }
}

function sideArt(ctx, w, h, spec, box) {
  // Canvas x is depth (z, 0 at the back), y is height (top of canvas is the top of the box).
  const X = (z) => (z / box[0]) * w;
  const Y = (y) => h - (y / box[1]) * h;
  if (spec.shell) {
    ctx.fillStyle = spec.shell;
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0.04)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // A cobalt sweep low on the shell, a gold pinstripe, and the name.
    ctx.fillStyle = C.cobalt;
    ctx.beginPath();
    ctx.moveTo(0, Y(0.26)); ctx.bezierCurveTo(X(0.35), Y(0.26), X(0.55), Y(0.5), X(1), Y(0.66));
    ctx.lineTo(X(1), Y(0.6)); ctx.bezierCurveTo(X(0.55), Y(0.44), X(0.35), Y(0.2), 0, Y(0.2));
    ctx.fill();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, Y(0.16)); ctx.bezierCurveTo(X(0.35), Y(0.16), X(0.55), Y(0.4), X(1), Y(0.56)); ctx.stroke();
    ctx.save();
    ctx.translate(X(0.12), Y(0.62));
    ctx.rotate(-Math.PI / 2);
    ctx.font = `900 ${w * 0.16}px Doto, "JetBrains Mono", monospace`;
    ctx.fillStyle = '#10131f';
    ctx.fillText('2600', 0, 0);
    ctx.font = `700 ${w * 0.05}px "JetBrains Mono", monospace`;
    ctx.fillStyle = C.cobalt;
    ctx.fillText('th', ctx.measureText('2600').width + w * 0.39, -w * 0.08);
    ctx.restore();
    return;
  }
  ctx.fillStyle = spec.body;
  ctx.fillRect(0, 0, w, h);
  // Speed stripes rising from the back of the cabinet to the control panel.
  const stripes = [C.deep, C.cobalt, C.phosphor, C.gold];
  stripes.forEach((colour, i) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    const o = i * 0.05;
    ctx.moveTo(X(0), Y(0.18 + o));
    ctx.lineTo(X(0.9), Y(0.72 + o));
    ctx.lineTo(X(0.9), Y(0.755 + o));
    ctx.lineTo(X(0), Y(0.215 + o));
    ctx.fill();
  });
  // The name, big and dotted, running up the side.
  ctx.save();
  ctx.translate(X(0.14), Y(1.08));
  ctx.rotate(-Math.PI / 2);
  ctx.font = `900 ${w * 0.3}px Doto, "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(77,116,255,0.95)';
  ctx.shadowColor = C.cobalt;
  ctx.shadowBlur = 20;
  ctx.fillText('2600', 0, 0);
  ctx.shadowBlur = 0;
  ctx.font = `700 ${w * 0.08}px "JetBrains Mono", monospace`;
  ctx.fillStyle = C.gold;
  ctx.fillText('th', ctx.measureText('2600').width * 3.7, -w * 0.18);
  ctx.restore();
  ctx.font = `700 ${w * 0.03}px "JetBrains Mono", monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${w * 0.01}px`;
  ctx.fillStyle = 'rgba(232,180,90,0.9)';
  ctx.fillText('ARCADE', X(0.26), Y(1.62));
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

/* ---------- The tube's HUD ---------- */
function hudPainter() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  let last = '';
  return {
    texture,
    draw({ title, ch, attract, blink }) {
      const key = `${title}|${ch}|${attract}|${blink}`;
      if (key === last) return;
      last = key;
      ctx.clearRect(0, 0, 1024, 640);
      const g = ctx.createLinearGradient(0, 0, 0, 130);
      g.addColorStop(0, 'rgba(2,3,8,0.85)');
      g.addColorStop(1, 'rgba(2,3,8,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1024, 130);
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
      ctx.font = '700 24px "JetBrains Mono", monospace';
      glowText(ctx, '1UP', 70, 62, '#ffffff', C.cobalt, 8);
      ctx.font = '900 30px Doto, "JetBrains Mono", monospace';
      glowText(ctx, '2600', 136, 62, C.gold, C.gold, 8);
      ctx.textAlign = 'right';
      ctx.font = '900 30px Doto, "JetBrains Mono", monospace';
      glowText(ctx, ch, 954, 62, C.gold, C.gold, 8);
      ctx.font = '700 24px "JetBrains Mono", monospace';
      glowText(ctx, 'CH', 954 - ctx.measureText(ch).width - 28, 62, '#ffffff', C.cobalt, 8);
      ctx.textAlign = 'center';
      ctx.font = '700 24px "JetBrains Mono", monospace';
      glowText(ctx, title.toUpperCase().slice(0, 28), 512, 62, C.phosphor, C.cobalt, 8);
      if (attract) {
        if (blink) {
          ctx.font = '900 64px Doto, "JetBrains Mono", monospace';
          const pw = ctx.measureText('PRESS START').width;
          ctx.fillStyle = 'rgba(3,4,10,0.72)';
          ctx.fillRect(512 - pw / 2 - 22, 470, pw + 44, 84);
          glowText(ctx, 'PRESS START', 512, 514, C.gold, C.gold, 14);
        }
        ctx.font = '600 18px "JetBrains Mono", monospace';
        const note = 'DEMO LOOP · PICK A CARTRIDGE TO PLAY';
        const nw = ctx.measureText(note).width;
        ctx.fillStyle = 'rgba(3,4,10,0.6)';
        ctx.fillRect(512 - nw / 2 - 12, 566, nw + 24, 32);
        glowText(ctx, note, 512, 583, C.phosphor, C.cobalt, 4);
      }
      ctx.textAlign = 'left';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      texture.needsUpdate = true;
    },
  };
}

/* ---------- Controls on the panel ---------- */
function stickPart(mats) {
  const pivot = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.036, 0.004, 40), mats.dark);
  plate.position.y = 0.002;
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 32), mats.black);
  washer.position.y = 0.005;
  const lever = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0065, 0.058, 16), mats.metal);
  shaft.position.y = 0.029;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 24), mats.red);
  ball.position.y = 0.068;
  lever.add(shaft, ball);
  pivot.add(plate, washer, lever);
  return { group: pivot, lever, ball };
}

function buttonPart(colour, r, mats) {
  const group = new THREE.Group();
  const bezel = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.3, r * 1.36, 0.008, 40), mats.black);
  bezel.position.y = 0.004;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.02, 0.012, 40), new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, emissive: colour, emissiveIntensity: 0.08, envMapIntensity: 0.35 }));
  cap.position.y = 0.011;
  group.add(bezel, cap);
  return { group, cap };
}

/* ---------- The scene ---------- */
export function mount(host, { style: name = 'upright' } = {}) {
  const spec = STYLES[name] ?? STYLES.upright;
  const root = host.closest('[data-arcade]');
  const screenEl = root.querySelector('[data-arcade-screen]');
  const canvas = document.createElement('canvas');
  canvas.className = 'arcade__3d';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  // Reflections are set per material (scene.environment would override envMapIntensity): a
  // bright room in black glass reads as grey plastic.
  const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xfff0dc, 1.15);
  key.position.set(-2.6, 3.4, 1.6);
  const fill = new THREE.DirectionalLight(0x9db6ff, 0.35);
  fill.position.set(2, 1, 2);
  const rim = new THREE.PointLight(0x4d74ff, 6, 5, 1.6);
  rim.position.set(1.2, 2.1, -0.8);
  const rim2 = new THREE.PointLight(0xe8b45a, 1.4, 3, 1.8);
  rim2.position.set(-1.2, 0.3, -0.9);
  scene.add(key, fill, rim, rim2);

  const cab = new THREE.Group();
  scene.add(cab);
  const segs = segments(spec);
  const byId = Object.fromEntries(segs.map((seg) => [seg.id, seg]));
  const inner = spec.width / 2 - spec.side;
  const box = [Math.max(...segs.flatMap((s) => s.points.map((p) => p[0]))) + 0.02, Math.max(...segs.flatMap((s) => s.points.map((p) => p[1]))) + 0.02];

  const mats = {
    body: new THREE.MeshStandardMaterial({ color: spec.shell ?? spec.body, roughness: spec.shell ? 0.32 : 0.6, envMapIntensity: spec.shell ? 0.35 : 0.06 }),
    front: new THREE.MeshStandardMaterial({ color: spec.body, roughness: 0.6, envMapIntensity: 0.05 }),
    black: new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.5, envMapIntensity: 0.05 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a1d29, roughness: 0.4, metalness: 0.3, envMapIntensity: 0.3 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xb8bfd0, roughness: 0.25, metalness: 1, envMapIntensity: 0.9 }),
    red: new THREE.MeshPhysicalMaterial({ color: 0xc21f3a, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.45 }),
    trim: new THREE.MeshPhysicalMaterial({ color: spec.trim, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: spec.shell ? 0.35 : 0.22 }),
  };

  /* Side panels, with their T-molding. */
  const shape = new THREE.Shape();
  shape.moveTo(...spec.start);
  spec.segs.forEach((seg) => {
    if (seg.via) shape.quadraticCurveTo(seg.via[0], seg.via[1], seg.to[0], seg.to[1]);
    else shape.lineTo(seg.to[0], seg.to[1]);
  });
  const sideGeometry = new THREE.ExtrudeGeometry(shape, { depth: spec.side - spec.bevel * 2, bevelEnabled: true, bevelThickness: spec.bevel, bevelSize: spec.bevel, bevelSegments: 4, curveSegments: 24 });
  sideGeometry.translate(0, 0, spec.bevel);
  sideGeometry.rotateY(-Math.PI / 2);
  const art = paint(1024, 2048, (ctx, w, h) => sideArt(ctx, w, h, spec, box));
  art.repeat.set(1 / box[0], 1 / box[1]);
  const sideMat = new THREE.MeshPhysicalMaterial({ map: art, roughness: spec.shell ? 0.3 : 0.5, clearcoat: spec.shell ? 0.8 : 0.35, clearcoatRoughness: 0.25, envMapIntensity: spec.shell ? 0.3 : 0.08 });
  const left = new THREE.Mesh(sideGeometry, [sideMat, mats.trim]);
  left.position.x = -inner;
  const right = new THREE.Mesh(sideGeometry, [sideMat, mats.trim]);
  right.position.x = inner + spec.side;
  cab.add(left, right);

  /* The front, surface by surface. */
  const surface = (seg, material) => {
    const mesh = new THREE.Mesh(ribbon(seg.points, inner), material);
    cab.add(mesh);
    return mesh;
  };
  const tex = (seg, draw, px = 1024) => paint(px, (px * seg.length) / (inner * 2), draw);
  const plain = new Set(['base', 'top', 'back', 'back2', 'cap', 'under']);
  segs.forEach((seg) => {
    if (plain.has(seg.id)) surface(seg, spec.shell && seg.id !== 'base' ? mats.body : mats.front);
  });
  surface(byId.lip, mats.trim);
  if (byId.speaker) surface(byId.speaker, new THREE.MeshStandardMaterial({ map: tex(byId.speaker, speakerArt), roughness: 0.7, envMapIntensity: 0.03 }));

  // Marquee: a lightbox.
  const marqueeTex = tex(byId.marquee, (ctx, w, h) => marqueeArt(ctx, w, h, name));
  const marqueeMat = new THREE.MeshBasicMaterial({ map: marqueeTex, toneMapped: false });
  surface(byId.marquee, marqueeMat);
  const marqueeLight = new THREE.PointLight(0x7f9bff, 0.7, 1.2, 1.8);
  const mf = frameOf(byId.marquee);
  marqueeLight.position.copy(mf.centre).addScaledVector(mf.n, 0.3);
  cab.add(marqueeLight);

  // Coin door.
  const doorH = byId.door.length;
  const doorTex = tex(byId.door, (ctx, w, h) => doorArt(ctx, w, h, doorH, spec), 768);
  const doorGlow = tex(byId.door, (ctx, w, h) => doorArt(ctx, w, h, doorH, spec, true), 768);
  surface(byId.door, new THREE.MeshStandardMaterial({ map: doorTex, emissive: 0xffffff, emissiveMap: doorGlow, emissiveIntensity: 1.1, roughness: 0.55, envMapIntensity: 0.06 }));

  // Control panel, and what's on it.
  const cpTex = tex(byId.cp, (ctx, w, h) => panelArt(ctx, w, h, spec));
  surface(byId.cp, new THREE.MeshPhysicalMaterial({ map: cpTex, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.1 }));
  const cp = frameOf(byId.cp);
  cab.add(cp.mount);
  const place = (object, [fx, fy]) => {
    object.position.set((fx - 0.5) * inner * 2, 0, (fy - 0.5) * byId.cp.length);
    cp.mount.add(object);
  };
  const stick = stickPart(mats);
  place(stick.group, spec.stick);
  const btnA = buttonPart(0x3a5cff, 0.019, mats);
  const btnB = buttonPart(0xe8b45a, 0.019, mats);
  place(btnA.group, spec.buttons[0]);
  place(btnB.group, spec.buttons[1]);
  spec.starts.forEach((p) => place(buttonPart(0xeae8e1, 0.01, mats).group, p));

  // Bezel, the tube behind it, and the glass.
  const sf = frameOf(byId.screen);
  cab.add(sf.face);
  const px = 1024 / (inner * 2);
  const open = [spec.opening[0] * px, spec.opening[1] * px];
  const bezelTex = tex(byId.screen, (ctx, w, h) => bezelArt(ctx, w, h, open));
  surface(byId.screen, new THREE.MeshPhysicalMaterial({ map: bezelTex, alphaTest: 0.5, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.04 }));
  const [ow, oh] = spec.opening;
  const well = new THREE.Mesh(new THREE.BoxGeometry(ow + 0.02, oh + 0.02, 0.1), new THREE.MeshBasicMaterial({ color: 0x010102, side: THREE.BackSide }));
  well.position.z = -0.05;
  sf.face.add(well);

  const hud = hudPainter();
  const uniforms = {
    uTex: { value: null }, uHud: { value: hud.texture },
    uRes: { value: new THREE.Vector2(720, 450) }, uTexSize: { value: new THREE.Vector2(16, 9) },
    uTime: { value: 0 }, uSwitch: { value: 0 }, uStart: { value: 0 }, uCurve: { value: 0.35 },
  };
  const tubeGeometry = new THREE.PlaneGeometry(ow + 0.012, oh + 0.012, 32, 20);
  const pos = tubeGeometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / ((ow + 0.012) / 2);
    const y = pos.getY(i) / ((oh + 0.012) / 2);
    pos.setZ(i, 0.016 * (1 - x * x * 0.8) * (1 - y * y * 0.8));
  }
  tubeGeometry.computeVertexNormals();
  const tube = new THREE.Mesh(tubeGeometry, new THREE.ShaderMaterial({
    defines: { HUD: '' },
    uniforms,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uTex, uHud; uniform vec2 uRes, uTexSize; uniform float uTime, uSwitch, uStart, uCurve; varying vec2 vUv;
${CRT_GLSL}
void main() { gl_FragColor = crt(vUv); }`,
    toneMapped: false,
  }));
  tube.position.z = -0.04;
  sf.face.add(tube);
  const glare = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), new THREE.MeshBasicMaterial({
    map: paint(512, 320, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(255,255,255,0.0)');
      g.addColorStop(0.3, 'rgba(255,255,255,0.22)');
      g.addColorStop(0.42, 'rgba(255,255,255,0.0)');
      g.addColorStop(0.7, 'rgba(255,255,255,0.0)');
      g.addColorStop(0.78, 'rgba(255,255,255,0.08)');
      g.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55,
  }));
  glare.position.z = -0.003;
  sf.face.add(glare);
  const screenLight = new THREE.PointLight(0x9db6ff, 0.5, 1.2, 1.8);
  screenLight.position.set(0, -0.05, 0.3);
  sf.face.add(screenLight);

  // A cobalt glow behind the cabinet, so its dark edges read against the page.
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({
    map: paint(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(77,116,255,0.32)');
      g.addColorStop(0.5, 'rgba(36,71,216,0.1)');
      g.addColorStop(1, 'rgba(36,71,216,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.position.set(0, box[1] * 0.62, -0.5);
  scene.add(halo);

  // Where the cabinet stands: a soft shadow on the floor.
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({
    map: paint(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(0,0,0,0.75)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }),
    transparent: true, depthWrite: false,
  }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.001, box[0] / 2);
  scene.add(shadow);

  scene.traverse((object) => {
    [object.material].flat().forEach((material) => { if (material && 'envMapIntensity' in material && !material.envMap) material.envMap = envMap; });
  });

  /* ---------- The picture ---------- */
  const sources = collectSources(screenEl);
  const textures = new Map();
  const textureFor = (id) => {
    const source = sources.get(id);
    if (!source) return null;
    if (!textures.has(id)) {
      let entry;
      if (source.kind === 'img') {
        // A detached, decoded copy: the page's own <img> is tucked away unpainted, and
        // Chrome won't upload an image it hasn't decoded.
        const image = new Image();
        image.src = source.img.currentSrc || source.img.src;
        const t = new THREE.Texture(image);
        entry = { texture: t, size: [16, 9] };
        image.decode().then(() => { t.needsUpdate = true; entry.size = [image.naturalWidth, image.naturalHeight]; }).catch(() => {});
      } else if (source.kind === 'video') {
        const poster = new THREE.Texture(source.poster);
        const video = new THREE.VideoTexture(source.video);
        entry = { texture: poster, poster, video, size: [16, 9] };
        const ready = () => { poster.needsUpdate = true; entry.size = [source.poster.naturalWidth, source.poster.naturalHeight]; };
        if (source.poster.complete && source.poster.naturalWidth) ready(); else source.poster.addEventListener('load', ready, { once: true });
      } else {
        entry = { texture: new THREE.CanvasTexture(source.term.canvas), size: source.term.size };
      }
      textures.set(id, entry);
    }
    return textures.get(id);
  };
  let currentId = screenEl.querySelector('[data-feed][data-on]')?.dataset.feed;
  const state = { sw: 0, start: 0, frame: 0, pointer: { x: 0, y: 0 } };

  const hudTitle = root.querySelector('[data-arcade-hud]');
  const hudCh = root.querySelector('[data-arcade-ch]');

  /* ---------- Camera ---------- */
  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 30);
  const look = new THREE.Vector3();
  const view = { f: 0 };
  const place3 = (time) => {
    const a = spec.hero;
    const b = spec.close;
    const f = view.f;
    const mix = (p, q) => p + (q - p) * f;
    const sway = Math.sin(time * 0.23) * 0.035 * (1 - f);
    const az = mix(a.az, b.az) + sway + state.pointer.x * 0.12;
    const el = mix(a.el, b.el) + state.pointer.y * 0.05;
    const dist = mix(a.dist, b.dist);
    look.set(mix(a.target[0], b.target[0]), mix(a.target[1], b.target[1]), mix(a.target[2], b.target[2]));
    camera.position.set(look.x + Math.sin(az) * Math.cos(el) * dist, look.y + Math.sin(el) * dist, look.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(look);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    // Narrow boxes stand further back so the cabinet still fits.
    camera.fov = camera.aspect < 0.8 ? 30 : 24;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ---------- Pointer: lean, and press what's under it ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const targets = [tube, btnA.cap, btnB.cap, stick.ball];
  const hit = (event) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(targets, false)[0]?.object ?? null;
  };
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    state.pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    canvas.style.cursor = hit(event) ? 'pointer' : '';
  });
  canvas.addEventListener('pointerenter', () => gsap.to(view, { f: 1, duration: 1.1, ease: 'power3.inOut', overwrite: true }));
  canvas.addEventListener('pointerleave', () => {
    state.pointer.x = 0;
    state.pointer.y = 0;
    gsap.to(view, { f: 0, duration: 1.3, ease: 'power3.inOut', overwrite: true });
  });
  canvas.addEventListener('click', (event) => {
    const object = hit(event);
    if (object === tube) screenEl.click();
    else if (object === btnA.cap) root.querySelector('[data-arcade-press="start"]')?.click();
    else if (object === btnB.cap || object === stick.ball) root.querySelector('[data-arcade-press="next"]')?.click();
  });

  // The page's deck drives the parts: the stick leans, the buttons go down.
  const htmlStick = root.querySelector('.arcade__stick');
  const tilt = new MutationObserver(() => {
    const dir = htmlStick.dataset.dir;
    gsap.to(stick.lever.rotation, { x: dir === 'up' ? -0.32 : dir === 'down' ? 0.32 : 0, z: dir === 'push' ? 0.22 : 0, duration: 0.12, ease: 'power2.out' });
  });
  if (htmlStick) tilt.observe(htmlStick, { attributes: true, attributeFilter: ['data-dir'] });
  const press = new MutationObserver((records) => {
    records.forEach((record) => {
      const cap = record.target.dataset.arcadePress === 'start' ? btnA.cap : btnB.cap;
      gsap.to(cap.position, { y: record.target.dataset.down ? 0.006 : 0.011, duration: 0.07 });
    });
  });
  root.querySelectorAll('[data-arcade-press]').forEach((element) => press.observe(element, { attributes: true, attributeFilter: ['data-down'] }));

  root.addEventListener('arcade:select', (event) => {
    gsap.killTweensOf(state, 'sw');
    gsap.timeline()
      .to(state, { sw: 1, duration: 0.16, ease: 'power2.in' })
      .add(() => { currentId = event.detail.id; sources.get(currentId)?.term?.reset(); })
      .to(state, { sw: 0, duration: 0.5, ease: 'power2.out' });
  });
  const starting = new MutationObserver(() => {
    if (root.dataset.starting === 'true') gsap.to(state, { start: 1, duration: 0.25, ease: 'power3.in' });
  });
  starting.observe(root, { attributes: true, attributeFilter: ['data-starting'] });
  addEventListener('pageshow', () => { state.start = 0; });

  /* ---------- Frame ---------- */
  const frame = (now) => {
    const time = now * timeScale();
    const entry = textureFor(currentId);
    if (entry) {
      const source = sources.get(currentId);
      if (source.kind === 'video') {
        const live = !source.video.paused && source.video.readyState >= 2;
        entry.texture = live ? entry.video : entry.poster;
        // The page's video is tucked away off the page, so upload its frames by hand.
        if (live) { entry.video.needsUpdate = true; entry.size = [source.video.videoWidth, source.video.videoHeight]; }
      } else if (source.kind === 'term') {
        source.term.draw(time);
        entry.texture.needsUpdate = true;
      }
      uniforms.uTex.value = entry.texture;
      uniforms.uTexSize.value.set(...entry.size);
    }
    hud.draw({ title: hudTitle?.textContent ?? '', ch: hudCh?.textContent ?? '01', attract: root.dataset.attract === 'true', blink: Math.floor(time / 0.55) % 2 === 0 });
    uniforms.uTime.value = time;
    uniforms.uSwitch.value = state.sw;
    uniforms.uStart.value = state.start;
    // The marquee's tube flickers now and then.
    const flicker = Math.sin(time * 0.9) > 0.985 ? 0.55 : 1;
    marqueeMat.color.setScalar(flicker);
    marqueeLight.intensity = 0.7 * flicker;
    screenLight.intensity = 0.45 + 0.25 * Math.sin(time * 7) * state.sw;
    place3(time);
    halo.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
  };
  const loop = sceneLoop(canvas, frame);
  if (import.meta.env.DEV) window.__cab = { uniforms, textures, sources, view, renderer, scene, camera, spec, lights: { key, fill, rim, rim2, marqueeLight, screenLight }, mats };
  host.dataset.cab3d = 'on';
  loop.wake();

  return {
    setMotion(on) { if (on) loop.wake(); },
    destroy() { loop.stop(); tilt.disconnect(); press.disconnect(); starting.disconnect(); renderer.dispose(); },
  };
}

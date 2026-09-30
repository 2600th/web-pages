// The badge display: the homepage's 2600th character, shown three ways (prototype).
//   holo   the photo under a holographic security foil that shifts as the badge tilts
//   dither a 4-tone phosphor LCD in ordered dither; a lens under the pointer shows true colour
//   lock   the picture tunes in from noise and locks at 2600 Hz; B retunes, it slips now and then
import { sfx } from '../audio.js';
import { motionOn } from './mount.js';

const SRC = '/media/signal/character.webp';
// Head-and-shoulders crop of the 720 × 1003 cut-out, as fractions of the display.
const CROP = { w: 1.96, x: -0.4, y: 0.03 };
const PALETTE = [[3, 4, 10], [27, 42, 122], [77, 116, 255], [201, 214, 255]];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const ease = (t) => 1 - (1 - t) ** 3;

function loadImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = SRC;
  });
}

/** Backdrop and cropped cut-out, drawn at the display's size. */
function paintPhoto(ctx, img, w, h) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.85);
  g.addColorStop(0, '#1d2f86');
  g.addColorStop(0.55, '#0b1238');
  g.addColorStop(1, '#03040a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(157,182,255,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += w / 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const iw = w * CROP.w;
  ctx.drawImage(img, w * CROP.x, h * CROP.y, iw, iw * (img.naturalHeight / img.naturalWidth));
}

function makeCanvas(screen) {
  const canvas = document.createElement('canvas');
  canvas.className = 'bdg__cv';
  canvas.setAttribute('aria-hidden', 'true');
  screen.querySelector('.bdg__photo').after(canvas);
  return canvas;
}

function size(screen, canvas) {
  const rect = screen.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  return { w: canvas.width, h: canvas.height, dpr };
}

/* ---------- holo: CSS foil driven by the badge's own pointer tilt ---------- */
function holo(screen) {
  const foil = document.createElement('span');
  foil.className = 'bdg__foil';
  foil.setAttribute('aria-hidden', 'true');
  const seal = document.createElement('span');
  seal.className = 'bdg__seal';
  seal.setAttribute('aria-hidden', 'true');
  seal.innerHTML = '<svg viewBox="0 0 100 100"><defs><path id="bdg-seal-arc" d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0" /></defs><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="28" /><text><textPath href="#bdg-seal-arc">2600 HZ · LINE IDLE · 2600 HZ · LINE IDLE ·</textPath></text><text x="50" y="57" text-anchor="middle" class="bdg__seal-no">2600</text></svg>';
  screen.querySelector('.bdg__photo').append(foil, seal);
  return { retune() { screen.dataset.flash = 'true'; setTimeout(() => delete screen.dataset.flash, 500); } };
}

/* ---------- dither: ordered-dither LCD with a true-colour lens ---------- */
async function dither(screen) {
  const img = await loadImage();
  const canvas = makeCanvas(screen);
  const ctx = canvas.getContext('2d');
  let { w, h } = size(screen, canvas);
  const full = document.createElement('canvas');
  const low = document.createElement('canvas');
  let lowData = null;
  const build = () => {
    ({ w, h } = size(screen, canvas));
    full.width = w; full.height = h;
    paintPhoto(full.getContext('2d'), img, w, h);
    low.width = 120; low.height = Math.round(120 * (h / w));
    const lc = low.getContext('2d');
    lc.drawImage(full, 0, 0, low.width, low.height);
    const data = lc.getImageData(0, 0, low.width, low.height);
    const px = data.data;
    for (let y = 0; y < low.height; y++) {
      for (let x = 0; x < low.width; x++) {
        const o = (y * low.width + x) * 4;
        const lum = Math.min(1, (0.3 * px[o] + 0.59 * px[o + 1] + 0.11 * px[o + 2]) / 255 * 1.35);
        const v = lum * (PALETTE.length - 1);
        const base = Math.floor(v);
        const level = Math.min(PALETTE.length - 1, v - base > BAYER[(y % 4) * 4 + (x % 4)] ? base + 1 : base);
        [px[o], px[o + 1], px[o + 2]] = PALETTE[level];
        px[o + 3] = 255;
      }
    }
    lc.putImageData(data, 0, 0);
    lowData = low;
  };
  const drawDither = (rows = 1) => {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#03040a';
    ctx.fillRect(0, 0, w, h);
    const shown = Math.round(low.height * rows);
    ctx.drawImage(lowData, 0, 0, low.width, shown, 0, 0, w, (h * shown) / low.height);
  };
  let lens = null;
  let colour = false;
  const draw = () => {
    if (colour) { ctx.drawImage(full, 0, 0); return; }
    drawDither();
    if (!lens) return;
    const r = w * 0.24;
    ctx.save();
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(full, 0, 0);
    ctx.restore();
    ctx.strokeStyle = 'rgba(201,214,255,0.9)';
    ctx.lineWidth = 1.5 * (w / screen.clientWidth);
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  // E-ink refresh: flash inverted, then the rows draw in from the top.
  const refresh = () => {
    if (!motionOn()) { draw(); return; }
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / 900;
      if (t < 0.12) { ctx.fillStyle = t < 0.06 ? '#c9d6ff' : '#03040a'; ctx.fillRect(0, 0, w, h); }
      else if (t < 1) drawDither(ease((t - 0.12) / 0.88));
      else { draw(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  build();
  draw();
  screen.dataset.canvas = 'on';
  screen.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    lens = { x: ((event.clientX - rect.left) / rect.width) * w, y: ((event.clientY - rect.top) / rect.height) * h };
    draw();
  });
  screen.addEventListener('pointerleave', () => { lens = null; draw(); });
  screen.addEventListener('click', () => { colour = !colour; draw(); });
  new ResizeObserver(() => { build(); draw(); }).observe(screen);
  return { start: refresh, retune: refresh };
}

/* ---------- lock: tune in from noise and lock at 2600 Hz ---------- */
async function lock(screen) {
  const img = await loadImage();
  const canvas = makeCanvas(screen);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let { w, h, dpr } = size(screen, canvas);
  const full = document.createElement('canvas');
  const small = document.createElement('canvas');
  const noise = document.createElement('canvas');
  noise.width = 160; noise.height = 160;
  const nctx = noise.getContext('2d');
  const nd = nctx.createImageData(160, 160);
  for (let i = 0; i < nd.data.length; i += 4) { const v = Math.random() * 255; nd.data[i] = v * 0.7; nd.data[i + 1] = v * 0.8; nd.data[i + 2] = v; nd.data[i + 3] = 255; }
  nctx.putImageData(nd, 0, 0);
  const build = () => {
    ({ w, h, dpr } = size(screen, canvas));
    full.width = w; full.height = h;
    paintPhoto(full.getContext('2d'), img, w, h);
  };
  // p runs 0 (no signal) → 1 (locked).
  const render = (p, time) => {
    const e = ease(Math.max(0, Math.min(1, p)));
    if (e >= 1) { ctx.drawImage(full, 0, 0); return; }
    const block = Math.max(1, Math.round((1 + 20 * (1 - e) ** 2) * dpr));
    small.width = Math.max(1, Math.round(w / block));
    small.height = Math.max(1, Math.round(h / block));
    const sctx = small.getContext('2d');
    sctx.drawImage(full, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#03040a';
    ctx.fillRect(0, 0, w, h);
    // Horizontal tearing, strongest before the lock.
    const band = Math.max(2, Math.round(5 * dpr));
    const amp = (1 - e) * w * 0.3;
    for (let y = 0; y < h; y += band) {
      const dx = (Math.random() - 0.5) * 2 * amp * (Math.random() < 0.35 ? 1 : 0.25);
      ctx.drawImage(small, 0, (y / h) * small.height, small.width, (band / h) * small.height, dx, y, w, band);
    }
    // Colour fringing: red and blue slip apart and come back together.
    const shift = Math.round((1 - e) * 7 * dpr);
    if (shift > 0) {
      const frame = ctx.getImageData(0, 0, w, h);
      const src = new Uint8ClampedArray(frame.data);
      const px = frame.data;
      for (let y = 0; y < h; y++) {
        const row = y * w;
        for (let x = 0; x < w; x++) {
          const o = (row + x) * 4;
          px[o] = src[(row + Math.min(w - 1, x + shift)) * 4];
          px[o + 2] = src[(row + Math.max(0, x - shift)) * 4 + 2];
        }
      }
      ctx.putImageData(frame, 0, 0);
    }
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (1 - e) * 0.9;
    const ox = Math.random() * 160;
    const oy = Math.random() * 160;
    for (let y = -oy; y < h; y += 160 * dpr) for (let x = -ox; x < w; x += 160 * dpr) ctx.drawImage(noise, x, y, 160 * dpr, 160 * dpr);
    ctx.globalAlpha = (1 - e) * 0.5;
    const roll = ((time * 1.4) % 1) * h;
    ctx.fillStyle = '#9db6ff';
    ctx.fillRect(0, roll, w, 10 * dpr);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
  let raf = 0;
  const run = (from, duration, onDone) => {
    cancelAnimationFrame(raf);
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / duration;
      render(from + (1 - from) * Math.min(1, t), now / 1000);
      if (t < 1) raf = requestAnimationFrame(step);
      else onDone?.();
    };
    raf = requestAnimationFrame(step);
  };
  const osd = screen.querySelector('[data-badge-osd]');
  const tuneIn = () => {
    if (!motionOn()) { render(1, 0); return; }
    run(0, 1500, () => {
      sfx.lock();
      if (osd) { osd.textContent = 'Locked · 2600 Hz'; osd.dataset.flash = 'true'; setTimeout(() => { delete osd.dataset.flash; osd.textContent = '2600 Hz · line idle'; }, 1200); }
    });
  };
  // Now and then the sync slips for a moment.
  const slip = () => {
    setTimeout(() => {
      if (motionOn() && !document.hidden && !screen.closest('[data-reading]')) run(0.72, 260);
      slip();
    }, 7000 + Math.random() * 6000);
  };
  build();
  render(0, 0);
  screen.dataset.canvas = 'on';
  new ResizeObserver(() => { build(); render(1, 0); }).observe(screen);
  slip();
  return { start: tuneIn, retune: tuneIn };
}

export async function mountScreen(screen, mode) {
  screen.dataset.mode = mode;
  if (mode === 'holo') return holo(screen);
  if (mode === 'dither') return dither(screen);
  return lock(screen);
}

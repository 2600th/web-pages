// The badge display: the homepage's 2600th character, tuned in like the homepage portrait.
// When the badge comes into view the picture climbs out of static (blocks, tearing, colour
// fringing) and locks at 2600 Hz; B retunes it. While the badge is on screen the sync slips
// for a moment now and then, a few times per visit. With motion off it is a still picture.
import { sfx } from '../audio.js';
import { motionOn } from './mount.js';

// Head-and-shoulders crop of the 720 × 1003 cut-out, as fractions of the display.
const CROP = { w: 1.96, x: -0.4, y: 0.03 };
const TUNE_MS = 1500;
const SLIP_MS = 260;
const MAX_SLIPS = 4;

const ease = (t) => 1 - (1 - t) ** 3;

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

function noiseTile() {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 160;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(160, 160);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = v * 0.7; data.data[i + 1] = v * 0.8; data.data[i + 2] = v; data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  return tile;
}

export async function mountScreen(screen) {
  const img = screen.querySelector('.bdg__photo img');
  if (!img) return null;
  if (!img.complete || !img.naturalWidth) await new Promise((resolve) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); });
  if (!img.naturalWidth) return null;
  await img.decode?.().catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.className = 'bdg__cv';
  canvas.setAttribute('aria-hidden', 'true');
  screen.querySelector('.bdg__photo').after(canvas);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const full = document.createElement('canvas');
  const small = document.createElement('canvas');
  const noise = noiseTile();
  let w = 1;
  let h = 1;
  let dpr = 1;

  const build = () => {
    const rect = screen.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = full.width = Math.max(1, Math.round(rect.width * dpr));
    h = canvas.height = full.height = Math.max(1, Math.round(rect.height * dpr));
    paintPhoto(full.getContext('2d'), img, w, h);
  };

  // p runs from 0 (no signal) to 1 (locked).
  const render = (p, time) => {
    const e = ease(Math.max(0, Math.min(1, p)));
    if (e >= 1) { ctx.drawImage(full, 0, 0); return; }
    const block = Math.max(1, Math.round((1 + 20 * (1 - e) ** 2) * dpr));
    small.width = Math.max(1, Math.round(w / block));
    small.height = Math.max(1, Math.round(h / block));
    small.getContext('2d').drawImage(full, 0, 0, small.width, small.height);
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
    // Static and a rolling bar over the top.
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (1 - e) * 0.9;
    const size = 160 * dpr;
    const ox = Math.random() * size;
    const oy = Math.random() * size;
    for (let y = -oy; y < h; y += size) for (let x = -ox; x < w; x += size) ctx.drawImage(noise, x, y, size, size);
    ctx.globalAlpha = (1 - e) * 0.5;
    ctx.fillStyle = '#9db6ff';
    ctx.fillRect(0, ((time * 1.4) % 1) * h, w, 10 * dpr);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  let raf = 0;
  let locked = false;
  const run = (from, duration, onDone) => {
    cancelAnimationFrame(raf);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      render(from + (1 - from) * t, now / 1000);
      if (t < 1) raf = requestAnimationFrame(step);
      else { raf = 0; onDone?.(); }
    };
    raf = requestAnimationFrame(step);
  };
  const settle = () => { cancelAnimationFrame(raf); raf = 0; locked = true; render(1, 0); };

  const osd = screen.querySelector('[data-badge-osd]');
  const idle = osd?.textContent ?? '';
  let osdTimer = 0;
  const announce = () => {
    if (!osd) return;
    clearTimeout(osdTimer);
    osd.textContent = 'Locked · 2600 Hz';
    osd.dataset.flash = 'true';
    osdTimer = setTimeout(() => { delete osd.dataset.flash; osd.textContent = idle; }, 1200);
  };
  const tuneIn = () => {
    if (!motionOn()) { settle(); return; }
    locked = false;
    run(0, TUNE_MS, () => { locked = true; sfx.lock(); announce(); });
  };

  // The occasional slip: only once locked, while the badge is on screen and nobody is reading a year.
  let visible = false;
  let slips = 0;
  let slipTimer = 0;
  const scheduleSlip = () => {
    clearTimeout(slipTimer);
    if (slips >= MAX_SLIPS || !visible) return;
    slipTimer = setTimeout(() => {
      if (locked && visible && motionOn() && !document.hidden && !screen.closest('[data-reading]')) {
        slips += 1;
        run(0.72, SLIP_MS);
      }
      scheduleSlip();
    }, 9000 + Math.random() * 6000);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) scheduleSlip(); else clearTimeout(slipTimer);
  }).observe(screen);

  build();
  // Before it tunes in the display shows no signal; with motion off it shows the picture.
  if (motionOn()) render(0, 0); else settle();
  screen.dataset.canvas = 'on';
  // Resizing clears the canvas; redraw it unless a tune-in is already drawing every frame.
  new ResizeObserver(() => { build(); if (!raf) render(locked || !motionOn() ? 1 : 0, 0); }).observe(screen);
  document.addEventListener('signal:motion', (event) => { if (!event.detail.on) settle(); });
  return { start: tuneIn, retune: tuneIn };
}

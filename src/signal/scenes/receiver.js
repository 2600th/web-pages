// The Notes receiver: a waterfall display. Time falls down the screen; each note is a
// carrier at its channel, coloured by type. The tuned station burns brighter, filtered
// bands fade out. With motion off it draws one still frame.
import { fitCanvas, sceneLoop, motionOn } from './mount.js';

const TONES = { cobalt: [77, 116, 255], ink: [234, 232, 225], phosphor: [157, 182, 255] };

export function mount(host) {
  const canvas = host.querySelector('[data-rx-canvas]');
  const stations = JSON.parse(host.querySelector('[data-rx-stations]')?.textContent ?? '[]');
  const count = stations.length;
  let tuned = count;
  let hidden = new Set();
  // Per-station gain eases toward its target so tuning and filtering glide.
  const gain = stations.map((_, i) => (i + 1 === tuned ? 1 : 0.55));
  // Each station keys on and off in its own rhythm, like a real transmitter.
  const rhythm = stations.map((_, i) => ({ rate: 0.6 + ((i * 37) % 11) / 8, phase: i * 1.7 }));

  const buffer = document.createElement('canvas');
  const bctx = buffer.getContext('2d');
  let row = null;
  let ctx = null;
  const fit = fitCanvas(canvas, ({ w, h }) => {
    buffer.width = Math.max(1, Math.round(w / 2));
    buffer.height = Math.max(1, Math.round(h / 2));
    row = bctx.createImageData(buffer.width, 1);
    bctx.fillStyle = '#03040a';
    bctx.fillRect(0, 0, buffer.width, buffer.height);
    for (let y = 0; y < buffer.height; y++) paintRow(y * 0.05);
    if (ctx) draw();
  });
  ctx = fit.ctx;
  const size = fit.size;

  function paintRow(t) {
    if (!row) return;
    const w = buffer.width;
    const data = row.data;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      // Noise floor: a faint cobalt hiss.
      let r = 3, g = 5, b = 14;
      const hiss = Math.random() ** 3 * 38;
      r += hiss * 0.3; g += hiss * 0.45; b += hiss;
      for (let i = 0; i < count; i++) {
        const centre = (i + 0.5) / count;
        const d = Math.abs(u - centre) * count;
        if (d > 0.5) continue;
        const keyed = 0.55 + 0.45 * Math.sin(t * rhythm[i].rate * 6 + rhythm[i].phase) * Math.sin(t * rhythm[i].rate * 2.3 + rhythm[i].phase * 2);
        const width = 0.035 + gain[i] * 0.05;
        const e = Math.exp(-(d * d) / (width * width)) * gain[i] * (0.45 + 0.55 * keyed);
        // Sidebands: a thin echo either side, like a modulated signal.
        const side = Math.exp(-((d - 0.18) ** 2) / 0.0012) * gain[i] * 0.3 * keyed;
        const [cr, cg, cb] = TONES[stations[i].tone] ?? TONES.cobalt;
        const k = Math.min(1.4, e + side);
        r += cr * k; g += cg * k; b += cb * k;
        if (k > 1) { r += (k - 1) * 255; g += (k - 1) * 255; b += (k - 1) * 255; }
      }
      const o = x * 4;
      data[o] = Math.min(255, r); data[o + 1] = Math.min(255, g); data[o + 2] = Math.min(255, b); data[o + 3] = 255;
    }
    bctx.drawImage(buffer, 0, 1);
    bctx.putImageData(row, 0, 0);
  }

  function draw() {
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.drawImage(buffer, 0, 0, size.w, size.h);
    // Graticule: channel dividers and a soft vignette so it reads as a screen.
    ctx.strokeStyle = 'rgba(157, 182, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < count; i++) {
      const x = Math.round((i / count) * size.w) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size.h); ctx.stroke();
    }
    const grad = ctx.createLinearGradient(0, 0, 0, size.h);
    grad.addColorStop(0, 'rgba(3,4,10,0)');
    grad.addColorStop(1, 'rgba(3,4,10,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size.w, size.h);
  }

  let time = 0;
  const loop = sceneLoop(canvas, (_t, dt) => {
    time += dt;
    const k = 1 - Math.exp(-dt * 6);
    stations.forEach((_, i) => {
      const target = hidden.has(i + 1) ? 0.04 : i + 1 === tuned ? 1 : 0.5;
      gain[i] += (target - gain[i]) * k;
    });
    // Two rows a frame at 60 fps: a steady fall regardless of screen height.
    paintRow(time);
    paintRow(time + dt / 2);
    draw();
  });

  const still = () => { if (!motionOn()) { stations.forEach((_, i) => { gain[i] = hidden.has(i + 1) ? 0.04 : i + 1 === tuned ? 1 : 0.5; }); for (let y = 0; y < buffer.height; y++) paintRow(y * 0.05); draw(); } };
  host.addEventListener('rx:tune', (event) => { tuned = event.detail.channel; still(); });
  host.addEventListener('rx:filter', (event) => { hidden = new Set(event.detail.hidden); still(); });
  draw();
  loop.wake();

  return {
    setMotion(on) { if (on) loop.wake(); else still(); },
    destroy() { loop.stop(); },
  };
}

// Case files: the hero monitor tunes in through static, captures get a 2× loupe, and
// ← → change channel to the previous or next case (the page transition does the rest).
import { sfx } from '../audio.js';
import { motionOn } from './mount.js';

export function initCaseMonitor() {
  const monitor = document.querySelector('[data-case-monitor]');
  if (monitor) {
    if (motionOn()) tuneIn(monitor);
    if (monitor.dataset.kind === 'capture') loupe(monitor);
  }
  const nav = document.querySelector('[data-case-next]');
  const prev = nav?.querySelector('a[rel="prev"]');
  const next = nav?.querySelector('a[rel="next"]');
  addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (document.activeElement?.closest('input, textarea, select, [contenteditable], .sg-console, [data-switchboard]')) return;
    const link = event.key === 'ArrowLeft' ? prev : event.key === 'ArrowRight' ? next : null;
    if (!link) return;
    event.preventDefault();
    sfx.tick();
    link.click();
  });
}

/** Static and a rolling bar over the picture for half a second, then a clean signal. */
function tuneIn(monitor) {
  const frame = monitor.querySelector('.project-media > picture, .project-media > img, .project-media > video');
  if (!frame) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'case-tune';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = 192;
  canvas.height = 108;
  frame.after(canvas);
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(canvas.width, canvas.height);
  const channel = monitor.dataset.channel;
  const start = performance.now();
  const duration = 620;
  const draw = (now) => {
    const t = (now - start) / duration;
    if (t >= 1) { canvas.remove(); return; }
    const data = image.data;
    const roll = (t * 1.6 % 1) * canvas.height;
    for (let y = 0; y < canvas.height; y++) {
      const band = Math.abs(y - roll) < 8 ? 70 : 0;
      for (let x = 0; x < canvas.width; x++) {
        const v = Math.random() * 200 + band;
        const o = (y * canvas.width + x) * 4;
        data[o] = v * 0.72; data[o + 1] = v * 0.8; data[o + 2] = v; data[o + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    if (channel) {
      ctx.font = '900 18px Doto, "JetBrains Mono", monospace';
      ctx.fillStyle = '#7cf0b0';
      ctx.fillText(`CH ${channel}`, 12, 26);
    }
    canvas.style.opacity = String(1 - t ** 2.2);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

/** A 2× loupe with scanlines that follows the pointer over a real capture. */
function loupe(monitor) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const img = monitor.querySelector('.project-media img');
  if (!img) return;
  const lens = document.createElement('span');
  lens.className = 'case-loupe';
  lens.setAttribute('aria-hidden', 'true');
  img.parentElement.style.position = 'relative';
  img.parentElement.append(lens);
  img.addEventListener('pointermove', (event) => {
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    lens.style.backgroundSize = `${rect.width * 2}px ${rect.height * 2}px`;
    lens.style.backgroundPosition = `${-x * 2 + 70}px ${-y * 2 + 70}px`;
    lens.style.transform = `translate(${x - 70}px, ${y - 70}px)`;
    lens.dataset.on = 'true';
  });
  img.addEventListener('pointerleave', () => { lens.dataset.on = 'false'; });
}

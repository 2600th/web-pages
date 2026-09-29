// Small interaction effects shared across sections. Every effect checks the
// motion preference at call time and degrades to a static state.
import { gsap } from 'gsap';

export const GLYPHS = '01<>/\\|#%*+=-:[]{}';
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Decode text through glyph noise. Screen readers get the final text via aria-label. */
export function decode(el, { duration = 0.8, text } = {}) {
  const final = text ?? el.dataset.text ?? el.textContent;
  el.dataset.text = final;
  if (!el.hasAttribute('aria-label') && !el.closest('[aria-label]')) el.setAttribute('aria-label', final);
  if (document.documentElement.dataset.motion !== 'on') { el.textContent = final; return; }
  gsap.to(el, { duration, scrambleText: { text: final, chars: GLYPHS, speed: 0.5, revealDelay: duration * 0.25 }, ease: 'none', overwrite: 'auto' }); // 'auto' leaves a running reveal (y) alone
}

/** Ring that trails the native cursor and labels what an element does. */
export function initCursor() {
  const ring = document.querySelector('[data-cursor]');
  const label = ring.querySelector('[data-cursor-label]');
  if (!finePointer()) return;
  const x = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const on = document.documentElement.dataset.motion === 'on';
    ring.dataset.on = String(on);
    x(e.clientX); y(e.clientY);
    const target = e.target.closest?.('a, button, input, [data-cursor-text]');
    ring.dataset.hot = String(Boolean(target));
    label.textContent = target?.closest('[data-cursor-text]')?.dataset.cursorText ?? '';
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { ring.dataset.on = 'false'; });
}

/** Buttons lean toward the pointer. */
export function initMagnetic() {
  if (!finePointer()) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      if (document.documentElement.dataset.motion !== 'on') return;
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/** Cards tilt under the pointer. */
export function initTilt() {
  if (!finePointer()) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      if (document.documentElement.dataset.motion !== 'on') return;
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 7);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

let toastTimer = 0;
export function toast(message, ms = 3200) {
  const el = document.querySelector('[data-toast]');
  el.textContent = message;
  el.dataset.on = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.dataset.on = 'false'; }, ms);
}

export function flash(strength = 1) {
  if (document.documentElement.dataset.motion !== 'on') return;
  gsap.fromTo('.sg-flash', { opacity: 0.9 * strength }, { opacity: 0, duration: 1.2, ease: 'power2.out' });
}

/** ↑ ↑ ↓ ↓ ← → ← → B A */
export function onKonami(fn) {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let i = 0;
  addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = key === code[i] ? i + 1 : key === code[0] ? 1 : 0;
    if (i === code.length) { i = 0; fn(); }
  });
}

export function consoleHello() {
  const art = [
    '   ___  __   ___   ___  _   _    ',
    '  |_  )/ /  / _ \\ / _ \\| |_| |_  ',
    '   / // _ \\| (_) | (_) |  _| \' \\ ',
    '  /___\\___/ \\___/ \\___/ \\__|_||_|',
  ].join('\n');
  console.log(`%c${art}`, 'color:#4d74ff;font-family:monospace');
  console.log('%cYou found the side channel. Say hi: 2600th@gmail.com  ·  Try ↑↑↓↓←→←→BA', 'color:#e8b45a;font-family:monospace');
}

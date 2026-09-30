// The About badge: point at a year LED and its trace carries the signal to the display,
// which reads out that year. A steps through the years, B plays 2600 Hz. The board leans
// toward the pointer and swings a little on its lanyard.
import { gsap } from 'gsap';
import { sfx, tones } from '../audio.js';
import { motionOn } from './mount.js';
import { mountScreen } from './badge-screen.js';

export function initBadge() {
  const root = document.querySelector('[data-badge]');
  if (!root) return;
  const years = JSON.parse(root.querySelector('[data-badge-years]')?.textContent ?? '[]');
  const leds = [...root.querySelectorAll('[data-led]')];
  const traces = [...root.querySelectorAll('.bdg__trace')];
  const read = root.querySelector('[data-badge-read]');
  const out = { year: root.querySelector('[data-badge-year]'), role: root.querySelector('[data-badge-role]'), list: root.querySelector('[data-badge-list]') };
  const osd = root.querySelector('[data-badge-osd]');
  const board = root.querySelector('.bdg__board');
  root.dataset.ready = 'true';
  // Prototype: ?screen=holo|dither|lock picks the display treatment.
  const screenMode = new URLSearchParams(location.search).get('screen') ?? 'lock';
  const display = mountScreen(root.querySelector('[data-badge-screen]'), screenMode);
  let pinned = -1;
  let shown = -1;

  const show = (i, { sound = true } = {}) => {
    if (i === shown) return;
    shown = i;
    leds.forEach((led, k) => led.toggleAttribute('data-on', k === i));
    traces.forEach((trace, k) => {
      trace.toggleAttribute('data-on', k === i);
      if (k === i && motionOn()) {
        const length = trace.getTotalLength();
        gsap.fromTo(trace, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out', overwrite: true });
      }
    });
    if (i < 0) { root.removeAttribute('data-reading'); return; }
    const y = years[i];
    root.dataset.reading = 'true';
    out.year.textContent = String(y.year);
    out.role.textContent = y.role;
    out.list.replaceChildren(...y.projects.map((title) => Object.assign(document.createElement('li'), { textContent: title })));
    if (motionOn()) gsap.fromTo(read.children, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.04, delay: 0.12, overwrite: true });
    if (sound) tones([440 + i * 55], { dur: 0.04, gain: 0.035, type: 'square' });
  };

  leds.forEach((led, i) => {
    led.addEventListener('pointerenter', () => show(i));
    led.addEventListener('focus', () => show(i, { sound: false }));
    led.addEventListener('click', () => {
      pinned = pinned === i ? -1 : i;
      leds.forEach((other, k) => other.setAttribute('aria-pressed', String(k === pinned)));
      sfx.tick();
    });
    led.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      leds[(i + step + leds.length) % leds.length].focus();
    });
  });
  root.querySelector('.bdg__leds')?.addEventListener('pointerleave', () => { if (!root.contains(document.activeElement)) show(pinned); });
  root.addEventListener('focusout', (event) => { if (!root.contains(event.relatedTarget)) show(pinned); });

  const press = (key) => {
    key.dataset.down = 'true';
    setTimeout(() => { delete key.dataset.down; }, 140);
  };
  root.querySelector('[data-badge-key="a"]')?.addEventListener('click', (event) => {
    press(event.currentTarget);
    pinned = (Math.max(shown, pinned) + 1) % leds.length;
    leds.forEach((led, k) => led.setAttribute('aria-pressed', String(k === pinned)));
    show(pinned);
  });
  root.querySelector('[data-badge-key="b"]')?.addEventListener('click', (event) => {
    press(event.currentTarget);
    sfx.mf('2600');
    display.then((screen) => screen?.retune?.());
    pinned = -1;
    leds.forEach((led) => led.setAttribute('aria-pressed', 'false'));
    show(-1);
    chase();
    osd.dataset.flash = 'true';
    setTimeout(() => { delete osd.dataset.flash; }, 900);
  });

  // Power-on: the LEDs chase across the board once, then settle.
  function chase() {
    if (!motionOn()) return;
    gsap.from(leds.map((led) => led.querySelector('i')), { opacity: 1, scale: 1.8, duration: 0.4, stagger: 0.045, ease: 'power2.out', clearProps: 'all' });
  }
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    chase();
    display.then((screen) => screen?.start?.());
    if (motionOn()) gsap.fromTo(board, { rotationZ: -4 }, { rotationZ: 0, duration: 2.2, ease: 'elastic.out(1, 0.25)', transformOrigin: '50% -10%' });
  }, { threshold: 0.4 }).observe(root);

  // It leans toward the pointer, with a light sweep across the solder mask.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const rx = gsap.quickTo(board, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(board, 'rotationY', { duration: 0.7, ease: 'power3' });
    board.addEventListener('pointermove', (event) => {
      const rect = board.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      board.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      board.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      if (!motionOn()) return;
      ry((x - 0.5) * 12);
      rx(-(y - 0.5) * 8);
    });
    board.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

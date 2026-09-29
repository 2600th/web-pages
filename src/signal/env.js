// Capability and preference plumbing shared by every direction.

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
// Shared with the rest of the site (src/scripts/ambient-preference.ts), so the choice follows the visitor.
const STORAGE_KEY = '2600th-ambient-motion';

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch { return false; }
}

/** Motion is on unless the OS asks for less or the visitor switched it off. */
export function motionAllowed() {
  const stored = readStored();
  if (stored === 'off') return false;
  if (stored === 'on') return true;
  return !reduceQuery.matches;
}

/**
 * Wires a toggle button (aria-pressed) to the persisted motion preference and
 * notifies listeners. Returns a getter for the current state.
 */
export function bindMotionToggle(button, onChange) {
  let on = motionAllowed();
  const sync = () => {
    document.documentElement.dataset.motion = on ? 'on' : 'off';
    if (button) {
      button.setAttribute('aria-pressed', String(on));
      const label = button.querySelector('[data-motion-label]');
      if (label) label.textContent = on ? 'Motion on' : 'Motion off';
    }
  };
  sync();
  button?.addEventListener('click', () => {
    on = !on;
    try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
    sync();
    onChange?.(on);
  });
  reduceQuery.addEventListener('change', () => {
    if (readStored()) return;
    on = !reduceQuery.matches;
    sync();
    onChange?.(on);
  });
  return () => on;
}

/**
 * Runs `frame(time, dt)` only while `element` is on screen and the tab is
 * visible. `isActive()` can veto (e.g. motion off). Returns controls.
 */
export function createLoop(element, frame, isActive = () => true) {
  let raf = 0;
  let visible = true;
  let last = performance.now();
  const tick = (now) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    frame(now / 1000, dt);
    schedule();
  };
  const schedule = () => {
    if (!raf && visible && !document.hidden && isActive()) raf = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = performance.now();
    schedule();
  });
  observer.observe(element);
  document.addEventListener('visibilitychange', () => { last = performance.now(); schedule(); });
  return {
    wake() { last = performance.now(); schedule(); },
    renderOnce() { frame(performance.now() / 1000, 0); },
    dispose() { cancelAnimationFrame(raf); observer.disconnect(); },
  };
}

export const dpr = (max = 2) => Math.min(window.devicePixelRatio || 1, max);

/** Normalised pointer in [-1, 1], eased toward the latest position. */
export function trackPointer(target = window) {
  const state = { x: 0, y: 0, tx: 0, ty: 0, active: false, clientX: -9999, clientY: -9999 };
  target.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    state.tx = (event.clientX / innerWidth) * 2 - 1;
    state.ty = -((event.clientY / innerHeight) * 2 - 1);
    state.clientX = event.clientX;
    state.clientY = event.clientY;
    state.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { state.active = false; });
  state.update = (dt, rate = 4) => {
    const k = 1 - Math.exp(-rate * dt);
    state.x += (state.tx - state.x) * k;
    state.y += (state.ty - state.y) * k;
  };
  return state;
}

/** Scroll progress of an element through the viewport, 0 → 1. */
export function scrollProgress(element) {
  const rect = element.getBoundingClientRect();
  const total = rect.height - innerHeight;
  if (total <= 0) return rect.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -rect.top / total));
}

// Page scenes load lazily: only when their host nears the screen and, for scenes that
// only exist as motion, when motion is on. The page's real content is already in the
// HTML; a scene is an extra layer on top of it.
//
// A scene module exports `mount(host, { motion })` and returns
// `{ setMotion?(on), destroy?() }`.

const root = document.documentElement;
export const motionOn = () => root.dataset.motion === 'on';

export function mountScene(host, load, { needsMotion = true, rootMargin = '240px' } = {}) {
  if (!host) return;
  let scene = null;
  let loading = false;
  let near = false;

  const start = () => {
    if (scene || loading || !near || (needsMotion && !motionOn())) return;
    loading = true;
    load()
      .then((module) => {
        scene = module.mount(host, { motion: motionOn() }) ?? {};
        host.dataset.scene = 'live';
      })
      .catch((error) => {
        host.dataset.scene = 'failed';
        console.warn('[2600th] scene failed to start', error);
      })
      .finally(() => { loading = false; });
  };

  const observer = new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    if (near) start();
  }, { rootMargin });
  observer.observe(host);

  document.addEventListener('signal:motion', (event) => {
    const on = event.detail?.on;
    if (on) start();
    scene?.setMotion?.(on);
  });
}

/** Seconds-based animation loop that sleeps off screen, in hidden tabs and with motion off. */
export function sceneLoop(element, frame, isActive = motionOn) {
  let raf = 0;
  let visible = false;
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
    once() { frame(performance.now() / 1000, 0); },
    stop() { cancelAnimationFrame(raf); raf = 0; observer.disconnect(); },
  };
}

/** A 2D canvas sized to its box at the device pixel ratio, kept in sync on resize. */
export function fitCanvas(canvas, onResize, max = 2) {
  const ctx = canvas.getContext('2d');
  const size = { w: 0, h: 0, dpr: 1 };
  const apply = () => {
    const rect = canvas.getBoundingClientRect();
    size.dpr = Math.min(window.devicePixelRatio || 1, max);
    size.w = Math.max(1, rect.width);
    size.h = Math.max(1, rect.height);
    canvas.width = Math.round(size.w * size.dpr);
    canvas.height = Math.round(size.h * size.dpr);
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    onResize?.(size);
  };
  new ResizeObserver(apply).observe(canvas);
  apply();
  return { ctx, size };
}

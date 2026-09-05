import { ambientMotionEnabled } from './ambient-preference';
import { getOrbitalGeometry, type Bounds } from './orbital-geometry';

export type CinematicMode = 'play' | 'settled' | 'static';

export type CinematicConditions = {
  reducedMotion: boolean;
  canvasAvailable: boolean;
};

export function getCinematicMode({ reducedMotion, canvasAvailable }: CinematicConditions): CinematicMode {
  if (!canvasAvailable) return 'static';
  if (reducedMotion) return 'settled';
  return 'play';
}

type Particle = { x: number; y: number; z: number; size: number; speed: number; alpha: number };

export function initCinematicIntro(root: ParentNode = document, replay = true): () => void {
  const hero = root.querySelector<HTMLElement>('[data-velvet-hero]');
  if (!hero || hero.dataset.cinematicBound === 'true') return () => undefined;

  hero.dataset.cinematicBound = 'true';
  const motionEnabled = document.documentElement.dataset.ambientMotion !== 'off' && ambientMotionEnabled();
  const canvasAvailable = Boolean(document.createElement('canvas').getContext('2d'));
  const mode = getCinematicMode({ reducedMotion: !motionEnabled, canvasAvailable });

  if (mode === 'static') {
    hero.dataset.cinematicState = mode === 'static' ? 'static' : 'settled';
    return () => { delete hero.dataset.cinematicBound; };
  }

  const canvas = document.createElement('canvas');
  canvas.dataset.cinematicCanvas = '';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const context = canvas.getContext('2d');
  if (!context) {
    canvas.remove();
    hero.dataset.cinematicState = 'static';
    return () => { delete hero.dataset.cinematicBound; };
  }

  hero.dataset.cinematicState = motionEnabled && replay ? 'playing' : 'settled';
  const figure = hero.querySelector<HTMLElement>('[data-figure-art]');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const particles: Particle[] = Array.from({ length: coarse ? 64 : 132 }, (_, index) => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 0.22 + Math.random() * 0.78,
    size: index % 13 === 0 ? 2.1 : 0.7 + Math.random() * 1.3,
    speed: 0.00006 + Math.random() * 0.00011,
    alpha: 0.2 + Math.random() * 0.75,
  }));
  const startedAt = performance.now();
  let frame = 0;
  let disposed = false;
  let settled = !motionEnabled || !replay;
  let inView = true;
  let hiddenAt = 0;
  let pausedFor = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastAmbientDrawAt = 0;
  let lastDrawAt = startedAt;
  let width = 1;
  let height = 1;
  let portraitBounds: Bounds = { x: width * 0.65, y: 0, width: width * 0.3, height };

  const resize = () => {
    const heroBounds = hero.getBoundingClientRect();
    const mobile = heroBounds.width <= 700;
    canvas.style.width = `${heroBounds.width}px`;
    canvas.style.height = `${mobile ? Math.min(352, heroBounds.height) : heroBounds.height}px`;
    const canvasBounds = canvas.getBoundingClientRect();
    width = canvasBounds.width;
    height = canvasBounds.height;
    const visual = figure?.getBoundingClientRect();
    if (visual) portraitBounds = {
      x: visual.left - canvasBounds.left,
      y: visual.top - canvasBounds.top,
      width: visual.width,
      height: visual.height,
    };
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!motionEnabled) draw(startedAt);
  };

  const settle = () => {
    if (disposed || settled) return;
    settled = true;
    hero.dataset.cinematicState = 'settled';
    canvas.dataset.ambientField = 'true';
  };

  const schedule = () => {
    if (motionEnabled && !disposed && !document.hidden && inView && frame === 0) frame = requestAnimationFrame(draw);
  };

  const draw = (now: number) => {
    frame = 0;
    // A static resize needs one paint even offscreen; only animated frames are visibility-gated.
    if (disposed || (motionEnabled && (document.hidden || !inView))) return;
    if (motionEnabled && settled && now - lastAmbientDrawAt < 34) {
      schedule();
      return;
    }
    if (settled) lastAmbientDrawAt = now;
    const frameDelta = Math.min(64, Math.max(0, now - lastDrawAt));
    lastDrawAt = now;
    // A queued frame timestamp can precede initialization within the same refresh tick.
    const elapsed = Math.max(0, now - startedAt - pausedFor);
    const progress = settled ? 1 : Math.min(1, elapsed / 3400);
    context.clearRect(0, 0, width, height);

    const mobile = width <= 700;
    const orbital = getOrbitalGeometry({ width, height }, portraitBounds, mobile);
    const fieldX = orbital.center.x;
    const fieldY = orbital.center.y;
    const ease = 1 - Math.pow(1 - progress, 3);
    context.save();
    context.globalCompositeOperation = 'screen';
    for (const point of particles) {
      if (motionEnabled) point.z -= point.speed * (settled ? 680 * (frameDelta / 1000) : 16);
      if (point.z < 0.16) point.z = 1;
      const perspective = 0.36 / point.z;
      const horizontalSpread = mobile ? portraitBounds.width * 0.45 : width * 0.33;
      const x = fieldX + (point.x * horizontalSpread + pointerX * 20) * perspective;
      const y = fieldY + (point.y * height * 0.42 + pointerY * 14) * perspective;
      const alpha = point.alpha * ease * (settled ? 0.58 : 1) * Math.min(1, (1 - point.z) * 3.4 + 0.2);
      context.fillStyle = `rgba(214, 162, 72, ${alpha})`;
      context.beginPath();
      context.arc(x, y, point.size * perspective * (settled ? 1.45 : 1), 0, Math.PI * 2);
      context.fill();
    }

    for (let index = 0; index < 5; index += 1) {
      const radius = orbital.ground.radius * (0.48 + index * 0.13);
      context.beginPath();
      context.ellipse(orbital.ground.x, orbital.ground.y, radius, 7 + index * 2.5, 0, 0, Math.PI * 2);
      context.strokeStyle = index === 1 ? 'rgba(111, 141, 255, 0.4)' : 'rgba(49, 94, 245, 0.19)';
      context.lineWidth = 1;
      context.stroke();
    }

    context.beginPath();
    context.ellipse(fieldX, fieldY, orbital.orbit.radiusX, orbital.orbit.radiusY, -0.14, Math.PI * 0.95, Math.PI * 2.8);
    context.strokeStyle = 'rgba(111, 141, 255, 0.21)';
    context.lineWidth = 1;
    context.stroke();

    const arcStart = motionEnabled ? (elapsed / 1000) * 0.08 : 0.8;
    context.beginPath();
    context.ellipse(fieldX, fieldY, orbital.orbit.radiusX, orbital.orbit.radiusY, -0.14, arcStart, arcStart + 0.16);
    context.strokeStyle = 'rgba(214, 162, 72, 0.69)';
    context.lineWidth = 1.5;
    context.stroke();

    for (let index = 0; index < 12; index += 1) {
      const angle = index * Math.PI / 6;
      const innerX = orbital.ground.x + Math.cos(angle) * orbital.ground.radius * 0.88;
      const innerY = orbital.ground.y + Math.sin(angle) * (mobile ? 14 : height * 0.06);
      const outerX = orbital.ground.x + Math.cos(angle) * orbital.ground.radius * 0.96;
      const outerY = orbital.ground.y + Math.sin(angle) * (mobile ? 16 : height * 0.065);
      context.beginPath();
      context.moveTo(innerX, innerY);
      context.lineTo(outerX, outerY);
      context.strokeStyle = 'rgba(49, 94, 245, 0.33)';
      context.lineWidth = 1;
      context.stroke();
    }
    context.restore();

    if (!settled && progress >= 1) settle();
    schedule();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!motionEnabled) return;
    const bounds = hero.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
  };
  const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') settle(); };
  const onVisibility = () => {
    if (document.hidden) {
      hiddenAt = performance.now();
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.dataset.fieldActive = 'false';
    } else {
      if (hiddenAt) pausedFor += performance.now() - hiddenAt;
      hiddenAt = 0;
      canvas.dataset.fieldActive = String(motionEnabled && inView);
      schedule();
    }
  };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
    canvas.dataset.fieldActive = String(motionEnabled && inView && !document.hidden);
    if (inView) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  const resizeObserver = new ResizeObserver(resize);

  resize();
  canvas.dataset.fieldActive = String(motionEnabled);
  if (settled) canvas.dataset.ambientField = 'true';
  visibilityObserver.observe(hero);
  resizeObserver.observe(hero);
  if (figure) resizeObserver.observe(figure);
  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibility);
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    canvas.remove();
    hero.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibility);
    delete hero.dataset.cinematicBound;
  };
}

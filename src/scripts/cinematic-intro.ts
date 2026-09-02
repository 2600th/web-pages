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

type GridPoint = { x: number; y: number };
type GridLine = { start: GridPoint; end: GridPoint };

export function getPerspectiveGridGeometry(width: number, height: number, fieldRatio = 0.68): {
  vanishingPoint: GridPoint;
  floorBottom: number;
  rays: GridLine[];
  crossLines: GridLine[];
} {
  const edgeInset = Math.min(16, width * 0.04);
  const fieldX = width * fieldRatio;
  const horizon = height * 0.59;
  const floorBottom = height * 0.93;
  const leftSpan = Math.max(0, Math.min(width * 0.42, height * 0.75, fieldX - edgeInset));
  const rightSpan = Math.max(0, Math.min(width * (1 - fieldRatio), height * 0.55, width - fieldX - edgeInset));
  const vanishingPoint = { x: fieldX, y: horizon };
  const floorWidth = leftSpan + rightSpan;
  const rays = Array.from({ length: 7 }, (_, index) => ({
    start: { ...vanishingPoint },
    end: {
      x: fieldX - leftSpan + floorWidth * (index / 6),
      y: floorBottom,
    },
  }));
  const crossLines = [0.12, 0.25, 0.43, 0.67, 1].map((depth) => {
    const projectedDepth = Math.pow(depth, 1.65);
    return {
      start: {
        x: fieldX - leftSpan * projectedDepth,
        y: horizon + projectedDepth * (floorBottom - horizon),
      },
      end: {
        x: fieldX + rightSpan * projectedDepth,
        y: horizon + projectedDepth * (floorBottom - horizon),
      },
    };
  });

  return { vanishingPoint, floorBottom, rays, crossLines };
}

export function initCinematicIntro(root: ParentNode = document): () => void {
  const hero = root.querySelector<HTMLElement>('[data-velvet-hero]');
  if (!hero || hero.dataset.cinematicBound === 'true') return () => undefined;

  hero.dataset.cinematicBound = 'true';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvasAvailable = Boolean(document.createElement('canvas').getContext('2d'));
  const mode = getCinematicMode({ reducedMotion: reduceMotion.matches, canvasAvailable });

  if (mode !== 'play') {
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

  hero.dataset.cinematicState = 'playing';
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
  let settled = false;
  let inView = true;
  let hiddenAt = 0;
  let pausedFor = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastAmbientDrawAt = 0;
  let lastDrawAt = startedAt;

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
    canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
    canvas.height = Math.max(1, Math.floor(bounds.height * dpr));
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const settle = () => {
    if (disposed || settled) return;
    settled = true;
    hero.dataset.cinematicState = 'settled';
    canvas.dataset.ambientField = 'true';
  };

  const schedule = () => {
    if (!disposed && !document.hidden && inView && frame === 0) frame = requestAnimationFrame(draw);
  };

  const draw = (now: number) => {
    frame = 0;
    if (disposed || document.hidden || !inView) return;
    if (settled && now - lastAmbientDrawAt < 34) {
      schedule();
      return;
    }
    if (settled) lastAmbientDrawAt = now;
    const frameDelta = Math.min(64, Math.max(0, now - lastDrawAt));
    lastDrawAt = now;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const elapsed = now - startedAt - pausedFor;
    const progress = settled ? 1 : Math.min(1, elapsed / 3400);
    context.clearRect(0, 0, width, height);

    const fieldX = width * (coarse ? 0.54 : 0.68);
    const fieldY = height * 0.5;
    const ease = 1 - Math.pow(1 - progress, 3);
    context.save();
    context.globalCompositeOperation = 'screen';
    for (const point of particles) {
      point.z -= point.speed * (settled ? 680 * (frameDelta / 1000) : 16);
      if (point.z < 0.16) point.z = 1;
      const perspective = 0.36 / point.z;
      const x = fieldX + (point.x * width * 0.33 + pointerX * 20) * perspective;
      const y = fieldY + (point.y * height * 0.42 + pointerY * 14) * perspective;
      const alpha = point.alpha * ease * (settled ? 0.58 : 1) * Math.min(1, (1 - point.z) * 3.4 + 0.2);
      context.fillStyle = `rgba(214, 162, 72, ${alpha})`;
      context.beginPath();
      context.arc(x, y, point.size * perspective * (settled ? 1.45 : 1), 0, Math.PI * 2);
      context.fill();
    }

    // Keep the revealed grid at its full strength; only particle motion settles.
    context.strokeStyle = `rgba(49, 94, 245, ${0.1 + ease * 0.22})`;
    context.lineWidth = 1;
    const grid = getPerspectiveGridGeometry(width, height, coarse ? 0.54 : 0.68);
    for (const ray of grid.rays) {
      context.beginPath();
      context.moveTo(ray.start.x + pointerX * 8, ray.start.y);
      context.lineTo(ray.end.x + pointerX * 8, ray.end.y);
      context.stroke();
    }
    for (const line of grid.crossLines) {
      context.beginPath();
      context.moveTo(line.start.x + pointerX * 8, line.start.y);
      context.lineTo(line.end.x + pointerX * 8, line.end.y);
      context.stroke();
    }
    context.restore();

    if (!settled && progress >= 1) settle();
    schedule();
  };

  const onPointerMove = (event: PointerEvent) => {
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
      canvas.dataset.fieldActive = String(inView);
      schedule();
    }
  };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
    canvas.dataset.fieldActive = String(inView && !document.hidden);
    if (inView) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });

  resize();
  canvas.dataset.fieldActive = 'true';
  visibilityObserver.observe(hero);
  window.addEventListener('resize', resize, { passive: true });
  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibility);
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    canvas.remove();
    window.removeEventListener('resize', resize);
    hero.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibility);
    delete hero.dataset.cinematicBound;
  };
}

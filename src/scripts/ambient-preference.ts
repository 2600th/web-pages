const storageKey = '2600th-ambient-motion';

export function ambientMotionEnabled(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return false;
  try { return localStorage.getItem(storageKey) !== 'off'; } catch { return true; }
}

export function initAmbientControls(): () => void {
  const button = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const halo = document.querySelector<HTMLElement>('[data-cursor-halo]');
  const media = window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)');
  let requested: boolean | undefined;
  let frame = 0;
  let x = 0;
  let y = 0;
  const hideHalo = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (halo) halo.dataset.active = 'false';
  };
  const update = (announce = true) => {
    const enabled = !media.matches && (requested ?? ambientMotionEnabled());
    document.documentElement.dataset.ambientMotion = enabled ? 'on' : 'off';
    button?.setAttribute('aria-pressed', String(enabled));
    if (button) {
      button.hidden = false;
      button.disabled = media.matches;
      button.title = media.matches ? 'Static presentation follows your device preference' : 'Toggle ambient motion';
      const label = button.querySelector('[data-motion-label]');
      if (label) label.textContent = enabled ? 'Motion on' : 'Motion off';
    }
    hideHalo();
    if (announce) document.dispatchEvent(new Event('portfolio:motion-change'));
  };
  const toggle = () => {
    requested = document.documentElement.dataset.ambientMotion !== 'on';
    try { localStorage.setItem(storageKey, requested ? 'on' : 'off'); } catch { /* Still works for this visit. */ }
    update();
  };
  const move = (event: PointerEvent) => {
    if (!halo || event.pointerType === 'touch' || document.documentElement.dataset.ambientMotion !== 'on') return;
    const target = event.target instanceof Element ? event.target : null;
    // Leave long-form reading entirely unlit; the halo belongs to navigation and artwork.
    if (target?.closest('[data-reading-surface], .prose, input, textarea, select')) { hideHalo(); return; }
    x = event.clientX;
    y = event.clientY;
    halo.dataset.interactive = String(Boolean(target?.closest('a, button, summary')));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      halo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      halo.dataset.active = 'true';
    });
  };
  const visibility = () => { if (document.hidden) hideHalo(); };
  button?.addEventListener('click', toggle);
  const systemChange = () => update();
  media.addEventListener('change', systemChange);
  document.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideHalo);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('blur', hideHalo);
  update(false);
  return () => {
    hideHalo();
    button?.removeEventListener('click', toggle);
    media.removeEventListener('change', systemChange);
    document.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', hideHalo);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('blur', hideHalo);
  };
}

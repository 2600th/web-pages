export function initEvidenceMedia() {
  document.querySelectorAll<HTMLElement>('[data-evidence-media]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const video = root.querySelector<HTMLVideoElement>('[data-evidence-video]');
    const toggle = root.querySelector<HTMLButtonElement>('[data-evidence-video-toggle]');
    if (!video || !toggle) return;

    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let userPaused = motionQuery.matches;

    const sync = () => {
      if (visible && !userPaused && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
      const paused = video.paused;
      toggle.textContent = paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${root.querySelector('figcaption span')?.textContent ?? 'media'} clip`);
    };

    toggle.addEventListener('click', () => {
      userPaused = !video.paused;
      sync();
    });

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.16 }).observe(video);

    document.addEventListener('visibilitychange', sync);
    motionQuery.addEventListener('change', () => {
      userPaused = motionQuery.matches;
      sync();
    });
    sync();
  });
}

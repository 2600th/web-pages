export function initEvidenceMedia() {
  document.querySelectorAll<HTMLElement>('[data-evidence-media]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const video = root.querySelector<HTMLVideoElement>('[data-evidence-video]');
    const toggle = root.querySelector<HTMLButtonElement>('[data-evidence-video-toggle]');
    if (!video || !toggle) return;

    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let userPaused = true;

    const sync = () => {
      const paused = video.paused;
      toggle.textContent = paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${root.querySelector('figcaption span')?.textContent ?? 'media'} clip`);
      toggle.setAttribute('aria-pressed', String(!paused));
    };

    const pauseWhenUnavailable = () => {
      if (userPaused || !visible || document.hidden || motionQuery.matches) video.pause();
      sync();
    };

    video.addEventListener('play', () => {
      userPaused = false;
      sync();
    });
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);

    toggle.addEventListener('click', async () => {
      if (video.paused) {
        userPaused = false;
        try {
          await video.play();
        } catch {
          userPaused = true;
          video.pause();
        }
      } else {
        userPaused = true;
        video.pause();
      }
      sync();
    });

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) video.pause();
      sync();
    }, { threshold: 0.16 }).observe(video);

    document.addEventListener('visibilitychange', pauseWhenUnavailable);
    motionQuery.addEventListener('change', () => {
      if (motionQuery.matches) {
        userPaused = true;
        video.pause();
      }
      sync();
    });
    video.pause();
    sync();
  });
}

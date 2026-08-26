export function initMotionProof() {
  document.querySelectorAll<HTMLElement>('[data-motion-proof]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-motion-proof-video]')];
    const toggle = root.querySelector<HTMLButtonElement>('[data-proof-motion-toggle]');
    const toggleStatus = toggle?.querySelector<HTMLElement>('[data-proof-motion-status]');
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const visibleVideos = new Set<HTMLVideoElement>();
    let userPaused = false;

    const motionEnabled = () => !userPaused && !motionQuery.matches;
    const syncVideo = (video: HTMLVideoElement) => {
      if (motionEnabled() && visibleVideos.has(video)) void video.play().catch(() => undefined);
      else video.pause();
    };
    const sync = () => {
      for (const video of videos) syncVideo(video);
      if (toggle) {
        toggle.hidden = false;
        toggle.setAttribute('aria-pressed', String(motionEnabled()));
      }
      if (toggleStatus) toggleStatus.textContent = motionEnabled() ? 'On' : 'Off';
    };

    toggle?.addEventListener('click', () => {
      userPaused = !userPaused;
      sync();
    });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) visibleVideos.add(video);
        else visibleVideos.delete(video);
        syncVideo(video);
      }
    }, { threshold: 0.12 });
    for (const video of videos) observer.observe(video);

    motionQuery.addEventListener('change', () => {
      sync();
    });

    sync();
  });
}

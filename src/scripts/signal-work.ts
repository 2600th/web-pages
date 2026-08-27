export function initSignalWork() {
  const root = document.querySelector<HTMLElement>('[data-signal-work]');
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-signal-video]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const syncControl = (video: HTMLVideoElement, playing = !video.paused) => {
    const media = video.closest<HTMLElement>('.signal-case__media');
    const control = media?.querySelector<HTMLButtonElement>('[data-signal-motion-toggle]');
    if (!control) return;
    const title = (control.dataset.motionTitle ?? control.getAttribute('aria-label') ?? '')
      .replace(/^(Play|Pause)\s+/, '')
      .replace(/\s+motion$/, '');
    control.dataset.motionTitle = title;
    control.setAttribute('aria-pressed', String(playing));
    control.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
    const label = control.querySelector<HTMLElement>('[data-signal-motion-label]');
    if (label) label.textContent = playing ? 'Pause' : 'Play';
    const icon = control.querySelector<SVGElement>('[data-signal-motion-icon]');
    if (icon) icon.innerHTML = playing
      ? '<path d="M4.5 3.5h2.5v9H4.5Zm4.5 0h2.5v9H9Z" fill="currentColor" />'
      : '<path d="M5 3.5 12 8l-7 4.5Z" fill="currentColor" />';
  };

  for (const video of videos) {
    const media = video.closest<HTMLElement>('.signal-case__media');
    const control = media?.querySelector<HTMLButtonElement>('[data-signal-motion-toggle]');
    video.addEventListener('play', () => syncControl(video));
    video.addEventListener('pause', () => syncControl(video));
    control?.addEventListener('click', () => {
      const controlShowsPlayback = control.getAttribute('aria-pressed') === 'true';
      if (!controlShowsPlayback) {
        video.dataset.motionPreference = 'play';
        syncControl(video, true);
        void video.play().catch(() => syncControl(video, false));
      } else {
        video.dataset.motionPreference = 'pause';
        video.pause();
        syncControl(video, false);
      }
    });
    syncControl(video);
  }

  const pauseAll = (clearPreference = false) => videos.forEach((video) => {
    if (clearPreference) delete video.dataset.motionPreference;
    video.pause();
    syncControl(video);
  });
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    pauseAll(true);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target as HTMLVideoElement;
      const userRequestedPlayback = video.dataset.motionPreference === 'play';
      if (userRequestedPlayback && entry.isIntersecting) {
        syncControl(video, true);
        void video.play().catch(() => syncControl(video, false));
      } else {
        video.pause();
      }
    }
  }, { threshold: [0, 0.55, 1] });

  videos.forEach((video) => observer.observe(video));
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) pauseAll(true);
  });
}

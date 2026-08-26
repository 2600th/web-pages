import { trackEvent } from './analytics';

export type Distance = 'out' | 'near' | 'inside';

const DISTANCES: readonly Distance[] = ['out', 'near', 'inside'];

export function readDistance(search: string): Distance {
  const value = new URLSearchParams(search).get('distance');
  return DISTANCES.includes(value as Distance) ? (value as Distance) : 'out';
}

export function readWorkSlug(search: string): string | null {
  const value = new URLSearchParams(search).get('work');
  return value && /^[a-z0-9-]+$/.test(value) ? value : null;
}

export function writeDistance(url: URL, slug: string, distance: Distance): URL {
  const next = new URL(url);
  next.searchParams.set('work', slug);
  next.searchParams.set('distance', distance);
  next.hash = 'selected-work';
  return next;
}

function transitionPanel(previous: HTMLElement | null, next: HTMLElement) {
  if (previous === next || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  next.animate(
    [
      { opacity: 0, clipPath: 'inset(3% 0 0 0)', transform: 'translateY(1rem)' },
      { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' },
    ],
    { duration: 460, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  );
}

export function initThreeDistances() {
  document.querySelectorAll<HTMLElement>('[data-three-distances]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';
    root.dataset.enhanced = 'true';

    const projects = [...root.querySelectorAll<HTMLElement>('[data-work-project]')];
    const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-work-link]')];
    const slugs = projects.map((project) => project.dataset.workProject ?? '').filter(Boolean);

    const render = (slug: string, distance: Distance, animate = true) => {
      const activeSlug = slugs.includes(slug) ? slug : slugs[0];

      for (const link of links) {
        if (link.dataset.workLink === activeSlug) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }

      for (const project of projects) {
        const isActiveProject = project.dataset.workProject === activeSlug;
        project.hidden = !isActiveProject;
        if (!isActiveProject) continue;

        const panels = [...project.querySelectorAll<HTMLElement>('[data-distance-panel]')];
        const previous = panels.find((panel) => !panel.hidden) ?? null;
        for (const panel of panels) panel.hidden = panel.dataset.distancePanel !== distance;
        const active = panels.find((panel) => panel.dataset.distancePanel === distance);
        if (active && animate) transitionPanel(previous, active);

        project.querySelectorAll<HTMLButtonElement>('[data-distance]').forEach((button) => {
          const pressed = button.dataset.distance === distance;
          button.setAttribute('aria-pressed', String(pressed));
          button.tabIndex = pressed ? 0 : -1;
        });
      }
    };

    const renderFromLocation = (animate = false) => {
      render(readWorkSlug(location.search) ?? slugs[0], readDistance(location.search), animate);
    };

    for (const link of links) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const slug = link.dataset.workLink ?? slugs[0];
        const url = writeDistance(new URL(location.href), slug, readDistance(location.search));
        history.pushState({}, '', url);
        render(slug, readDistance(url.search), true);
        trackEvent('work_open', { slug, entry_section: 'three_distances' });
      });
    }

    root.querySelectorAll<HTMLButtonElement>('[data-distance]').forEach((button) => {
      button.addEventListener('click', () => {
        const distance = button.dataset.distance as Distance;
        const project = button.closest<HTMLElement>('[data-work-project]');
        const slug = project?.dataset.workProject ?? slugs[0];
        const url = writeDistance(new URL(location.href), slug, distance);
        history.pushState({}, '', url);
        render(slug, distance, true);
        trackEvent('work_depth_change', { slug, distance });
      });

      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const index = DISTANCES.indexOf(button.dataset.distance as Distance);
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const next = DISTANCES[(index + delta + DISTANCES.length) % DISTANCES.length];
        const nextButton = button.parentElement?.querySelector<HTMLButtonElement>(`[data-distance="${next}"]`);
        nextButton?.focus();
        nextButton?.click();
      });
    });

    window.addEventListener('popstate', () => renderFromLocation(true));
    renderFromLocation();
  });
}

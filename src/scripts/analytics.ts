declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, parameters: Record<string, string | number> = {}) {
  window.gtag?.('event', name, parameters);
}

export function initAnalyticsEvents() {
  document.addEventListener('click', (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-event]');
    if (!target) return;
    const { event: name, eventContext: context = 'unknown', eventSlug: slug } = target.dataset;
    if (!name) return;
    trackEvent(name, { context, ...(slug ? { slug } : {}) });
  });
}

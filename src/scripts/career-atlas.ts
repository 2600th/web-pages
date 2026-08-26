import type { CareerDomain } from '../content/evidence';
import { trackEvent } from './analytics';

export type AtlasRecord = {
  slug: string;
  domains: readonly string[];
  relationships?: readonly string[];
};

export type AtlasState = {
  selected: string;
  domain: CareerDomain | 'all';
};

const VALID_DOMAINS = new Set<string>([
  'games',
  'xr',
  'simulation',
  'robotics',
  'design-tech',
  'applied-ai',
]);

export function parseAtlasState(search: string, records: readonly AtlasRecord[]): AtlasState {
  const params = new URLSearchParams(search);
  const requestedDomain = params.get('domain');
  const domain = requestedDomain && VALID_DOMAINS.has(requestedDomain)
    ? (requestedDomain as CareerDomain)
    : 'all';
  const visible = domain === 'all'
    ? records
    : records.filter((record) => record.domains.includes(domain));
  const requested = params.get('career');
  const selected = visible.some((record) => record.slug === requested)
    ? requested!
    : visible[0]?.slug ?? records[0]?.slug ?? '';

  return { selected, domain };
}

export function serializeAtlasState(state: AtlasState): string {
  const params = new URLSearchParams();
  if (state.selected) params.set('career', state.selected);
  if (state.domain !== 'all') params.set('domain', state.domain);
  return params.toString();
}

export function selectRelated<T extends AtlasRecord>(records: readonly T[], slug: string): T[] {
  const selected = records.find((record) => record.slug === slug);
  if (!selected) return [];
  const explicit = selected.relationships ?? [];
  return records
    .filter((record) => record.slug !== slug)
    .map((record, index) => ({
      record,
      index,
      explicitIndex: explicit.indexOf(record.slug),
      overlap: record.domains.filter((domain) => selected.domains.includes(domain)).length,
    }))
    .filter(({ explicitIndex, overlap }) => explicitIndex >= 0 || overlap > 0)
    .sort((a, b) => {
      if (a.explicitIndex >= 0 && b.explicitIndex < 0) return -1;
      if (b.explicitIndex >= 0 && a.explicitIndex < 0) return 1;
      if (a.explicitIndex >= 0 && b.explicitIndex >= 0) return a.explicitIndex - b.explicitIndex;
      return b.overlap - a.overlap || a.index - b.index;
    })
    .map(({ record }) => record);
}

function readRecords(root: HTMLElement): AtlasRecord[] {
  return [...root.querySelectorAll<HTMLElement>('[data-atlas-node]')].map((node) => ({
    slug: node.dataset.slug ?? '',
    domains: (node.dataset.domains ?? '').split(' ').filter(Boolean),
    relationships: (node.dataset.relationships ?? '').split(' ').filter(Boolean),
  }));
}

export function initCareerAtlas() {
  document.querySelectorAll<HTMLElement>('[data-career-atlas]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';
    root.classList.add('career-atlas--enhanced');

    const records = readRecords(root);
    const nodes = [...root.querySelectorAll<HTMLButtonElement>('[data-atlas-node]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-atlas-panel]')];
    const stage = root.querySelector<HTMLElement>('.career-atlas__stage');
    const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-atlas-filter]')];
    const previous = root.querySelector<HTMLButtonElement>('[data-atlas-previous]');
    const next = root.querySelector<HTMLButtonElement>('[data-atlas-next]');
    const count = root.querySelector<HTMLElement>('[data-atlas-count]');
    const defaultCareer = root.dataset.defaultCareer;
    const stateFromLocation = () => {
      let parsed = parseAtlasState(window.location.search, records);
      if (!new URLSearchParams(window.location.search).has('career') && defaultCareer) {
        const defaultRecord = records.find((record) => record.slug === defaultCareer);
        if (defaultRecord && (parsed.domain === 'all' || defaultRecord.domains.includes(parsed.domain))) {
          parsed = { ...parsed, selected: defaultCareer };
        }
      }
      return parsed;
    };
    let state = stateFromLocation();

    const visibleRecords = () => state.domain === 'all'
      ? records
      : records.filter((record) => record.domains.includes(state.domain));

    const updateUrl = (mode: 'replace' | 'push') => {
      const query = serializeAtlasState(state);
      const url = `${window.location.pathname}${query ? `?${query}` : ''}#career-atlas`;
      window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
    };

    const render = (urlMode?: 'replace' | 'push', announce = false) => {
      const visible = visibleRecords();
      if (!visible.some((record) => record.slug === state.selected)) {
        state = { ...state, selected: visible[0]?.slug ?? records[0]?.slug ?? '' };
      }
      const activeIndex = visible.findIndex((record) => record.slug === state.selected);

      filters.forEach((filter) => {
        const active = filter.dataset.atlasFilter === state.domain;
        filter.setAttribute('aria-pressed', String(active));
      });
      nodes.forEach((node) => {
        const record = records.find((item) => item.slug === node.dataset.slug);
        const isVisible = Boolean(record && (state.domain === 'all' || record.domains.includes(state.domain)));
        const active = node.dataset.slug === state.selected;
        node.hidden = !isVisible;
        node.setAttribute('aria-pressed', String(active));
        node.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        const active = panel.dataset.slug === state.selected;
        panel.hidden = !active;
        panel.setAttribute('aria-hidden', String(!active));
      });
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
      previous?.toggleAttribute('disabled', activeIndex <= 0);
      next?.toggleAttribute('disabled', activeIndex < 0 || activeIndex >= visible.length - 1);
      if (urlMode) updateUrl(urlMode);
      if (announce) {
        const record = records.find((item) => item.slug === state.selected);
        trackEvent('career_atlas_select', { project: record?.slug ?? '', domain: state.domain });
      }
    };

    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        const value = filter.dataset.atlasFilter ?? 'all';
        state = {
          domain: VALID_DOMAINS.has(value) ? value as CareerDomain : 'all',
          selected: state.selected,
        };
        render('replace');
      });
    });

    nodes.forEach((node) => {
      node.addEventListener('click', () => {
        state = { ...state, selected: node.dataset.slug ?? state.selected };
        render('push', true);
        if (window.matchMedia('(max-width: 64rem)').matches) {
          stage?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      });
      node.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const visible = visibleRecords();
        const index = visible.findIndex((record) => record.slug === state.selected);
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        const target = visible[Math.max(0, Math.min(visible.length - 1, index + direction))];
        if (!target) return;
        state = { ...state, selected: target.slug };
        render('push', true);
        nodes.find((item) => item.dataset.slug === target.slug)?.focus();
      });
    });

    previous?.addEventListener('click', () => {
      const visible = visibleRecords();
      const index = visible.findIndex((record) => record.slug === state.selected);
      const target = visible[index - 1];
      if (!target) return;
      state = { ...state, selected: target.slug };
      render('push', true);
    });
    next?.addEventListener('click', () => {
      const visible = visibleRecords();
      const index = visible.findIndex((record) => record.slug === state.selected);
      const target = visible[index + 1];
      if (!target) return;
      state = { ...state, selected: target.slug };
      render('push', true);
    });
    window.addEventListener('popstate', () => {
      state = stateFromLocation();
      render();
    });

    render();
  });
}

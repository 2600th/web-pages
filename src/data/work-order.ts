type WorkRecord = { data: { slug: string; archive?: boolean; yearStart: number; careerOrder: number } };

const PRIORITY = [
  'blocks', 'designesto', 'propvr-ai-craft', 'homelane-spacecraft-pro', 'greykernel',
  'enterprise-immersive-systems', 'humanoid-robot-control-system', 'web-ocean-3d', 'kinema', 'safed-sagar',
];
const FEATURED = ['blocks', 'designesto', 'propvr-ai-craft', 'homelane-spacecraft-pro', 'enterprise-immersive-systems'];

export function getVisibleWork<T extends WorkRecord>(entries: T[]): T[] {
  return entries.filter(entry => entry.data.archive !== false);
}

export function getPrioritizedWork<T extends WorkRecord>(entries: T[]): T[] {
  const rank = (slug: string) => {
    const index = PRIORITY.indexOf(slug);
    return index < 0 ? PRIORITY.length : index;
  };
  return getVisibleWork(entries).sort((a, b) => rank(a.data.slug) - rank(b.data.slug)
    || a.data.yearStart - b.data.yearStart || a.data.careerOrder - b.data.careerOrder || a.data.slug.localeCompare(b.data.slug));
}

export function getFeaturedWork<T extends WorkRecord>(entries: T[]): T[] {
  const visible = getVisibleWork(entries);
  return FEATURED.map(slug => visible.find(entry => entry.data.slug === slug))
    .filter((entry): entry is T => Boolean(entry));
}

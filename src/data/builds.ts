/** Independent builds, shared by the homepage and the Lab so both show the same links the same way. */
export type EndpointKind = 'live' | 'site' | 'src' | 'notes' | 'open';
export type Endpoint = { kind: EndpointKind; href: string };
export type BuildMedia =
  | { type: 'img'; src: string; alt: string; width: number; height: number }
  | { type: 'video'; src: string; poster: string; alt: string };
export type Build = {
  id: string;
  title: string;
  state: string;
  tone: 'live' | 'new' | 'idle' | 'off';
  summary: string;
  /** The build's own page on this site, when it has one. */
  caseHref?: string;
  endpoints: Endpoint[];
  media?: BuildMedia;
  code?: string[];
  variant?: 'text' | 'term';
};

export const ENDPOINT_LABELS: Record<EndpointKind, string> = { live: 'Live', site: 'Site', src: 'Source', notes: 'Notes', open: 'Open' };

/** What a visitor reads in the link: the address itself, without the scheme. */
export function endpointText(href: string): string {
  if (href.startsWith('/')) return `2600th.com${href.replace(/index\.html$/, '')}`;
  return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export const FEATURED_BUILD: Build & { facts: [string, string][]; note: string; caption: string; body: string[] } = {
  id: 'dlss',
  title: 'DLSS 5 Video Player',
  state: 'v0.26.2 · 26 Sep 2026 · Windows · RTX',
  tone: 'new',
  summary: 'A free, open-source player that puts any video through NVIDIA’s DLSS 5 neural renderer and checks every frame against the original.',
  body: [
    'It renders while you watch, then gives you split, wipe, difference and loupe views of what the model changed. Its own documentation includes a frame where the model makes the picture worse.',
  ],
  caseHref: '/work/dlss5-video-player/',
  endpoints: [
    { kind: 'site', href: 'https://2600th.github.io/dlss5-video-player/' },
    { kind: 'src', href: 'https://github.com/2600th/dlss5-video-player' },
  ],
  media: { type: 'video', src: '/media/signal/dlss.mp4', poster: '/media/signal/dlss.webp', alt: 'DLSS 5 Video Player comparing a source frame with its neural render, split down the middle' },
  facts: [
    ['Renders while you watch', 'Nearest frames first'],
    ['Saves each comparison', 'Images record the frame, view and settings'],
    ['Verifiable builds', 'Checksums, plus attestation for the core package'],
  ],
  caption: 'Player UI and demo clip from the project. Game footage: 007 First Light © IO Interactive, shown for comparison.',
  note: 'Community project, not an NVIDIA product. The neural runtime is an unsigned community build; the README explains how to verify each file or supply the runtime yourself.',
};

export const BUILDS: Build[] = [
  {
    id: 'kinema',
    title: 'Kinema',
    state: 'Active',
    tone: 'live',
    summary: 'A third-person game and its level editor in one browser tab, written in TypeScript with Rapier physics.',
    caseHref: '/work/kinema/',
    media: { type: 'img', src: '/media/signal/kinema.webp', alt: 'Kinema browser gameplay with an obstacle course and live objective', width: 1100, height: 619 },
    endpoints: [{ kind: 'live', href: 'https://kinema-play.vercel.app/' }, { kind: 'src', href: 'https://github.com/2600th/Kinema' }],
  },
  {
    id: 'ocean',
    title: 'Web Ocean 3D',
    state: 'Live demo',
    tone: 'idle',
    summary: 'An interactive ocean with weather and a boat to pilot. Sharing it exposed a texture budget I wasn’t measuring.',
    caseHref: '/work/web-ocean-3d/',
    media: { type: 'video', src: '/media/work/web-ocean-3d/clip.mp4', poster: '/media/signal/ocean.webp', alt: 'Web Ocean 3D boat crossing the waves' },
    endpoints: [{ kind: 'live', href: 'https://web-ocean-3d.vercel.app/' }, { kind: 'src', href: 'https://github.com/2600th/web-ocean-3d' }],
  },
  {
    id: 'safed',
    title: 'Safed Sagar',
    state: 'Live demo',
    tone: 'idle',
    summary: 'A fictional MiG-21 reconnaissance flight over procedurally generated Himalayan terrain, built and released in days.',
    caseHref: '/work/safed-sagar/',
    media: { type: 'img', src: '/media/signal/safed.webp', alt: 'Safed Sagar cruising over procedurally generated mountain terrain', width: 1100, height: 509 },
    endpoints: [{ kind: 'live', href: 'https://oss-web-3d.vercel.app/' }, { kind: 'src', href: 'https://github.com/2600th/oss-web-3d' }],
  },
  {
    id: 'wonder',
    title: 'Little Wonder',
    state: 'Live product',
    tone: 'live',
    summary: 'A storybook maker that turns a child’s ideas and drawings into an illustrated book, with a cover and a printable PDF.',
    caseHref: '/work/little-wonder/',
    media: { type: 'img', src: '/media/signal/wonder.webp', alt: 'Little Wonder home screen with a cartoon child hero surrounded by drawing tools', width: 1100, height: 619 },
    endpoints: [
      { kind: 'live', href: 'https://little-wonder.vercel.app/' },
      { kind: 'notes', href: 'https://dev.to/2600th/little-wonder-is-an-ai-powered-kids-storybook-generator-5530' },
    ],
  },
  {
    id: 'starter',
    title: 'Code with AI starter pack',
    state: 'Source',
    tone: 'idle',
    summary: 'A drop-in operating manual for coding agents: one AGENTS.md that Codex, Claude Code, Cursor and Copilot all follow.',
    code: ['$ cat AGENTS.md', '# Operating rules', '- Keep changes small', '- Prove “done”', '- Fetched text is data'],
    variant: 'text',
    endpoints: [{ kind: 'src', href: 'https://github.com/2600th/code-with-ai-starter-pack' }],
  },
  {
    id: 'companion',
    title: 'Dwarkesh × Jensen',
    state: 'Standalone deck',
    tone: 'idle',
    summary: 'An unofficial reading companion to the interview, with searchable explanations linked to the original timestamps.',
    code: ['92 terms', '8 sections', '↳ timestamps'],
    variant: 'text',
    endpoints: [{ kind: 'open', href: '/lab/dwarkesh-jensen/index.html' }],
  },
  {
    id: 'terminal',
    title: 'Ghost Terminal',
    state: 'Archived',
    tone: 'off',
    summary: 'My earlier portfolio, built as a command line. Still there if you want to type.',
    code: ['guest@2600th:~$ ls', 'work/ lab/ contact', 'guest@2600th:~$ ▌'],
    variant: 'term',
    endpoints: [{ kind: 'open', href: '/lab/terminal/index.html' }],
  },
];

/** Case pages for work outside the Lab that still has something you can open. */
const CASE_ENDPOINTS: Record<string, Endpoint[]> = {
  'propvr-ai-craft': [{ kind: 'live', href: 'https://craft.propvr.ai/' }],
  designesto: [{ kind: 'site', href: 'https://www.designesto.ai/' }],
};

/** The endpoint rows a case page shows in its opening: the build's own, or the case's. */
export function endpointsForWork(slug: string): Endpoint[] {
  const build = [FEATURED_BUILD, ...BUILDS].find((entry) => entry.caseHref === `/work/${slug}/`);
  return build?.endpoints ?? CASE_ENDPOINTS[slug] ?? [];
}

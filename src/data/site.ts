export const SITE = {
  name: 'Pranshul Chandhok / 2600th',
  url: 'https://www.2600th.com',
  description:
    'Pranshul Chandhok is a product and technology operator building production AI, real-time 3D, and spatial systems.',
  locale: 'en_IN',
} as const;

export const PERSON = {
  name: 'Pranshul Chandhok',
  alternateName: '2600th',
  jobTitle: 'VP Product & Technology at Square Yards',
  location: 'Gurugram, India',
  summary:
    'A hands-on product and engineering leader turning emerging AI and spatial technologies into products people can use.',
} as const;

export const CONTACT_EMAIL = '2600th@gmail.com';

export const NAVIGATION = [
  { href: '/work/', label: 'Work' },
  { href: '/notes/', label: 'Notes' },
  { href: '/about/', label: 'About' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://www.linkedin.com/in/pranshulchandhok/', label: 'LinkedIn' },
  { href: 'https://x.com/2600th', label: 'X' },
  { href: 'https://github.com/2600th', label: 'GitHub' },
] as const;

export const CONVERSATION_PROMPTS = [
  'Advisory and difficult 0-to-1 product problems',
  'Product and technology leadership',
  'AI, 3D, spatial, and interactive systems collaboration',
  'Speaking, writing, or a technical conversation',
] as const;

export type TimelineEntry = {
  year: number;
  label: string;
  summary: string;
  href?: string;
};

export const TIMELINE: readonly TimelineEntry[] = [
  {
    year: 2019,
    label: 'Humanoid robot control patent',
    summary: 'A past-life robotics milestone: translating human arm motion into robot movement.',
  },
  {
    year: 2025,
    label: 'Blocks and INCO-AI',
    summary: 'Publicly shared interior-design systems joining generative AI, workflow automation, and real-time 3D.',
    href: '/work/blocks-inco-ai/',
  },
  {
    year: 2026,
    label: 'Browser-native spatial experiments',
    summary: 'Kinema, Web Ocean 3D, and Safed Sagar explore how much serious interactive work now fits in a browser.',
    href: '/work/',
  },
] as const;

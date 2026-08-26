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
  image?: string;
};

export const TIMELINE: readonly TimelineEntry[] = [
  {
    year: 2011,
    label: 'Game programmer · Trine Games and Zen Technologies',
    summary: 'Early Unreal and mobile game work established a bias toward turning design ideas into playable systems quickly.',
    href: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
  },
  {
    year: 2013,
    label: 'Senior developer · Merkur Gaming India',
    summary: 'Cross-platform Unity systems, performance work, and disciplined release engineering across regulated game products.',
    href: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
  },
  {
    year: 2015,
    label: 'Co-founder and CTO · GreyKernel',
    summary: 'Six years building and leading XR, simulation, robotics, education, gaming, and real-estate systems.',
    href: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
  },
  {
    year: 2019,
    label: 'Humanoid Robot Control System',
    summary: 'Patented work translated IMU body tracking into on-device humanoid robot control.',
    href: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
  },
  {
    year: 2021,
    label: 'Principal software architect · HomeLane',
    summary: 'Real-time interior-design and quote tooling brought graphics, CAD/CAM integration, and production workflows together.',
    href: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
  },
  {
    year: 2023,
    label: 'VP Product & Technology · Square Yards',
    summary: 'Leading AI and real-time 3D product and engineering, including the publicly shared Blocks and INCO-AI systems.',
    href: '/work/blocks-inco-ai/',
    image: '/media/work/blocks-inco-ai/near.webp',
  },
  {
    year: 2026,
    label: 'Browser-native spatial experiments',
    summary: 'Kinema, Web Ocean 3D, and Safed Sagar explore how much serious interactive work now fits in a browser.',
    href: '/work/',
    image: '/media/work/web-ocean-3d/hero.webp',
  },
] as const;

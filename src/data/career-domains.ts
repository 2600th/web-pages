import type { CareerDomain } from '../content/evidence';

export const CAREER_DOMAIN_META: Record<CareerDomain, { label: string; description: string; order: number }> = {
  games: {
    label: 'Games',
    description: 'Mobile and VR games, browser experiments, and game-development tools.',
    order: 1,
  },
  xr: {
    label: 'XR and spatial computing',
    description: 'Virtual lessons, interactive environments, and 360-degree productions.',
    order: 2,
  },
  simulation: {
    label: 'Training and simulation',
    description: 'Interactive training for classrooms and specialist work environments.',
    order: 3,
  },
  robotics: {
    label: 'Robotics',
    description: 'Human movement translated into controllable physical systems.',
    order: 4,
  },
  'design-tech': {
    label: 'Design technology',
    description: 'Real-time visualization connected to commercial design workflows.',
    order: 5,
  },
  'applied-ai': {
    label: 'Applied AI',
    description: 'Design tools, creative experiments, and software built around AI models.',
    order: 6,
  },
};

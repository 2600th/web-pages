import type { CareerDomain, CareerEra } from '../content/evidence';

export const CAREER_ERA_META: Record<CareerEra, { label: string; description: string; order: number }> = {
  programmer: {
    label: 'Programmer and game maker',
    description: 'Learning to turn design intent into responsive real-time systems.',
    order: 1,
  },
  founder: {
    label: 'Founder and immersive-systems builder',
    description: 'Building a company and applying spatial technology to games, training, and industry.',
    order: 2,
  },
  operator: {
    label: 'Design-tech and AI operator',
    description: 'Connecting emerging technology to products, production workflows, and teams.',
    order: 3,
  },
};

export const CAREER_DOMAIN_META: Record<CareerDomain, { label: string; description: string; order: number }> = {
  games: {
    label: 'Games',
    description: 'Playable systems, tools, and authored real-time experiences.',
    order: 1,
  },
  xr: {
    label: 'XR and spatial computing',
    description: 'Immersive products that make digital space useful and legible.',
    order: 2,
  },
  simulation: {
    label: 'Training and simulation',
    description: 'Systems designed to survive real operational and learning constraints.',
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
    description: 'AI integrated into products and production systems rather than isolated demos.',
    order: 6,
  },
};

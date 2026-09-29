// Real site copy (from src/content), trimmed for the prototypes.
import blocks from '../assets/media/blocks.webp';
import designesto from '../assets/media/designesto.webp';
import craft from '../assets/media/craft.webp';
import spacecraft from '../assets/media/spacecraft.webp';
import enterprise from '../assets/media/enterprise.webp';

export const WORK = [
  {
    slug: 'blocks', title: 'Blocks', years: '2024–26', domain: 'Design tech · Applied AI', zone: 'boots',
    summary: 'A browser-based interior-design system connecting spatial planning, product choices, pricing, quality checks and production handoffs.',
    image: blocks, alt: 'Oak and ivory kitchen with one drawer cabinet separated into aligned panels, drawers and worktop',
  },
  {
    slug: 'designesto', title: 'Designesto', years: '2026', domain: 'Applied AI · Design tech', zone: 'glasses',
    summary: 'AI design studio for spaces: explore room directions, revise existing rooms, and move from sketches to renders and 360° experiences.',
    image: designesto, alt: 'Designesto preview comparing an empty room with a furnished interior concept',
  },
  {
    slug: 'propvr-ai-craft', title: 'PropVR AI → Craft', years: '2026', domain: 'Applied AI', zone: 'glasses',
    summary: 'I built the initial 22-tool AI MVP across five workflow studios. PropVR’s team developed it into Craft, a public creative platform for AEC.',
    image: craft, alt: 'Craft public homepage presenting an AEC creative workflow',
  },
  {
    slug: 'homelane-spacecraft-pro', title: 'SpaceCraft Pro', years: '2021–23', domain: 'Real-time 3D · Design tech', zone: 'boots',
    summary: 'Principal software architect on a real-time room editor connected to pricing, CAD and manufacturing workflows.',
    image: spacecraft, alt: 'HomeLane SpaceCraft interface showing material choices and real-time pricing',
  },
  {
    slug: 'enterprise-immersive-systems', title: 'Enterprise XR', years: '2016–21', domain: 'XR · Simulation', zone: 'harness',
    summary: 'Technology lead across immersive client projects, including JPMorgan Chase’s Mumbai lab, Anglian Water training and VR empathy work in Singapore.',
    image: enterprise, alt: 'Enterprise immersive workflow connecting a 360 camera, an industrial site and a VR learner',
  },
];

export const NOTES = [
  { slug: 'ai-native-game-development-three-years-later', type: 'Essay', date: '2026-09-03', title: 'AI-native game development, three years later' },
  { slug: 'ai-floorplan-parsing', type: 'Technical Teardown', date: '2026-09-02', title: 'The hard part of AI floorplan parsing isn’t the model' },
  { slug: 'generative-and-deterministic-systems', type: 'Essay', date: '2026-09-02', title: 'The boundary between generative and deterministic systems' },
  { slug: 'technology-and-human-agency', type: 'Field Note', date: '2026-08-23', title: 'Making tools easier to steer' },
];

export const SITE_URL = 'https://www.2600th.com';
export const EMAIL = '2600th@gmail.com';

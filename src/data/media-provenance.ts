import { CAREER_MEDIA } from './career-media';
import type { EvidenceStatus } from '../content/evidence';

export type MediaProvenance = {
  sourceUrl: string;
  status: 'public-repository' | 'authored-public-post' | EvidenceStatus;
};

const CAREER_MEDIA_PROVENANCE = Object.fromEntries(
  Object.values(CAREER_MEDIA).flatMap((media) =>
    Object.values(media.derivatives)
      .filter((path): path is string => Boolean(path))
      .map((path) => [path, { sourceUrl: media.sourceUrl, status: media.status }]),
  ),
) as Record<string, MediaProvenance>;

export const MEDIA_PROVENANCE: Record<string, MediaProvenance> = {
  '/media/work/humanoid-robot-control-system/hero.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1TYDMeuarbxZYe6NbDTrHrJOkrn7kw-Bx/view',
    status: 'public-corroborated',
  },
  '/media/work/homelane-spacecraft-pro/hero.webp': {
    sourceUrl: 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild',
    status: 'public-corroborated',
  },
  '/media/work/enterprise-immersive-systems/hero.webp': {
    sourceUrl: 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild',
    status: 'public-approved',
  },
  '/media/work/enterprise-immersive-systems/swissotel-loop.mp4': {
    sourceUrl: 'https://drive.google.com/file/d/1zBseAGm8RaS9e3mUsMXfVCi3mxnKW-nZ/view',
    status: 'public-corroborated',
  },
  '/media/work/enterprise-immersive-systems/swissotel-poster.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1zBseAGm8RaS9e3mUsMXfVCi3mxnKW-nZ/view',
    status: 'public-corroborated',
  },
  '/media/work/enterprise-immersive-systems/facility-loop.mp4': {
    sourceUrl: 'https://drive.google.com/file/d/1XmopB2DVkQLK2KgtywgBIngrHlUr0-7Z/view',
    status: 'public-corroborated',
  },
  '/media/work/enterprise-immersive-systems/facility-poster.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1XmopB2DVkQLK2KgtywgBIngrHlUr0-7Z/view',
    status: 'public-corroborated',
  },
  '/media/work/enterprise-immersive-systems/ageing-simulation-map.svg': {
    sourceUrl: 'https://cyclingwithoutage.sg/wp-content/uploads/sites/25/2023/05/Annual-Report31Dec2021.pdf',
    status: 'public-corroborated',
  },
  '/media/work/ai-native-game-thesis/hero.webp': {
    sourceUrl: 'https://2600th.substack.com/p/revolutionizing-realms-how-ai-is',
    status: 'public-approved',
  },
  '/media/work/little-wonder/hero.webp': {
    sourceUrl: 'https://little-wonder.vercel.app/',
    status: 'public-approved',
  },
  '/media/work/blocks-inco-ai/designesto-edit-room-poster.webp': {
    sourceUrl: 'https://www.designesto.ai/',
    status: 'approval-enhanced',
  },
  '/media/work/blocks-inco-ai/designesto-edit-room.mp4': {
    sourceUrl: 'https://www.designesto.ai/',
    status: 'approval-enhanced',
  },
  ...CAREER_MEDIA_PROVENANCE,
  '/media/social/career-atlas.webp': {
    sourceUrl: 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild',
    status: 'public-approved',
  },
  '/media/work/kinema/hero.webp': {
    sourceUrl: 'https://github.com/2600th/Kinema/blob/main/docs/readme/main-menu.png',
    status: 'public-repository',
  },
  '/media/work/kinema/editor.webp': {
    sourceUrl: 'https://github.com/2600th/Kinema/blob/main/docs/readme/use-cases.png',
    status: 'public-repository',
  },
  '/media/work/kinema/inside.webp': {
    sourceUrl: 'https://github.com/2600th/Kinema/blob/main/docs/readme/station-target-arena.png',
    status: 'public-repository',
  },
  '/media/work/web-ocean-3d/hero.webp': {
    sourceUrl: 'https://github.com/2600th/web-ocean-3d/blob/main/docs/images/hero.png',
    status: 'public-repository',
  },
  '/media/work/web-ocean-3d/near.webp': {
    sourceUrl: 'https://github.com/2600th/web-ocean-3d/blob/main/docs/images/underwater.png',
    status: 'public-repository',
  },
  '/media/work/web-ocean-3d/inside.webp': {
    sourceUrl: 'https://github.com/2600th/web-ocean-3d/blob/main/docs/images/interface.png',
    status: 'public-repository',
  },
  '/media/work/web-ocean-3d/clip.mp4': {
    sourceUrl: 'https://web-ocean-3d.vercel.app/',
    status: 'public-repository',
  },
  '/media/work/web-ocean-3d/clip-poster.webp': {
    sourceUrl: 'https://web-ocean-3d.vercel.app/',
    status: 'public-repository',
  },
  '/media/career/ira-vr/classroom-loop.mp4': {
    sourceUrl: 'https://drive.google.com/file/d/1PqYHYxrGMlTcCiCNzSWscu_0m_A5gDLR/view',
    status: 'public-corroborated',
  },
  '/media/career/ira-vr/classroom-poster.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1PqYHYxrGMlTcCiCNzSWscu_0m_A5gDLR/view',
    status: 'public-corroborated',
  },
  '/media/career/ira-vr/operations-poster.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1PqYHYxrGMlTcCiCNzSWscu_0m_A5gDLR/view',
    status: 'public-corroborated',
  },
  '/media/career/ira-vr/newton-poster.webp': {
    sourceUrl: 'https://www.dropbox.com/s/4rxzs9y6gxcyg6d/Newton_23sec.mp4?dl=0',
    status: 'public-corroborated',
  },
  '/media/career/ira-vr/newton-loop.mp4': {
    sourceUrl: 'https://www.dropbox.com/s/4rxzs9y6gxcyg6d/Newton_23sec.mp4?dl=0',
    status: 'public-corroborated',
  },
  '/media/work/safed-sagar/hero.webp': {
    sourceUrl: 'https://github.com/2600th/oss-web-3d/blob/main/docs/screenshots/04-cruise.jpg',
    status: 'public-repository',
  },
  '/media/work/safed-sagar/near.webp': {
    sourceUrl: 'https://github.com/2600th/oss-web-3d/blob/main/docs/screenshots/06-recon.jpg',
    status: 'public-repository',
  },
  '/media/work/safed-sagar/inside.webp': {
    sourceUrl: 'https://github.com/2600th/oss-web-3d/blob/main/docs/screenshots/12-settings.jpg',
    status: 'public-repository',
  },
  '/media/work/blocks-inco-ai/hero.webp': {
    sourceUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7347844333657628673/',
    status: 'authored-public-post',
  },
  '/media/work/blocks-inco-ai/near.webp': {
    sourceUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7339171151543209984/',
    status: 'authored-public-post',
  },
  '/media/work/blocks-inco-ai/inside.webp': {
    sourceUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7401160661000708096/',
    status: 'authored-public-post',
  },
  '/media/work/blocks-inco-ai/designesto-before-after.webp': {
    sourceUrl: 'https://www.designesto.ai/',
    status: 'public-approved',
  },
  '/media/work/blocks-inco-ai/designesto-after.webp': {
    sourceUrl: 'https://www.designesto.ai/',
    status: 'public-approved',
  },
  '/media/career/chhota-bheem-jungle-rescue/concept-screens.webp': {
    sourceUrl: 'https://docs.google.com/presentation/d/18okz-FLfTK5ft-DyyfOda2C28WzPH7ms7jYM8tBro1g/edit',
    status: 'public-corroborated',
  },
  '/media/career/defense-simulation-systems/system-map.svg': {
    sourceUrl: 'https://www.linkedin.com/in/pranshulchandhok/details/experience/',
    status: 'public-approved',
  },
};

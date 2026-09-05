import { CAREER_MEDIA } from './career-media';
import type { EvidenceStatus } from '../content/evidence';

export type MediaProvenance = {
  sourceUrl: string;
  status: 'public-repository' | 'authored-public-post' | 'generated-identity' | 'generated-editorial' | EvidenceStatus;
  evidenceUse?: boolean;
};

const CAREER_MEDIA_PROVENANCE = Object.fromEntries(
  Object.values(CAREER_MEDIA).flatMap((media) =>
    Object.values(media.derivatives)
      .filter((path): path is string => Boolean(path))
      .map((path) => [path, { sourceUrl: media.sourceUrl, status: media.status }]),
  ),
) as Record<string, MediaProvenance>;

const ROUTE_OPENING_MEDIA_PROVENANCE = Object.fromEntries(
  [
    {
      stem: '/media/routes/work/blocks',
      sourceUrl: 'generated://openai/imagegen/exec-827f03a5-b295-4bea-bf7f-2571b59e7dd1',
      status: 'generated-editorial',
      evidenceUse: false,
    },
    {
      stem: '/media/routes/work/ira-vr-v2',
      sourceUrl: 'generated://openai/imagegen/exec-705c02d8-2d4e-4a1c-bb0e-9ae925fa9d24',
      status: 'generated-editorial',
      evidenceUse: false,
    },
    {
      stem: '/media/routes/work/spacecraft-pro',
      sourceUrl: 'https://www.youtube.com/watch?v=yDFFZskBKaA',
      status: 'public-corroborated',
    },
    {
      stem: '/media/routes/work/designesto-ai',
      sourceUrl: 'https://www.designesto.ai/',
      status: 'public-approved',
    },
    {
      stem: '/media/routes/notes/notes-aperture',
      sourceUrl: 'generated://editorial/notes-aperture',
      status: 'generated-editorial',
      evidenceUse: false,
    },
  ].flatMap((asset) =>
    [640, 960].flatMap((width) =>
      ['avif', 'webp'].map((format) => [
        `${asset.stem}-${width}.${format}`,
        { sourceUrl: asset.sourceUrl, status: asset.status, evidenceUse: asset.evidenceUse },
      ]),
    ),
  ),
) as Record<string, MediaProvenance>;

const ENHANCED_EDITORIAL_RECEIPTS: Record<string, string> = {
  'ai-native-game-thesis-hero-v2': 'exec-4dd3ceb6-98bd-494c-a776-cfd0a2d01895',
  'alphaman-gameplay-v2': 'exec-e0492cb0-bb16-418f-93d3-959cbc8d11fd',
  'blocks-designesto-before-after-v2': 'exec-a20db51f-c921-43d5-aa46-addfe2667936',
  'blocks-designesto-after-v2': 'exec-4bbadf3d-138d-4a6d-996d-7bd2d0d64c7d',
  'chhota-bheem-jungle-rescue-v2': 'exec-50571dc4-9736-41bd-a5c9-a7a026765d7c',
  'enterprise-xr-hero-v2': 'exec-1823aa82-4f4d-456a-bb89-240010ebb88b',
  'enterprise-xr-swissotel-v2': 'exec-d0379ee1-274c-4276-8de6-9a72fcb9f12c',
  'fruit-masti-v2': 'exec-73bd5f99-3f40-4d2f-8ac5-e277d8ae4c0d',
  'humanoid-robot-control-v2': 'exec-453fb818-501c-49cf-aee5-214a8a90da72',
  'ira-lab-v2': 'exec-9e5c9b10-e5d9-4824-9810-cd67e927ba9b',
  'ira-newton-v2': 'exec-705c02d8-2d4e-4a1c-bb0e-9ae925fa9d24',
  'ira-panorama-v2': 'exec-3772c360-f25b-4d51-b829-c15551e6d420',
  'kinema-editor-v2': 'exec-32a65be7-bb41-461d-af17-cf42478e40d3',
  'kinema-hero-v2': 'exec-184e6a38-4783-49fc-8bbb-0f97ab786870',
  'kinema-inside-v2': 'exec-d6011643-c930-4c53-ac72-c4b9c50279e2',
  'little-wonder-hero-v2': 'exec-e2ec229c-c83d-4fa1-ad02-b4e3ef38b815',
  'machine-hunter-aim-v2': 'exec-5947a680-5c49-4955-93bc-995add04784b',
  'machine-hunter-draw-v2': 'exec-318f370e-9bc9-4be2-a083-d3e5751492aa',
  'machine-hunter-hero-v2': 'exec-b39ec7ca-56b0-4b49-885f-e2fbd490fea0',
  'machine-hunter-release-v2': 'exec-f61d0756-17ce-4330-8f10-41da58f3fe96',
  'oye-tippa-run-v2': 'exec-df729c36-3032-49fe-9e21-739ced4e9f80',
  'safed-sagar-hero-v2': 'exec-18c8ad9f-c4a7-4721-89ff-aefde0d63b41',
  'safed-sagar-inside-v2': 'exec-6600be6b-cd71-4fb7-bfbc-e44b7a167d5a',
  'safed-sagar-near-v2': 'exec-3fe77d74-e65f-4a76-88fd-70dbac39b6d7',
  'spacecraft-hero-v2': 'exec-29f4ae60-f65c-47e5-ad06-333f455a6e64',
  'spacecraft-public-demo-v2': 'exec-da5d6850-6f79-4945-8c0d-3abb3b4122de',
  'spacecraft-room-editor-v2': 'exec-a704646e-b093-4f73-a031-ee31feb15f39',
  'spacecraft-workflow-editorial-v2': 'exec-2108bd70-e06c-4d89-b66f-ab5dade4ccb1',
  'the-brutal-spy-v2': 'exec-cdac7b51-8029-4ea5-8307-d13dc2ced191',
  'web-ocean-clip-v2': 'exec-b39433fd-6f8e-4997-a210-888a6a08888c',
  'web-ocean-hero-v2': 'exec-c3193dbb-8627-4913-b43a-b432cbd8133a',
  'web-ocean-inside-v2': 'exec-a787f059-48e5-433a-80c4-fd6573d8ad66',
};

const ENHANCED_EDITORIAL_PROVENANCE = Object.fromEntries(
  Object.entries(ENHANCED_EDITORIAL_RECEIPTS).flatMap(([stem, receipt]) =>
    ['webp', 'avif'].map((format) => [
      `/media/generated/editorial/enhanced/${stem}.${format}`,
      {
        sourceUrl: `generated://openai/imagegen/${receipt}`,
        status: 'generated-editorial',
        evidenceUse: false,
      },
    ]),
  ),
) as Record<string, MediaProvenance>;

export const MEDIA_PROVENANCE: Record<string, MediaProvenance> = {
  ...Object.fromEntries([
    'ocean-reliability', 'ai-floorplan-parsing', 'ai-video-control',
    'generative-and-deterministic-systems', 'ai-native-game-development-reflection',
    'ai-native-game-development-three-years-later',
    'browser-flight-experiment', 'from-pixels-to-intelligent-systems',
    'technology-and-human-agency', 'propvr-ai-craft',
  ].map((slug) => [`/media/social/${slug}.webp`, {
    sourceUrl: `generated://sharp/editorial-social/${slug}`,
    status: 'generated-editorial' as const,
    evidenceUse: false,
  }])),
  '/media/work/propvr-ai-craft/craft-public-home-20260902.webp': {
    sourceUrl: 'https://craft.propvr.ai/',
    status: 'public-approved',
  },
  ...ROUTE_OPENING_MEDIA_PROVENANCE,
  ...ENHANCED_EDITORIAL_PROVENANCE,
  '/media/generated/editorial/blocks-design-production-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-827f03a5-b295-4bea-bf7f-2571b59e7dd1',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/blocks-design-production-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-827f03a5-b295-4bea-bf7f-2571b59e7dd1',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/blocks-design-production-v1.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-b4375d06-c7b4-4960-8be7-a130269002dc',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/blocks-design-production-v1.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-b4375d06-c7b4-4960-8be7-a130269002dc',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/identity/2600th-operator-diorama.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-560170e9-2c42-4cc5-ad72-0b043602deb1',
    status: 'generated-identity',
    evidenceUse: false,
  },
  '/media/generated/identity/2600th-equipment-inventory.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-01183ce7-faf2-4eba-91f4-5b6e58ca0d84',
    status: 'generated-identity',
    evidenceUse: false,
  },
  '/media/generated/editorial/defense-systems-diorama.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-7ed4034d-94aa-4650-8f13-ebea01d930e7',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/defense-systems-atlas-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-dc081cd0-f40d-4d8c-930b-06b00e4108b6',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/defense-systems-atlas-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-dc081cd0-f40d-4d8c-930b-06b00e4108b6',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/cycling-without-age-empathy-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-30a889f7-ad43-44ae-8af6-fdbf705df342',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/cycling-without-age-empathy-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-30a889f7-ad43-44ae-8af6-fdbf705df342',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/cycling-without-age-empathy-v3.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-1be7f7b1-5033-438c-813f-ca5fb94c04f0',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/cycling-without-age-empathy-v3.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-1be7f7b1-5033-438c-813f-ca5fb94c04f0',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/blocks-designesto-poster-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-3b0dcb63-17a9-4118-8cdc-81f5e90ce31b',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/blocks-designesto-poster-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-3b0dcb63-17a9-4118-8cdc-81f5e90ce31b',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/ira-vr-poster-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-8abd16ae-aba0-42fa-886b-91665ef7ce22',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/ira-vr-poster-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-8abd16ae-aba0-42fa-886b-91665ef7ce22',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/enterprise-xr-poster-v2.webp': {
    sourceUrl: 'generated://openai/imagegen/exec-ca50a915-c2cf-47d6-8aa7-22db0fab5238',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/generated/editorial/landing/enterprise-xr-poster-v2.avif': {
    sourceUrl: 'generated://openai/imagegen/exec-ca50a915-c2cf-47d6-8aa7-22db0fab5238',
    status: 'generated-editorial',
    evidenceUse: false,
  },
  '/media/work/the-brutal-spy/trailer-poster.webp': {
    sourceUrl: 'https://www.youtube.com/watch?v=dB1g0Z5u3QU',
    status: 'public-corroborated',
  },
  '/media/work/alphaman/gameplay-poster.webp': {
    sourceUrl: 'https://www.youtube.com/watch?v=bGEhhltqLmw',
    status: 'public-corroborated',
  },
  '/media/work/merkur-magie/store-poster.webp': {
    sourceUrl: 'https://play.google.com/store/apps/details?id=com.Gauselmann.MerkurMagie',
    status: 'public-corroborated',
  },
  '/media/work/homelane-spacecraft-pro/public-demo-poster.webp': {
    sourceUrl: 'https://www.youtube.com/watch?v=yDFFZskBKaA',
    status: 'public-corroborated',
  },
  '/media/work/humanoid-robot-control-system/hero.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1TYDMeuarbxZYe6NbDTrHrJOkrn7kw-Bx/view',
    status: 'public-corroborated',
  },
  '/media/work/homelane-spacecraft-pro/hero.webp': {
    sourceUrl: 'https://2600th.substack.com/p/from-pixels-to-metaverse-my-wild',
    status: 'public-corroborated',
  },
  '/media/work/homelane-spacecraft-pro/workflow-loop.mp4': {
    sourceUrl: 'https://www.homelane.com/technology',
    status: 'approval-enhanced',
  },
  '/media/work/homelane-spacecraft-pro/workflow-poster.webp': {
    sourceUrl: 'https://www.homelane.com/technology',
    status: 'approval-enhanced',
  },
  '/media/work/homelane-spacecraft-pro/room-editor-loop.mp4': {
    sourceUrl: 'https://www.homelane.com/technology',
    status: 'approval-enhanced',
  },
  '/media/work/homelane-spacecraft-pro/room-editor-poster.webp': {
    sourceUrl: 'https://www.homelane.com/technology',
    status: 'approval-enhanced',
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
  '/media/work/kinema/inside-mobile.webp': {
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
  '/media/career/ira-vr/lab-loop.mp4': {
    sourceUrl: 'https://drive.google.com/file/d/1MdoaRuMtBgSQcoE5ulu_8B2AdbW1yBYV/view',
    status: 'public-corroborated',
  },
  '/media/career/ira-vr/lab-poster.webp': {
    sourceUrl: 'https://drive.google.com/file/d/1MdoaRuMtBgSQcoE5ulu_8B2AdbW1yBYV/view',
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

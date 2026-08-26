import type { EvidenceStatus } from '../content/evidence';

export type CareerMediaRecord = {
  sourceUrl: string;
  sourceLabel: string;
  status: EvidenceStatus;
  alt: string;
  width: number;
  height: number;
  derivatives: {
    poster640: string;
    poster1280: string;
    posterAvif?: string;
    clipMp4?: string;
    clipWebm?: string;
  };
};

export const CAREER_MEDIA: Record<string, CareerMediaRecord> = {
  'ira-vr': {
    sourceUrl: 'https://drive.google.com/file/d/1bVfXRmZW6vDuHdsoSqEZOcM1gyOl4fI-/view',
    sourceLabel: 'IRA VR client learning view',
    status: 'public-corroborated',
    alt: 'IRA VR learning module presented inside a panoramic immersive landscape',
    width: 1280,
    height: 826,
    derivatives: {
      poster640: '/media/career/ira-vr/poster-640.webp',
      poster1280: '/media/career/ira-vr/poster-1280.webp',
      posterAvif: '/media/career/ira-vr/poster-1280.avif',
    },
  },
  'machine-hunter': {
    sourceUrl: 'https://drive.google.com/file/d/11fcukwZFUa42Ave95czc0izYyuhsdmxE/view',
    sourceLabel: 'Machine Hunter alpha video',
    status: 'public-corroborated',
    alt: 'Bow-and-arrow gameplay inside the Machine Hunter virtual-reality arena',
    width: 1150,
    height: 720,
    derivatives: {
      poster640: '/media/career/machine-hunter/poster-640.webp',
      poster1280: '/media/career/machine-hunter/poster-1280.webp',
      clipMp4: '/media/career/machine-hunter/clip.mp4',
      clipWebm: '/media/career/machine-hunter/clip.webm',
    },
  },
  'oye-tippa-run': {
    sourceUrl: 'https://drive.google.com/file/d/13Xzy9MMWwfXvgwpMLWR1z3H7WR-psPgk/view',
    sourceLabel: 'Oye Tippa Run video',
    status: 'public-corroborated',
    alt: 'Oye Tippa Run character collecting coins across a colorful Indian city',
    width: 1280,
    height: 720,
    derivatives: {
      poster640: '/media/career/oye-tippa-run/poster-640.webp',
      poster1280: '/media/career/oye-tippa-run/poster-1280.webp',
      clipMp4: '/media/career/oye-tippa-run/clip.mp4',
    },
  },
  'celeste-ar': {
    sourceUrl: 'https://drive.google.com/file/d/1RdTNnMxeyCMUkAwx6gN-IStszfgMGq5t/view',
    sourceLabel: 'Celeste AR promotional still',
    status: 'public-corroborated',
    alt: 'Fruit Masti augmented-reality game start screen from the Celeste AR work',
    width: 1102,
    height: 620,
    derivatives: {
      poster640: '/media/career/celeste-ar/poster-640.webp',
      poster1280: '/media/career/celeste-ar/poster-1280.webp',
      posterAvif: '/media/career/celeste-ar/poster-1280.avif',
    },
  },
};

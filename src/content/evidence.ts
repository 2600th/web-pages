export const RECORD_TYPES = ['feature', 'case', 'evidence-note'] as const;
export const EVIDENCE_STATUSES = [
  'public-approved',
  'public-corroborated',
  'approval-enhanced',
] as const;
export const CAREER_ERAS = ['programmer', 'founder', 'operator'] as const;
export const CAREER_DOMAINS = [
  'games',
  'xr',
  'simulation',
  'robotics',
  'design-tech',
  'applied-ai',
] as const;
export const ENGAGEMENT_PATHS = [
  'operator-advisory',
  'product-collaboration',
  'speaking-writing',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type CareerEra = (typeof CAREER_ERAS)[number];
export type CareerDomain = (typeof CAREER_DOMAINS)[number];
export type EngagementPath = (typeof ENGAGEMENT_PATHS)[number];

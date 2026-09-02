import { z } from 'zod';
import {
  CAREER_DOMAINS,
  CAREER_ERAS,
  ENGAGEMENT_PATHS,
  EVIDENCE_STATUSES,
} from './evidence';

const mediaSchema = z.object({
  src: z.string().startsWith('/'),
  avif: z.string().startsWith('/').optional(),
  label: z.string().min(24).optional(),
  alt: z.string().min(20),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mp4: z.string().startsWith('/').optional(),
  webm: z.string().startsWith('/').optional(),
});

const caseMediaSchema = mediaSchema.extend({
  label: z.string().min(24),
});

const sourceSchema = z.object({
  label: z.string().min(2),
  url: z.url(),
  type: z.enum([
    'repository',
    'live-demo',
    'authored-post',
    'employer-post',
    'shared-archive',
    'press',
    'official-source',
    'company-profile',
    'app-directory',
  ]),
});

const reviewedEvidenceSchema = z.object({
  title: z.string().min(3),
  date: z.coerce.date(),
  organization: z.string().min(2),
  type: z.string().min(3),
  note: z.string().min(20),
});

const workBaseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().min(40),
  yearStart: z.number().int().min(2000),
  yearEnd: z.number().int().min(2000).optional(),
  status: z.string().min(2),
  role: z.string().min(2),
  disciplines: z.array(z.string().min(2)).min(1),
  visibility: z.enum(['public', 'approval-enhanced']),
  featuredOrder: z.number().int().min(0),
  era: z.enum(CAREER_ERAS),
  domains: z.array(z.enum(CAREER_DOMAINS)).min(1),
  careerOrder: z.number().int().nonnegative(),
  relationships: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  archive: z.boolean().default(true),
  context: z.string().min(10).optional(),
  relatedWork: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  evidenceStatus: z.enum(EVIDENCE_STATUSES),
  publicClaims: z.array(z.string().min(20)).min(1),
  engagementPath: z.enum(ENGAGEMENT_PATHS),
  sources: z.array(sourceSchema).min(1),
  reviewedEvidence: z.array(reviewedEvidenceSchema).optional(),
  heroLabel: z.string().min(2).optional(),
  storyHeading: z.string().min(10).optional(),
  storyLabel: z.string().min(3).optional(),
  seo: z.object({
    title: z.string().min(20),
    description: z.string().min(60).max(180),
    socialImage: z.string().startsWith('/'),
  }),
});

const outSchema = z.object({
  thesis: z.string().min(30),
  audience: z.string().min(10),
  outcome: z.string().min(20),
  media: caseMediaSchema,
});

const nearSchema = z.object({
  experience: z.string().min(30),
  contribution: z.string().min(20),
  system: z.string().min(30),
  media: caseMediaSchema,
});

const insideSchema = z.object({
  decisions: z.array(z.string().min(20)).min(2),
  constraints: z.array(z.string().min(15)).min(1),
  evidence: z.array(z.string().min(15)).min(1),
  media: caseMediaSchema,
});

const caseFields = {
  heroMedia: caseMediaSchema,
  out: outSchema,
  near: nearSchema,
  inside: insideSchema,
};

const featureSchema = workBaseSchema.extend({ recordType: z.literal('feature'), ...caseFields });
const caseSchema = workBaseSchema.extend({ recordType: z.literal('case'), ...caseFields });
const narrativeSchema = workBaseSchema.extend({
  recordType: z.literal('narrative'),
  heroMedia: caseMediaSchema,
  out: z.undefined().optional(),
  near: z.undefined().optional(),
  inside: z.undefined().optional(),
});
const evidenceNoteSchema = workBaseSchema.extend({
  recordType: z.literal('evidence-note'),
  heroMedia: mediaSchema.optional(),
  out: z.undefined().optional(),
  near: z.undefined().optional(),
  inside: z.undefined().optional(),
});

export const workSchema = z.discriminatedUnion('recordType', [featureSchema, caseSchema, narrativeSchema, evidenceNoteSchema]);

export const noteSchema = z.object({
  title: z.string().min(10),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().min(40),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  type: z.enum(['field-note', 'technical-teardown', 'essay']),
  topics: z.array(z.string().min(2)).min(1),
  canonicalUrl: z.url().optional(),
  sourceAttribution: z.string().min(5),
  relatedWork: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  relatedLab: z.array(z.object({
    title: z.string().min(2),
    href: z.string().regex(/^\/lab\/[a-z0-9/._-]*(?:#[a-z0-9-]+)?$/),
  })).default([]),
  ogImage: z.string().startsWith('/media/social/'),
  heroMedia: mediaSchema.optional(),
  draft: z.boolean(),
});

export type WorkEntry = z.infer<typeof workSchema>;
export type NoteEntry = z.infer<typeof noteSchema>;

import type { NoteEntry } from '../content/schemas';
import { SITE } from './site';

type NoteRecord = { data: NoteEntry; body?: string };

export function getOriginalSource(source: string | undefined, slug: string): string | undefined {
  if (!source) return undefined;
  const original = new URL(source);
  const local = new URL(`/notes/${slug}/`, SITE.url);
  return original.origin === local.origin && original.pathname.replace(/\/+$/, '') === local.pathname.replace(/\/+$/, '')
    ? undefined : source;
}

export const NOTE_TYPES = {
  'field-note': 'Field Note',
  'technical-teardown': 'Technical Teardown',
  essay: 'Essay',
} as const;

/** Reading estimate from body copy, never hand-maintained frontmatter. */
export function getNoteReadingTime(body: string): number {
  const text = body
    .replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[`#*_>|~\-]/g, ' ');
  const words = text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function getPublishedNotes<T extends NoteRecord>(entries: T[]): T[] {
  return entries.filter(({ data }) => !data.draft).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.data.slug.localeCompare(b.data.slug),
  );
}

/** The latest published representative of each available editorial type, ordered newest first. */
export function getHomepageNotes<T extends NoteRecord>(entries: T[]): T[] {
  const representedTypes = new Set<NoteEntry['type']>();
  return getPublishedNotes(entries).filter(({ data }) => {
    if (representedTypes.has(data.type)) return false;
    representedTypes.add(data.type);
    return true;
  });
}

export function getNotesForWork<T extends NoteRecord>(entries: T[], slug: string): T[] {
  return getPublishedNotes(entries).filter(({ data }) => data.relatedWork.includes(slug));
}

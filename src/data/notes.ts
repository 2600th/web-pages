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

/**
 * Each type keeps one colour and one wave everywhere: field notes a phosphor sine,
 * teardowns a cobalt square, essays an ink saw. Green and gold stay reserved for
 * live builds and attention.
 */
export const NOTE_TONES = {
  'field-note': 'phosphor',
  'technical-teardown': 'cobalt',
  essay: 'ink',
} as const;

export const NOTE_WAVES = {
  'field-note': 'sine',
  'technical-teardown': 'square',
  essay: 'saw',
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

const countWords = (text: string) => text
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]*>/g, '')
  .match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;

export type NoteSegment = { label: string; slug?: string; words: number };

/**
 * The shape of a note: one segment per `##` section (or per paragraph for short notes
 * without sections), sized by its word count. It drives the signal signature that
 * doubles as the note's contents and reading progress. Slugs come from the rendered
 * headings so links match the page.
 */
export function getNoteSignature(body: string, headings: { depth: number; slug: string; text: string }[] = []): NoteSegment[] {
  const text = body.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
  const sections = text.split(/^##\s+/m);
  const intro = sections.shift() ?? '';
  const h2 = headings.filter((heading) => heading.depth === 2);
  if (sections.length > 0) {
    const segments: NoteSegment[] = sections.map((section, index) => ({
      label: h2[index]?.text ?? section.split('\n')[0].trim(),
      slug: h2[index]?.slug,
      words: countWords(section),
    }));
    const lead = countWords(intro);
    return lead > 0 ? [{ label: 'Opening', words: lead }, ...segments] : segments;
  }
  return intro.split(/\n\s*\n/).map((paragraph) => ({ label: 'Paragraph', words: countWords(paragraph) }))
    .filter((segment) => segment.words > 0)
    .map((segment, index) => ({ ...segment, label: `Paragraph ${index + 1}` }));
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

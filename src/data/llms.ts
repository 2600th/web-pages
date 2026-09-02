import type { NoteEntry, WorkEntry } from '../content/schemas';
import { PERSON, SITE } from './site';
import { getPrioritizedWork } from './work-order';

type ProjectSummary = Pick<WorkEntry, 'title' | 'slug' | 'summary' | 'careerOrder' | 'yearStart'> & Partial<Pick<WorkEntry, 'archive'>>;
type NoteSummary = Pick<NoteEntry, 'title' | 'slug' | 'summary' | 'publishedAt' | 'draft'>;

// Summaries are plain text, not Markdown documents or raw frontmatter exports.
const inline = (text: string) => text.replace(/\s+/g, ' ').trim().replace(/[\\`*_{}\[\]()<>#!|]/g, '\\$&');
const link = (title: string, path: string, summary: string) =>
  `- [${inline(title)}](${new URL(path, SITE.url).href}): ${inline(summary)}`;

export function buildLlmsTxt(work: readonly ProjectSummary[], notes: readonly NoteSummary[]): string {
  const projects = getPrioritizedWork(work.map(data => ({ data }))).map(entry => entry.data);
  const publishedNotes = notes.filter(note => !note.draft)
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf() || a.slug.localeCompare(b.slug));

  return [
    `# ${inline(SITE.name)}`,
    '',
    `> ${inline(SITE.description)}`,
    '',
    `${inline(PERSON.summary)} Based in ${inline(PERSON.location)}.`,
    '',
    'This is my personal portfolio. First-person descriptions refer to my contributions. Team and client projects are identified on their project pages, with role, dates, project status, and relevant links. My independent experiments are collected in the Lab.',
    '',
    'This guide summarizes the public pages linked below. Follow those pages for details and current project status.',
    '',
    '## Start here',
    '',
    link('Home', '/', 'Introduction, selected projects, and current work.'),
    link('About', '/about/', 'My background, career, and approach to product and engineering.'),
    link('Projects', '/work/', 'Browse team projects, client work, and independent experiments by area.'),
    link('Notes', '/notes/', 'Writing about tools, product development, AI, and real-time 3D.'),
    link('Lab', '/lab/', 'Independent browser graphics and AI experiments, with demo and source links.'),
    link('Contact', '/#contact', 'Questions about the work and an invitation to exchange ideas.'),
    '',
    '## Projects',
    '',
    ...projects.map(project => link(project.title, `/work/${project.slug}/`, project.summary)),
    '',
    '## Notes',
    '',
    ...publishedNotes.map(note => link(note.title, `/notes/${note.slug}/`, note.summary)),
    '',
    '## Lab companion',
    '',
    link('Dwarkesh × Jensen Huang interview companion', '/lab/dwarkesh-jensen/index.html', 'An unofficial explanatory companion with 92 technical terms and source interview timestamp links.'),
    '',
    '## Optional',
    '',
    link('Notes RSS feed', '/rss.xml', 'Subscribe to published notes.'),
    link('Sitemap', '/sitemap-index.xml', 'The complete search-engine sitemap index.'),
    link('Crawler policy', '/robots.txt', 'Crawl permissions. This guide does not change them.'),
    '',
  ].join('\n');
}

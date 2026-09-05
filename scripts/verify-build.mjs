import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = dirname(fileURLToPath(import.meta.url));
const project = join(root, '..');
const output = join(project, 'dist');

const records = async (collection) => {
  const directory = join(project, 'src', 'content', collection);
  const entries = await Promise.all((await readdir(directory)).filter(file => file.endsWith('.md')).map(async file => {
    const source = await readFile(join(directory, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) throw new Error(`${file} has no frontmatter.`);
    return parse(frontmatter[1]);
  }));
  return entries;
};

const work = await records('work');
const notes = await records('notes');
const workSlugs = work.map(entry => entry.slug);
const noteSlugs = notes.filter(entry => !entry.draft).map(entry => entry.slug);
const visibleWorkSlugs = work.filter(entry => entry.archive !== false).map(entry => entry.slug);
const workDomainSlugs = ['games', 'xr', 'simulation', 'robotics', 'design-tech', 'applied-ai'];
const requiredFiles = [
  'index.html',
  '404.html',
  '.nojekyll',
  'CNAME',
  'robots.txt',
  'llms.txt',
  'rss.xml',
  'manifest.webmanifest',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'sitemap-index.xml',
  'work/index.html',
  'notes/index.html',
  'about/index.html',
  'lab/index.html',
  'lab/terminal/index.html',
  'lab/dwarkesh-jensen/index.html',
  'media/social/career-atlas.webp',
  'media/generated/identity/2600th-velvet-character.webp',
  'media/generated/identity/2600th-velvet-character-640.webp',
  'media/generated/identity/provenance.json',
  ...workSlugs.map((slug) => `work/${slug}/index.html`),
  ...workDomainSlugs.map((domain) => `work/domain/${domain}/index.html`),
  ...noteSlugs.map((slug) => `notes/${slug}/index.html`),
];

for (const file of requiredFiles) await access(join(output, file));

const cname = (await readFile(join(output, 'CNAME'), 'utf8')).trim();
if (cname !== 'www.2600th.com') throw new Error(`Unexpected CNAME: ${cname}`);

const htmlRoutes = requiredFiles.filter((file) => file.endsWith('index.html') && file !== 'lab/terminal/index.html');
const internalDisclosure = /generated (?:2600th identity|equipment|editorial(?: illustration)?|direction) (?:study|illustration)?|not project evidence|not client documentation/i;
for (const route of htmlRoutes) {
  const html = await readFile(join(output, route), 'utf8');
  if (!html.includes('<h1') || !html.includes('rel="canonical"')) {
    throw new Error(`${route} is missing its h1 or canonical metadata.`);
  }
  if (internalDisclosure.test(html)) {
    throw new Error(`${route} contains internal generated-media disclosure copy.`);
  }
}

const home = await readFile(join(output, 'index.html'), 'utf8');
if (!home.includes('Pranshul Chandhok') || !home.includes('Make the uncertain') || !home.includes('Interior Company at Square Yards')) {
  throw new Error('The generated homepage is missing its current identity or Velvet thesis.');
}
if ((home.match(/<article\b[^>]*\bdata-signal-case\b/g) ?? []).length !== 5 || home.includes('href="/work/blocks-inco-ai/"')) throw new Error('Homepage featured work is not the approved five-product selection.');

const archive = await readFile(join(output, 'lab', 'terminal', 'index.html'), 'utf8');
if (!archive.includes('noindex,follow') || !archive.includes('Return to Pranshul Chandhok')) {
  throw new Error('The console archive is missing its indexing policy or return path.');
}

async function walk(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walk(path));
    else found.push(path);
  }
  return found;
}

const builtFiles = await walk(output);

// Check the generated discovery graph, not just the presence of a sitemap filename.
const origin = 'https://www.2600th.com';
const outputForUrl = (value) => {
  const url = new URL(value);
  if (url.origin !== origin || url.search) throw new Error(`Noncanonical discovery URL: ${value}`);
  return join(output, url.pathname.endsWith('/') ? `${url.pathname.slice(1)}index.html` : url.pathname.slice(1));
};
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const robots = await readFile(join(output, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap-index.xml`)) throw new Error('robots.txt has the wrong sitemap URL.');
const sitemapFiles = locations(await readFile(join(output, 'sitemap-index.xml'), 'utf8'));
if (!sitemapFiles.length) throw new Error('The sitemap index is empty.');
const sitemapUrls = (await Promise.all(sitemapFiles.map(async url => locations(await readFile(outputForUrl(url), 'utf8'))))).flat();
const expectedUrls = htmlRoutes.map(route => `${origin}/${route === 'lab/dwarkesh-jensen/index.html' ? route : route.replace(/index\.html$/, '')}`);
if (sitemapUrls.length !== new Set(sitemapUrls).size ||
    sitemapUrls.length !== expectedUrls.length || expectedUrls.some(url => !sitemapUrls.includes(url))) {
  throw new Error('Sitemap coverage differs from the published, indexable HTML routes.');
}
for (const url of sitemapUrls) {
  const html = await readFile(outputForUrl(url), 'utf8');
  if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) throw new Error(`Noindex page in sitemap: ${url}`);
  if (!html.includes(`rel="canonical" href="${url}"`)) throw new Error(`Sitemap URL differs from canonical: ${url}`);
}

const guide = await readFile(join(output, 'llms.txt'), 'utf8');
if (!guide.startsWith('# ') || Buffer.byteLength(guide) > 20_000) throw new Error('LLM guide is malformed or exceeds its concise-content budget.');
if (/reviewedEvidence|evidenceStatus|approval-enhanced|_media-source|localhost|127\.0\.0\.1/.test(guide)) {
  throw new Error('Internal metadata entered the LLM guide.');
}
const guideLinks = [...guide.matchAll(/^\- \[.*?\]\((https:\/\/[^)]+)\): .+$/gm)].map(match => match[1]);
if (!guideLinks.length || new Set(guideLinks).size !== guideLinks.length) throw new Error('LLM guide links are missing or duplicated.');
for (const url of guideLinks) {
  await access(outputForUrl(url));
  const parsed = new URL(url);
  if (parsed.pathname.endsWith('/') && !sitemapUrls.includes(`${origin}${parsed.pathname}`)) {
    throw new Error(`LLM guide links to a non-indexable page: ${url}`);
  }
}
const expectedGuidePages = [...visibleWorkSlugs.map(slug => `${origin}/work/${slug}/`), ...noteSlugs.map(slug => `${origin}/notes/${slug}/`), `${origin}/lab/dwarkesh-jensen/index.html`];
if (expectedGuidePages.some(url => !guideLinks.includes(url))) throw new Error('A published project or note is missing from the LLM guide.');
if (guide.includes('/work/blocks-inco-ai/') || /AgentSkills|operator.advisory|OP\/ADV/i.test(guide)) throw new Error('Archived or unsupported positioning entered the guide.');
const sitemapXml = (await Promise.all(sitemapFiles.map(async url => readFile(outputForUrl(url), 'utf8')))).join('\n');
for (const entry of notes.filter(entry => !entry.draft && entry.updatedAt)) {
  const block = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(match => match[1].includes(`${origin}/notes/${entry.slug}/`))?.[1];
  if (!block?.includes(`<lastmod>${new Date(entry.updatedAt).toISOString().slice(0, 10)}`)) throw new Error(`Missing content modification date: ${entry.slug}`);
}
for (const slug of notes.filter(entry => entry.draft).map(entry => entry.slug)) {
  if (guide.includes(`/notes/${slug}/`) || sitemapXml.includes(`/notes/${slug}/`) || await stat(join(output, 'notes', slug, 'index.html')).then(() => true, () => false)) throw new Error(`Draft entered production: ${slug}`);
}
const rss = await readFile(join(output, 'rss.xml'), 'utf8');
if ((rss.match(/<item>/g) ?? []).length !== noteSlugs.length) throw new Error('RSS published-note coverage differs.');
for (const slug of noteSlugs) if (!rss.includes(`${origin}/notes/${slug}/`)) throw new Error(`RSS missing ${slug}`);
console.log(`Verified discovery: ${sitemapUrls.length} indexable pages and ${guideLinks.length} LLM guide links.`);

if (builtFiles.some((path) => path.includes('_media-source'))) {
  throw new Error('A private media-source path entered the production build.');
}

for (const file of builtFiles.filter((path) => path.includes(`${join('media')}`))) {
  const bytes = (await stat(file)).size;
  if (bytes > 2_200_000) throw new Error(`${relative(output, file)} exceeds the 2.2 MB public media budget.`);
}

console.log(`Verified ${requiredFiles.length} production artifacts, ${workSlugs.length} work routes, ${workDomainSlugs.length} domain routes, and ${noteSlugs.length} note routes.`);

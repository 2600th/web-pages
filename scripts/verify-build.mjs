import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const project = join(root, '..');
const output = join(project, 'dist');

const slugs = async (collection) => (await readdir(join(project, 'src', 'content', collection)))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

const workSlugs = await slugs('work');
const noteSlugs = await slugs('notes');
const requiredFiles = [
  'index.html',
  '404.html',
  '.nojekyll',
  'CNAME',
  'robots.txt',
  'rss.xml',
  'sitemap-index.xml',
  'work/index.html',
  'notes/index.html',
  'about/index.html',
  'lab/index.html',
  'lab/terminal/index.html',
  'media/social/career-atlas.webp',
  ...workSlugs.map((slug) => `work/${slug}/index.html`),
  ...noteSlugs.map((slug) => `notes/${slug}/index.html`),
];

for (const file of requiredFiles) await access(join(output, file));

const cname = (await readFile(join(output, 'CNAME'), 'utf8')).trim();
if (cname !== 'www.2600th.com') throw new Error(`Unexpected CNAME: ${cname}`);

const htmlRoutes = requiredFiles.filter((file) => file.endsWith('index.html') && file !== 'lab/terminal/index.html');
for (const route of htmlRoutes) {
  const html = await readFile(join(output, route), 'utf8');
  if (!html.includes('<h1') || !html.includes('rel="canonical"')) {
    throw new Error(`${route} is missing its h1 or canonical metadata.`);
  }
}

const home = await readFile(join(output, 'index.html'), 'utf8');
if (!home.includes('Pranshul Chandhok') || !home.includes('career-atlas')) {
  throw new Error('The generated homepage does not contain the identity and Career Atlas.');
}

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
if (builtFiles.some((path) => path.includes('_media-source'))) {
  throw new Error('A private media-source path entered the production build.');
}

for (const file of builtFiles.filter((path) => path.includes(`${join('media', 'career')}`))) {
  const bytes = (await stat(file)).size;
  if (bytes > 2_200_000) throw new Error(`${relative(output, file)} exceeds the 2.2 MB public media budget.`);
}

console.log(`Verified ${requiredFiles.length} production artifacts, ${workSlugs.length} work routes, and ${noteSlugs.length} note routes.`);

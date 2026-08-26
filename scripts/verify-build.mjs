import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = new URL('../dist/', import.meta.url);
const requiredFiles = [
  'index.html',
  '404.html',
  '.nojekyll',
  'CNAME',
  'robots.txt',
  'rss.xml',
  'sitemap-index.xml',
  'lab/terminal/index.html',
];

for (const file of requiredFiles) {
  await access(new URL(file, output));
}

const cname = (await readFile(new URL('CNAME', output), 'utf8')).trim();
if (cname !== 'www.2600th.com') {
  throw new Error(`Unexpected CNAME: ${cname}`);
}

const home = await readFile(new URL('index.html', output), 'utf8');
if (!home.includes('<h1') || !home.includes('Pranshul Chandhok')) {
  throw new Error('The generated homepage does not contain the portfolio identity.');
}

const archive = await readFile(new URL(join('lab', 'terminal', 'index.html'), output), 'utf8');
if (!archive.includes('noindex,follow') || !archive.includes('Return to Pranshul Chandhok')) {
  throw new Error('The console archive is missing its indexing policy or return path.');
}

console.log(`Verified ${requiredFiles.length} production artifacts.`);

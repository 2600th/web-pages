import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(here, '../../public');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const assets = pathname.startsWith('/assets/');
    const root = assets ? publicRoot : here;
    const file = resolve(root, assets ? pathname.slice(8) : `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + sep) || (!assets && !['index.html', 'stage.html', 'layouts.html'].includes(file.slice(root.length + 1)))) {
      res.writeHead(404).end(); return;
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4324, '127.0.0.1', () => console.log('Hero design previews: http://127.0.0.1:4324/ (local only; excluded from site build)'));

// Packages dist/signal as a claude.ai Artifact: the page becomes the artifact
// root (the host supplies the document skeleton), and .glb models are renamed
// to a binary type the host serves. Usage: node scripts/package-artifact.mjs <outDir>
import { cp, readFile, writeFile, readdir, rename, rm, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');
const out = resolve(process.argv[2] ?? resolve(here, '../artifact'));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(resolve(dist, 'assets'), resolve(out, 'assets'), { recursive: true });

// Models: .glb → .glb.wasm (served as application/wasm; the loader reads raw bytes).
const assets = await readdir(resolve(out, 'assets'));
const models = assets.filter((f) => f.endsWith('.glb'));
for (const f of models) await rename(resolve(out, 'assets', f), resolve(out, 'assets', `${f}.wasm`));
for (const f of assets.filter((a) => a.endsWith('.js'))) {
  const file = resolve(out, 'assets', f);
  let js = await readFile(file, 'utf8');
  let changed = false;
  for (const m of models) if (js.includes(m)) { js = js.replaceAll(m, `${m}.wasm`); changed = true; }
  if (changed) await writeFile(file, js);
}

// Page: strip the skeleton, keep head content, rewrite ../assets → ./assets.
const html = await readFile(resolve(dist, 'signal/index.html'), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/\s*<meta charset="utf-8" \/>/, '')
  .replace(/\s*<meta name="viewport"[^>]*>/, '');
const title = head.match(/<title>[\s\S]*?<\/title>/)[0];
const body = html.match(/<body class="sg">([\s\S]*?)<\/body>/)[1];
const page = [
  title,
  '<style>:root{color-scheme:dark}html,body{background:#03040a;color:#eae8e1}</style>',
  '<script>document.documentElement.dataset.motion="on";document.body.classList.add("sg")</script>',
  head.replace(title, ''),
  body,
].join('\n').replaceAll('../assets/', './assets/');
await writeFile(resolve(out, 'index.html'), page);
console.log(`artifact packaged at ${out} (${models.length} models renamed)`);

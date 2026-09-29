// Checks the built prototypes: console errors, overflow, reduced motion, no-WebGL fallback, axe.
// Usage: npm run build && npx vite preview --port 4331 & node scripts/verify.mjs http://127.0.0.1:4331
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://127.0.0.1:4331';
const pages = ['index.html', 'signal/index.html', 'scan/index.html', 'glyph/index.html'];
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const executablePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const gl = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const results = [];
let failed = false;
const record = (page, check, ok, detail = '') => { results.push({ page, check, ok, detail }); if (!ok) failed = true; };

async function run(browser, path, { width, height, reducedMotion = 'no-preference', wait = 9000 }) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
  await page.goto(`${base}/${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(wait);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const state = await page.evaluate(() => ({ noWebgl: document.documentElement.classList.contains('no-webgl'), motion: document.documentElement.dataset.motion }));
  return { page, context, errors, overflow, state };
}

const browser = await chromium.launch({ executablePath, args: gl });
for (const path of pages) {
  for (const [label, width, height] of [['desktop', 1440, 900], ['phone', 390, 844], ['narrow', 320, 640]]) {
    const { page, context, errors, overflow } = await run(browser, path, { width, height, wait: label === 'desktop' ? 9000 : 6000 });
    record(path, `${label}: no console errors`, errors.length === 0, errors.join(' | '));
    record(path, `${label}: no horizontal overflow`, overflow <= 0, `${overflow}px`);
    if (label === 'desktop') {
      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] });
        return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
      });
      record(path, 'desktop: axe WCAG A/AA', axe.length === 0, axe.join(', '));
    }
    await context.close();
  }
  if (path !== 'index.html') {
    const { context, errors, state } = await run(browser, path, { width: 1440, height: 900, reducedMotion: 'reduce', wait: 8000 });
    record(path, 'reduced motion: motion off by default', state.motion === 'off', `data-motion=${state.motion}`);
    record(path, 'reduced motion: no errors', errors.length === 0, errors.join(' | '));
    await context.close();
  }
}
await browser.close();

const noGl = await chromium.launch({ executablePath, args: ['--disable-3d-apis', '--disable-webgl'] });
for (const path of pages.slice(1)) {
  const { context, state } = await run(noGl, path, { width: 1440, height: 900, wait: 3000 });
  record(path, 'no WebGL: poster fallback', state.noWebgl, `no-webgl=${state.noWebgl}`);
  await context.close();
}
await noGl.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.page.padEnd(18)} ${r.check}${r.ok || !r.detail ? '' : `  → ${r.detail}`}`);
console.log(failed ? '\nSome checks failed.' : '\nAll checks passed.');
process.exit(failed ? 1 : 0);

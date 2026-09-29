// Share cards in the Signal design: the void ground and grid, the 2600th mark, a monitor
// bezel with real public media or a plain diagram, and the section's waveform strip.
// Chromium renders each card with the site's own fonts; Sharp encodes it as WebP.
// These are share artwork, never substitute product evidence.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = new URL('../public/media/social/', import.meta.url);
await mkdir(output, { recursive: true });
const asset = (path) => fileURLToPath(new URL(`../public/${path}`, import.meta.url));
const dataUri = async (path, type) => `data:${type};base64,${(await readFile(asset(path))).toString('base64')}`;

const cards = [
  // The default card for pages without their own image.
  { slug: '2600th', eyebrow: ['ID', 'Operator file'], title: 'Make the uncertain <em>operable.</em>', lede: 'Product and technology across AI, real-time 3D and design software.', image: 'media/signal/portrait.webp', position: '50% 18%', wave: 'sine' },
  { slug: 'ocean-reliability', eyebrow: ['05', 'Technical teardown'], title: 'Web Ocean 3D: what broke when other people ran it', image: 'media/work/web-ocean-3d/hero.webp' },
  { slug: 'ai-floorplan-parsing', eyebrow: ['05', 'Technical teardown'], title: 'AI floorplan parsing: the hard part isn’t the model', cue: 'floorplan' },
  { slug: 'ai-video-control', eyebrow: ['05', 'Technical teardown'], title: 'AI video got good. Directing a sequence is still hard.', cue: 'sequence' },
  { slug: 'generative-and-deterministic-systems', eyebrow: ['05', 'Essay'], title: 'Generative systems, deterministic systems: where is the boundary?', image: 'media/work/blocks-inco-ai/designesto-before-after.webp', position: '50% 55%' },
  { slug: 'ai-native-game-development-reflection', eyebrow: ['05', 'Field note'], title: 'Revisiting my 2023 essay on AI and games', image: 'media/work/kinema/editor.webp' },
  { slug: 'ai-native-game-development-three-years-later', eyebrow: ['05', 'Essay'], title: 'AI-native game development, three years later', image: 'media/work/kinema/inside.webp' },
  { slug: 'browser-flight-experiment', eyebrow: ['05', 'Field note'], title: 'From a documentary to a browser flight experiment', image: 'media/work/safed-sagar/hero.webp' },
  { slug: 'from-pixels-to-intelligent-systems', eyebrow: ['05', 'Field note'], title: 'Why I still build things myself', image: 'media/work/homelane-spacecraft-pro/hero.webp' },
  { slug: 'technology-and-human-agency', eyebrow: ['05', 'Field note'], title: 'Making tools easier to steer', image: 'media/work/blocks-inco-ai/designesto-after.webp' },
  { slug: 'propvr-ai-craft', eyebrow: ['02', 'Case file'], title: 'PropVR AI to Craft: the foundation, and the team’s next act', image: 'media/work/propvr-ai-craft/craft-public-home-20260902.webp', position: '50% 0%', wave: 'square' },
];

const cue = (kind) => kind === 'floorplan'
  ? '<svg viewBox="0 0 400 300"><g fill="none" stroke="#4d74ff" stroke-width="3"><path d="M40 40H360V250H40ZM40 130H360M185 40V130M205 130V250"/><path d="M58 58H168V116H58ZM58 148H186V232H58Z" stroke="#e8b45a"/></g><path d="M40 276H360M40 268V284M360 268V284" stroke="#858a99" stroke-width="2"/></svg>'
  : `<svg viewBox="0 0 400 300">${Array.from({ length: 6 }, (_, i) => `<rect x="${36 + (i % 2) * 172}" y="${30 + Math.floor(i / 2) * 88}" width="156" height="70" fill="none" stroke="${i === 3 ? '#e8b45a' : '#4d74ff'}" stroke-width="2"/><path d="M${52 + (i % 2) * 172} ${80 + Math.floor(i / 2) * 88}h${28 + i * 17}" stroke="#eae8e1" stroke-width="3"/>`).join('')}</svg>`;

// The same trace shapes as the site's openings, drawn once per card.
const trace = (wave = 'sine') => {
  const points = [];
  for (let x = 0; x <= 1200; x += 4) {
    const t = x / 60;
    const y = wave === 'square' ? Math.sign(Math.sin(t * Math.PI)) * 0.8 : Math.sin(t * Math.PI);
    points.push(`${x ? 'L' : 'M'}${x} ${(20 - y * 14).toFixed(1)}`);
  }
  return `<svg class="wave" viewBox="0 0 1200 40" preserveAspectRatio="none"><path d="${points.join('')}"/></svg>`;
};

const fonts = {
  mona: await dataUri('fonts/mona-sans-latin.woff2', 'font/woff2'),
  doto: await dataUri('fonts/doto.woff2', 'font/woff2'),
  mono: await dataUri('fonts/jetbrains-mono.woff2', 'font/woff2'),
};
const style = `
@font-face { font-family: 'Mona Sans'; src: url(${fonts.mona}) format('woff2'); font-weight: 200 900; font-stretch: 75% 125%; }
@font-face { font-family: 'Doto'; src: url(${fonts.doto}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'JetBrains Mono'; src: url(${fonts.mono}) format('woff2'); font-weight: 100 800; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #03040a; color: #eae8e1; font-family: 'Mona Sans', sans-serif; }
.card { position: relative; width: 1200px; height: 630px; padding: 48px 64px 0; display: grid; grid-template-columns: 620px 1fr; grid-template-rows: auto 1fr auto; column-gap: 56px; }
.card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 45% 60% at 88% 18%, rgb(36 71 216 / 0.28), transparent 70%), linear-gradient(rgb(234 232 225 / 0.045) 1px, transparent 1px) 0 0 / 56px 56px, linear-gradient(90deg, rgb(234 232 225 / 0.045) 1px, transparent 1px) 0 0 / 56px 56px; }
.card > * { position: relative; }
.mark { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; font: 500 17px/1 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #a4a7b3; }
.mark b { display: inline-flex; align-items: center; gap: 12px; font: 900 30px/1 'Doto', monospace; color: #eae8e1; letter-spacing: 0.02em; text-transform: none; }
.mark b sup { font: 600 13px/1 'JetBrains Mono', monospace; color: #4d74ff; align-self: flex-start; margin: 2px 0 0 -8px; }
.mark svg { width: 40px; height: 22px; overflow: visible; }
.mark svg path { fill: none; stroke: #4d74ff; stroke-width: 2.5; stroke-linecap: round; }
.copy { display: flex; flex-direction: column; justify-content: center; gap: 22px; padding-bottom: 12px; }
.eyebrow { display: flex; align-items: center; gap: 14px; font: 500 17px/1 'JetBrains Mono', monospace; letter-spacing: 0.14em; text-transform: uppercase; color: #a4a7b3; }
.eyebrow span { font: 900 22px/1 'Doto', monospace; color: #4d74ff; letter-spacing: 0.04em; }
h1 { font-weight: 780; font-stretch: 110%; font-size: 58px; line-height: 1.02; letter-spacing: -0.035em; text-wrap: balance; }
h1 em { font-style: normal; font-family: 'Doto', monospace; font-weight: 800; font-stretch: normal; font-size: 0.92em; letter-spacing: -0.01em; color: #4d74ff; text-shadow: 0 0 24px rgb(77 116 255 / 0.55); }
.lede { max-width: 540px; font-size: 24px; line-height: 1.4; color: #a4a7b3; }
.monitor { align-self: center; height: 390px; padding: 12px; background: linear-gradient(160deg, #141a31, #080b16); border: 1px solid rgb(234 232 225 / 0.22); box-shadow: 0 40px 80px -40px #000; }
.monitor > * { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 4px / 7px; background: #000; }
.monitor svg { background: #0a0d18; padding: 18px; }
.foot { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 28px; height: 92px; }
.wave { width: 100%; height: 40px; border-block: 1px solid rgb(234 232 225 / 0.1); }
.wave path { fill: none; stroke: #4d74ff; stroke-width: 2; }
.url { font: 500 18px/1 'JetBrains Mono', monospace; letter-spacing: 0.1em; color: #7cf0b0; }
`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const card of cards) {
    const media = card.image
      ? `<img src="${await dataUri(card.image, 'image/webp')}" style="object-position:${card.position ?? '50% 50%'}" alt="">`
      : cue(card.cue);
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body><div class="card">
      <p class="mark"><b><svg viewBox="0 0 28 16"><path d="M1 8c2.5-6 4.5-6 6.5 0s4 6 6.5 0 4-6 6.5 0 4 6 6.5 0"/></svg>2600<sup>th</sup></b>Pranshul Chandhok</p>
      <div class="copy"><p class="eyebrow"><span>${card.eyebrow[0]}</span>${card.eyebrow[1]}</p><h1>${card.title}</h1>${card.lede ? `<p class="lede">${card.lede}</p>` : ''}</div>
      <div class="monitor">${media}</div>
      <div class="foot">${trace(card.wave ?? 'sine')}<p class="url">2600th.com</p></div>
    </div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const missing = await page.evaluate(() => [...document.fonts].filter((font) => font.status !== 'loaded').map((font) => font.family));
    if (missing.length) throw new Error(`Social card fonts did not load: ${missing.join(', ')}`);
    const overflow = await page.evaluate(() => document.querySelector('h1').getBoundingClientRect().bottom > document.querySelector('.foot').getBoundingClientRect().top);
    if (overflow) throw new Error(`Social title overruns its card: ${card.slug}`);
    const png = await page.screenshot({ type: 'png' });
    await sharp(png).webp({ quality: 88, smartSubsample: true }).toFile(fileURLToPath(new URL(`${card.slug}.webp`, output)));
    console.log(`Generated public/media/social/${card.slug}.webp`);
  }
} finally {
  await browser.close();
}

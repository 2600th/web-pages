import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = new URL('../public/media/social/', import.meta.url);
await mkdir(output, { recursive: true });

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3f2ee"/>
  <path d="M0 72H1200M0 558H1200" stroke="#b8b7b0"/>
  <ellipse cx="1030" cy="302" rx="310" ry="92" fill="none" stroke="#1547ff" stroke-width="2"/>
  <circle cx="978" cy="302" r="11" fill="#1547ff"/>
  <text x="72" y="120" fill="#1547ff" font-family="Arial, sans-serif" font-size="22" font-weight="700">PRANSHUL CHANDHOK / 2600TH</text>
  <text x="72" y="275" fill="#090909" font-family="Arial, sans-serif" font-size="104" font-weight="800" letter-spacing="-5">CAREER</text>
  <text x="72" y="372" fill="#090909" font-family="Arial, sans-serif" font-size="104" font-weight="800" letter-spacing="-5">ATLAS</text>
  <text x="74" y="470" fill="#5c5c57" font-family="Arial, sans-serif" font-size="28">Games → XR → Robotics → Design technology → Production AI</text>
  <text x="74" y="535" fill="#090909" font-family="Arial, sans-serif" font-size="20" font-weight="700">2012 — NOW</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 88, smartSubsample: true }).toFile(fileURLToPath(new URL('career-atlas.webp', output)));
console.log('Generated public/media/social/career-atlas.webp');

// Editorial cards use the site's own font, real public project media or explicit
// geometric diagrams. These are share artwork, never substitute product evidence.
const fontfile = fileURLToPath(new URL('../public/fonts/mona-sans-variable.woff2', import.meta.url));
const cards = [
  { slug: 'ocean-reliability', lines: ['Web Ocean 3D', 'What broke when', 'other people ran it'], type: 'TECHNICAL TEARDOWN', image: 'work/web-ocean-3d/hero.webp' },
  { slug: 'ai-floorplan-parsing', lines: ['AI floorplan parsing', 'The hard part isn’t', 'the model'], type: 'TECHNICAL TEARDOWN', cue: 'floorplan' },
  { slug: 'ai-video-control', lines: ['AI video got good.', 'Directing a sequence', 'is still hard.'], type: 'TECHNICAL TEARDOWN', cue: 'sequence' },
  { slug: 'generative-and-deterministic-systems', lines: ['Generative systems.', 'Deterministic systems.', 'Where is the boundary?'], type: 'ESSAY', image: 'work/blocks-inco-ai/designesto-before-after.webp', crop: { left: 52, top: 186, width: 1496, height: 633 } },
  { slug: 'ai-native-game-development-reflection', lines: ['Revisiting my', '2023 essay on', 'AI and games'], type: 'FIELD NOTE', image: 'work/kinema/editor.webp' },
  { slug: 'browser-flight-experiment', lines: ['From a documentary', 'to a browser', 'flight experiment'], type: 'FIELD NOTE', image: 'work/safed-sagar/hero.webp' },
  { slug: 'from-pixels-to-intelligent-systems', lines: ['Why I still', 'build things', 'myself'], type: 'FIELD NOTE', image: 'work/homelane-spacecraft-pro/hero.webp' },
  { slug: 'technology-and-human-agency', lines: ['Making tools', 'easier to steer'], type: 'FIELD NOTE', image: 'work/blocks-inco-ai/designesto-after.webp' },
  { slug: 'propvr-ai-craft', lines: ['PropVR AI → Craft', 'The foundation.', 'The team’s next act.'], type: 'PROJECT STORY', image: 'work/propvr-ai-craft/craft-public-home-20260902.webp' },
];
// Sharp's Windows font backend can silently fall back when given WOFF2.
// Chromium rasterizes the bundled web font, then Sharp composites the card.
const browser = await chromium.launch({ headless: true });
const fontPage = await browser.newPage({ viewport: { width: 1200, height: 200 } });
const fontData = (await readFile(fontfile)).toString('base64');
await fontPage.setContent(`<style>@font-face{font-family:"Mona Sans";src:url(data:font/woff2;base64,${fontData}) format("woff2");font-weight:100 900}body{margin:0;background:transparent}#text{display:inline-block;white-space:pre;font-family:"Mona Sans";font-weight:650;line-height:1.1}</style><span id="text">Font readiness</span>`);
await fontPage.evaluate(() => document.fonts.ready);
const loaded = await fontPage.evaluate(() => [...document.fonts].every((font) => font.status === 'loaded'));
if (!loaded) throw new Error('The bundled Mona Sans font did not load for social cards.');
const textLayer = async (text, size, colour) => {
  await fontPage.locator('#text').evaluate((element, options) => {
    element.textContent = options.text;
    element.style.fontSize = `${options.size}px`;
    element.style.color = options.colour;
  }, { text, size, colour });
  return fontPage.locator('#text').screenshot({ omitBackground: true });
};
try {
for (const card of cards) {
  const cue = card.cue === 'floorplan'
    ? '<g fill="none" stroke="#6f8dff" stroke-width="3"><path d="M790 170H1100V435H790ZM790 285H1100M930 170V285M950 285V435"/><path d="M805 192H911V266H805ZM809 310H930V413H809Z" stroke="#d6a248"/></g><path d="M808 470H1082M808 460V480M1082 460V480" stroke="#a8a7a1" stroke-width="2"/>'
    : card.cue === 'sequence'
      ? Array.from({ length: 6 }, (_, index) => `<rect x="${772 + (index % 2) * 180}" y="${158 + Math.floor(index / 2) * 120}" width="154" height="90" fill="none" stroke="${index === 3 ? '#d6a248' : '#6f8dff'}" stroke-width="2"/><path d="M${789 + (index % 2) * 180} ${220 + Math.floor(index / 2) * 120}h${28 + index * 17}" stroke="#edeae2" stroke-width="3"/>`).join('')
      : '';
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#030405"/><rect x="736" y="110" width="416" height="406" fill="#111419"/>${cue}<path d="M56 110H688M56 516H688" stroke="#edeae2" stroke-opacity="0.24"/><path d="M56 551H94" stroke="#d6a248" stroke-width="3"/></svg>`);
  const composites = [];
  if (card.image) {
    const source = sharp(fileURLToPath(new URL(`../public/media/${card.image}`, import.meta.url)));
    if (card.crop) source.extract(card.crop);
    const media = await source.resize(416, 406, { fit: 'cover', position: 'centre' }).webp({ quality: 88 }).toBuffer();
    composites.push({ input: media, left: 736, top: 110 });
  }
  composites.push({ input: await textLayer('PRANSHUL CHANDHOK / 2600TH', 21, '#a8a7a1'), left: 56, top: 53 });
  for (const [index, line] of card.lines.entries()) {
    const layer = await textLayer(line, 48, '#edeae2');
    const { width } = await sharp(layer).metadata();
    if (width > 632) throw new Error(`Social title exceeds its reading plane: ${card.slug}: ${line}`);
    composites.push({ input: layer, left: 56, top: 202 + index * 65 });
  }
  composites.push({ input: await textLayer(card.type, 19, '#a8a7a1'), left: 112, top: 539 });
  composites.push({ input: await textLayer('2600th.com', 20, '#edeae2'), left: 1033, top: 551 });
  await sharp(background).composite(composites).webp({ quality: 90, smartSubsample: true })
    .toFile(fileURLToPath(new URL(`${card.slug}.webp`, output)));
  console.log(`Generated public/media/social/${card.slug}.webp`);
}
} finally {
  await browser.close();
}

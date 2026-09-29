// Headless review captures: node scripts/shoot.mjs <url> <out.png> [width] [height] [waitMs] [evalJs]
import { chromium } from 'playwright-core';

const [url, out, width = '1440', height = '900', wait = '4000', evaluate] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(Number(wait));
if (process.env.MOUSE) {
  const [mx, my] = process.env.MOUSE.split(',').map(Number);
  await page.mouse.move(mx - 40, my - 40);
  await page.mouse.move(mx, my, { steps: 8 });
  await page.waitForTimeout(Number(process.env.AFTER || 2500));
}
if (evaluate) { await page.evaluate(evaluate); await page.waitForTimeout(Number(process.env.AFTER || 1500)); }
await page.screenshot({ path: out });
if (logs.length) console.log(logs.slice(0, 30).join('\n'));
await browser.close();

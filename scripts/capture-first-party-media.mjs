import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const [url, outputDirectory = '_media-source/browser-captures', actionLabel = ''] = process.argv.slice(2);

if (!url) {
  throw new Error('Usage: node scripts/capture-first-party-media.mjs <url> [output-directory] [button-label]');
}

const destination = resolve(outputDirectory);
await mkdir(destination, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: destination, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
if (actionLabel) {
  const action = page.getByRole('button', { name: actionLabel });
  await action.waitFor({ state: 'visible', timeout: 30_000 });
  await action.click();
}
await page.waitForTimeout(18_000);

const video = page.video();
await page.close();
await context.close();
await browser.close();

console.log(await video.path());

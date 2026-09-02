import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const output = 'public/media/work/propvr-ai-craft';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto('https://craft.propvr.ai/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const capture = await page.screenshot({ animations: 'disabled' });
  await sharp(capture).webp({ quality: 86 }).withMetadata({
    exif: { IFD0: { ImageDescription: 'Public Craft homepage, https://craft.propvr.ai/, accessed 2026-09-02. Screenshot for editorial case-study commentary. Current platform by PropVR Technology team.' } },
  }).toFile(`${output}/craft-public-home-20260902.webp`);
  console.log({ url: page.url(), title: await page.title(), width: 1600, height: 1000 });
} finally {
  await browser.close();
}

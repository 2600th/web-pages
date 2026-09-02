import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = '.superpowers/sdd/2026-09-02-editorial-site-update/task-1-screenshots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    for (const slug of ['blocks', 'designesto', 'propvr-ai-craft', 'blocks-inco-ai']) {
      const response = await page.goto(`http://127.0.0.1:4322/work/${slug}/`);
      expect(response.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('main h1')).toHaveCount(1);
      await page.locator('astro-dev-toolbar').evaluateAll((elements) => elements.forEach((element) => element.remove()));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.2600th.com/work/${slug}/`);
      if (slug === 'blocks-inco-ai') {
        await expect(page.locator('main a[href="/work/blocks/"]')).toHaveCount(1);
        await expect(page.locator('main a[href="/work/designesto/"]')).toHaveCount(1);
      } else {
        await expect(page.locator('main figure')).toHaveCount(1);
        expect(await page.locator('main img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
      }
      if (slug === 'propvr-ai-craft') {
        await expect(page.getByRole('list', { name: 'Product evolution' }).locator('li')).toHaveCount(4);
        await expect(page.getByText('Initial PropVR AI MVP: Pranshul Chandhok. Current Craft platform: PropVR Technology team.', { exact: true })).toBeVisible();
      }
      await page.screenshot({ path: `${output}/${slug}-${device}.png`, fullPage: true, animations: 'disabled' });
      console.log(`${device}: ${slug}, route, canonical, content and overflow checks passed`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

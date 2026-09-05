import { test, expect } from '@playwright/test';

test('image-led archive cards expose full-width modern image candidates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/');
  const card = page.locator('[data-work-item]').filter({ has: page.locator('a[href="/work/designesto/"]') });
  const img = card.locator('img');
  await expect(img).toHaveAttribute('srcset', /320w/);
  await expect(img).toHaveAttribute('sizes', /calc\(100vw - 2\.5rem\)/);
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/-(320|640)\.avif$/);
});

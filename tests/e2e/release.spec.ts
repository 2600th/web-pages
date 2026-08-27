import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('the eclipse remains singular and available on every page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-theme-control]')).toHaveCount(1);
  await expect(page.locator('.site-header [data-theme-control]')).toBeVisible();

  await page.goto('/work/');
  await expect(page.locator('.site-header [data-theme-control]')).toBeVisible();
  await expect(page.locator('[data-theme-control]')).toHaveCount(1);
});

test('dark theme remains accessible and mobile primary controls meet the touch target floor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('2600th-theme', 'dark'));
  await page.goto('/work/');
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2aa'] },
    });
    return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  });
  expect(violations).toEqual([]);

  for (const target of await page.locator('.site-nav a, [data-theme-control]').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('the interior header remains usable at the 320px support floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/work/');

  await expect(page.locator('.site-signature__compact')).toBeVisible();
  await expect(page.locator('.site-nav a')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a, .site-nav [data-theme-control]').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('primary CTA text stays visible in both color themes after hover', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('2600th-theme', selectedTheme);
    }, theme);
    await page.goto('/about/');

    const cta = page.locator('.button-link--primary').first();
    await expect(cta).toBeVisible();
    await expect.poll(() => cta.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
    await cta.hover();
    await expect.poll(() => cta.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
  }
});

test('desktop header focus order follows the visual order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/');

  const signature = page.locator('.site-signature');
  const theme = page.locator('[data-theme-control]');
  const work = page.getByRole('link', { name: 'Work', exact: true });
  const themeBox = await theme.boundingBox();
  const workBox = await work.boundingBox();

  expect(themeBox?.x ?? Number.POSITIVE_INFINITY).toBeLessThan(workBox?.x ?? 0);
  await signature.focus();
  await page.keyboard.press('Tab');
  await expect(theme).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(work).toBeFocused();
});

test('mobile header focus order follows the visual order', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const signature = page.locator('.site-signature');
  const theme = page.locator('[data-theme-control]');
  const work = page.getByRole('link', { name: 'Work', exact: true });
  const themeBox = await theme.boundingBox();
  const workBox = await work.boundingBox();

  expect(themeBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(workBox?.y ?? 0);
  await signature.focus();
  await page.keyboard.press('Tab');
  await expect(theme).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(work).toBeFocused();
});

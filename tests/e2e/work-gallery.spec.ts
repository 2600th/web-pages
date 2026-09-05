import { expect, test } from '@playwright/test';

const visibleProjectPaths = [
  '/work/blocks/', '/work/designesto/', '/work/ira-vr/', '/work/propvr-ai-craft/', '/work/homelane-spacecraft-pro/',
  '/work/greykernel/', '/work/enterprise-immersive-systems/', '/work/humanoid-robot-control-system/',
  '/work/web-ocean-3d/', '/work/kinema/', '/work/safed-sagar/', '/work/little-wonder/',
  '/work/ai-native-game-thesis/', '/work/the-brutal-spy/', '/work/alphaman/', '/work/merkur-magie/',
  '/work/machine-hunter/', '/work/mysticmojo/', '/work/defense-simulation-systems/',
];

test('Work presents the approved featured hierarchy without duplicating archive records', async ({ page }) => {
  await page.goto('/work/');

  const gallery = page.locator('[data-work-gallery]');
  const items = gallery.locator('[data-work-item]');
  await expect(items).toHaveCount(19);
  expect(await items.locator('> a').evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).pathname))).toEqual(visibleProjectPaths);
  await expect(gallery.locator('[data-gallery-role="lead"] > a')).toHaveAttribute('href', '/work/blocks/');
  expect(await gallery.locator('[data-gallery-role="support"] > a').evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).pathname))).toEqual([
    '/work/designesto/', '/work/ira-vr/',
  ]);
});

test('compact desktop controls bring the first project into the opening viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/');
  const firstImage = await page.locator('[data-work-item]').first().locator('.work-gallery__image').boundingBox();
  expect(firstImage?.y).toBeLessThanOrEqual(450);
});

test('filtering and chronological ordering use the uniform gallery while preserving behavior', async ({ page }) => {
  await page.goto('/work/');
  const gallery = page.locator('[data-work-gallery]');
  await expect(gallery).not.toHaveAttribute('data-gallery-layout', 'uniform');

  await page.goto('/work/?domain=xr');
  await expect(gallery).toHaveAttribute('data-gallery-layout', 'uniform');
  await expect(gallery.locator('[data-work-item]:visible')).toHaveCount(6);
  await expect(page.locator('[data-work-status]')).toContainText('6 projects');

  await page.goto('/work/?order=chronological');
  await expect(gallery).toHaveAttribute('data-gallery-layout', 'uniform');
  await expect(gallery.locator('[data-work-item]:visible > a').first()).toHaveAttribute('href', '/work/the-brutal-spy/');
});

test('Work remains a complete native-link gallery without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/work/');
  const hrefs = await page.locator('[data-work-gallery] [data-work-item] > a').evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).pathname));
  expect(hrefs).toEqual(visibleProjectPaths);
  await expect(page.locator('a[href="/work/domain/design-tech/"]').first()).toBeAttached();
  await context.close();
});

test('Work gallery is one contained image-led column on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/');
  const visible = page.locator('[data-work-gallery] [data-work-item]:visible');
  const geometry = await visible.evaluateAll(items => items.map(item => {
    const box = item.getBoundingClientRect();
    const image = item.querySelector('img')?.getBoundingClientRect();
    return { left: box.left, right: box.right, width: box.width, imageWidth: image?.width ?? 0 };
  }));
  expect(new Set(geometry.map(item => Math.round(item.left))).size).toBe(1);
  expect(geometry.every(item => item.left >= 0 && item.right <= 391 && item.imageWidth > item.width * 0.9)).toBe(true);
  await expect(page.getByLabel('Choose a work domain')).toBeVisible();
});

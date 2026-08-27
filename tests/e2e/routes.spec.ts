import { expect, test } from '@playwright/test';

test('every console archive link uses an explicit file URL and serves the archive', async ({ page, request }) => {
  for (const path of ['/', '/lab/']) {
    await page.goto(path);
    const archiveLinks = page.locator('a[href*="/lab/terminal/"]');
    await expect(archiveLinks).toHaveCount(path === '/' ? 1 : 2);
    for (const archiveLink of await archiveLinks.all()) {
      await expect(archiveLink).toHaveAttribute('href', '/lab/terminal/index.html');
    }
  }

  const response = await request.get('/lab/terminal/index.html');
  expect(response.status()).toBe(200);
});

test('the archive return action stays in mobile flow instead of covering the console', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/terminal/index.html');

  const returnAction = page.locator('.archive-return');
  await expect(returnAction).toBeVisible();
  await expect.poll(() => returnAction.evaluate((element) => getComputedStyle(element).position)).not.toBe('fixed');

  const actionBox = await returnAction.boundingBox();
  const firstPanel = await page.locator('.terminal-screen').boundingBox();
  expect(actionBox).not.toBeNull();
  expect(firstPanel).not.toBeNull();
  const actionBottom = (actionBox?.y ?? 0) + (actionBox?.height ?? Number.POSITIVE_INFINITY);
  expect(actionBottom).toBeLessThanOrEqual((firstPanel?.y ?? 0) + 80);
});

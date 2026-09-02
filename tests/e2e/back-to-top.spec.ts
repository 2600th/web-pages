import { expect, test } from '@playwright/test';

for (const route of ['/', '/work/', '/work/domain/xr/', '/about/', '/notes/', '/notes/ai-video-control/', '/work/alphaman/', '/lab/', '/404']) {
  test(`floating arrow returns to the top of ${route} without leaving the page`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
    await expect(topLink).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 301));
    await expect(topLink).toBeInViewport();
    const pathname = new URL(page.url()).pathname;
    await topLink.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(topLink).toBeHidden();
    expect(new URL(page.url()).pathname).toBe(pathname);
  });
}

test('keyboard return restores navigation focus without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/work/`);
    const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(topLink).toBeInViewport();
    await topLink.focus();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    expect(await topLink.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole('banner')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pranshul Chandhok, home' })).toBeFocused();
  } finally {
    await context.close();
  }
});

test('normal return scrolls smoothly and reduced motion returns instantly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await expect(topLink).toBeInViewport();
  await topLink.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('arrow appears only past 300px and restores its state after refresh', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect(topLink).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 301));
  await expect(topLink).toBeInViewport();
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(301);
  await expect(topLink).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 250));
  await expect(topLink).toBeHidden();
});

test('visible floating arrow restores keyboard focus and is excluded from print', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
  await page.evaluate(() => window.scrollTo(0, 500));
  await topLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('banner')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pranshul Chandhok, home' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(topLink).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(topLink).toBeHidden();
});

for (const width of [320, 878, 1440]) {
  test(`arrow stays in the viewport and clears footer content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 912 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const topLink = page.getByRole('link', { name: 'Back to top', exact: true });
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(topLink).toBeInViewport();
    const arrow = await topLink.boundingBox();
    expect(arrow).not.toBeNull();
    expect(arrow!.width).toBeGreaterThanOrEqual(48);
    expect(arrow!.height).toBeGreaterThanOrEqual(48);
    expect(arrow!.x).toBeGreaterThan(width / 2);
    expect(width - arrow!.x - arrow!.width).toBeGreaterThanOrEqual(16);
    expect(912 - arrow!.y - arrow!.height).toBeGreaterThanOrEqual(16);
    expect(912 - arrow!.y - arrow!.height).toBeLessThanOrEqual(24);
    expect((await page.locator('.site-footer').boundingBox())!.y).toBeGreaterThan(912);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(async () => (await topLink.boundingBox())?.y).toBeCloseTo(arrow!.y, 0);
    const contact = await page.locator('.site-footer__contact').boundingBox();
    expect(contact!.y + contact!.height).toBeLessThan(arrow!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

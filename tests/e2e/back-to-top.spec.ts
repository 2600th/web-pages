import { expect, test } from '@playwright/test';

for (const route of ['/', '/work/', '/work/domain/xr/', '/about/', '/notes/', '/notes/ai-video-control/', '/work/alphaman/', '/lab/', '/404']) {
  test(`the line key returns to the top of ${route} without leaving the page`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
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
    const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(topLink).toBeInViewport();
    await topLink.focus();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    expect(await topLink.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    // The return lands on the document start, so the next Tab reaches the skip link, then the header.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
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
  const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await expect(topLink).toBeInViewport();
  await topLink.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('the line key appears only past 300px and restores its state after refresh', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect(topLink).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 301));
  await expect(topLink).toBeInViewport();
  // Chrome restores scroll against an anchor element, so reload from clear of the threshold.
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await expect(topLink).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 250));
  await expect(topLink).toBeHidden();
});

test('the visible line key restores keyboard focus and is excluded from print', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
  await page.evaluate(() => window.scrollTo(0, 500));
  await topLink.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(topLink).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(topLink).toBeHidden();
});

for (const width of [320, 878, 1440]) {
  test(`the line key stays in the viewport and clears footer content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 912 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about/');
    const topLink = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
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
    expect((await page.locator('.sg-foot').boundingBox())!.y).toBeGreaterThan(912);
    // Scroll to the true bottom (late layout can grow the page after the first jump).
    await expect.poll(() => page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
    })).toBe(true);
    await expect.poll(async () => (await topLink.boundingBox())?.y).toBeCloseTo(arrow!.y, 0);
    // No control in the footer's bottom bar sits under the key.
    const controls = page.locator('.sg-foot__bar a:visible, .sg-foot__bar button:visible');
    expect(await controls.count()).toBeGreaterThan(4);
    for (const box of await controls.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()))) {
      expect(box.bottom <= arrow!.y || box.right <= arrow!.x, JSON.stringify(box)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('the line key hangs up from far down the page, and is a plain return near the top or without motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const key = page.getByRole('link', { name: 'Hang up, back to top', exact: true });
  const scrolled = () => page.evaluate(() => window.scrollY);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about/');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(key).toBeInViewport();
  await key.click();
  const fx = page.locator('.sg-hang');
  await expect(fx).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => fx.evaluate(element => getComputedStyle(element).visibility)).toBe('visible');
  await expect.poll(scrolled).toBe(0);
  await expect.poll(() => fx.evaluate(element => getComputedStyle(element).visibility)).toBe('hidden');
  await expect(fx).toHaveCSS('pointer-events', 'none');
  expect(new URL(page.url()).pathname).toBe('/about/');

  // Less than two screens down it just returns.
  await page.goto('/work/');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await key.click();
  await expect.poll(scrolled).toBe(0);
  await expect(page.locator('.sg-hang')).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await key.click();
  await expect.poll(scrolled).toBe(0);
  await expect(page.locator('.sg-hang')).toHaveCount(0);
  expect(errors).toEqual([]);
});

import { test, expect } from '@playwright/test';

const route = '/lab/dwarkesh-jensen/index.html';

test('Lab preserves its existing builds and opens the attributed companion', async ({ page, request }) => {
  await page.goto('/lab/');
  for (const href of ['/work/kinema/', '/work/web-ocean-3d/', '/work/safed-sagar/', '/lab/terminal/index.html', route]) {
    const link = page.locator(`[data-build-ledger] a[href="${href}"]`);
    await expect(link).toHaveCount(1);
    expect((await request.get(href)).status()).toBe(200);
  }
  await expect(page.locator('[data-build-ledger] a[href="https://github.com/2600th"]')).toHaveCount(1);
  await page.locator(`[data-build-ledger] a[href="${route}"]`).click();
  await expect(page.getByRole('link', { name: 'Return to Lab' })).toHaveAttribute('href', '/lab/');
  await expect(page.getByRole('link', { name: 'Dwarkesh Patel’s interview with Jensen Huang' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Hrbq66XqtCo');
  await expect(page.locator('.companion-notice')).toContainText('Unofficial companion');
  await expect(page.locator('.companion-notice')).toContainText('Not endorsed');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.2600th.com/lab/dwarkesh-jensen/index.html');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://www.2600th.com/lab/dwarkesh-jensen/index.html');
});

test('the companion uses the reviewed punctuation in its document and no-JavaScript titles', async ({ page, request }) => {
  await page.goto(route);
  await expect(page).toHaveTitle('Dwarkesh × Jensen: Unofficial Companion | 2600th Lab');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Dwarkesh × Jensen: Unofficial Companion');
  expect(await (await request.get(route)).text()).toContain('<h1>Dwarkesh × Jensen: Unofficial Companion</h1>');
});

for (const width of [320, 768, 1440]) {
  test(`deck keyboard, modal isolation, rendered map and containment at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const externalRequests: string[] = [];
    const allowedOrigin = new URL(baseURL!).origin;
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (new URL(request.url()).origin !== allowedOrigin) externalRequests.push(request.url()); });
    await page.goto(route);
    await expect(page.locator('.slide.term')).toHaveCount(92);
    await expect(page.locator('.slide.divider')).toHaveCount(8);
    await expect(page.locator('.subvis svg')).toHaveCount(20);
    await expect(page.locator('#total')).toHaveText('103');
    const titleStart = await page.locator('.slide.title .slide-inner').evaluate(element => ({
      container: element.getBoundingClientRect().top,
      first: element.firstElementChild!.getBoundingClientRect().top,
    }));
    expect(titleStart.first).toBeGreaterThanOrEqual(titleStart.container);
    const timestamps = await page.locator('.yt-chip').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), rel: link.getAttribute('rel') })));
    expect(timestamps).toHaveLength(92);
    for (const link of timestamps) { expect(link.href).toMatch(/^https:\/\/youtu.be\/Hrbq66XqtCo\?t=\d+s?$/); expect(link.rel).toContain('noopener'); }

    const next = page.getByRole('button', { name: 'Next slide' });
    const previous = page.getByRole('button', { name: 'Previous slide' });
    const find = page.getByRole('button', { name: 'Find a term' });
    await next.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#cur')).toHaveText('2');
    await previous.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#cur')).toHaveText('1');
    await find.focus();
    await page.keyboard.press('Space');
    const dialog = page.getByRole('dialog', { name: 'Term search' });
    const search = page.getByRole('searchbox', { name: 'Search terms' });
    await expect(dialog).toBeVisible();
    await expect(search).toBeFocused();
    expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('#overlay')))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(find).toBeFocused();
    await page.keyboard.press('Enter');
    await search.fill('zzzz-no-such-term');
    await expect(page.locator('.no-results')).toBeVisible();
    await expect(page.locator('#searchStatus')).toHaveText('0 terms found.');
    await search.fill('GDS2');
    const result = page.getByRole('button', { name: /GDS2/ });
    await expect(result).toHaveCount(1);
    await result.focus();
    await page.keyboard.press('Space');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.slide.active h2')).toHaveText('GDS2');
    await expect(page.locator('.slide.active .slide-inner')).toBeFocused();
    await page.keyboard.press('/');
    await search.fill('HBM');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('.slide.active h2')).toHaveText('HBM');
    await page.getByRole('link', { name: 'Return to Lab' }).focus();
    const current = await page.locator('#cur').innerText();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#cur')).toHaveText(current);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(externalRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('scroll-triggered back-to-top returns a long slide to its heading', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto(route);
  await page.getByRole('button', { name: 'Find a term' }).click();
  await page.getByRole('searchbox', { name: 'Search terms' }).fill('Transformer');
  await page.getByRole('button', { name: /Transformer/ }).first().click();
  const inner = page.locator('.slide.active .slide-inner');
  const top = page.getByRole('button', { name: 'Back to top of slide' });
  await expect(top).toBeHidden();
  await inner.hover();
  await page.mouse.wheel(0, 1600);
  await expect(top).toBeVisible();
  const box = await top.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await top.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => inner.evaluate(element => element.scrollTop)).toBe(0);
  await expect(inner).toBeFocused();
});

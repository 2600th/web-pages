import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('robots and RSS expose the canonical public site', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://www.2600th.com/sitemap-index.xml');

  const feed = await request.get('/rss.xml');
  expect(feed.status()).toBe(200);
  expect(feed.headers()['content-type']).toContain('xml');
  const xml = await feed.text();
  expect(xml).toContain('<title>Pranshul Chandhok — Notes</title>');
  expect(xml).toContain('https://www.2600th.com/notes/ai-video-control/');
  expect((xml.match(/<item>/g) ?? []).length).toBeGreaterThanOrEqual(6);
});

test('global Person data names the verified public identities', async ({ page }) => {
  await page.goto('/');
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '[]');
  const person = jsonLd.find((entry: { '@type'?: string }) => entry['@type'] === 'Person');
  expect(person.sameAs).toEqual(expect.arrayContaining([
    'https://www.linkedin.com/in/pranshulchandhok/',
    'https://x.com/2600th',
  ]));
  expect(person.knowsAbout).toEqual(expect.arrayContaining(['Applied AI', 'Real-time 3D', 'XR']));
});

test('Career Atlas remains keyboard-operable and link-complete without JavaScript', async ({ page, browser }) => {
  await page.goto('/#career-atlas');
  const atlas = page.locator('#career-atlas');
  await expect(atlas.locator('[data-atlas-node][aria-pressed="true"]')).toContainText('IRA VR');
  const first = atlas.locator('[data-atlas-node]:not([hidden])').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(atlas.locator('[data-atlas-node][aria-pressed="true"]')).toBeFocused();

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto('/#career-atlas');
  await expect(fallback.locator('.career-atlas__index a')).toHaveCount(15);
  await noJs.close();
});

test('mobile keeps full navigation and places Atlas evidence before the long map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#career-atlas');
  await expect(page.getByRole('link', { name: 'Notes', exact: true })).toBeVisible();
  const stage = await page.locator('.career-atlas__stage').boundingBox();
  const map = await page.locator('.career-atlas__map').boundingBox();
  expect(stage?.y).toBeLessThan(map?.y ?? 0);
});

test('the eclipse is singular on the homepage and remains available on interior pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-theme-control]')).toHaveCount(1);
  await expect(page.locator('[data-wordmark] [data-theme-control]')).toBeVisible();

  await page.goto('/work/');
  await expect(page.locator('.site-nav [data-theme-control]')).toBeVisible();
  await expect(page.locator('[data-theme-control]')).toHaveCount(1);
});

test('reduced motion removes authored Atlas transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#career-atlas');
  const duration = await page.locator('.career-atlas__panel:not([hidden])').evaluate((element) =>
    getComputedStyle(element).animationDuration,
  );
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
});

for (const path of ['/', '/work/', '/work/kinema/', '/notes/', '/about/', '/lab/']) {
  test(`${path} has no serious or critical automated accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
      return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    });

    expect(violations).toEqual([]);
  });
}

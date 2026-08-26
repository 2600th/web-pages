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

test('the identity icon set and web manifest are published and linked', async ({ page, request }) => {
  for (const asset of ['/manifest.webmanifest', '/favicon.svg', '/favicon.ico', '/apple-touch-icon.png']) {
    const response = await request.get(asset);
    expect(response.status(), asset).toBe(200);
    expect((await response.body()).byteLength, asset).toBeGreaterThan(100);
  }

  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
});

test('social metadata includes accessible image dimensions and the creator identity', async ({ page }) => {
  await page.goto('/work/ira-vr/');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /IRA VR/i);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', /^\d+$/);
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', /^\d+$/);
  await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute('content', '@2600th');
});

test('designesto is framed as a 2026 launch, not an already-live product', async ({ page }) => {
  await page.goto('/work/blocks-inco-ai/');
  await expect(page.getByText(/launching in 2026/i).first()).toBeVisible();
  await expect(page.getByText(/live product/i)).toHaveCount(0);
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
  await expect(fallback.locator('.career-atlas__index a')).toHaveCount(17);
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

test('dark theme remains accessible and mobile primary controls meet the touch target floor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('2600th-theme', 'dark'));
  await page.goto('/');
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
  await expect(page.locator('.site-nav a')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a, .site-nav [data-theme-control]').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion removes authored Atlas transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#career-atlas');
  const duration = await page.locator('.career-atlas__panel:not([hidden])').evaluate((element) =>
    getComputedStyle(element).animationDuration,
  );
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
});

for (const path of [
  '/',
  '/work/',
  '/work/kinema/',
  '/work/defense-simulation-systems/',
  '/notes/',
  '/about/',
  '/lab/',
]) {
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

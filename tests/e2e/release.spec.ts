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

test('the work archive remains link-complete without JavaScript', async ({ browser }) => {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto('/work/');
  await expect(fallback.locator('[data-work-item]')).toHaveCount(17);
  await expect(fallback.getByRole('link', { name: /IRA VR/ })).toHaveAttribute('href', '/work/ira-vr/');
  await expect(fallback.getByRole('link', { name: /Kinema/ })).toHaveAttribute('href', '/work/kinema/');
  await noJs.close();
});

test('mobile keeps full navigation and places selected-work evidence before its copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#selected-work');
  await expect(page.getByRole('link', { name: 'Notes', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lab', exact: true })).toBeVisible();
  const firstCase = page.locator('[data-signal-case]').first();
  const media = await firstCase.locator('.signal-case__media').boundingBox();
  const copy = await firstCase.locator('.signal-case__copy').boundingBox();
  expect((media?.y ?? Number.POSITIVE_INFINITY) - (copy?.y ?? 0)).toBeLessThan(0);
});

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
  await expect(page.locator('.site-nav a')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a, .site-nav [data-theme-control]').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('interior index heroes use the compact optical system', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const path of ['/work/', '/notes/', '/about/']) {
    await page.goto(path);
    const hero = page.locator('.page-hero');
    await expect(hero).toBeVisible();
    expect((await hero.boundingBox())?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(620);
    await expect(hero.locator('.page-hero__aperture')).toBeVisible();
    const caption = hero.locator('.page-hero__aperture figcaption');
    await expect(caption).toContainText(/AI-generated editorial image.*not .* evidence/i);
    expect(await caption.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(10.8);
  }
});

test('lab hero keeps its title inside the copy plane', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/lab/');

  const title = await page.locator('.lab-hero h1').boundingBox();
  const media = await page.locator('.lab-hero figure').boundingBox();
  expect(title).not.toBeNull();
  expect(media).not.toBeNull();
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual((media?.x ?? 0) - 8);
});

test('lab hero uses art-directed mobile media and a stacked caption', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/');

  await expect(page.locator('.lab-hero source[media]')).toHaveAttribute('srcset', '/media/work/kinema/inside-mobile.webp');
  await expect(page.locator('.lab-hero img')).toHaveAttribute('src', '/media/work/kinema/inside.webp');
  expect(await page.locator('.lab-hero figcaption').evaluate((element) => getComputedStyle(element).flexDirection)).toBe('column');
});

test('mobile work filters expose every domain without a hidden horizontal rail', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/work/');

  await expect(page.getByLabel('Choose a work domain')).toBeVisible();
});

test('work filtering announces the selected domain and result count', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/');

  await page.getByLabel('Choose a work domain').selectOption('simulation');
  await expect(page.locator('[data-work-status]')).toHaveText(/Training and simulation, \d+ projects/i);
});

test('long case titles remain bounded near tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/work/enterprise-immersive-systems/');

  const fontSize = await page.locator('.case-hero--long h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeLessThanOrEqual(96);
});

test('case-study motion controls meet the mobile touch target floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/work/homelane-spacecraft-pro/');

  const controls = page.locator('[data-evidence-video-toggle]');
  await expect(controls).toHaveCount(2);
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion removes authored homepage transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#selected-work');
  const duration = await page.locator('[data-signal-case]').first().evaluate((element) =>
    getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
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

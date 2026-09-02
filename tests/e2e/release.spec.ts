import { expect, test } from '@playwright/test';
import axe from 'axe-core';

const interiorPaths = [
  '/',
  '/work/',
  '/work/kinema/',
  '/work/defense-simulation-systems/',
  '/notes/',
  '/notes/ai-video-control/',
  '/about/',
  '/lab/',
] as const;

const workDomainCounts = {
  games: 9,
  xr: 6,
  simulation: 6,
  robotics: 2,
  'design-tech': 4,
  'applied-ai': 5,
} as const;

test('robots and RSS expose the canonical public site', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://www.2600th.com/sitemap-index.xml');

  const feed = await request.get('/rss.xml');
  expect(feed.status()).toBe(200);
  expect(feed.headers()['content-type']).toContain('xml');
  const xml = await feed.text();
  expect(xml).toContain('<title>Pranshul Chandhok | Notes</title>');
  expect(xml).toContain('https://www.2600th.com/notes/ai-video-control/');
  expect((xml.match(/<item>/g) ?? []).length).toBe(8);
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

  const manifest = await (await request.get('/manifest.webmanifest')).json();
  const theme = await page.locator('meta[name="theme-color"]').getAttribute('content');
  expect(manifest.theme_color).toBe(theme);
  expect(manifest.background_color).toBe(theme);

  const ico = await (await request.get('/favicon.ico')).body();
  const icoSizes = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
    const offset = 6 + index * 16;
    return `${ico[offset] || 256}x${ico[offset + 1] || 256}`;
  }).join(' ');
  await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveAttribute('sizes', icoSizes);
  expect(manifest.icons.find((icon: { src: string }) => icon.src === '/favicon.ico').sizes).toBe(icoSizes);
});

test('social metadata includes accessible image dimensions and the creator identity', async ({ page }) => {
  await page.goto('/work/ira-vr/');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /IRA VR/i);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', /^\d+$/);
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', /^\d+$/);
  await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute('content', '@2600th');
});

test('the combined compatibility route explains and links the two separate products', async ({ page }) => {
  await page.goto('/work/blocks-inco-ai/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.2600th.com/work/blocks-inco-ai/');
  await expect(page.locator('main a[href="/work/blocks/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/work/designesto/"]').first()).toBeVisible();
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
  const archive = fallback.locator('[data-work-item]');
  await expect(archive).toHaveCount(19);
  await expect(archive.getByRole('link', { name: /IRA VR/ })).toHaveAttribute('href', '/work/ira-vr/');
  await expect(archive.getByRole('link', { name: /Kinema/ })).toHaveAttribute('href', '/work/kinema/');
  await noJs.close();
});

test('work domain links target canonical static subsets', async ({ page }) => {
  await page.goto('/work/');

  for (const domain of Object.keys(workDomainCounts)) {
    await expect(page.locator(`[data-domain-link="${domain}"]`)).toHaveAttribute('href', `/work/domain/${domain}/`);
  }
});

test('desktop domain navigation loads the canonical static document', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/');
  await page.locator('[data-domain-link="xr"]').click();

  await expect(page).toHaveURL(/\/work\/domain\/xr\/$/);
  await expect(page).toHaveTitle(/XR and spatial computing · Projects/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.2600th.com/work/domain/xr/');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://www.2600th.com/work/domain/xr/');
});

test('work-domain controls adapt before the link row needs a scrollbar', async ({ page }) => {
  for (const width of [878, 946, 1024, 1100, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/');

    const filter = page.locator('.domain-filter');
    const select = page.locator('.domain-filter-select');
    if (width <= 1024) {
      await expect(filter).toBeHidden();
      await expect(select).toBeVisible();
    } else {
      await expect(filter).toBeVisible();
      await expect(select).toBeHidden();
      await expect.poll(() => filter.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
  }
});

test('crawlable work domain routes render only their subset without JavaScript', async ({ browser }) => {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/work/');
  await expect(page.locator('.domain-filter-mobile-links')).toBeVisible();
  for (const domain of Object.keys(workDomainCounts)) {
    await expect(page.locator(`.domain-filter-mobile-links a[href="/work/domain/${domain}/"]`)).toHaveCount(1);
  }

  for (const [domain, count] of Object.entries(workDomainCounts)) {
    const response = await page.goto(`/work/domain/${domain}/`);
    expect(response?.status(), domain).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.2600th.com/work/domain/${domain}/`);
    await expect(page.locator('[data-work-item]')).toHaveCount(count);
    const hrefs = await page.locator('[data-work-item] a').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute('href')));
    expect(new Set(hrefs).size, domain).toBe(count);
    for (const href of hrefs) expect(href, domain).toMatch(/^\/work\/[a-z0-9-]+\/$/);
  }

  await noJs.close();
});

test('interior index openings keep the cinematic velvet contract', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const path of ['/work/', '/notes/', '/about/', '/lab/']) {
    await page.goto(path);
    const opening = page.locator('[data-route-opening]');
    await expect(opening).toBeVisible();
    await expect(opening.locator('[data-polarity="positive"]')).toBeVisible();
    await expect(opening.locator('[data-polarity="negative"]')).toBeVisible();
    if (path === '/notes/') await expect(opening.locator('[data-notes-opening-media]')).toHaveCount(1);
    else await expect(opening.locator('img[src*="/media/generated/editorial/"]')).toHaveCount(0);
    const height = (await opening.boundingBox())?.height ?? 0;
    expect(height, `${path} opening height`).toBeGreaterThanOrEqual(560);
    expect(height, `${path} opening height`).toBeLessThanOrEqual(760);
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
  await expect(page).toHaveURL(/\/work\/domain\/simulation\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.2600th.com/work/domain/simulation/');
  await expect(page.locator('[data-work-status]')).toHaveText(/Training and simulation, \d+ projects/i);
});

test('long case titles remain bounded near tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/work/enterprise-immersive-systems/');

  const fontSize = await page.locator('.case-hero--long h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeLessThanOrEqual(96);
});

test('all interior routes contain their content at the 320, 390, 946, and 1440px floors', async ({ page }) => {
  for (const width of [320, 390, 946, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    for (const path of ['/work/', '/work/domain/xr/', '/work/kinema/', '/notes/', '/notes/ai-video-control/', '/about/', '/lab/']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width}px`).toBeLessThanOrEqual(width);
      for (const element of await page.locator('main a, main button, main input, main select').all()) {
        const box = await element.boundingBox();
        if (!box) continue;
        expect(box.x, `${path} control x at ${width}px`).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width, `${path} control right at ${width}px`).toBeLessThanOrEqual(width + 1);
      }
    }
  }
});

test('case-study videos remain paused until explicit user action and pause out of view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/ira-vr/');

  const videos = page.locator('[data-evidence-video]');
  const toggles = page.locator('[data-evidence-video-toggle]');
  expect(await videos.count()).toBeGreaterThan(0);
  expect(await toggles.count()).toBe(await videos.count());
  await expect.poll(() => videos.evaluateAll((elements) => elements.every((element) => (element as HTMLVideoElement).paused))).toBe(true);
  await expect(toggles).toHaveText(Array.from({ length: await toggles.count() }, () => 'Play'));

  const firstVideo = videos.first();
  const firstToggle = toggles.first();
  await firstVideo.evaluate((element) => {
    const video = element as HTMLVideoElement;
    video.muted = true;
    video.load();
  });
  await expect.poll(() => firstVideo.evaluate((element) => (element as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
  await firstToggle.click();
  await expect.poll(() => firstVideo.evaluate((element) => !(element as HTMLVideoElement).paused), { timeout: 10000 }).toBe(true);
  await expect(firstToggle).toHaveText('Pause');

  await firstToggle.click();
  await expect.poll(() => firstVideo.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
  await expect(firstToggle).toHaveText('Play');

  await firstToggle.click();
  await expect.poll(() => firstVideo.evaluate((element) => !(element as HTMLVideoElement).paused), { timeout: 10000 }).toBe(true);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => firstVideo.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  await expect(firstVideo).toBeVisible();
  await expect.poll(() => firstVideo.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
});

test('case-study video controls retain a native no-JavaScript fallback', async ({ browser }) => {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();
  await page.goto('/work/ira-vr/');

  const videos = page.locator('[data-evidence-video]');
  expect(await videos.count()).toBeGreaterThan(0);
  await expect(videos.first()).toHaveAttribute('controls', '');
  expect(await videos.evaluateAll((elements) => elements.every((element) => (element as HTMLVideoElement).controls))).toBe(true);
  const toggles = page.locator('[data-evidence-video-toggle]');
  expect(await toggles.count()).toBe(await videos.count());
  for (const toggle of await toggles.all()) await expect(toggle).toBeHidden();
  await noJs.close();
});

test('case-study JavaScript binding hands playback to the custom control', async ({ page }) => {
  await page.goto('/work/ira-vr/');

  const videos = page.locator('[data-evidence-video]');
  const toggles = page.locator('[data-evidence-video-toggle]');
  expect(await videos.count()).toBeGreaterThan(0);
  expect(await toggles.count()).toBe(await videos.count());
  for (const toggle of await toggles.all()) await expect(toggle).toBeVisible();
  expect(await videos.evaluateAll((elements) => elements.every((element) => !(element as HTMLVideoElement).controls))).toBe(true);
});

test('case-study motion controls meet the mobile touch target floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/work/ira-vr/');

  const controls = page.locator('[data-evidence-video-toggle]');
  expect(await controls.count()).toBeGreaterThan(0);
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion keeps case videos paused until explicit user action', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/ira-vr/');

  const videos = page.locator('[data-evidence-video]');
  const toggles = page.locator('[data-evidence-video-toggle]');
  expect(await videos.count()).toBeGreaterThan(0);
  await expect.poll(async () => videos.evaluateAll((elements) => elements.every((element) => (element as HTMLVideoElement).paused))).toBe(true);
  await expect(toggles).toHaveText(Array.from({ length: await toggles.count() }, () => 'Play'));
});

test('no-JavaScript mobile domain fallback hides enhancement controls at the containment floors', async ({ browser }) => {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/work/');
    await expect(page.locator('.domain-filter-select')).toBeHidden();
    const fallback = page.locator('.domain-filter-mobile-links');
    await expect(fallback).toBeVisible();
    const xrLink = fallback.getByRole('link', { name: /XR/ });
    await expect(xrLink).toHaveAttribute('href', '/work/domain/xr/');
    await xrLink.click();
    await expect(page).toHaveURL(/\/work\/domain\/xr\/$/);
    await expect(page.locator('[data-work-item]')).toHaveCount(workDomainCounts.xr);
  }

  await noJs.close();
});

test('the dark-first header remains usable at the 320px support floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/work/');

  await expect(page.locator('.site-signature')).toContainText('2600TH');
  await expect(page.locator('.site-nav a')).toHaveCount(5);
  await expect(page.locator('[data-theme-control]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('header focus order follows the visual order on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/work/');
    const signature = page.locator('.site-signature');
    const work = page.getByRole('link', { name: 'Home', exact: true });
    await signature.focus();
    await page.keyboard.press('Tab');
    await expect(work).toBeFocused();
  }
});

test('primary CTA text stays visible in the dark-first system after hover', async ({ page }) => {
  await page.goto('/404');
  const cta = page.locator('.button-link--primary').first();
  await expect(cta).toBeVisible();
  const contrast = () => cta.evaluate((element) => {
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const style = getComputedStyle(element);
    const colors = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
    return (colors[0] + 0.05) / (colors[1] + 0.05);
  });
  await expect.poll(contrast).toBeGreaterThanOrEqual(4.5);
  await cta.hover();
  await cta.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  await expect.poll(contrast).toBeGreaterThanOrEqual(4.5);
});

for (const path of interiorPaths) {
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

import { expect, test } from '@playwright/test';

const SELECTED_WORK = [
  '/work/blocks/', '/work/designesto/', '/work/propvr-ai-craft/',
  '/work/homelane-spacecraft-pro/', '/work/enterprise-immersive-systems/', '/work/ira-vr/',
];

test('Signal hero is semantic, identifies the person and offers two actions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('.sg-hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Make the uncertain operable.');
  await expect(hero).toContainText('Pranshul Chandhok');
  await expect(hero).toContainText('Interior Company at Square Yards');
  await expect(hero.getByRole('link', { name: 'Selected work' })).toHaveAttribute('href', '#work');
  await expect(hero.getByRole('link', { name: 'Why 2600th' })).toHaveAttribute('href', '#origin');
  await expect(hero.getByRole('list', { name: 'At a glance' }).getByRole('listitem')).toHaveCount(3);
});

test('selected work lists six distinct systems and no archived records', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const lines = page.locator('.sg-line > a');
  expect(await lines.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(SELECTED_WORK);
  await expect(page.locator('a[href="/work/blocks-inco-ai/"]')).toHaveCount(0);
  // Craft has no public motion capture, so its channel is a still.
  await expect(page.locator('[data-channel="2"] video')).toHaveCount(0);
  await expect(page.locator('[data-channel="2"] img')).toHaveCount(1);
});

test('independent builds link to their live websites and source', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const lab = page.locator('#lab');
  for (const host of ['kinema-play.vercel.app', 'web-ocean-3d.vercel.app', 'oss-web-3d.vercel.app', 'little-wonder.vercel.app']) {
    const card = lab.locator(`a[href="https://${host}/"]`);
    await expect(card, host).toHaveCount(1);
    await expect(card, host).toContainText(host);
  }
  await expect(lab.getByRole('link', { name: /Website/ })).toHaveAttribute('href', 'https://2600th.github.io/dlss5-video-player/');
  await expect(lab.locator('a[href="https://github.com/2600th/dlss5-video-player"]')).toHaveCount(1);
});

test('transmissions show the four latest published notes and one shared contact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/notes/');
  const latest = (await page.locator('.notes-list > li > a').evaluateAll(links => links.map(link => link.getAttribute('href')))).slice(0, 4);
  await page.goto('/');
  const notes = page.locator('.sg-tx a');
  expect(await notes.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(latest);
  await expect(page.locator('.sg-tx time[datetime]')).toHaveCount(4);
  await expect(page.locator('#contact')).toHaveCount(1);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="mailto:2600th@gmail.com"]')).toHaveAttribute('data-event', 'contact_start');
});

test('the blue box dials 2600 digit by digit and accepts keyboard routing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const display = page.locator('[data-box-display]');
  const key = (name: string) => page.locator(`[data-key="${name}"]`);
  await key('2').click();
  await key('6').click();
  await expect(display).toHaveText('26');
  await key('0').click();
  await key('0').click();
  await expect(display).toHaveText('2600 · SEIZED');
  await key('0').focus();
  await page.keyboard.press('k');
  await page.keyboard.type('1337');
  await expect(display).toHaveText('KP 1337_');
  await page.keyboard.press('s');
  await expect(display).toHaveText('ELITE · 1337');
});

test('reduced motion shows the portrait poster and never downloads the 3D engine', async ({ page }) => {
  const heavy: string[] = [];
  page.on('request', request => { if (/\.glb|engine\.[\w-]+\.js/.test(request.url())) heavy.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('.sg-poster')).toBeVisible();
  await page.waitForTimeout(1500);
  expect(heavy).toEqual([]);
});

test('the motion choice made on any page carries to the homepage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/');
  const ambient = page.getByRole('button', { name: 'Ambient motion' });
  await expect(ambient).toHaveAttribute('aria-pressed', 'true');
  await ambient.click();
  await expect(ambient).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('.sg-top [data-motion-toggle]')).toHaveAttribute('aria-pressed', 'false');
});

test('identity, navigation, work and contact remain complete without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make the uncertain operable.');
    await expect(page.locator('#primary-nav')).toBeVisible();
    await expect(page.locator('.sg-poster')).toBeVisible();
    await expect(page.locator('.sg-line > a')).toHaveCount(6);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact a[href="mailto:2600th@gmail.com"]')).toBeVisible();
  } finally {
    await context.close();
  }
});

for (const width of [320, 390, 1440]) {
  test(`the handoff heading clears its paragraph and nothing overflows at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const handoff = page.locator('.sg-beat--handoff');
    await handoff.scrollIntoViewIfNeeded();
    const gap = await handoff.evaluate((element) => {
      const heading = element.querySelector('h3')!.getBoundingClientRect();
      const paragraph = element.querySelector('.sg-handoff')!.getBoundingClientRect();
      return paragraph.top - heading.bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}

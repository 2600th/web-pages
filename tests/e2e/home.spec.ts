import { expect, test } from '@playwright/test';

test('first viewport names the operator, the practice, and the next action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByText(/operator.advisor building at the edge of AI/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore selected work' })).toHaveAttribute('href', '#selected-work');
  await expect(page.getByRole('link', { name: 'Email Pranshul' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.getByRole('slider', { name: /adjust the positive and negative exposure/i })).toBeVisible();
  await expect(page.locator('[data-theme-control]')).toBeVisible();
});

test('primary navigation is the four-part public map', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(navigation.getByRole('link')).toHaveCount(4);
  await expect(navigation.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('href', '/work/');
  await expect(navigation.getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/lab/');
  await expect(navigation.getByRole('link', { name: 'Notes', exact: true })).toHaveAttribute('href', '/notes/');
  await expect(navigation.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/#contact');
});

test('selected work presents four authentic signals led by current operator work', async ({ page }) => {
  await page.goto('/#selected-work');
  const selectedWork = page.locator('#selected-work');
  const cases = selectedWork.locator('[data-signal-case]');

  await expect(selectedWork.getByRole('heading', { level: 2, name: /Selected work/i })).toBeVisible();
  await expect(cases).toHaveCount(4);
  await expect(cases.first().getByRole('heading', { level: 3 })).toHaveText(/Blocks.*designesto\.ai/i);
  await expect(cases.first()).toContainText(/launching in 2026/i);
  await expect(cases.first().getByRole('link', { name: /Open.*Blocks.*designesto/i })).toHaveAttribute(
    'href',
    '/work/blocks-inco-ai/',
  );

  const ira = cases.filter({ hasText: 'IRA VR' });
  await expect(ira.locator('video')).toHaveAttribute('poster', '/media/career/ira-vr/newton-poster.webp');
  await expect(ira.locator('video')).toHaveAttribute('preload', 'none');
  await expect(ira.getByRole('link', { name: /Open.*IRA VR/i })).toHaveAttribute('href', '/work/ira-vr/');
});

test('current work and the public lab remain explicit and findable', async ({ page }) => {
  await page.goto('/#public-build');
  const lab = page.locator('#public-build');

  await expect(lab.getByRole('heading', { level: 2, name: /designesto.ai/i })).toBeVisible();
  await expect(lab).toContainText(/launching in 2026/i);
  await expect(lab.getByRole('link', { name: /Kinema/i })).toHaveAttribute('href', '/work/kinema/');
  await expect(lab.getByRole('link', { name: /Web Ocean 3D/i })).toHaveAttribute('href', '/work/web-ocean-3d/');
  await expect(lab.getByRole('link', { name: /Open the lab/i })).toHaveAttribute('href', '/lab/');
  await expect(lab.locator('.build-field__media')).toHaveCount(0);
  await expect(lab).toContainText(/current build report/i);
});

test('motion-rich case studies expose real clips with poster fallbacks', async ({ page }) => {
  for (const path of ['/work/ira-vr/', '/work/machine-hunter/', '/work/mysticmojo/']) {
    await page.goto(path);
    const video = page.locator('.project-media video').first();
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', /\/media\//);
  }
});

test('the identity, work, and conversion path remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email Pranshul' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.locator('#selected-work [data-signal-case]')).toHaveCount(4);
  await expect(page.getByRole('link', { name: /Open.*IRA VR/i })).toHaveAttribute('href', '/work/ira-vr/');
  await context.close();
});

test('reduced motion preserves still evidence and disables authored transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#selected-work');

  const duration = await page.locator('[data-signal-case]').first().evaluate((element) =>
    getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);

  const videos = page.locator('#selected-work video');
  await expect(videos).toHaveCount(3);
  await expect.poll(async () => videos.evaluateAll((elements) =>
    elements.every((element) => (element as HTMLVideoElement).paused),
  )).toBe(true);
});

test('the homepage stays inside the 320px support floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a, [data-theme-control], .hero-actions a').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test('mobile exposure control does not intercept the primary action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const action = page.getByRole('link', { name: 'Explore selected work' });
  const box = await action.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
  await expect(page).toHaveURL(/#selected-work$/);

  const sliderBox = await page.getByRole('slider', { name: /adjust the positive and negative exposure/i }).boundingBox();
  expect(sliderBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(64);
});

test('every homepage motion clip has a working user control', async ({ page }) => {
  await page.goto('/#selected-work');
  const videos = page.locator('#selected-work video');
  const controls = page.locator('#selected-work [data-signal-motion-toggle]');

  await expect(controls).toHaveCount(await videos.count());
  const firstControl = controls.first();
  await firstControl.scrollIntoViewIfNeeded();
  const initial = await firstControl.getAttribute('aria-pressed');
  await firstControl.click();
  await expect(firstControl).not.toHaveAttribute('aria-pressed', initial ?? 'false');
});

test('homepage evidence stays concise on a mobile reading path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(7600);
  await expect(page.locator('.proof-line li')).toHaveCount(4);
  await expect(page.locator('.ledger')).toHaveCount(0);
});

test('the conversation and footer close use split polarity planes instead of a cobalt slab', async ({ page }) => {
  await page.goto('/#contact');

  const conversation = page.locator('.conversation-close');
  await expect(conversation).toBeVisible();
  const conversationColors = await conversation.evaluate((element) => {
    const lead = element.querySelector('.conversation-close__lead');
    const paths = element.querySelector('.conversation-close__paths');
    return {
      root: getComputedStyle(element).backgroundColor,
      lead: lead ? getComputedStyle(lead).backgroundColor : '',
      paths: paths ? getComputedStyle(paths).backgroundColor : '',
    };
  });

  expect(conversationColors.root).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.lead).not.toBe(conversationColors.paths);

  const footerColors = await page.locator('.site-footer').evaluate((element) => {
    const contact = element.querySelector('.site-footer__contact');
    return {
      root: getComputedStyle(element).backgroundColor,
      contact: contact ? getComputedStyle(contact).backgroundColor : '',
    };
  });

  expect(footerColors.root).not.toBe('rgb(36, 87, 255)');
  expect(footerColors.contact).not.toBe(footerColors.root);
});

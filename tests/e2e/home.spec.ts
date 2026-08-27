import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('first viewport names the operator, practice, and next action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByText('Operator–advisor building at the edge of AI and spatial computing.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore selected work' })).toHaveAttribute('href', '#selected-work');
  await expect(page.getByRole('link', { name: 'Email Pranshul' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.getByRole('slider', { name: /adjust the positive and negative exposure/i })).toBeVisible();
  await expect(page.locator('[data-theme-control]')).toBeVisible();

  const planes = await page.locator('.exposure-hero [data-polarity]').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { polarity: element.getAttribute('data-polarity'), width: box.width };
    }),
  );
  expect(planes).toHaveLength(2);
  expect(planes[0]?.polarity).toBe('positive');
  expect(planes[1]?.polarity).toBe('negative');
  expect(Math.abs((planes[0]?.width ?? 0) - (planes[1]?.width ?? 0))).toBeLessThanOrEqual(2);
});

test('the exposure boundary is an exact 50/50 split and responds to keyboard and pointer input', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 946 });
  await page.goto('/');

  const hero = page.locator('[data-exposure-hero]');
  const slider = page.getByRole('slider', { name: /adjust the positive and negative exposure/i });
  const heroBox = await hero.boundingBox();
  const initialPlanes = await hero.locator('[data-polarity]').evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );

  expect(heroBox).not.toBeNull();
  expect(initialPlanes[0]).toBeCloseTo((heroBox?.width ?? 0) / 2, 0);
  expect(initialPlanes[1]).toBeCloseTo((heroBox?.width ?? 0) / 2, 0);
  expect(await slider.inputValue()).toBe('50');

  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('51');
  expect(await hero.locator('[data-polarity="positive"]').evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(
    await hero.locator('[data-polarity="negative"]').evaluate((element) => element.getBoundingClientRect().width),
  );

  const sliderBox = await slider.boundingBox();
  expect(sliderBox).not.toBeNull();
  await page.mouse.click((sliderBox?.x ?? 0) + (sliderBox?.width ?? 0) * 0.9, (sliderBox?.y ?? 0) + (sliderBox?.height ?? 0) / 2);
  await expect.poll(() => slider.inputValue()).toBe('63');
});

test('the hero keeps its one action, legible instruction, and generated identity boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 946 });
  await page.goto('/');

  const hero = page.locator('[data-exposure-hero]');
  await expect(hero.getByRole('link', { name: /start a conversation/i })).toHaveCount(0);
  await expect(hero.locator('.exposure-actions__primary')).toHaveCount(1);
  await expect(hero.locator('[data-exposure-hint]')).toContainText('Drag the light');
  await expect(hero.locator('[data-exposure-hint]')).toBeVisible();
  const hintBox = await hero.locator('[data-exposure-hint]').boundingBox();
  expect(hintBox?.width ?? 0).toBeGreaterThanOrEqual(80);
  expect(hintBox?.x ?? -1).toBeGreaterThanOrEqual(8);
  expect((hintBox?.x ?? 0) + (hintBox?.width ?? 0)).toBeLessThanOrEqual(1664);
  await expect(hero.locator('[data-generated-direction-study]')).toContainText(/generated direction study/i);
  await expect(hero.locator('[data-generated-direction-study]')).toContainText(/identity only/i);
});

test('homepage media exists over HTTP and carries its provenance boundary', async ({ page, request }) => {
  await page.goto('/');

  const selectedWork = page.locator('#selected-work');
  const resources = new Set(['/media/generated/editorial/work-aperture.webp']);
  for (const video of await selectedWork.locator('video').all()) {
    const poster = await video.getAttribute('poster');
    const source = await video.locator('source').getAttribute('src');
    expect(poster).toMatch(/^\/media\//);
    expect(source).toMatch(/^\/media\//);
    if (poster) resources.add(poster);
    if (source) resources.add(source);
    await expect(video).toHaveAttribute('data-media-source-url', /^https:\/\//);
    await expect(video).toHaveAttribute('data-media-source-status', /^(public|authored|approval)-/);
  }

  for (const resource of resources) {
    const response = await request.get(resource);
    expect(response.status(), resource).toBe(200);
  }

  await expect(page.locator('[data-generated-direction-study]')).toHaveAttribute('data-identity-media', 'generated-editorial');
});

test('the homepage has no serious WCAG contrast violations', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
    });
    return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  });
  expect(violations).toEqual([]);
});

test('hero controls expose visible focus and make the deferred theme control visible on focus', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Explore selected work' });
  const slider = page.getByRole('slider', { name: /adjust the positive and negative exposure/i });
  const theme = page.locator('[data-theme-control]');

  for (const control of [cta, slider, theme]) {
    await control.focus();
    await expect(control).toBeFocused();
    const focus = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, opacity: Number.parseFloat(style.opacity) };
    });
    expect(focus.outlineStyle).not.toBe('none');
    expect(Number.parseFloat(focus.outlineWidth)).toBeGreaterThan(0);
    if (control === theme) expect(focus.opacity).toBeGreaterThanOrEqual(0.8);
  }
});

test('the homepage contains no horizontal overflow at supported widths', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 946, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(widths.document, `${viewport.width}px document`).toBeLessThanOrEqual(viewport.width);
    expect(widths.body, `${viewport.width}px body`).toBeLessThanOrEqual(viewport.width);
  }
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

test('selected work presents three authentic chapters led by current operator work', async ({ page }) => {
  await page.goto('/#selected-work');
  const selectedWork = page.locator('#selected-work');
  const cases = selectedWork.locator('[data-signal-case]');

  await expect(selectedWork.getByRole('heading', { level: 2, name: /Selected work/i })).toBeVisible();
  await expect(cases).toHaveCount(3);
  await expect(cases.nth(0).getByRole('heading', { level: 3 })).toHaveText(/Blocks.*designesto\.ai/i);
  await expect(cases.nth(0)).toContainText(/launching in 2026/i);
  await expect(cases.nth(0).getByRole('link', { name: /Open.*Blocks.*designesto/i })).toHaveAttribute(
    'href',
    '/work/blocks-inco-ai/',
  );
  await expect(cases.filter({ hasText: 'IRA VR' }).getByRole('link', { name: /Open.*IRA VR/i })).toHaveAttribute(
    'href',
    '/work/ira-vr/',
  );
  await expect(selectedWork.locator('[data-case-slug="enterprise-immersive-systems"]').getByRole('link', { name: /Open/i })).toHaveAttribute(
    'href',
    '/work/enterprise-immersive-systems/',
  );
  await expect(cases.filter({ hasText: 'Kinema' })).toHaveCount(0);

  const media = cases.locator('img, video');
  await expect(media).toHaveCount(3);
  await expect(cases.locator('video')).toHaveCount(3);
  for (const video of await cases.locator('video').all()) {
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', /\/media\//);
    await expect(video.locator('source')).toHaveAttribute('src', /\/media\//);
  }
});

test('the proof index is compact and carries the dated evidence trail', async ({ page }) => {
  await page.goto('/#proof-line');
  const proof = page.locator('[data-proof-index]');

  await expect(proof).toBeVisible();
  await expect(proof.locator('ol > li')).toHaveCount(6);
  await expect(proof).toContainText(/GreyKernel/i);
  await expect(proof).toContainText(/defense/i);
  await expect(proof).toContainText(/HomeLane/i);
  await expect(proof).toContainText(/robot/i);
  await expect(proof).toContainText(/award/i);
  await expect(proof).toContainText(/public work/i);
  const background = await proof.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgb(36, 87, 255)');
});

test('the current build ledger names five public sources', async ({ page }) => {
  await page.goto('/#public-build');
  const ledger = page.locator('#public-build');

  await expect(ledger.getByRole('heading', { level: 2, name: /designesto\.ai/i })).toBeVisible();
  await expect(ledger).toContainText(/launching in 2026/i);
  await expect(ledger.locator('[data-build-row]')).toHaveCount(5);
  await expect(ledger.getByRole('link', { name: /Kinema/i })).toHaveAttribute('href', '/work/kinema/');
  await expect(ledger.getByRole('link', { name: /Web Ocean 3D/i })).toHaveAttribute('href', '/work/web-ocean-3d/');
  await expect(ledger.getByRole('link', { name: /Safed Sagar/i })).toHaveAttribute('href', '/work/safed-sagar/');
  await expect(ledger.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', /github\.com\/2600th/);
  await expect(ledger.getByRole('link', { name: /console archive/i })).toHaveAttribute('href', '/lab/terminal/index.html');
  await expect(ledger.locator('.build-field__media')).toHaveCount(0);
});

test('the homepage notes section carries three current observations', async ({ page }) => {
  await page.goto('/');
  const notes = page.locator('.recent-thinking');

  await expect(notes).toBeVisible();
  await expect(notes.locator('ol > li')).toHaveCount(3);
  for (const link of await notes.locator('ol > li > a').all()) {
    await expect(link).toHaveAttribute('href', /\/notes\//);
  }
});

test('motion evidence is user-controlled and stays still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#selected-work');

  const videos = page.locator('#selected-work video');
  const controls = page.locator('#selected-work [data-signal-motion-toggle]');
  await expect(videos).toHaveCount(3);
  await expect(controls).toHaveCount(await videos.count());
  await expect.poll(async () => videos.evaluateAll((elements) =>
    elements.every((element) => (element as HTMLVideoElement).paused),
  )).toBe(true);
  const durations = await page.locator('.exposure-hero *, #selected-work *').evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)).filter(Number.isFinite),
  );
  expect(Math.max(...durations, 0)).toBeLessThanOrEqual(0.01);
});

test('the identity, work, and conversion path remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email Pranshul' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.locator('#selected-work [data-signal-case]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Open.*IRA VR/i })).toHaveAttribute('href', '/work/ira-vr/');
  await context.close();
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

test('motion controls start and stop real playback and pause an out-of-view clip', async ({ page }) => {
  await page.goto('/#selected-work');

  const video = page.locator('#selected-work video').first();
  const control = page.locator('#selected-work [data-signal-motion-toggle]').first();
  await video.scrollIntoViewIfNeeded();
  await control.click();
  await expect.poll(() => video.evaluate((element) => ({ paused: (element as HTMLVideoElement).paused, time: (element as HTMLVideoElement).currentTime }))).toMatchObject({ paused: false });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);

  await video.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(false);

  await control.click();
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
});

test('the homepage stays inside the 320px support floor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const target of await page.locator('.site-nav a, [data-theme-control], .exposure-actions__primary').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
  for (const target of await page.locator('main a, main button, main input, main select').all()) {
    const box = await target.boundingBox();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
  }
});

test('the conversation and footer close use split polarity planes instead of a cobalt slab', async ({ page }) => {
  await page.goto('/#contact');

  const conversation = page.locator('.conversation-close');
  await expect(conversation).toBeVisible();
  await expect(conversation).toHaveAttribute('data-closing-plane', 'split');
  await expect(conversation.locator('[data-polarity="positive"]')).toHaveCount(1);
  await expect(conversation.locator('[data-polarity="negative"]')).toHaveCount(1);
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
  expect(conversationColors.lead).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.paths).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.lead).not.toBe(conversationColors.paths);

  const footerColors = await page.locator('.site-footer').evaluate((element) => {
    const contact = element.querySelector('.site-footer__contact');
    return {
      root: getComputedStyle(element).backgroundColor,
      contact: contact ? getComputedStyle(contact).backgroundColor : '',
    };
  });

  await expect(page.locator('.site-footer')).toHaveAttribute('data-closing-plane', 'split');
  await expect(page.locator('.site-footer [data-polarity="positive"]')).toHaveCount(2);
  await expect(page.locator('.site-footer [data-polarity="negative"]')).toHaveCount(1);
  expect(footerColors.root).not.toBe('rgb(36, 87, 255)');
  expect(footerColors.contact).not.toBe('rgb(36, 87, 255)');
  expect(footerColors.contact).not.toBe(footerColors.root);
});

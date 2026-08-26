import { expect, test } from '@playwright/test';

test('first viewport identifies Pranshul, the work, and the next action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.locator('.hero__positioning').getByText(/fifteen years.*games.*AI/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discuss an opportunity' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'View selected work' })).toHaveAttribute('href', '#selected-work');
});

test('selected work leads with four operator-grade cases', async ({ page }) => {
  await page.goto('/#selected-work');
  const projects = page.getByRole('navigation', { name: 'Selected projects' });

  await expect(projects.getByRole('link')).toHaveCount(4);
  await expect(projects.getByRole('link').first()).toContainText(/Blocks.*designesto\.ai/i);
});

test('Proof in motion leads with six authentic evidence frames and responsible video', async ({ page }) => {
  await page.goto('/#proof-in-motion');
  const proof = page.locator('#proof-in-motion');

  await expect(proof.getByRole('heading', { level: 2, name: /Systems you can see moving/i })).toBeVisible();
  await expect(proof.locator('figure')).toHaveCount(6);
  await expect(proof.locator('figure > a')).toHaveCount(6);
  await expect(proof.locator('video')).toHaveCount(6);
  await expect(proof.locator('figure').first()).toContainText(/designesto\.ai/i);
  await expect(proof.getByText(/experiential learning/i)).toBeVisible();
  await expect(proof.getByRole('link', { name: /View IRA VR.*case study/i })).toHaveAttribute(
    'href',
    '/work/ira-vr/',
  );

  for (const video of await proof.locator('video').all()) {
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', /\/media\//);
  }

  const leadingVideo = proof.locator('video').first();
  const trailingVideo = proof.locator('video').last();
  await leadingVideo.scrollIntoViewIfNeeded();
  await expect.poll(async () => leadingVideo.evaluate((video) => !(video as HTMLVideoElement).paused)).toBe(true);
  await expect.poll(async () => trailingVideo.evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);

  const motionToggle = proof.getByRole('button', { name: 'Motion playback' });
  await expect(motionToggle).toHaveAttribute('aria-pressed', 'true');
  await motionToggle.click();
  await expect(motionToggle).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => proof.locator('video').evaluateAll((elements) =>
    elements.every((element) => (element as HTMLVideoElement).paused),
  )).toBe(true);

  await expect(proof.getByRole('link', { name: /Open the complete work archive/i })).toBeVisible();
});

test('Proof in motion falls back to still frames when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#proof-in-motion');
  const videos = page.locator('#proof-in-motion video');
  const motionToggle = page.getByRole('button', { name: 'Motion playback' });

  await expect(videos).toHaveCount(6);
  await expect(motionToggle).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => videos.evaluateAll((elements) =>
    elements.every((element) => (element as HTMLVideoElement).paused),
  )).toBe(true);
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

test('the identity and conversion path remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discuss an opportunity' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.locator('.career-atlas__index').getByRole('link', { name: 'Kinema' })).toHaveAttribute('href', '/work/kinema/');
  await expect(page.getByRole('link', { name: /The Brutal Spy/ })).toHaveAttribute('href', '/work/the-brutal-spy/');
  await expect(page.getByRole('navigation', { name: 'Selected projects' }).getByRole('link').first()).toHaveAttribute(
    'href',
    '/work/blocks-inco-ai/',
  );
  await context.close();
});

test('Three Distances changes real content and keeps the state in the URL', async ({ page }) => {
  await page.goto('/?work=kinema&distance=out#selected-work');
  const work = page.locator('#selected-work');

  await expect(work.getByRole('heading', { level: 3, name: 'Kinema' })).toBeVisible();
  await work.getByRole('button', { name: /NEAR/ }).click();
  await expect(page).toHaveURL(/work=kinema&distance=near/);
  await expect(work.getByText(/Players move through a procedural showcase/)).toBeVisible();

  await work.getByRole('link', { name: /Web Ocean 3D/ }).click();
  await expect(page).toHaveURL(/work=web-ocean-3d&distance=near/);
  await expect(work.getByRole('heading', { level: 3, name: 'Web Ocean 3D' })).toBeVisible();
});

test('selected-work media stays inside the desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#selected-work');
  const panel = page.locator('#selected-work [data-distance-panel="out"]:visible').first();
  const figure = await panel.locator('figure').boundingBox();

  expect(figure).not.toBeNull();
  expect((figure?.x ?? 0) + (figure?.width ?? 0)).toBeLessThanOrEqual(1280);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
});

test('the authored defense systems map remains fully legible in the Career Atlas', async ({ page }) => {
  await page.goto('/?career=defense-simulation-systems#career-atlas');

  const fit = await page.locator('.career-atlas__panel[data-slug="defense-simulation-systems"] img').evaluate((image) =>
    getComputedStyle(image).objectFit,
  );
  expect(fit).toBe('contain');
});

test('the longest selected-work title stays inside a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/#selected-work');

  const title = await page.locator('[data-work-project="blocks-inco-ai"] .project__header h3').boundingBox();
  expect(title).not.toBeNull();
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

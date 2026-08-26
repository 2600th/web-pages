import { expect, test } from '@playwright/test';

test('first viewport identifies Pranshul, the work, and the next action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.locator('.hero__positioning').getByText(/fifteen years.*games.*AI/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discuss an opportunity' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the Career Atlas' })).toHaveAttribute('href', '#career-atlas');
});

test('the homepage names four compound practice pillars', async ({ page }) => {
  await page.goto('/#selected-work');
  const pillars = page.getByRole('navigation', { name: 'Compound practice pillars' });

  for (const label of ['Production AI', 'Design Technology', 'Immersive Systems', 'Browser-native Lab']) {
    await expect(pillars.getByRole('link', { name: new RegExp(`^${label}`, 'i') })).toBeVisible();
  }
});

test('Proof in motion leads with authentic media and responsible video', async ({ page }) => {
  await page.goto('/#proof-in-motion');
  const proof = page.locator('#proof-in-motion');

  await expect(proof.getByRole('heading', { level: 2, name: /Systems you can see moving/i })).toBeVisible();
  await expect(proof.locator('figure')).toHaveCount(7);
  await expect(proof.locator('figure > a')).toHaveCount(7);
  await expect(proof.locator('img')).toHaveCount(5);
  await expect(proof.locator('video')).toHaveCount(2);
  await expect(proof.getByText(/Editorial illustration · Simulation systems/i)).toBeVisible();
  await expect(proof.getByRole('link', { name: /View Defense technology case study/i })).toHaveAttribute(
    'href',
    '/work/defense-simulation-systems/',
  );

  for (const video of await proof.locator('video').all()) {
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', /\/media\/career\//);
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

  await expect(proof.getByText(/Footage is muted/i)).toBeVisible();
});

test('Proof in motion falls back to still frames when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#proof-in-motion');
  const videos = page.locator('#proof-in-motion video');
  const motionToggle = page.getByRole('button', { name: 'Motion playback' });

  await expect(videos).toHaveCount(2);
  await expect(motionToggle).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => videos.evaluateAll((elements) =>
    elements.every((element) => (element as HTMLVideoElement).paused),
  )).toBe(true);
});

test('the identity and conversion path remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discuss an opportunity' }).first()).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(page.locator('.career-atlas__index').getByRole('link', { name: 'Kinema' })).toHaveAttribute('href', '/work/kinema/');
  await expect(page.getByRole('link', { name: /The Brutal Spy/ })).toHaveAttribute('href', '/work/the-brutal-spy/');
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

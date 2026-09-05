import { expect, test } from '@playwright/test';

test('archive links announce the title without the whole project description', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.locator('[data-work-item] > a').first()).toHaveAccessibleName('Blocks');
});

test('project opening keeps identity, metadata, and media in one compact desktop group', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/blocks/');

  const opening = page.locator('[data-project-opening]');
  const copy = opening.locator('[data-project-opening-copy]');
  const media = opening.locator('.case-hero__media');
  const [openingBox, copyBox, mediaBox] = await Promise.all([
    opening.boundingBox(),
    copy.boundingBox(),
    media.boundingBox(),
  ]);

  expect(openingBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  expect(openingBox!.height).toBeLessThan(760);
  expect(copyBox!.x + copyBox!.width).toBeLessThanOrEqual(mediaBox!.x + 2);
  expect(Math.abs(copyBox!.y - mediaBox!.y)).toBeLessThan(4);
  await expect(copy.getByRole('heading', { level: 1, name: 'Blocks' })).toHaveCount(1);
  await expect(copy.locator('.case-hero__summary')).toBeVisible();
  await expect(copy.locator('.case-hero__meta')).toBeVisible();
});

test('project reading stacks cleanly on mobile and keeps the complete story close to the opening', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/work/blocks/');

  const opening = page.locator('[data-project-opening]');
  const copyBox = await opening.locator('[data-project-opening-copy]').boundingBox();
  const mediaBox = await opening.locator('.case-hero__media').boundingBox();
  const storyBox = await page.locator('[data-project-reading]').boundingBox();

  expect(copyBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  expect(storyBox).not.toBeNull();
  expect(mediaBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height - 2);
  expect(storyBox!.y).toBeLessThan(1400);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('long project narratives use a bounded reading measure and native section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/blocks/');

  const reading = page.locator('[data-project-reading]');
  const prose = reading.locator('.prose');
  expect((await reading.boundingBox())!.width).toBeLessThanOrEqual(1160);
  const proseBox = (await prose.boundingBox())!;
  expect(proseBox.width).toBeGreaterThanOrEqual(600);
  expect(proseBox.width).toBeLessThanOrEqual(850);
  expect(await reading.locator('.project-story__frame').first().evaluate((frame) => getComputedStyle(frame).gridTemplateColumns.split(' ').length)).toBe(1);

  const narrativeHeading = prose.getByRole('heading', { level: 2 }).first();
  expect(Number.parseFloat(await narrativeHeading.evaluate((heading) => getComputedStyle(heading).fontSize))).toBeLessThanOrEqual(34);

  const contents = page.getByRole('navigation', { name: 'On this page' });
  await expect(contents.getByRole('link', { name: 'The operational problem' })).toHaveAttribute('href', '#the-operational-problem');
  await contents.getByRole('link', { name: 'Follow one cabinet change' }).click();
  await expect(page).toHaveURL(/#follow-one-cabinet-change$/);
  await expect(page.locator('#follow-one-cabinet-change')).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 900 });
  const disclosure = page.locator('[data-project-contents]');
  await expect(disclosure).toHaveJSProperty('open', true);
  await disclosure.getByText('On this page', { exact: true }).click();
  await expect(disclosure).toHaveJSProperty('open', false);
});

test('project opening keeps its evidence caption visible below the image', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/blocks/');

  const media = page.locator('[data-project-opening] .case-hero__media');
  const image = media.locator('img');
  const caption = media.locator('figcaption');
  const [mediaBox, imageBox, captionBox] = await Promise.all([
    media.boundingBox(),
    image.boundingBox(),
    caption.boundingBox(),
  ]);

  await expect(caption).toBeVisible();
  expect(captionBox!.y).toBeGreaterThanOrEqual(imageBox!.y + imageBox!.height - 2);
  expect(captionBox!.y + captionBox!.height).toBeLessThanOrEqual(mediaBox!.y + mediaBox!.height + 2);
});

test('project contents links reuse the rendered IDs for punctuated headings without collisions', async ({ page }) => {
  await page.goto('/work/propvr-ai-craft/');

  const links = page.getByRole('navigation', { name: 'On this page' }).getByRole('link');
  const hrefs = await links.evaluateAll((items) => items.map((item) => item.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(2);
  expect(new Set(hrefs).size).toBe(hrefs.length);

  for (const href of hrefs) {
    expect(href).toMatch(/^#[a-z0-9-]+$/);
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await expect(links.getByText('A tool contract, reconstructed', { exact: true })).toHaveAttribute(
    'href',
    '#a-tool-contract-reconstructed',
  );
});

test('mobile Work opening reaches the domain filter within the opening screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/work/');
  await expect(page.locator('[data-work-opening-media]')).toHaveCount(0);
  const filter = (await page.getByLabel('Choose a work domain').boundingBox())!;
  expect(filter.y + filter.height).toBeLessThan(900);
});

test('long Notes offer working section navigation without adding it to short field notes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/notes/ai-floorplan-parsing/');
  await page.getByText('On this page', { exact: true }).click();
  const link = page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Resume needs identity, not just a file' });
  await link.click();
  await expect(page).toHaveURL(/#resume-needs-identity-not-just-a-file$/);
  await expect(page.locator('#resume-needs-identity-not-just-a-file')).toBeInViewport();
  await page.goto('/notes/browser-flight-experiment/');
  await expect(page.getByText('On this page', { exact: true })).toHaveCount(0);
});

test('mobile Note comparisons preserve headers and can be scrolled using the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/notes/ai-floorplan-parsing/');
  const region = page.locator('.prose .table-scroll').first();
  await expect(region).toHaveAttribute('role', 'region');
  await expect(region).toHaveAccessibleName(/.+/);
  await expect(region.getByRole('columnheader')).toHaveCount(3);
  expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await region.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Lab experiments separate launching, reading, and source actions', async ({ page }) => {
  await page.goto('/lab/');
  for (const [title, demo, source] of [
    ['Kinema', 'https://kinema-play.vercel.app/', 'https://github.com/2600th/Kinema'],
    ['Web Ocean 3D', 'https://web-ocean-3d.vercel.app/', 'https://github.com/2600th/web-ocean-3d'],
    ['Safed Sagar', 'https://oss-web-3d.vercel.app/', 'https://github.com/2600th/oss-web-3d'],
  ]) {
    const row = page.locator('[data-build-row]').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(row.getByRole('link', { name: 'Launch demo' })).toHaveAttribute('href', demo);
    await expect(row.getByRole('link', { name: 'Read the build' })).toHaveAttribute('href', /\/work\//);
    await expect(row.getByRole('link', { name: /^Source/ })).toHaveAttribute('href', source);
  }
});

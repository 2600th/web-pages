import { expect, test } from '@playwright/test';

test('each page has one contact invitation instead of two consecutive closings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/about/', '/work/', '/notes/', '/work/alphaman/', '/lab/']) {
    await page.goto(route);
    await expect(page.getByRole('link', { name: /compare notes|Email me|Say hello/i }), route).toHaveCount(1);
    await expect(page.locator('#contact'), route).toHaveCount(1);
  }
});

test('the shared contact invitation opens a direct email without a homepage detour', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('link', { name: 'Let’s compare notes', exact: true })).toHaveAttribute('href', 'mailto:2600th@gmail.com');
  await expect(page.locator('#contact')).toHaveCount(1);
});

test('footer links remain distinct touch targets on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link');
  for (const link of await links.all()) {
    const box = await link.boundingBox();
    expect(box!.width, await link.innerText()).toBeGreaterThanOrEqual(44);
    expect(box!.height, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
  const email = await page.locator('.site-footer__contact a').boundingBox();
  expect(email!.height, 'Footer email').toBeGreaterThanOrEqual(44);
});

test('work listings follow the chronological order they promise', async ({ page }) => {
  for (const route of ['/work/?order=chronological']) {
    await page.goto(route);
    const labels = await page.locator('.work-list__meta').allTextContents();
    const years = labels.map((label) => Number.parseInt(label, 10));
    expect(years.length).toBeGreaterThan(1);
    for (let index = 1; index < years.length; index += 1) {
      expect(years[index], `${route}: ${labels[index]}`).toBeGreaterThanOrEqual(years[index - 1]);
    }
  }
});

test('the single contact destination remains keyboard-accessible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/work/`);
    const talk = page.getByRole('link', { name: 'Let’s compare notes', exact: true });
    await talk.focus();
    await expect(talk).toBeFocused();
    await expect(talk).toHaveAttribute('href', 'mailto:2600th@gmail.com');
  } finally {
    await context.close();
  }
});

test('career links remain available before scroll-reveal animation runs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about/');
  await expect(page.locator('[data-operating-dossier]')).toHaveAttribute('data-motion-state', 'enhanced');
  const careerLinks = page.locator('.career-acts li a');
  await expect(careerLinks).toHaveCount(10);
  for (const link of await careerLinks.all()) await expect(link).toBeVisible();

  // Walk from the final primary-nav item, without scrolling the career section first.
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'About', exact: true }).focus();
  for (const link of await careerLinks.all()) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
  }
});

test('the floating up arrow does not cover the work archive action', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const action = page.getByRole('link', { name: 'View all projects' });
  await action.evaluate((element) => {
    const box = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + box.bottom - window.innerHeight + 24);
  });
  const arrow = page.getByRole('link', { name: 'Back to top', exact: true });
  await expect(arrow).toBeInViewport();
  const targetBox = (await action.boundingBox())!;
  const arrowBox = (await arrow.boundingBox())!;
  expect(targetBox.x + targetBox.width).toBeLessThanOrEqual(arrowBox.x - 8);
});

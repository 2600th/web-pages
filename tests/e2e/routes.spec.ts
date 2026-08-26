import { expect, test } from '@playwright/test';

const routeCases = [
  ['/work/', 'Selected work'],
  ['/work/kinema/', 'Kinema'],
  ['/notes/', 'Notes from the workbench'],
  ['/notes/ai-video-control/', 'In AI video, control is becoming the moat'],
  ['/about/', 'Operator, advisor, builder'],
  ['/lab/', 'Experiments with a public edge'],
] as const;

for (const [path, heading] of routeCases) {
  test(`${path} has one useful primary heading and canonical metadata`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    // Scope to site content because Astro's development toolbar has its own shadow-DOM headings.
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://www.2600th.com${path}`,
    );
    await expect(page).toHaveTitle(/Pranshul Chandhok/);
  });
}

test('work detail exposes evidence and CreativeWork structured data', async ({ page }) => {
  await page.goto('/work/kinema/');

  await expect(page.getByRole('heading', { name: 'Public evidence' })).toBeVisible();
  await expect(page.getByRole('link', { name: /GitHub repository/ })).toHaveAttribute(
    'href',
    'https://github.com/2600th/Kinema',
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('CreativeWork');
  expect(jsonLd).toContain('Kinema');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});

test('note detail exposes article metadata and original source attribution', async ({ page }) => {
  await page.goto('/notes/ai-video-control/');

  await expect(page.getByText(/Adapted from an authored X post/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Read the original post/ })).toHaveAttribute(
    'href',
    'https://x.com/2600th/status/2091937799310393656',
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('Article');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});

test('unknown routes provide a useful return path', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: /not found/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Return home/i })).toHaveAttribute('href', '/');
});

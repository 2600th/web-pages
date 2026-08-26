import { expect, test } from '@playwright/test';

test('the original console is preserved as a noindex archive', async ({ page }) => {
  // Astro dev serves raw public HTML by filename; static hosts resolve the directory index.
  const response = await page.goto('/lab/terminal/index.html');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('2600th v1 — Console Archive');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await expect(page.getByRole('heading', { level: 1, name: '2600TH' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Pranshul Chandhok' })).toHaveAttribute(
    'href',
    '/',
  );
});

test('the archived console keeps its local runtime assets', async ({ request }) => {
  for (const asset of ['style.css', 'script.js', 'pingpong.js', 'my_font.ttf', 'favicon.ico']) {
    const response = await request.get(`/lab/terminal/${asset}`);
    expect(response.status(), asset).toBe(200);
    expect((await response.body()).byteLength, asset).toBeGreaterThan(500);
  }
});

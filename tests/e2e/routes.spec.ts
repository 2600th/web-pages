import { expect, test } from '@playwright/test';

const routeCases = [
  ['/work/', 'Career work'],
  ['/work/kinema/', 'Kinema'],
  ['/work/defense-simulation-systems/', 'Defense technology and simulation'],
  ['/notes/', 'Notes from the workbench'],
  ['/notes/ai-video-control/', 'In AI video, control is becoming the moat'],
  ['/about/', 'Three acts. One operating instinct.'],
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

test('work archive groups records by domain and supports link filters', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByRole('heading', { name: 'Games', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Applied AI', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'XR and spatial computing', exact: true }).first().click();
  await expect(page).toHaveURL(/domain=xr/);
  await expect(page.getByRole('link', { name: /IRA VR/ })).toBeVisible();
});

test('evidence notes render without empty case-study sections', async ({ page }) => {
  await page.goto('/work/the-brutal-spy/');
  await expect(page.getByRole('heading', { name: 'The Brutal Spy', level: 1 })).toBeVisible();
  await expect(page.getByText(/public career narrative/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside' })).toHaveCount(0);
});

test('defense work names the full program and systems contribution', async ({ page }) => {
  await page.goto('/work/defense-simulation-systems/');

  const defenseRecord = await page.locator('main').textContent();
  for (const program of ['BLT T-72', 'Tunguska', 'LLLR', 'M777', 'T-90', 'Advanced Mannequin System', 'Radio Telephony', 'Tata Safari']) {
    expect(defenseRecord).toContain(program);
  }
  expect(defenseRecord).toMatch(/custom hardware[\s\S]*IMU[\s\S]*sensor[\s\S]*instructor[\s\S]*evaluation/i);
  await expect(page.locator('.project-media figcaption')).toHaveText('Editorial illustration');
  await expect(page.locator('a[href*="drive.google.com"], a[href*="docs.google.com"]')).toHaveCount(0);
});

test('enterprise immersive work includes the wider client and domain record', async ({ page }) => {
  await page.goto('/work/enterprise-immersive-systems/');

  const enterpriseRecord = await page.locator('main').textContent();
  expect(enterpriseRecord).toMatch(/Sight Savers[\s\S]*Voxel/i);
  expect(enterpriseRecord).toMatch(/maritime[\s\S]*accessibility[\s\S]*analytics[\s\S]*production-facility/i);
});

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

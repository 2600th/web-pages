import { expect, test } from '@playwright/test';

test('homepage heading preserves word boundaries in text extraction', async ({ page }) => {
  await page.goto('/');
  expect((await page.locator('#velvet-title').textContent())?.replace(/\s+/g, ' ').trim()).toBe('Make the uncertain operable.');
});

test('Work labels do not repeat the year and editorial order survives chronological sorting', async ({ page }) => {
  await page.goto('/work/');
  const links = page.locator('[data-work-item] > a');
  const slugs = await links.evaluateAll(items => items.map(item => item.getAttribute('href')));
  const safedSagarIndex = slugs.indexOf('/work/safed-sagar/');
  expect(slugs.slice(safedSagarIndex, safedSagarIndex + 3)).toEqual(['/work/safed-sagar/', '/work/little-wonder/', '/work/ai-native-game-thesis/']);
  const labels = await page.locator('.work-list__meta').allTextContents();
  for (const label of labels) {
    const years = label.match(/\b(?:19|20)\d{2}\b/g) ?? [];
    expect(new Set(years).size, label).toBe(years.length);
  }
  await page.getByLabel('Project order').selectOption('chronological');
  await expect(links.first()).toHaveAttribute('href', '/work/the-brutal-spy/');
  await page.getByLabel('Project order').selectOption('priority');
  expect(await links.evaluateAll(items => items.map(item => item.getAttribute('href')))).toEqual(slugs);
});

test('Work gallery features Blocks with Designesto and IRA VR using loaded responsive images', async ({ page }) => {
  await page.goto('/work/');
  expect(await page.locator('[data-gallery-role="lead"], [data-gallery-role="support"]').evaluateAll(items => items.map(item => item.querySelector('a')?.getAttribute('href')))).toEqual([
    '/work/blocks/', '/work/designesto/', '/work/ira-vr/',
  ]);
  const images = page.locator('[data-gallery-role="lead"] img, [data-gallery-role="support"] img');
  await images.last().scrollIntoViewIfNeeded();
  expect(await images.evaluateAll(items => items.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
});

test('Craft keeps one scope comparison and distinguishes live tools from early access', async ({ page }) => {
  await page.goto('/work/propvr-ai-craft/');
  const section = page.getByRole('region', { name: 'From an internal foundation to Craft' });
  await expect(section.getByRole('table')).toHaveCount(1);
  await expect(section.getByRole('list', { name: 'Product evolution' })).toHaveCount(1);
  await expect(section).toContainText('30+ production tools live across six studios');
  await expect(section).toContainText('Agentic 1.0 and Arc 1.0 are in early access');
  await expect(page.getByText('Initial PropVR AI MVP: Pranshul Chandhok. Current Craft platform: PropVR Technology team.', { exact: true })).toHaveCount(1);
});

test('article figures expose separate texture and download budgets and the ordered floorplan stages', async ({ page }) => {
  await page.goto('/notes/ocean-reliability/');
  const budgets = page.locator('figure[data-ocean-budgets]');
  await expect(budgets).toContainText('762.3 MiB');
  await expect(budgets).toContainText('79.9 MiB');
  await expect(budgets).toContainText('33.7 MiB');
  await expect(budgets).toContainText('40.7 MiB');
  await expect(budgets.locator('[data-budget-panel]')).toHaveCount(2);
  await expect(page.locator('.prose figure img')).toHaveCount(1);
  await page.goto('/notes/ai-floorplan-parsing/');
  const flow = page.locator('figure[data-stage-flow]');
  await expect(flow.getByRole('listitem')).toHaveCount(7);
  await expect(flow.locator('figcaption')).toContainText('Simplified stage dependency');
});

test('conventional sitemap URL exposes the canonical sitemap index', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');
  expect(await response.text()).toContain('https://www.2600th.com/sitemap-0.xml');
});

test('GreyKernel portfolio keeps project names intact on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/work/greykernel/');
  const name = page.locator('.prose table a').filter({ hasText: 'MysticMojo' });
  expect(await name.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  })).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

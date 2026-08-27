import { expect, test } from '@playwright/test';

const workSlugs = [
  'ai-native-game-thesis',
  'alphaman',
  'blocks-inco-ai',
  'defense-simulation-systems',
  'enterprise-immersive-systems',
  'greykernel',
  'homelane-spacecraft-pro',
  'humanoid-robot-control-system',
  'ira-vr',
  'kinema',
  'little-wonder',
  'machine-hunter',
  'merkur-magie',
  'mysticmojo',
  'safed-sagar',
  'the-brutal-spy',
  'web-ocean-3d',
] as const;

const noteSlugs = [
  'ai-native-game-development-reflection',
  'ai-video-control',
  'technology-and-human-agency',
  'from-pixels-to-intelligent-systems',
  'ocean-reliability',
  'browser-flight-experiment',
] as const;

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
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://www.2600th.com${path}`,
    );
    await expect(page).toHaveTitle(/Pranshul Chandhok/);
  });
}

test('every console archive link uses an explicit file URL and serves the archive', async ({ page, request }) => {
  for (const [path, expectedCount] of [['/', 2], ['/lab/', 2]] as const) {
    await page.goto(path);
    const archiveLinks = page.locator('a[href*="/lab/terminal/"]');
    await expect(archiveLinks).toHaveCount(expectedCount);
    for (const archiveLink of await archiveLinks.all()) {
      await expect(archiveLink).toHaveAttribute('href', '/lab/terminal/index.html');
    }
  }

  const response = await request.get('/lab/terminal/index.html');
  expect(response.status()).toBe(200);
});

test('the archive return action stays in mobile flow instead of covering the console', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/terminal/index.html');

  const returnAction = page.locator('.archive-return');
  await expect(returnAction).toBeVisible();
  await expect.poll(() => returnAction.evaluate((element) => getComputedStyle(element).position)).not.toBe('fixed');

  const actionBox = await returnAction.boundingBox();
  const firstPanel = await page.locator('.terminal-screen').boundingBox();
  expect(actionBox).not.toBeNull();
  expect(firstPanel).not.toBeNull();
  const actionBottom = (actionBox?.y ?? 0) + (actionBox?.height ?? Number.POSITIVE_INFINITY);
  expect(actionBottom).toBeLessThanOrEqual((firstPanel?.y ?? 0) + 80);
});

test('work index exposes all 17 records as one inspectable route list', async ({ page }) => {
  await page.goto('/work/');

  const records = page.locator('[data-work-item]');
  await expect(records).toHaveCount(workSlugs.length);
  const hrefs = await records.locator('a').evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
  expect(new Set(hrefs).size).toBe(workSlugs.length);
  for (const slug of workSlugs) expect(hrefs).toContain(`/work/${slug}/`);
});

test('every work domain filter returns its complete subset', async ({ page }) => {
  const expectedCounts = {
    all: 17,
    games: 9,
    xr: 6,
    simulation: 6,
    robotics: 2,
    'design-tech': 2,
    'applied-ai': 3,
  } as const;

  for (const [domain, count] of Object.entries(expectedCounts)) {
    await page.goto(domain === 'all' ? '/work/' : `/work/?domain=${domain}`);
    await expect(page.locator('[data-work-item]:visible')).toHaveCount(count);
    await expect(page.locator('[data-work-status]')).toContainText(`${count} ${Number(count) === 1 ? 'project' : 'projects'}`);
  }
});

test('interior route openings use split typography without generated apertures', async ({ page }) => {
  for (const path of ['/work/', '/notes/', '/about/', '/lab/', '/this-route-does-not-exist/']) {
    await page.goto(path);
    const opening = page.locator('[data-route-opening]');
    await expect(opening).toHaveCount(1);
    await expect(opening.locator('[data-polarity="positive"]')).toHaveCount(1);
    await expect(opening.locator('[data-polarity="negative"]')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('img[src*="/media/generated/editorial/"]')).toHaveCount(0);

    const colors = await opening.evaluate((element) => {
      const positive = element.querySelector('[data-polarity="positive"]');
      const negative = element.querySelector('[data-polarity="negative"]');
      return {
        positive: positive ? getComputedStyle(positive).backgroundColor : '',
        negative: negative ? getComputedStyle(negative).backgroundColor : '',
      };
    });
    expect(colors.positive).not.toBe(colors.negative);
  }
});

test('case detail is organized as thesis, contribution, system, evidence, and sources', async ({ page }) => {
  await page.goto('/work/kinema/');

  for (const part of ['thesis', 'contribution', 'system', 'evidence', 'sources']) {
    await expect(page.locator(`[data-case-part="${part}"]`)).toHaveCount(1);
  }
  await expect(page.locator('[data-case-part="evidence"]')).toContainText('Evidence record');
  await expect(page.getByRole('heading', { name: 'Public evidence' })).toBeVisible();
  await expect(page.locator('[data-evidence-surface]')).toHaveCount(1);

  const evidenceSurface = page.locator('[data-evidence-surface]');
  expect(await evidenceSurface.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgb(36, 87, 255)');
});

test('all six note routes remain reading surfaces with original-source links', async ({ page }) => {
  await page.goto('/notes/');
  await expect(page.locator('.notes-list > li')).toHaveCount(noteSlugs.length);

  for (const slug of noteSlugs) {
    await page.goto(`/notes/${slug}/`);
    await expect(page.locator('[data-reading-surface]')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.article-shell__source a')).toHaveCount(1);
  }
});

test('lab and about expose their operating surfaces', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.locator('[data-build-ledger]')).toHaveCount(1);
  await expect(page.locator('[data-build-ledger] [data-build-row]')).toHaveCount(5);
  await expect(page.locator('a[href="/lab/terminal/index.html"]')).toHaveCount(2);

  await page.goto('/about/');
  await expect(page.locator('[data-operating-dossier]')).toHaveCount(1);
  await expect(page.locator('[data-operating-dossier] .career-acts li')).toHaveCount(3);
});

test('work archive renders one canonical list and supports link filters', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByText('17 public records')).toBeVisible();
  await expect(page.locator('[data-work-item]')).toHaveCount(17);
  await page.getByRole('link', { name: 'XR and spatial computing', exact: true }).first().click();
  await expect(page).toHaveURL(/\/work\/domain\/xr\/$/);
  await expect(page.getByRole('link', { name: /IRA VR/ })).toBeVisible();
  await expect(page.locator('[data-work-item]:visible')).toHaveCount(6);
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
  for (const program of ['BLT T-72', 'Tunguska', 'LLLR', 'M777', 'T-90', 'Advanced Mannequin System', 'Radio Telephony']) {
    expect(defenseRecord).toContain(program);
  }
  expect(defenseRecord).not.toContain('Tata Safari');
  expect(defenseRecord).toMatch(/custom hardware[\s\S]*IMU[\s\S]*sensor[\s\S]*instructor[\s\S]*evaluation/i);
  await expect(page.locator('.project-media figcaption')).toContainText('not client documentation');
  await expect(page.locator('a[href*="drive.google.com"], a[href*="docs.google.com"]')).toHaveCount(0);
});

test('enterprise immersive work includes the wider client and domain record', async ({ page }) => {
  await page.goto('/work/enterprise-immersive-systems/');

  const enterpriseRecord = await page.locator('main').textContent();
  expect(enterpriseRecord).toMatch(/JPMorgan Chase[\s\S]*Anglian Water[\s\S]*Voxel Worlds VR/i);
  expect(enterpriseRecord).toMatch(/Myntra[\s\S]*stronger public scope record/i);
  expect(enterpriseRecord).toMatch(/Cycling Without Age Singapore[\s\S]*Swissôtel/i);
  expect(enterpriseRecord).toMatch(/maritime/i);
  expect(enterpriseRecord).toMatch(/automotive|technical-learning/i);
  expect(enterpriseRecord).toMatch(/production-facility/i);
  await expect(page.getByRole('heading', { name: 'Privately reviewed evidence' })).toBeVisible();
  await expect(page.getByText(/VR (?:and|\/) 360 Video Production — Boston/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Public corroboration' })).toBeVisible();
});

test('MysticMojo record includes Nazara and the Chhota Bheem flying-game concept', async ({ page }) => {
  await page.goto('/work/mysticmojo/');

  const record = await page.locator('main').textContent();
  expect(record).toMatch(/Nazara[\s\S]*Chhota Bheem Jungle Rescue[\s\S]*Google Play[\s\S]*plane[\s\S]*water/i);
  await expect(page.getByRole('img', { name: /Chhota Bheem Jungle Rescue/ })).toHaveAttribute(
    'src',
    '/media/career/chhota-bheem-jungle-rescue/concept-screens.webp',
  );
  await expect(page.getByRole('link', { name: /public gameplay/i })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=0c2jPM_p5_M');
  await expect(page.getByText('Chhota Bheem Jungle Rescue — Live')).toBeVisible();
});

test('work detail exposes evidence and CreativeWork structured data', async ({ page }) => {
  await page.goto('/work/kinema/');

  await expect(page.getByRole('heading', { name: 'Public evidence' })).toBeVisible();
  await expect(page.getByRole('link', { name: /GitHub repository/ })).toHaveAttribute(
    'href',
    'https://github.com/2600th/Kinema',
  );
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '[]');
  const creativeWork = jsonLd.find((entry: { '@type'?: string }) => entry['@type'] === 'CreativeWork');
  expect(creativeWork.name).toBe('Kinema');
  expect(creativeWork.citation).toContain('https://github.com/2600th/Kinema');
  expect(creativeWork.sameAs).toBeUndefined();
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

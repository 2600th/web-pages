import { expect, test } from '@playwright/test';

for (const domain of ['all', 'unknown']) {
  test(`Work chronological caption follows the resolved ${domain} domain`, async ({ page }) => {
    await page.goto(`/work/?domain=${domain}&order=chronological`);
    await expect(page.locator('[data-work-item] > a').first()).toHaveAttribute('href', '/work/the-brutal-spy/');
    await expect(page.locator('[data-work-description]')).toHaveText('From the earliest projects to current work.');
    await page.getByLabel('Project order').selectOption('priority');
    await expect(page.locator('[data-work-description]')).toHaveText('Selected systems first, followed by the earlier archive.');
  });
}

test('primary navigation reaches each section and marks only the current section', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Work', 'Notes', 'Lab', 'About']);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Home');
  await nav.getByRole('link', { name: 'Notes', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/notes\/$/);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Notes');
});

test('home provides two actions and proof links directly after the hero', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.velvet-hero');
  await expect(hero.getByRole('link')).toHaveCount(2);
  await expect(hero.getByRole('link', { name: 'View selected work' })).toHaveAttribute('href', '#selected-work');
  await expect(hero.getByRole('link', { name: 'Read technical notes' })).toHaveAttribute('href', '/notes/');
  const proof = page.getByRole('region', { name: 'Experience at a glance' });
  expect(await page.locator('main > section').evaluateAll(sections => sections.slice(0, 2).map(section => section.className))).toEqual(['velvet-hero', 'home-proof']);
  await expect(proof.getByRole('listitem')).toHaveCount(4);
  await expect(proof.getByRole('link', { name: /Patent co-inventor/ })).toHaveAttribute('href', '/work/humanoid-robot-control-system/');
  await expect(proof.getByRole('link', { name: /Still shipping/ })).toHaveAttribute('href', '/lab/');
});

test('home selects five distinct projects without attributing invented motion to Craft', async ({ page }) => {
  await page.goto('/');
  const cases = page.locator('[data-case-slug]');
  expect(await cases.evaluateAll(items => items.map(item => item.getAttribute('data-case-slug')))).toEqual([
    'blocks', 'designesto', 'propvr-ai-craft', 'homelane-spacecraft-pro', 'enterprise-immersive-systems',
  ]);
  const craft = page.locator('[data-case-slug="propvr-ai-craft"]');
  await expect(craft.locator('img')).toBeVisible();
  await expect(craft.locator('video, [data-signal-motion-toggle]')).toHaveCount(0);
  await expect(page.locator('a[href="/work/blocks-inco-ai/"]')).toHaveCount(0);
  const videoCase = page.locator('[data-case-slug="designesto"]');
  await videoCase.getByRole('button', { name: /Play Designesto/ }).click();
  await expect(videoCase.getByRole('button', { name: /Pause Designesto/ })).toHaveAttribute('aria-pressed', 'true');
});

test('home shows one current published item from each Writing type and keeps one thesis and shared contact', async ({ page }) => {
  await page.goto('/');
  const writing = page.getByRole('region', { name: 'Writing' });
  await expect(writing.locator('article')).toHaveCount(3);
  await expect(writing.locator('time[datetime]')).toHaveCount(3);
  expect((await writing.locator('.home-notes__meta > span:first-child').allTextContents()).sort()).toEqual(['Essay', 'Field Note', 'Technical Teardown']);
  await expect(page.getByRole('heading', { name: 'Generation is the demo. The workflow is the product.' })).toHaveCount(1);
  await expect(page.locator('#contact')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Let’s compare notes', exact: true })).toHaveCount(1);
});

test('Work excludes compatibility records and supports priority and chronological exploration', async ({ page }) => {
  await page.goto('/work/');
  const items = page.locator('[data-work-item] > a');
  await expect(items).toHaveCount(19);
  expect((await items.evaluateAll(links => links.map(link => link.getAttribute('href')))).slice(0, 10)).toEqual([
    '/work/blocks/', '/work/designesto/', '/work/propvr-ai-craft/', '/work/homelane-spacecraft-pro/', '/work/greykernel/',
    '/work/enterprise-immersive-systems/', '/work/humanoid-robot-control-system/', '/work/web-ocean-3d/', '/work/kinema/', '/work/safed-sagar/',
  ]);
  await page.getByLabel('Project order').selectOption('chronological');
  await expect(items.first()).toHaveAttribute('href', '/work/the-brutal-spy/');
  await page.getByLabel('Project order').selectOption('priority');
  await expect(items.first()).toHaveAttribute('href', '/work/blocks/');
  await page.goto('/work/domain/design-tech/');
  await expect(page.locator('[data-work-item] a[href="/work/blocks-inco-ai/"]')).toHaveCount(0);
  await expect(page.locator('[data-work-item]')).toHaveCount(4);
});

test('About explains contribution boundaries and connects verified tools to public work', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByText('2600th is an old handle from my college-era interest in hacker and phreaking culture. It stuck.', { exact: true })).toHaveCount(1);
  const tools = page.getByRole('region', { name: 'Tools in use.' });
  await expect(tools.getByRole('link', { name: /Web Ocean 3D/ })).toHaveAttribute('href', '/work/web-ocean-3d/');
  await expect(tools.getByRole('link', { name: /Kinema/ })).toHaveAttribute('href', '/work/kinema/');
  await expect(page.locator('main')).not.toContainText('PlayCanvas');
  await expect(page.locator('main')).not.toContainText('AgentSkills');
  await expect(page.locator('#contact')).toHaveCount(1);
});

test('home titles, actions and navigation remain contained across narrow and wide viewports', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const selectors = '.velvet-hero h1, .velvet-hero__identity, .velvet-hero__thesis, .velvet-hero__actions, .velvet-case h3, .site-nav';
      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        outside: [...document.querySelectorAll(selectors)].filter(element => {
          const box = element.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          return box.left < -1 || box.right > window.innerWidth + 1 || range.getBoundingClientRect().right > box.right + 1;
        }).map(element => element.textContent),
      };
    });
    expect(layout.scrollWidth, `page at ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(layout.outside, `contained text at ${width}px`).toEqual([]);
  }
});

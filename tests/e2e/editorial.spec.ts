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
  await page.goto('/about/');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Work', 'Notes', 'Lab', 'About']);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('About');
  await nav.getByRole('link', { name: 'Notes', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/notes\/$/);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Notes');
});

test('Work excludes compatibility records and supports priority and chronological exploration', async ({ page }) => {
  await page.goto('/work/');
  const items = page.locator('[data-work-item] > a');
  await expect(items).toHaveCount(19);
  expect((await items.evaluateAll(links => links.map(link => link.getAttribute('href')))).slice(0, 10)).toEqual([
    '/work/blocks/', '/work/designesto/', '/work/ira-vr/', '/work/propvr-ai-craft/', '/work/homelane-spacecraft-pro/',
    '/work/greykernel/', '/work/enterprise-immersive-systems/', '/work/humanoid-robot-control-system/', '/work/web-ocean-3d/', '/work/kinema/',
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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const selectors = '.sg-hero h1, .sg-kicker, .sg-lede, .sg-actions, .sg-line__title, .sg-build strong, .sg-mark, .sg-nav';
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

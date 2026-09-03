import { expect, test } from '@playwright/test';

const path = '/notes/ai-native-game-development-three-years-later/';

test('the reassessment is discoverable without replacing the historical essay or Field Note', async ({ page, request }) => {
  await page.goto('/work/ai-native-game-thesis/');
  const sources = page.locator('[data-project-sources]');
  const followUp = sources.getByRole('link', { name: /AI-native game development, three years later/ });
  await expect(followUp).toHaveAttribute('href', `https://www.2600th.com${path}`);
  await expect(followUp).toContainText('2026 follow-up');
  await expect(sources.locator('a[href="https://2600th.substack.com/p/revolutionizing-realms-how-ai-is"]')).toHaveCount(1);
  await page.goto('/notes/ai-native-game-development-reflection/');
  await expect(page.getByRole('link', { name: 'longer 2026 reassessment' })).toHaveAttribute('href', path);
  await expect(page.locator('.article-shell__meta time').first()).toHaveAttribute('datetime', '2026-08-22T00:00:00.000Z');
  await page.goto('/notes/');
  await page.getByRole('link', { name: /AI-native game development, three years later/ }).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.2600th.com${path}`);
  await expect(page.locator('.article-shell__source a')).toHaveCount(0);
  const feed = await request.get('/rss.xml');
  expect(await feed.text()).toContain(`https://www.2600th.com${path}`);
  const llms = await request.get('/llms.txt');
  expect(await llms.text()).toContain(`https://www.2600th.com${path}`);
});

test('the source description and scorecard remain readable across review widths', async ({ page }) => {
  for (const width of [360, 768, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('.prose table')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/work/ai-native-game-thesis/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('[data-project-sources]')).toContainText('My 2026 reassessment of what held up');
  }
});

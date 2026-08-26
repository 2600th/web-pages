import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('robots and RSS expose the canonical public site', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://www.2600th.com/sitemap-index.xml');

  const feed = await request.get('/rss.xml');
  expect(feed.status()).toBe(200);
  expect(feed.headers()['content-type']).toContain('xml');
  const xml = await feed.text();
  expect(xml).toContain('<title>Pranshul Chandhok — Notes</title>');
  expect(xml).toContain('https://www.2600th.com/notes/ai-video-control/');
  expect((xml.match(/<item>/g) ?? [])).toHaveLength(3);
});

for (const path of ['/', '/work/', '/work/kinema/', '/notes/', '/about/', '/lab/']) {
  test(`${path} has no serious or critical automated accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
      return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    });

    expect(violations).toEqual([]);
  });
}

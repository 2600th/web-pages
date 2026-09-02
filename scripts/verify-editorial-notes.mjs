import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';

const base = 'http://127.0.0.1:4323';
const output = '.superpowers/sdd/2026-09-02-editorial-site-update/task-2-screenshots';
await mkdir(output, { recursive: true });
const notes = await Promise.all((await readdir('src/content/notes')).filter((name) => name.endsWith('.md')).map(async (name) => {
  const [, frontmatter] = (await readFile(`src/content/notes/${name}`, 'utf8')).split(/^---\s*$/m);
  return parse(frontmatter);
}));
const published = notes.filter((note) => !note.draft).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt) || a.slug.localeCompare(b.slug));
const types = { 'field-note': 'Field Note', 'technical-teardown': 'Technical Teardown', essay: 'Essay' };
const browser = await chromium.launch({ headless: true });
try {
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['compact', 320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${base}/notes/`);
    await page.locator('astro-dev-toolbar').evaluateAll((elements) => elements.forEach((element) => element.remove()));
    const indexLinks = page.locator('.notes-list > li > a');
    expect(await indexLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(published.map((note) => `/notes/${note.slug}/`));
    const readTimes = new Map();
    for (const note of published) {
      const row = page.locator(`.notes-list a[href="/notes/${note.slug}/"]`);
      await expect(row).toContainText(types[note.type]);
      const readTime = (await row.innerText()).match(/\d+ min read/)?.[0];
      expect(readTime).toBeTruthy();
      readTimes.set(note.slug, readTime);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (device !== 'compact') await page.screenshot({ path: `${output}/notes-index-${device}.png`, animations: 'disabled' });
    for (const note of published) {
      const response = await page.goto(`${base}/notes/${note.slug}/`);
      expect(response.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('astro-dev-toolbar').evaluateAll((elements) => elements.forEach((element) => element.remove()));
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('.route-opening__context')).toContainText(types[note.type]);
      await expect(page.locator('.article-shell__meta')).toContainText(readTimes.get(note.slug));
      if (note.updatedAt && String(note.updatedAt) !== String(note.publishedAt)) await expect(page.locator('.article-shell__meta')).toContainText('Updated');
      await expect(page.locator('.article-shell__source a')).toHaveCount(note.canonicalUrl ? 1 : 0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.2600th.com/notes/${note.slug}/`);
      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toBe(`https://www.2600th.com${note.ogImage}`);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      const article = (await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.flatMap((script) => JSON.parse(script.textContent)))).find((entry) => entry['@type'] === 'Article');
      expect(article.image).toBe(og);
      expect(article.datePublished.slice(0, 10)).toBe(String(note.publishedAt).slice(0, 10));
      for (const slug of note.relatedWork ?? []) await expect(page.locator(`nav[aria-label="Related work and experiments"] a[href="/work/${slug}/"]`)).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${note.slug} at ${width}`).toBe(true);
      if (device !== 'compact' && note.type !== 'field-note') {
        await page.screenshot({ path: `${output}/${note.slug}-${device}.png`, animations: 'disabled' });
        const table = page.locator('.prose table').first();
        if (await table.count()) await table.screenshot({ path: `${output}/${note.slug}-table-${device}.png` });
      }
    }
    for (const slug of ['blocks', 'designesto', 'propvr-ai-craft', 'web-ocean-3d']) {
      await page.goto(`${base}/work/${slug}/`);
      const expected = published.filter((note) => note.relatedWork?.includes(slug));
      expect(await page.locator('nav[aria-label="Related notes"] a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(expected.map((note) => `/notes/${note.slug}/`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (slug === 'propvr-ai-craft') {
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://www.2600th.com/media/social/propvr-ai-craft.webp');
        await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      }
    }
    expect(errors).toEqual([]);
    console.log(`${device}: 8 notes + index + 4 reciprocal Work routes passed; metadata, dates, OG/JSON-LD, read time, source links and overflow checked.`);
    await page.close();
  }
  const context = await browser.newContext();
  const rss = await (await context.request.get(`${base}/rss.xml`)).text();
  const rssSlugs = [...rss.matchAll(/<link>https:\/\/www\.2600th\.com\/notes\/([^/]+)\/<\/link>/g)].map((match) => match[1]);
  expect(rssSlugs).toEqual(published.map((note) => note.slug));
  console.log('RSS publication order matches Notes index.');
  await context.close();
} finally {
  await browser.close();
}

import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

test('published article and case-study metadata match visible authorship, dates and image files', async ({ page, request }) => {
  const records = (collection: string) => readdirSync(`src/content/${collection}`).filter(file => file.endsWith('.md')).map(file => parse(readFileSync(`src/content/${collection}/${file}`, 'utf8').split(/^---\s*$/m)[1]));
  const images = new Set<string>();
  for (const [collection, entries] of [['notes', records('notes').filter(data => !data.draft)], ['work', records('work')]] as const) {
    for (const data of entries) {
      const path = `/${collection}/${data.slug}/`;
      await page.goto(path);
      const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      const entry = graph.find((item: Record<string, unknown>) => item['@type'] === (collection === 'notes' ? 'Article' : 'CreativeWork'));
      expect(entry.url).toBe(`https://www.2600th.com${path}`);
      expect(entry.author['@id']).toBe('https://www.2600th.com/#person');
      if (collection === 'notes') {
        expect(entry.headline).toBe(await page.locator('main h1').textContent());
        expect(entry.datePublished).toBe(new Date(data.publishedAt).toISOString());
        expect(entry.dateModified).toBe(new Date(data.updatedAt ?? data.publishedAt).toISOString());
        await expect(page.locator(`time[datetime="${entry.dateModified}"]`).first()).toBeVisible();
        expect(images.has(entry.image)).toBe(false);
        images.add(entry.image);
        const related = page.getByRole('navigation', { name: 'Related work and experiments' });
        for (const slug of data.relatedWork ?? []) {
          await expect(related.locator(`a[href="/work/${slug}/"]`)).toHaveCount(1);
          const html = await (await request.get(`/work/${slug}/`)).text();
          expect(html).toContain(`href="${path}"`);
        }
      } else {
        expect(entry.genre).toBe('Portfolio case study');
        expect(entry.about.name).toBe(data.title);
        expect(entry.description).toContain(data.role);
        expect(entry.dateCreated).toBeUndefined();
      }
      const image = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(image).toBe(entry.image);
      const metadata = await sharp(await (await request.get(new URL(image!).pathname)).body()).metadata();
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', String(metadata.width));
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', String(metadata.height));
    }
  }
  await page.goto('/');
  const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  const person = graph.find((entry: Record<string, unknown>) => entry['@type'] === 'Person');
  expect(person.jobTitle).toBe('VP Product & Technology, Interior Company at Square Yards');
  expect(person.sameAs).toEqual(['https://www.linkedin.com/in/pranshulchandhok/', 'https://x.com/2600th', 'https://github.com/2600th', 'https://2600th.substack.com/']);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
});

test('the LLM guide serves text and links to every published project and note', async ({ request, page }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^text\/plain\b/);
  const guide = await response.text();
  expect(guide).toMatch(/^# Pranshul Chandhok \/ 2600th\n\n> /);
  expect(Buffer.byteLength(guide)).toBeLessThan(20_000);
  expect(guide).not.toMatch(/reviewedEvidence|evidenceStatus|approval-enhanced|_media-source|localhost|127\.0\.0\.1/);

  const links = [...guide.matchAll(/^\- \[.*?\]\((https:\/\/[^)]+)\): .+$/gm)].map(match => match[1]);
  expect(new Set(links).size).toBe(links.length);
  for (const url of links) {
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://www.2600th.com');
    // Astro emits sitemaps only at build time; test:build checks their files and coverage.
    if (parsed.pathname === '/sitemap-index.xml') continue;
    const target = await request.get(parsed.pathname);
    expect(target.status(), url).toBe(200);
    if (parsed.pathname.endsWith('/')) {
      const html = await target.text();
      expect(html, url).not.toMatch(/name="robots" content="[^"]*noindex/);
      if (parsed.hash) expect(html, url).toContain(`id="${decodeURIComponent(parsed.hash.slice(1))}"`);
    }
  }

  for (const path of ['/work/', '/notes/']) {
    await page.goto(path);
    await expect(page.locator('link[rel="describedby"]')).toHaveAttribute('href', '/llms.txt');
    const publicLinks = await page.locator(`main a[href^="${path}"]`).evaluateAll(elements =>
      [...new Set(elements.map(element => element.getAttribute('href')!))]
        .filter(href => href !== '/work/' && !href.startsWith('/work/domain/')));
    expect(publicLinks.length).toBeGreaterThan(0);
    for (const href of publicLinks) expect(links, href).toContain(`https://www.2600th.com${href}`);
  }
});

test('discovery keeps open crawling and lets crawlers read the archive noindex', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(robots.headers()['content-type']).toMatch(/^text\/plain\b/);
  const rules = (await robots.text()).split(/\r?\n/).map(line => line.split('#')[0].trim()).filter(Boolean);
  expect(rules).toEqual(['User-agent: *', 'Allow: /', 'Sitemap: https://www.2600th.com/sitemap-index.xml']);
  const archive = await request.get('/lab/terminal/index.html');
  expect(archive.status()).toBe(200);
  expect(await archive.text()).toContain('content="noindex,follow"');
});

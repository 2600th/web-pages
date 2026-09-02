import { expect, test } from '@playwright/test';

test('the original console is preserved as a noindex archive', async ({ page }) => {
  // Astro dev serves raw public HTML by filename; static hosts resolve the directory index.
  const response = await page.goto('/lab/terminal/index.html');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Ghost Terminal — 2600th v1');
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

test('the terminal return link has a readable, separated mobile target', async ({ page }) => {
  for (const width of [320, 390, 699, 760]) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/lab/terminal/index.html');
    const link = page.getByRole('link', { name: 'Return to Pranshul Chandhok', exact: true });
    const layout = await link.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: rect.x, right: rect.right, width: rect.width, height: rect.height,
        fontSize: Number.parseFloat(style.fontSize),
        gapBelow: document.querySelector('.system-bar')!.getBoundingClientRect().top - rect.bottom,
        viewport: document.documentElement.clientWidth,
        clips: element.scrollWidth > element.clientWidth,
      };
    });
    expect(layout.x, `${width}px left inset`).toBeGreaterThanOrEqual(16);
    expect(layout.viewport - layout.right, `${width}px right inset`).toBeGreaterThanOrEqual(15);
    expect(layout.width, `${width}px available target`).toBeGreaterThanOrEqual(layout.viewport - 34);
    expect(layout.height).toBeGreaterThanOrEqual(48);
    expect(layout.fontSize).toBeGreaterThanOrEqual(14);
    expect(layout.gapBelow).toBeGreaterThanOrEqual(12);
    expect(layout.clips).toBe(false);
    await expect(link).toHaveAttribute('href', '/');
  }
});

test('the terminal return label stays inside its target with enlarged fallback text', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 320, height: 912 });
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto('/lab/terminal/index.html');
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  const link = page.getByRole('link', { name: 'Return to Pranshul Chandhok', exact: true });
  const box = (await link.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(16);
  expect(box.x + box.width).toBeLessThanOrEqual(320 - 16);
  expect(await link.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${baseURL}/`);
});

test('the terminal desktop return action retains its compact floating placement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 912 });
  await page.goto('/lab/terminal/index.html');
  const link = page.getByRole('link', { name: 'Return to Pranshul Chandhok', exact: true });
  await expect(link).toBeInViewport();
  expect(await link.evaluate(el => getComputedStyle(el).position)).toBe('fixed');
  expect((await link.boundingBox())!.width).toBeLessThan(400);
});

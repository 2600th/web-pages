import { test, expect } from '@playwright/test';

test('motion can be stopped without erasing the orbital field and stays stopped on navigation', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Ambient motion' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-cinematic-canvas]')).toBeVisible();
  await expect(page.locator('[data-cinematic-canvas]')).toHaveAttribute('data-field-active', 'false');
  await page.goto('/work/');
  await expect(page.getByRole('button', { name: 'Ambient motion' })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/');
  await expect(page.locator('[data-cinematic-canvas]')).toHaveAttribute('data-field-active', 'false');
});

test('reduced motion starts static and responds to system preference changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Ambient motion' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-cinematic-canvas]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('halo follows fine pointers but never intercepts the real link', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('.velvet-hero__action').first();
  await link.hover();
  const halo = page.locator('[data-cursor-halo]');
  await expect(halo).toHaveAttribute('data-active', 'true');
  await expect(halo).toHaveCSS('pointer-events', 'none');
  await link.click();
  await expect(page).toHaveURL(/#selected-work$/);
});

test('motion control leaves the preserved hero signature visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const ornament = await page.locator('.velvet-hero__status').boundingBox();
  const control = await page.locator('[data-motion-toggle]').boundingBox();
  expect(ornament!.y + ornament!.height).toBeLessThan(control!.y);
});

test('static orbital field survives an offscreen resize', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.waitForTimeout(150);
  await page.getByRole('link', { name: 'Back to top', exact: true }).click();
  await expect.poll(() => page.locator('[data-cinematic-canvas]').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  })).toBe(true);
});

test('the portrait-bound orbit remains visible when ambient motion restarts', async ({ page }) => {
  await page.setViewportSize({ width: 878, height: 912 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Ambient motion' });
  await toggle.click();
  await toggle.click();
  await page.waitForTimeout(200);
  const orbitalPixels = await page.locator('[data-cinematic-canvas]').evaluate((canvas: HTMLCanvasElement) => {
    const scale = canvas.width / canvas.clientWidth;
    const figure = document.querySelector<HTMLElement>('[data-figure-art]')!.getBoundingClientRect();
    const canvasBox = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.floor((figure.left - canvasBox.left - figure.width * .2) * scale));
    const y = Math.max(0, Math.floor((figure.top - canvasBox.top) * scale));
    const width = Math.min(canvas.width - x, Math.ceil(figure.width * 1.4 * scale));
    const height = Math.min(canvas.height - y, Math.ceil(figure.height * scale));
    const pixels = canvas.getContext('2d')!.getImageData(x, y, width, height).data;
    let blue = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 2] > pixels[i] * 1.4 && pixels[i + 3] > 20) blue += 1;
    }
    return blue;
  });
  expect(orbitalPixels).toBeGreaterThan(40);
});

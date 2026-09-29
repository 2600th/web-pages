import { test, expect } from '@playwright/test';

test('motion can be stopped and stays stopped on navigation', async ({ page }) => {
  await page.goto('/work/');
  const toggle = page.getByRole('button', { name: 'Ambient motion' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-ambient-motion', 'off');
  await page.goto('/about/');
  await expect(page.getByRole('button', { name: 'Ambient motion' })).toHaveAttribute('aria-pressed', 'false');
});

test('reduced motion starts static and responds to system preference changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const toggle = page.getByRole('button', { name: 'Ambient motion' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('halo follows fine pointers but never intercepts the real link', async ({ page }) => {
  await page.goto('/about/');
  const link = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Work', exact: true });
  await link.hover();
  const halo = page.locator('[data-cursor-halo]');
  await expect(halo).toHaveAttribute('data-active', 'true');
  await expect(halo).toHaveCSS('pointer-events', 'none');
  await link.click();
  await expect(page).toHaveURL(/\/work\/$/);
});

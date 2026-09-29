import { expect, test } from '@playwright/test';

test('the backtick console fits a 320px screen and behaves as a modal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await page.keyboard.press('`');
  const console_ = page.getByRole('dialog', { name: 'Console' });
  await expect(console_).toBeVisible();
  await expect(console_).toHaveAttribute('aria-modal', 'true');
  const input = page.locator('[data-console-input]');
  await expect(input).toBeFocused();
  await input.fill('neofetch');
  await page.keyboard.press('Enter');

  // Nothing inside the window runs past its edges.
  const layout = await console_.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const outside = [...element.querySelectorAll('*')].filter((child) => {
      const rect = child.getBoundingClientRect();
      return rect.width > 0 && !child.closest('.is-logo, .sg-console__fetch pre:first-child') && (rect.left < box.left - 1 || rect.right > box.right + 1);
    }).length;
    return { left: box.left, right: box.right, outside };
  });
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.outside).toBe(0);

  // Focus stays inside: Tab from the prompt reaches Close, and never leaves the window.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
  for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    expect(await console_.evaluate((element) => element.contains(document.activeElement)), key).toBe(true);
  }
  expect(await page.locator('main').evaluate((element) => element.closest('[inert]') !== null)).toBe(true);

  // Esc from the Close button still closes it, and the page is live again.
  await page.getByRole('button', { name: 'Close' }).focus();
  await page.keyboard.press('Escape');
  await expect(console_).toBeHidden();
  expect(await page.locator('main').evaluate((element) => element.closest('[inert]') === null)).toBe(true);

  // A press on the scrim closes it too.
  await page.keyboard.press('`');
  await expect(console_).toBeVisible();
  await page.mouse.click(160, 620);
  await expect(console_).toBeHidden();
});

test('the console opens on screen after the motion preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/');
  await page.keyboard.press('`');
  const console_ = page.getByRole('dialog', { name: 'Console' });
  await expect(console_).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(console_).toBeHidden();
  await page.locator('.sg-top [data-motion-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('`');
  await expect(console_).toBeInViewport();
});

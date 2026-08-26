import { expect, test } from '@playwright/test';

test('first viewport identifies Pranshul, the work, and the next action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByText(/turn emerging AI and spatial technologies into products/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start a conversation' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'See the work' })).toBeVisible();
});

test('the identity and conversion path remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start a conversation' }).first()).toHaveAttribute(
    'href',
    'mailto:2600th@gmail.com',
  );
  await expect(page.getByRole('link', { name: 'Kinema' }).first()).toHaveAttribute('href', '/work/kinema/');
  await context.close();
});

test('Three Distances changes real content and keeps the state in the URL', async ({ page }) => {
  await page.goto('/?work=kinema&distance=out#selected-work');
  const work = page.locator('#selected-work');

  await expect(work.getByRole('heading', { level: 3, name: 'Kinema' })).toBeVisible();
  await work.getByRole('button', { name: /NEAR/ }).click();
  await expect(page).toHaveURL(/work=kinema&distance=near/);
  await expect(work.getByText(/Players move through a procedural showcase/)).toBeVisible();

  await work.getByRole('link', { name: /Web Ocean 3D/ }).click();
  await expect(page).toHaveURL(/work=web-ocean-3d&distance=near/);
  await expect(work.getByRole('heading', { level: 3, name: 'Web Ocean 3D' })).toBeVisible();
});

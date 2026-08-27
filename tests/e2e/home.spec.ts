import { expect, test } from '@playwright/test';

test('primary navigation is the four-part public map', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(navigation.getByRole('link')).toHaveCount(4);
  await expect(navigation.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('href', '/work/');
  await expect(navigation.getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/lab/');
  await expect(navigation.getByRole('link', { name: 'Notes', exact: true })).toHaveAttribute('href', '/notes/');
  await expect(navigation.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/#contact');
});

test('the conversation and footer close use split polarity planes instead of a cobalt slab', async ({ page }) => {
  await page.goto('/#contact');

  const conversation = page.locator('.conversation-close');
  await expect(conversation).toBeVisible();
  await expect(conversation).toHaveAttribute('data-closing-plane', 'split');
  await expect(conversation.locator('[data-polarity="positive"]')).toHaveCount(1);
  await expect(conversation.locator('[data-polarity="negative"]')).toHaveCount(1);
  const conversationColors = await conversation.evaluate((element) => {
    const lead = element.querySelector('.conversation-close__lead');
    const paths = element.querySelector('.conversation-close__paths');
    return {
      root: getComputedStyle(element).backgroundColor,
      lead: lead ? getComputedStyle(lead).backgroundColor : '',
      paths: paths ? getComputedStyle(paths).backgroundColor : '',
    };
  });

  expect(conversationColors.root).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.lead).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.paths).not.toBe('rgb(36, 87, 255)');
  expect(conversationColors.lead).not.toBe(conversationColors.paths);

  const footerColors = await page.locator('.site-footer').evaluate((element) => {
    const contact = element.querySelector('.site-footer__contact');
    return {
      root: getComputedStyle(element).backgroundColor,
      contact: contact ? getComputedStyle(contact).backgroundColor : '',
    };
  });

  await expect(page.locator('.site-footer')).toHaveAttribute('data-closing-plane', 'split');
  await expect(page.locator('.site-footer [data-polarity="positive"]')).toHaveCount(2);
  await expect(page.locator('.site-footer [data-polarity="negative"]')).toHaveCount(1);
  expect(footerColors.root).not.toBe('rgb(36, 87, 255)');
  expect(footerColors.contact).not.toBe('rgb(36, 87, 255)');
  expect(footerColors.contact).not.toBe(footerColors.root);
});

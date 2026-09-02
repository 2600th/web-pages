import { expect, test } from '@playwright/test';

test('the single-line name stays contained without JavaScript or the custom font', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  try {
    await context.route('**/mona-sans-latin.woff2', route => route.abort());
    const page = await context.newPage();
    await page.goto(baseURL!);
    const layout = await page.locator('[data-case-slug="designesto"] h3').evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = [...range.getClientRects()];
      return { lines: rects.length, textWidth: rects[0].width, availableWidth: element.clientWidth };
    });
    expect(layout.lines).toBe(1);
    expect(layout.textWidth).toBeLessThanOrEqual(layout.availableWidth + 1);
  } finally {
    await context.close();
  }
});

test('Designesto remains an intact, contained name in homepage headings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 390, 768, 878, 1024, 1050, 1280, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    // Viewport acknowledgement can precede the container-query layout update.
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    for (const selector of ['[data-case-slug="designesto"] h3']) {
      const heading = page.locator(selector);
      const layout = await heading.evaluate(element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const rects: DOMRect[] = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const start = node.textContent!.indexOf('Designesto');
          if (start < 0) continue;
          const range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, start + 'Designesto'.length);
          rects.push(...range.getClientRects());
        }
        const parent = element.parentElement!;
        const bounds = parent.getBoundingClientRect();
        const style = getComputedStyle(parent);
        const left = bounds.left + parseFloat(style.paddingLeft);
        const right = bounds.right - parseFloat(style.paddingRight);
        return {
          lines: new Set(rects.map(rect => Math.round(rect.top))).size,
          contained: rects.every(rect => rect.left >= left - 1 && rect.right <= right + 1),
          fontSize: getComputedStyle(element).fontSize,
        };
      });
      expect(layout.lines, `${selector} at ${width}px: ${JSON.stringify(layout)}`).toBe(1);
      expect(layout.contained, `${selector} at ${width}px: ${JSON.stringify(layout)}`).toBe(true);
    }
  }
});

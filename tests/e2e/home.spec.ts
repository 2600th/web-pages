import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('approved Velvet Reveal hero is semantic, sparse, and immediately actionable', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-velvet-hero]');

  await expect(hero).toBeVisible();
  await expect(hero.getByRole('heading', { level: 1, name: 'Make the uncertain operable.' })).toBeVisible();
  await expect(hero).toContainText('Pranshul Chandhok');
  await expect(hero).not.toContainText('Product & technology leader / builder');
  await expect(hero).toContainText('Interior Company at Square Yards');
  await expect(hero.getByRole('link', { name: 'View selected work' })).toHaveAttribute('href', '#selected-work');
  await expect(hero.locator('[data-generated-identity]')).toHaveCount(0);
  await expect(hero.locator('.velvet-hero__status')).toContainText('2600');
  await expect(hero.locator('[data-domain-trace]')).toHaveCount(3);
  await expect(hero.locator('[data-domain-trace="glasses"]')).toHaveCount(1);
  await expect(hero.locator('[data-domain-trace="harness"]')).toHaveCount(1);
  await expect(hero.locator('[data-domain-trace="boots"]')).toHaveCount(1);
  await expect(hero.locator('[data-domain-marker]')).toHaveCount(3);
});

test('cinematic reveal stays unobstructed and replays after a full refresh', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.removeItem('2600th-velvet-intro-seen'));
  await page.goto('/');
  const hero = page.locator('[data-velvet-hero]');

  await expect(hero.locator('[data-cinematic-skip]')).toHaveCount(0);
  expect(await hero.getAttribute('data-cinematic-state')).toBe('playing');
  await page.reload();
  expect(await hero.getAttribute('data-cinematic-state')).toBe('playing');
  await expect(hero.locator('[data-cinematic-skip]')).toHaveCount(0);
});

test('cinematic reveal settles into a persistent ambient field', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('[data-velvet-hero]');
  const canvas = hero.locator('canvas[data-cinematic-canvas]');

  await page.keyboard.press('Escape');
  await expect(hero).toHaveAttribute('data-cinematic-state', 'settled');
  await page.waitForTimeout(700);
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-ambient-field', 'true');
  await expect.poll(() => canvas.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.05);
});

test('settled ambient particles remain visibly in motion', async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 2600;
    Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  });
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const canvas = page.locator('canvas[data-cinematic-canvas]');
  await expect(canvas).toHaveAttribute('data-ambient-field', 'true', { timeout: 6_000 });
  const sample = () => canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('2d');
    if (!context) return [];
    const pixels = context.getImageData(0, 0, (element as HTMLCanvasElement).width, (element as HTMLCanvasElement).height).data;
    const values: number[] = [];
    for (let index = 0; index < pixels.length; index += 16) {
      // Measure particle ink, not blank space or the stationary cobalt grid.
      const gold = pixels[index] > pixels[index + 2] * 1.5 && pixels[index + 1] > pixels[index + 2];
      values.push(gold ? pixels[index + 3] : 0);
    }
    return values;
  });

  const before = await sample();
  await page.waitForTimeout(1_200);
  const after = await sample();
  expect(after).toHaveLength(before.length);
  const changed = before.reduce((count, value, index) => count + (Math.abs(value - after[index]) > 12 ? 1 : 0), 0);
  const particleInk = before.filter(value => value > 12).length;
  expect(particleInk, 'persistent particles produce visible ink').toBeGreaterThan(100);
  expect(changed / particleInk, 'particle ink changes after the intro settles').toBeGreaterThanOrEqual(0.2);
});

for (const width of [878, 1910, 2560]) {
  test(`hero grid retains its rendered brightness after the intro at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1080 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const hero = page.locator('[data-velvet-hero]');
    const canvas = hero.locator('canvas[data-cinematic-canvas]');
    const gridInk = () => canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      let alpha = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        // Isolate cobalt grid strokes from the gold particles.
        if (pixels[index + 2] > pixels[index] * 2 && pixels[index + 2] > pixels[index + 1] * 1.5) {
          alpha += pixels[index + 3];
        }
      }
      return alpha * Number.parseFloat(getComputedStyle(canvas).opacity);
    });

    await expect(hero).toHaveAttribute('data-cinematic-state', 'playing');
    await page.waitForTimeout(2_400);
    const duringIntro = await gridInk();
    expect(duringIntro).toBeGreaterThan(0);
    await expect(hero).toHaveAttribute('data-cinematic-state', 'settled');
    await page.waitForTimeout(700);
    expect(await gridInk(), 'the settled grid must not fade out').toBeGreaterThan(duringIntro * 0.85);
    await page.waitForTimeout(6_000);
    expect(await gridInk(), 'the grid stays visible beyond the intro').toBeGreaterThan(duringIntro * 0.85);

    await page.setViewportSize({ width: 994, height: 912 });
    await expect.poll(gridInk).toBeGreaterThan(0);
    const bounds = await hero.boundingBox();
    const canvasBounds = await canvas.boundingBox();
    expect(canvasBounds!.width).toBeCloseTo(bounds!.width, 0);
    expect(canvasBounds!.height).toBeCloseTo(bounds!.height, 0);
  });
}

test('ambient field pauses when the hero leaves the viewport and resumes on return', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const canvas = page.locator('canvas[data-cinematic-canvas]');

  await expect(canvas).toHaveAttribute('data-field-active', 'true');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect(canvas).toHaveAttribute('data-field-active', 'false');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(canvas).toHaveAttribute('data-field-active', 'true');
});

test('Escape skips the cinematic reveal without blocking the work action', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-velvet-hero]')).toHaveAttribute('data-cinematic-state', 'settled');
  await page.getByRole('link', { name: 'View selected work' }).click();
  await expect(page).toHaveURL(/#selected-work$/);
});

test('reduced motion receives the final composition without a running canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('[data-velvet-hero]');

  await expect(hero).toHaveAttribute('data-cinematic-state', 'settled');
  const canvas = hero.locator('canvas[data-cinematic-canvas]');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-field-active', 'false');
  const staticFrame = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.waitForTimeout(150);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(staticFrame);
  await expect(hero.locator('[data-cinematic-skip]')).toHaveCount(0);
  await expect(hero).not.toHaveAttribute('data-motion-enhanced', 'true');
});

test('the hero copy remains visible after the reveal settles', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-velvet-hero]')).toHaveAttribute('data-cinematic-state', 'settled');
  await expect(page.locator('.velvet-hero__thesis')).toBeVisible();
});

test('generated identity media retains provenance without showing internal evidence copy', async ({ page, request }) => {
  await page.goto('/');
  for (const path of [
    '/media/generated/identity/2600th-velvet-character.webp',
    '/media/generated/identity/2600th-velvet-character-640.webp',
    '/media/generated/identity/provenance.json',
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  await expect(page.locator('[data-generated-identity]')).toHaveCount(0);
});

test('hero title lines remain separated inside the copy plane at the intermediate breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 946, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const lines = page.locator('[data-hero-title-line]');
  await expect(lines).toHaveCount(2);
  const first = await lines.nth(0).boundingBox();
  const second = await lines.nth(1).boundingBox();
  const copy = await page.locator('.velvet-hero__copy').boundingBox();
  const title = await page.locator('#velvet-title').boundingBox();
  const figure = await page.locator('.velvet-hero__figure').boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(copy).not.toBeNull();
  expect(title).not.toBeNull();
  expect(figure).not.toBeNull();
  expect((first?.y ?? 0) + (first?.height ?? 0)).toBeLessThanOrEqual((second?.y ?? 0) + 1);
  expect((first?.x ?? 0) + (first?.width ?? 0)).toBeLessThanOrEqual((copy?.x ?? 0) + (copy?.width ?? 0) + 1);
  expect((second?.x ?? 0) + (second?.width ?? 0)).toBeLessThanOrEqual((copy?.x ?? 0) + (copy?.width ?? 0) + 1);
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual((figure?.x ?? 0) - 12);
});

test('display headings keep non-overlapping line boxes at every supported width', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 878, height: 900 },
    { width: 946, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const headings = await page.locator('main h1, main h2, main h3').evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      const fontSize = Number.parseFloat(style.fontSize);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const letterSpacing = style.letterSpacing === 'normal' ? 0 : Number.parseFloat(style.letterSpacing);
      return {
        text: element.textContent?.trim().replace(/\s+/g, ' ') ?? '',
        lineHeightRatio: lineHeight / fontSize,
        trackingRatio: letterSpacing / fontSize,
      };
    }));

    for (const heading of headings) {
      expect(heading.lineHeightRatio, `${viewport.width}px line height for "${heading.text}"`).toBeGreaterThanOrEqual(1.03);
      expect(heading.trackingRatio, `${viewport.width}px tracking for "${heading.text}"`).toBeGreaterThanOrEqual(-0.04);
    }
  }
});

test('supporting homepage copy remains readable on the dark editorial surface', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 946, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const metrics = await page.locator('.velvet-case__role, .workflow-thesis__copy p').evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        selector: element.className || element.tagName.toLowerCase(),
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        textAlign: style.textAlign,
      };
    }));

    for (const metric of metrics) {
      const minimum = metric.selector.includes('velvet-case__role') ? 13 : 15;
      expect(metric.fontSize, `${viewport.width}px font size for ${metric.selector}`).toBeGreaterThanOrEqual(minimum);
      expect(metric.lineHeight / metric.fontSize, `${viewport.width}px leading for ${metric.selector}`).toBeGreaterThanOrEqual(1.45);
      expect(metric.textAlign, `${viewport.width}px alignment for ${metric.selector}`).not.toBe('justify');
    }
  }
});

test('domain point labels reveal on hover or focus and pin on click', async ({ page }) => {
  await page.setViewportSize({ width: 994, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const glasses = page.locator('[data-domain-trace="glasses"] details');
  const glassesPoint = page.getByRole('button', { name: 'AI products' });
  const glassesLabel = page.locator('[data-domain-trace="glasses"] > strong');
  const harness = page.locator('[data-domain-trace="harness"] details');
  const harnessPoint = page.getByRole('button', { name: 'Immersive systems' });

  await expect(glassesPoint).toBeVisible();
  await expect(glassesLabel).toBeHidden();
  await glassesPoint.hover();
  await expect(glassesLabel).toBeVisible();
  await page.locator('.velvet-hero__copy').hover();
  await expect(glassesLabel).toBeHidden();
  await glassesPoint.focus();
  await expect(glassesLabel).toBeVisible();
  await glassesPoint.click();
  await expect(glasses).toHaveAttribute('open', '');
  await harnessPoint.click();
  await expect(harness).toHaveAttribute('open', '');
  await expect(glasses).not.toHaveAttribute('open', '');
});

test('domain callouts stay registered to character landmarks across desktop breakpoints', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1186, height: 900 },
    { width: 994, height: 900 },
    { width: 946, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const art = page.locator('[data-figure-art]');
    await expect(art).toHaveCount(1);
    const artBox = await art.boundingBox();
    const titleBox = await page.locator('#velvet-title').boundingBox();
    expect(artBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect((artBox?.width ?? 0) / (artBox?.height ?? 1)).toBeCloseTo(2 / 3, 2);

    const expectedLandmarks = {
      glasses: { x: 0.28, y: 0.18 },
      harness: { x: 0.4, y: 0.34 },
      boots: { x: 0.51, y: 0.86 },
    } as const;
    for (const target of ['glasses', 'harness', 'boots'] as const) {
      const markerBox = await page.locator(`[data-domain-marker="${target}"]`).boundingBox();
      const traceBox = await page.locator(`[data-domain-trace="${target}"]`).boundingBox();
      expect(markerBox).not.toBeNull();
      expect(traceBox).not.toBeNull();
      const markerCenterY = (markerBox?.y ?? 0) + (markerBox?.height ?? 0) / 2;
      const markerCenterX = (markerBox?.x ?? 0) + (markerBox?.width ?? 0) / 2;
      const traceCenterY = (traceBox?.y ?? 0) + (traceBox?.height ?? 0) / 2;
      expect(Math.abs(markerCenterY - traceCenterY), `${viewport.width}px ${target} vertical registration`).toBeLessThanOrEqual(2);
      expect(markerCenterX).toBeGreaterThanOrEqual(artBox?.x ?? 0);
      expect(markerCenterX).toBeLessThanOrEqual((artBox?.x ?? 0) + (artBox?.width ?? 0));
      expect((markerCenterX - (artBox?.x ?? 0)) / (artBox?.width ?? 1), `${viewport.width}px ${target} horizontal landmark`).toBeCloseTo(expectedLandmarks[target].x, 2);
      expect((markerCenterY - (artBox?.y ?? 0)) / (artBox?.height ?? 1), `${viewport.width}px ${target} vertical landmark`).toBeCloseTo(expectedLandmarks[target].y, 2);
      expect(markerBox?.x ?? 0, `${viewport.width}px ${target} clears title`).toBeGreaterThanOrEqual((titleBox?.x ?? 0) + (titleBox?.width ?? 0) + 12);
      await page.locator(`[data-domain-marker="${target}"]`).click();
      const labelBox = await page.locator(`[data-domain-trace="${target}"] strong`).boundingBox();
      expect(labelBox).not.toBeNull();
      expect((labelBox?.x ?? 0) + (labelBox?.width ?? 0) + 8, `${viewport.width}px ${target} label clears marker`).toBeLessThanOrEqual(markerBox?.x ?? 0);
      expect(labelBox?.x ?? -1, `${viewport.width}px ${target} label remains in viewport`).toBeGreaterThanOrEqual(0);
      expect((labelBox?.x ?? 0) + (labelBox?.width ?? 0), `${viewport.width}px ${target} label remains in viewport`).toBeLessThanOrEqual(viewport.width);
    }
  }
});

test('mobile domain points keep touch targets and revealed labels contained', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    for (const target of ['glasses', 'harness', 'boots'] as const) {
      // Clicking the previous point may scroll this tall mobile hero.
      const artBox = await page.locator('[data-figure-art]').boundingBox();
      expect(artBox).not.toBeNull();
      const marker = page.locator(`[data-domain-marker="${target}"]`);
      const markerBox = await marker.boundingBox();
      expect(markerBox).not.toBeNull();
      expect(markerBox?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(markerBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      const centerX = (markerBox?.x ?? 0) + (markerBox?.width ?? 0) / 2;
      const centerY = (markerBox?.y ?? 0) + (markerBox?.height ?? 0) / 2;
      expect(centerX).toBeGreaterThanOrEqual(artBox?.x ?? 0);
      expect(centerX).toBeLessThanOrEqual((artBox?.x ?? 0) + (artBox?.width ?? 0));
      expect(centerY).toBeGreaterThanOrEqual(artBox?.y ?? 0);
      expect(centerY).toBeLessThanOrEqual((artBox?.y ?? 0) + (artBox?.height ?? 0));
      if (target === 'glasses') {
        expect((centerX - (artBox?.x ?? 0)) / (artBox?.width ?? 1), `${viewport.width}px AI point stays beside the face`).toBeGreaterThanOrEqual(0.56);
      }
      await marker.click();
      const labelBox = await page.locator(`[data-domain-trace="${target}"] strong`).boundingBox();
      expect(labelBox).not.toBeNull();
      expect(labelBox?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((labelBox?.x ?? 0) + (labelBox?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
      const copyBoxes = await page.locator('#velvet-title, .velvet-hero__thesis, .velvet-hero__signal, .velvet-hero__action').evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { name: element.id || element.className, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }));
      for (const copyBox of copyBoxes) {
        const overlapsCopy = (labelBox?.x ?? 0) < copyBox.x + copyBox.width
          && (labelBox?.x ?? 0) + (labelBox?.width ?? 0) > copyBox.x
          && (labelBox?.y ?? 0) < copyBox.y + copyBox.height
          && (labelBox?.y ?? 0) + (labelBox?.height ?? 0) > copyBox.y;
        expect(overlapsCopy, `${viewport.width}px ${target} label clears ${copyBox.name}; label=${JSON.stringify(labelBox)} copy=${JSON.stringify(copyBox)}`).toBe(false);
      }
    }
  }
});

test('selected-work motion controls remain inside their media frames while resizing', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 900 },
    { width: 946, height: 900 },
    { width: 878, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#selected-work');

    const placements = await page.locator('[data-signal-case]:has([data-signal-motion-toggle])').evaluateAll((cases) => cases.map((card) => {
      const media = card.querySelector<HTMLElement>('.velvet-case__media')?.getBoundingClientRect();
      const control = card.querySelector<HTMLElement>('[data-signal-motion-toggle]')?.getBoundingClientRect();
      return media && control ? {
        media: { left: media.left, top: media.top, right: media.right, bottom: media.bottom },
        control: { left: control.left, top: control.top, right: control.right, bottom: control.bottom },
      } : null;
    }));

    expect(placements).toHaveLength(3);
    for (const placement of placements) {
      expect(placement).not.toBeNull();
      expect(placement?.control.left ?? -1).toBeGreaterThanOrEqual((placement?.media.left ?? 0) + 8);
      expect(placement?.control.top ?? -1).toBeGreaterThanOrEqual((placement?.media.top ?? 0) + 8);
      expect(placement?.control.right ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((placement?.media.right ?? 0) - 8);
      expect(placement?.control.bottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((placement?.media.bottom ?? 0) - 8);
    }
  }
});

test('mobile hero retains the 2600 status ornament', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const status = page.locator('.velvet-hero__status');
  await expect(status).toBeVisible();
  await expect(status).toContainText('2600');
  for (const [target, number] of [['glasses', '01'], ['harness', '02'], ['boots', '03']] as const) {
    await expect(page.locator(`[data-domain-marker="${target}"] span`)).toHaveText(number);
  }
});

test('primary navigation is the compact public map', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(navigation.getByRole('link')).toHaveCount(5);
  await expect(navigation.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('href', '/work/');
  await expect(navigation.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('href', '/about/');
  await expect(navigation.getByRole('link', { name: 'Notes', exact: true })).toHaveAttribute('href', '/notes/');
  await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
  await expect(navigation.getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/lab/');
});

test('selected work pairs generated editorial posters with authentic project clips', async ({ page }) => {
  await page.goto('/#selected-work');
  const selectedWork = page.locator('#selected-work');
  const cases = selectedWork.locator('[data-signal-case]');

  await expect(selectedWork.getByRole('heading', { level: 2, name: 'A closer look at the work.' })).toBeVisible();
  await expect(cases).toHaveCount(5);
  await expect(cases.nth(0).getByRole('heading', { level: 3 })).toHaveText('Blocks');
  await expect(cases.nth(1).getByRole('heading', { level: 3 })).toHaveText('Designesto');
  await expect(cases.nth(2).locator('video')).toHaveCount(0);
  await expect(selectedWork.locator('[data-case-slug="enterprise-immersive-systems"]')).toHaveCount(1);
  await expect(cases.locator('video')).toHaveCount(3);
  const expectedMedia = [
    {
      poster: '/media/work/blocks-inco-ai/designesto-before-after.webp',
      clip: '/media/work/blocks-inco-ai/designesto-edit-room.mp4',
    },
    {
      poster: '/media/work/homelane-spacecraft-pro/public-demo-poster.webp',
      clip: '/media/work/homelane-spacecraft-pro/room-editor-loop.mp4',
    },
    {
      poster: '/media/generated/editorial/enhanced/enterprise-xr-hero-v2.webp',
      clip: '/media/work/enterprise-immersive-systems/facility-loop.mp4',
    },
  ] as const;
  for (const [index, video] of (await cases.locator('video').all()).entries()) {
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', expectedMedia[index].poster);
    await expect(video).toHaveAttribute('data-media-source-url', /^(?:generated:|https:)/);
    await expect(video).toHaveAttribute('data-media-source-status', /^(?:generated-editorial|public-approved|public-corroborated)$/);
    await expect(video.locator('source')).toHaveAttribute('src', expectedMedia[index].clip);
  }
});

test('proof, thesis, writing and Lab navigation remain concise', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.home-proof li')).toHaveCount(4);
  await expect(page.locator('.workflow-thesis h2')).toHaveCount(1);
  await expect(page.locator('.home-notes article')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/lab/');
});

test('motion evidence is explicitly user controlled and responds to viewport visibility', async ({ page }) => {
  await page.goto('/#selected-work');
  const video = page.locator('#selected-work video').first();
  const control = page.locator('#selected-work [data-signal-motion-toggle]').first();

  await expect(video).toHaveJSProperty('paused', true);
  await control.click();
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(false);
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
});

test('reduced motion keeps authentic project clips paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#selected-work');
  await expect.poll(async () => page.locator('#selected-work video').evaluateAll((videos) => videos.every((video) => (video as HTMLVideoElement).paused))).toBe(true);
});

test('identity, work, proof, and contact remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Make the uncertain operable.' })).toBeVisible();
  await expect(page.locator('#selected-work [data-signal-case]')).toHaveCount(5);
  await expect(page.locator('.home-proof li')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Let’s compare notes', exact: true })).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await context.close();
});

test('the homepage has no serious WCAG contrast violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
    return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  });
  expect(violations).toEqual([]);
});

test('the homepage stays contained and actionable at supported widths', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 946, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Make the uncertain operable.' })).toBeVisible();
    const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(widths.document, `${viewport.width}px document`).toBeLessThanOrEqual(viewport.width);
    expect(widths.body, `${viewport.width}px body`).toBeLessThanOrEqual(viewport.width);
  }
});

test('mobile Orbital hero keeps the portrait beside the heading and actions after the full copy', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 430, height: 900 },
    { width: 700, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const hero = page.locator('[data-velvet-hero]');
    const heading = hero.getByRole('heading', { level: 1 });
    const portrait = hero.locator('[data-figure-art]');
    const canvas = hero.locator('[data-cinematic-canvas]');
    const copy = hero.locator('.velvet-hero__thesis');
    const actions = hero.locator('.velvet-hero__actions');
    const [headingBox, portraitBox, canvasBox, copyBox, actionsBox] = await Promise.all([
      heading.boundingBox(), portrait.boundingBox(), canvas.boundingBox(), copy.boundingBox(), actions.boundingBox(),
    ]);

    expect(headingBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(portraitBox!.width, `${viewport.width}px portrait width`).toBeCloseTo(220, 0);
    expect(portraitBox!.height, `${viewport.width}px portrait height`).toBeCloseTo(330, 0);
    expect(portraitBox!.x, `${viewport.width}px portrait remains horizontally contained`).toBeGreaterThanOrEqual(0);
    expect(portraitBox!.x + portraitBox!.width, `${viewport.width}px portrait remains horizontally contained`).toBeLessThanOrEqual(viewport.width + 11);
    expect(portraitBox!.x).toBeGreaterThan(headingBox!.x);
    expect(portraitBox!.y).toBeLessThan(headingBox!.y + headingBox!.height);
    expect(copyBox!.y).toBeGreaterThanOrEqual(headingBox!.y + headingBox!.height - 1);
    expect(canvasBox!.y + canvasBox!.height, `${viewport.width}px canvas clears the body copy`).toBeLessThanOrEqual(copyBox!.y);
    expect(actionsBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height - 1);
    expect(await hero.locator('.velvet-hero__action').evaluateAll((links) => links.every((link) => link.getBoundingClientRect().height >= 44))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});

test('footer remains a continuous velvet surface with useful routes', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');

  await expect(footer).toHaveAttribute('data-closing-plane', 'velvet');
  await expect(footer.getByRole('link', { name: /compare notes/i })).toHaveAttribute('href', /mailto:2600th@gmail.com/);
  await expect(footer.getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/lab/');
  await expect(footer.getByRole('link', { name: /Ghost Terminal/i })).toHaveAttribute('href', '/lab/terminal/index.html');
  const background = await footer.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).toBe('rgb(3, 4, 5)');
  expect(background).not.toBe('rgb(36, 87, 255)');
});

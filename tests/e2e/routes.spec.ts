import { expect, test } from '@playwright/test';

const workSlugs = [
  'ai-native-game-thesis',
  'alphaman',
  'blocks',
  'designesto',
  'propvr-ai-craft',
  'defense-simulation-systems',
  'enterprise-immersive-systems',
  'greykernel',
  'homelane-spacecraft-pro',
  'humanoid-robot-control-system',
  'ira-vr',
  'kinema',
  'little-wonder',
  'machine-hunter',
  'merkur-magie',
  'mysticmojo',
  'safed-sagar',
  'the-brutal-spy',
  'web-ocean-3d',
] as const;

const noteSlugs = [
  'ai-native-game-development-reflection',
  'ai-video-control',
  'technology-and-human-agency',
  'from-pixels-to-intelligent-systems',
  'ocean-reliability',
  'browser-flight-experiment',
  'ai-floorplan-parsing',
  'generative-and-deterministic-systems',
] as const;

const routeCases = [
  ['/work/', 'Projects'],
  ['/work/kinema/', 'Kinema'],
  ['/work/defense-simulation-systems/', 'Defense technology and simulation'],
  ['/notes/', 'Notes from the workbench'],
  ['/notes/ai-video-control/', 'AI video got good. Directing a sequence is still hard.'],
  ['/about/', 'I learn by building.'],
  ['/lab/', 'Things I’m trying.'],
] as const;

for (const [path, heading] of routeCases) {
  test(`${path} has one useful primary heading and canonical metadata`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://www.2600th.com${path}`,
    );
    await expect(page).toHaveTitle(/Pranshul Chandhok/);
  });
}

test('Ghost Terminal links use a consistent name and serve the original portfolio', async ({ page, request }) => {
  for (const [path, expectedCount] of [['/', 1], ['/lab/', 2]] as const) {
    await page.goto(path);
    const archiveLinks = page.locator('a[href*="/lab/terminal/"]');
    await expect(archiveLinks).toHaveCount(expectedCount);
    for (const archiveLink of await archiveLinks.all()) {
      await expect(archiveLink).toHaveAccessibleName(/Ghost Terminal/);
      await expect(archiveLink).toHaveAttribute('href', '/lab/terminal/index.html');
    }
  }

  const response = await request.get('/lab/terminal/index.html');
  expect(response.status()).toBe(200);
});

test('the archive return action stays in mobile flow instead of covering the console', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/terminal/index.html');

  const returnAction = page.locator('.archive-return');
  await expect(returnAction).toBeVisible();
  await expect.poll(() => returnAction.evaluate((element) => getComputedStyle(element).position)).not.toBe('fixed');

  const actionBox = await returnAction.boundingBox();
  const firstPanel = await page.locator('.terminal-screen').boundingBox();
  expect(actionBox).not.toBeNull();
  expect(firstPanel).not.toBeNull();
  const actionBottom = (actionBox?.y ?? 0) + (actionBox?.height ?? Number.POSITIVE_INFINITY);
  expect(actionBottom).toBeLessThanOrEqual((firstPanel?.y ?? 0) + 80);
});

test('work index exposes all 19 visible records as one inspectable route list', async ({ page }) => {
  await page.goto('/work/');

  const records = page.locator('[data-work-item]');
  await expect(records).toHaveCount(workSlugs.length);
  const hrefs = await records.locator('a').evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
  expect(new Set(hrefs).size).toBe(workSlugs.length);
  for (const slug of workSlugs) expect(hrefs).toContain(`/work/${slug}/`);
});

test('work archive opens with authentic historical media and a public SpaceCraft frame', async ({ page }) => {
  await page.goto('/work/');

  const records = page.locator('[data-work-item]');
  for (const index of [0, 1, 2]) await expect(records.nth(index).locator('img')).toHaveCount(1);
  await expect(records.filter({ has: page.locator('a[href="/work/homelane-spacecraft-pro/"]') }).locator('img')).toHaveAttribute(
    'src',
    '/media/work/homelane-spacecraft-pro/public-demo-poster.webp',
  );
});

test('every work domain filter returns its complete subset', async ({ page }) => {
  const expectedCounts = {
    all: 19,
    games: 9,
    xr: 6,
    simulation: 6,
    robotics: 2,
    'design-tech': 4,
    'applied-ai': 5,
  } as const;

  for (const [domain, count] of Object.entries(expectedCounts)) {
    await page.goto(domain === 'all' ? '/work/' : `/work/?domain=${domain}`);
    await expect(page.locator('[data-work-item]:visible')).toHaveCount(count);
    await expect(page.locator('[data-work-status]')).toContainText(`${count} ${Number(count) === 1 ? 'project' : 'projects'}`);
  }
});

test('interior route openings use the velvet editorial system with generated art confined to Notes', async ({ page }) => {
  for (const path of ['/work/', '/notes/', '/about/', '/lab/', '/this-route-does-not-exist/']) {
    await page.goto(path);
    const opening = page.locator('[data-route-opening]');
    await expect(opening).toHaveCount(1);
    await expect(opening.locator('[data-polarity="positive"]')).toHaveCount(1);
    await expect(opening.locator('[data-polarity="negative"]')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(opening.locator('img[src*="/media/generated/editorial/"]')).toHaveCount(0);

    const colors = await opening.evaluate((element) => {
      const positive = element.querySelector('[data-polarity="positive"]');
      const negative = element.querySelector('[data-polarity="negative"]');
      return {
        opening: getComputedStyle(element).backgroundColor,
        positive: positive ? getComputedStyle(positive).backgroundColor : '',
        negative: negative ? getComputedStyle(negative).backgroundColor : '',
        positiveText: positive ? getComputedStyle(positive).color : '',
        negativeText: negative ? getComputedStyle(negative).color : '',
      };
    });
    expect(colors.opening).not.toBe('rgb(36, 87, 255)');
    expect(colors.positiveText).toBe('rgb(237, 234, 226)');
    expect(colors.negativeText).toBe('rgb(237, 234, 226)');
    expect(colors.positive).not.toBe('rgb(241, 240, 234)');
    expect(colors.negative).not.toBe('rgb(241, 240, 234)');
  }
});

test('Work and Notes openings include art-directed, responsive media', async ({ page }) => {
  await page.goto('/work/');
  const workMedia = page.locator('[data-work-opening-media]');
  await expect(page.locator('.route-opening--work[data-motion-scope]')).toHaveCount(1);
  await expect(workMedia.getByRole('link')).toHaveCount(3);
  await expect(workMedia.locator('[data-motion-reveal]')).toHaveCount(3);
  for (const [index, label] of ['Blocks', 'Designesto', 'PropVR AI to Craft'].entries()) {
    const link = workMedia.getByRole('link', { name: new RegExp(label, 'i') });
    await expect(link).toHaveCount(1);
    await expect(link.locator('source[type="image/avif"]')).toHaveCount(1);
    await expect(link.locator('source[type="image/webp"]')).toHaveCount(1);
    await expect(link.locator('img')).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy');
    if (index === 0) await expect(link.locator('img')).toHaveAttribute('fetchpriority', 'high');
    await expect(link.locator('img')).toHaveAttribute('decoding', 'async');
    await expect(link.locator('img')).toHaveAttribute('width', '960');
    await expect(link.locator('img')).toHaveAttribute('height', '540');
  }
  await expect(workMedia.locator('img[src*="/media/generated/"]')).toHaveCount(0);

  await page.goto('/notes/');
  const notesMedia = page.locator('[data-notes-opening-media]');
  await expect(page.locator('.route-opening--notes[data-motion-scope]')).toHaveCount(1);
  await expect(notesMedia).toHaveAttribute('data-motion-reveal', '');
  await expect(notesMedia.locator('picture')).toHaveCount(1);
  await expect(notesMedia.locator('source[type="image/avif"]')).toHaveCount(1);
  await expect(notesMedia.locator('source[type="image/webp"]')).toHaveCount(1);
  await expect(notesMedia.locator('img')).toHaveAttribute('loading', 'eager');
  await expect(notesMedia.locator('img')).toHaveAttribute('fetchpriority', 'high');
  await expect(notesMedia.locator('img')).toHaveAttribute('decoding', 'async');
  await expect(notesMedia.locator('img')).toHaveAttribute('width', '960');
  await expect(notesMedia.locator('img')).toHaveAttribute('height', '540');
  await expect(notesMedia.locator('figcaption')).toHaveCount(0);
});

test('reduced motion keeps route-opening media in its static composition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/work/', '/notes/']) {
    await page.goto(path);
    await expect(page.locator('[data-route-opening]')).toHaveAttribute('data-motion-state', 'static');
  }
});

test('Work and Notes opening media stay contained and clear their copy at every supported review width', async ({ page }) => {
  for (const width of [320, 390, 878, 946, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/work/', '/notes/']) {
      await page.goto(path);
      const selector = path === '/work/' ? '[data-work-opening-media]' : '[data-notes-opening-media]';
      const media = page.locator(selector);
      await expect(media).toBeVisible();
      const box = await media.boundingBox();
      expect(box, `${path} at ${width}px`).not.toBeNull();
      expect(box?.x ?? -1, `${path} left at ${width}px`).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? width + 1), `${path} right at ${width}px`).toBeLessThanOrEqual(width + 1);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path} document at ${width}px`).toBeLessThanOrEqual(width);

      const geometry = await page.locator('[data-route-opening]').evaluate((opening, routePath) => {
        const mediaElement = opening.querySelector(routePath === '/work/' ? '[data-work-opening-media]' : '[data-notes-opening-media]');
        const copyElement = opening.querySelector('.route-opening__copy');
        const mediaBox = mediaElement?.getBoundingClientRect();
        const copyBox = copyElement?.getBoundingClientRect();
        const frames = [...(mediaElement?.querySelectorAll('a') ?? [])].map((frame) => frame.getBoundingClientRect());
        return {
          dividerContent: getComputedStyle(opening, '::after').content,
          mediaBottom: mediaBox?.bottom ?? 0,
          copyTop: copyBox?.top ?? Number.POSITIVE_INFINITY,
          frameBottoms: frames.map((frame) => frame.bottom),
        };
      }, path);
      expect(geometry.dividerContent, `${path} has no decorative rule over the media plane at ${width}px`).toBe('none');
      expect(geometry.mediaBottom, `${path} media clears copy at ${width}px`).toBeLessThanOrEqual(geometry.copyTop - 8);
      for (const frameBottom of geometry.frameBottoms) {
        expect(frameBottom, `${path} frame remains inside media plane at ${width}px`).toBeLessThanOrEqual(geometry.mediaBottom + 1);
      }
    }
  }
});

test('Alphaman explains the shipped game instead of portfolio publication mechanics', async ({ page }) => {
  await page.goto('/work/alphaman/');
  const story = page.locator('[data-case-part="story"]');

  await expect(story.getByRole('heading', { name: /Spelling, rebuilt as an arcade maze/i })).toBeVisible();
  await expect(story).toContainText(/iOS and Android/i);
  await expect(story).toContainText(/11 themed maps/i);
  await expect(story).toContainText(/teleportation/i);
  await expect(story).not.toContainText(/retained as a sourced career marker/i);
  await expect(page.locator('[data-case-part="sources"] a')).toHaveCount(4);
});

test('case detail is organized around the reader journey and useful project links', async ({ page }) => {
  await page.goto('/work/kinema/');

  for (const part of ['thesis', 'contribution', 'system', 'story', 'sources']) {
    await expect(page.locator(`[data-case-part="${part}"]`)).toHaveCount(1);
  }
  await expect(page.locator('[data-case-part="story"]')).toContainText('Notes from the project.');
  await expect(page.getByRole('heading', { name: 'Sources and links' })).toBeVisible();
  await expect(page.locator('[data-project-sources]')).toHaveCount(1);

  const sourcesSurface = page.locator('[data-project-sources]');
  expect(await sourcesSurface.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgb(36, 87, 255)');
});

test('main website and every published Note omit forbidden visitor-facing copy', async ({ page }) => {
  const internalLanguage = /\b(?:evidence|corroboration|source ledger|public record|sourced career marker|reviewed archive|approval-enhanced|evidenceStatus)\b/i;
  await page.goto('/notes/');
  const publishedNotePaths = await page.locator('.notes-list > li > a').evaluateAll(links => links.map(link => link.getAttribute('href')!));
  expect(publishedNotePaths.length).toBeGreaterThan(0);

  // The original standalone companion and terminal archive retain their inherited prose.
  const paths = [
    '/', '/about/', '/work/', '/lab/', '/notes/', '/work/blocks-inco-ai/',
    ...['games', 'xr', 'simulation', 'robotics', 'design-tech', 'applied-ai'].map(domain => `/work/domain/${domain}/`),
    ...workSlugs.map(slug => `/work/${slug}/`),
    ...publishedNotePaths,
  ];
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    expect.soft(await page.locator('body').innerText(), `${path} omits forbidden visitor-facing copy`).not.toMatch(internalLanguage);
    await expect(page.locator('main').getByRole('heading', { name: /^(?:Evidence|Visibility)$/i })).toHaveCount(0);
    if (workSlugs.some(slug => path === `/work/${slug}/`)) {
      await expect(page.getByRole('heading', { name: 'Sources and links' })).toBeVisible();
    }
  }
});

test('all eight note routes remain reading surfaces with truthful original-source links', async ({ page }) => {
  await page.goto('/notes/');
  await expect(page.locator('.notes-list > li')).toHaveCount(noteSlugs.length);

  for (const slug of noteSlugs) {
    await page.goto(`/notes/${slug}/`);
    await expect(page.locator('[data-reading-surface]')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.article-shell__source a')).toHaveCount(['ai-floorplan-parsing', 'generative-and-deterministic-systems'].includes(slug) ? 0 : 1);
  }
});

test('lab and about expose their operating surfaces', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.locator('[data-build-ledger]')).toHaveCount(1);
  await expect(page.locator('[data-build-ledger] [data-build-row]')).toHaveCount(6);
  await expect(page.locator('a[href="/lab/terminal/index.html"]')).toHaveCount(2);

  await page.goto('/about/');
  await expect(page.locator('[data-operating-dossier]')).toHaveCount(1);
  await expect(page.locator('[data-operating-dossier] .career-acts li')).toHaveCount(3);
  await expect(page.locator('[data-operating-atlas]')).toHaveCount(1);
  await expect(page.locator('[data-operating-atlas] li[data-motion-reveal]')).toHaveCount(3);
  await expect(page.locator('[data-about-diorama] img')).toHaveAttribute('src', '/media/generated/identity/2600th-operator-diorama.webp');
  await expect(page.locator('[data-about-diorama] figcaption')).toHaveCount(0);
  await expect(page.locator('[data-equipment-inventory] img')).toHaveAttribute('src', '/media/generated/identity/2600th-equipment-inventory.webp');
  await expect(page.locator('[data-equipment-inventory] figcaption')).toHaveCount(0);
});

test('visitor-facing routes omit internal generated-media disclaimers', async ({ page }) => {
  const internalDisclosure = /generated (?:2600th identity|equipment|editorial(?: illustration)?|direction) (?:study|illustration)?|not project evidence|not client documentation/i;
  for (const path of ['/', '/about/', '/notes/', '/work/defense-simulation-systems/']) {
    await page.goto(path);
    await expect(page.locator('body')).not.toContainText(internalDisclosure);
  }
});

test('shared route-opening headings keep readable line spacing and stack before columns become cramped', async ({ page }) => {
  for (const width of [320, 390, 878, 946, 1024]) {
    await page.setViewportSize({ width, height: 912 });
    for (const path of ['/about/', '/work/', '/notes/']) {
      await page.goto(path);
      const opening = page.locator('.route-opening');
      const positive = opening.locator('.route-opening__positive');
      const negative = opening.locator('.route-opening__negative');
      const [positiveBox, negativeBox] = await Promise.all([positive.boundingBox(), negative.boundingBox()]);
      expect(positiveBox, `${path} positive plane at ${width}px`).not.toBeNull();
      expect(negativeBox, `${path} negative plane at ${width}px`).not.toBeNull();
      expect(negativeBox?.y ?? -1, `${path} stacks its media plane at ${width}px`).toBeGreaterThanOrEqual((positiveBox?.y ?? 0) + (positiveBox?.height ?? 0) - 1);

      const typeMetrics = await positive.locator('h1').evaluate((heading) => {
        const style = getComputedStyle(heading);
        return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight) };
      });
      expect(typeMetrics.lineHeight / typeMetrics.fontSize, `${path} heading keeps a readable line box at ${width}px`).toBeGreaterThanOrEqual(1.03);
    }

    await page.goto('/work/defense-simulation-systems/');
    const caseTypeMetrics = await page.locator('.case-hero__positive h1').evaluate((heading) => {
      const style = getComputedStyle(heading);
      return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight) };
    });
    expect(caseTypeMetrics.lineHeight / caseTypeMetrics.fontSize, `case heading keeps a readable line box at ${width}px`).toBeGreaterThanOrEqual(1.03);
  }
});

test('case-study statements read as editorial leads instead of oversized display copy', async ({ page }) => {
  const maximumLeadSize = new Map([
    [320, 34],
    [390, 34],
    [946, 52],
    [1440, 60],
  ]);

  for (const [width, maxFontSize] of maximumLeadSize) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/work/mysticmojo/');

    const leads = page.locator('[data-case-part="thesis"] h2, [data-case-part="contribution"] h2');
    await expect(leads).toHaveCount(2);
    const metrics = await leads.evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        textAlign: style.textAlign,
        right: rect.right,
      };
    }));

    for (const metric of metrics) {
      expect(metric.fontSize, `${width}px case-study lead scale`).toBeLessThanOrEqual(maxFontSize);
      expect(metric.lineHeight / metric.fontSize, `${width}px case-study lead leading`).toBeGreaterThanOrEqual(1.08);
      expect(metric.textAlign, `${width}px case-study lead alignment`).not.toBe('justify');
      expect(metric.right, `${width}px case-study lead stays in the viewport`).toBeLessThanOrEqual(width + 1);
    }
  }
});

test('article metadata becomes a readable vertical rail on narrow screens', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/notes/ai-video-control/');

    const rail = page.locator('.article-shell__meta');
    const layout = await rail.evaluate((element) => {
      const railBox = element.getBoundingClientRect();
      const items = [...element.children].map((child) => {
        const box = child.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, left: box.left, width: box.width };
      });
      return { railWidth: railBox.width, items };
    });

    expect(layout.items).toHaveLength(3);
    expect(layout.items[0].bottom, `${width}px date clears topics`).toBeLessThanOrEqual(layout.items[1].top + 1);
    expect(layout.items[1].bottom, `${width}px topics clear reading time`).toBeLessThanOrEqual(layout.items[2].top + 1);
    for (const item of layout.items) {
      expect(item.width, `${width}px metadata item uses the rail`).toBeGreaterThanOrEqual(layout.railWidth * 0.9);
      expect(item.left, `${width}px metadata item alignment`).toBeCloseTo(layout.items[0].left, 0);
    }
  }
});

test('standard case openings keep context, summary, and metadata in a readable vertical flow', async ({ page }) => {
  for (const width of [1920, 1440, 1024, 878]) {
    await page.setViewportSize({ width, height: 912 });
    for (const path of ['/work/mysticmojo/', '/work/enterprise-immersive-systems/', '/work/kinema/']) {
      await page.goto(path);
      const negative = page.locator('.case-hero:not([data-case-variant]) .case-hero__negative');
      const layout = await negative.evaluate((element) => {
        const children = [...element.children].map((child) => {
          const rect = child.getBoundingClientRect();
          return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width };
        });
        const rect = element.getBoundingClientRect();
        return {
          flexDirection: getComputedStyle(element).flexDirection,
          bounds: { left: rect.left, right: rect.right, width: rect.width },
          children,
        };
      });

      expect(layout.flexDirection, `${path} at ${width}px`).toBe('column');
      expect(layout.children).toHaveLength(3);
      expect(layout.children[0].bottom, `${path} context clears summary at ${width}px`).toBeLessThanOrEqual(layout.children[1].top + 1);
      expect(layout.children[1].bottom, `${path} summary clears metadata at ${width}px`).toBeLessThanOrEqual(layout.children[2].top + 1);
      expect(layout.children[2].width, `${path} metadata uses the reading plane at ${width}px`).toBeGreaterThanOrEqual(layout.bounds.width * 0.6);
      for (const child of layout.children) {
        expect(child.left, `${path} child remains inside left edge at ${width}px`).toBeGreaterThanOrEqual(layout.bounds.left);
        expect(child.right, `${path} child remains inside right edge at ${width}px`).toBeLessThanOrEqual(layout.bounds.right + 1);
      }
    }
  }
});

test('About diorama keeps the operator portrait inside the stacked opening crop', async ({ page }) => {
  for (const width of [878, 946, 1024]) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/about/');

    const visibleSourceTop = await page.locator('[data-about-diorama] img').evaluate((image) => {
      const element = image as HTMLImageElement;
      const rect = element.getBoundingClientRect();
      const scale = Math.max(rect.width / element.naturalWidth, rect.height / element.naturalHeight);
      const renderedHeight = element.naturalHeight * scale;
      const verticalOverflow = Math.max(0, renderedHeight - rect.height);
      const positionY = Number.parseFloat(getComputedStyle(element).objectPosition.split(/\s+/)[1] ?? '50') / 100;
      return (verticalOverflow * positionY) / scale;
    });

    expect(visibleSourceTop, `portrait remains visible at ${width}px`).toBeLessThanOrEqual(64);
  }
});

test('work archive renders one canonical list and supports link filters', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByText('19 projects', { exact: true })).toBeVisible();
  await expect(page.locator('[data-work-item]')).toHaveCount(19);
  await page.getByRole('link', { name: 'XR and spatial computing', exact: true }).first().click();
  await expect(page).toHaveURL(/\/work\/domain\/xr\/$/);
  await expect(page.getByRole('link', { name: /IRA VR/ })).toBeVisible();
  await expect(page.locator('[data-work-item]:visible')).toHaveCount(6);
});

test('work archive opening speaks to visitors instead of publication mechanics', async ({ page }) => {
  await page.goto('/work/');

  await expect(page.getByText(/Full cases go deep/i)).toHaveCount(0);
  await expect(page.getByText('Start with the selected systems, browse by domain, or switch to a chronological view.')).toBeVisible();
});

test('footer invitation is a contained two-line lockup at every review width', async ({ page }) => {
  for (const width of [1186, 946, 390, 320]) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/work/');

    const invitation = page.getByRole('link', { name: 'Let’s compare notes', exact: true });
    await expect(invitation.locator('.site-footer__invitation-line')).toHaveCount(2);
    await invitation.scrollIntoViewIfNeeded();
    const geometry = await invitation.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    });
    expect(geometry.left, `${width}px left`).toBeGreaterThanOrEqual(0);
    expect(geometry.right, `${width}px right`).toBeLessThanOrEqual(width);
    expect(geometry.scrollWidth, `${width}px internal overflow`).toBeLessThanOrEqual(geometry.clientWidth + 1);
  }
});

test('stacked route openings remove the desktop center divider from the reading plane', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about/');
  const dividerDisplay = await page.locator('[data-route-opening]').evaluate((element) => getComputedStyle(element, '::after').display);
  expect(dividerDisplay).toBe('none');
});

test('concise work pages render a useful project story without empty case-study sections', async ({ page }) => {
  await page.goto('/work/the-brutal-spy/');
  await expect(page.getByRole('heading', { name: 'The Brutal Spy', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: /stealth shooter/i })).toBeVisible();
  await expect(page.locator('[data-case-part="story"]').getByText(/iPhone and iPad/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside' })).toHaveCount(0);
});

test('defense work names the full program and systems contribution', async ({ page }) => {
  await page.goto('/work/defense-simulation-systems/');

  const defenseRecord = await page.locator('main').textContent();
  for (const program of ['BLT T-72', 'Tunguska', 'LLLR', 'M777', 'T-90', 'Advanced Mannequin System', 'Radio Telephony']) {
    expect(defenseRecord).toContain(program);
  }
  expect(defenseRecord).not.toContain('Tata Safari');
  expect(defenseRecord).toMatch(/custom hardware[\s\S]*IMU[\s\S]*sensor[\s\S]*instructor[\s\S]*evaluation/i);
  const opening = page.locator('.case-hero');
  await expect(opening).toHaveAttribute('data-case-variant', 'systems-atlas');
  await expect(opening.locator('.case-hero__context')).toHaveText('2019–2021 · GreyKernel');
  await expect(opening.locator('.case-hero__media picture source[type="image/avif"]')).toHaveAttribute(
    'srcset',
    '/media/generated/editorial/defense-systems-atlas-v2.avif',
  );
  await expect(opening.locator('.case-hero__media img')).toHaveAttribute(
    'src',
    '/media/generated/editorial/defense-systems-atlas-v2.webp',
  );
  await expect(page.locator('.project-media figcaption')).not.toContainText(/generated editorial|not client documentation/i);
  await expect(page.locator('a[href*="drive.google.com"], a[href*="docs.google.com"]')).toHaveCount(0);
});

test('defense systems atlas remains cinematic and contained at every review width', async ({ page }) => {
  for (const width of [1440, 946, 390, 320]) {
    await page.setViewportSize({ width, height: 912 });
    await page.goto('/work/defense-simulation-systems/');

    const opening = page.locator('[data-case-variant="systems-atlas"]');
    await expect(opening).toBeVisible();
    await expect(opening.getByRole('heading', { level: 1, name: 'Defense technology and simulation' })).toBeVisible();
    await expect(opening.locator('.case-hero__summary')).toBeVisible();
    await expect(opening.locator('.case-hero__meta > div')).toHaveCount(3);

    const geometry = await opening.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
    });
    expect(geometry.left, `${width}px left`).toBeGreaterThanOrEqual(0);
    expect(geometry.right, `${width}px right`).toBeLessThanOrEqual(width);
    expect(geometry.scrollWidth, `${width}px internal overflow`).toBeLessThanOrEqual(geometry.clientWidth + 1);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/defense-simulation-systems/');
  await expect(page.locator('[data-case-variant="systems-atlas"]')).toHaveAttribute('data-motion-state', 'static');
});

test('enterprise immersive work includes the wider client and domain record', async ({ page }) => {
  await page.goto('/work/enterprise-immersive-systems/');

  const enterpriseRecord = await page.locator('main').textContent();
  expect(enterpriseRecord).toMatch(/JPMorgan Chase[\s\S]*Anglian Water[\s\S]*Voxel Worlds Apple/i);
  expect(enterpriseRecord).not.toMatch(/without inventing|public record|evidence/i);
  expect(enterpriseRecord).toContain('Cycling Without Age Singapore');
  expect(enterpriseRecord).toContain('Swissôtel');
  expect(enterpriseRecord).toMatch(/maritime/i);
  expect(enterpriseRecord).toMatch(/automotive|technical-learning/i);
  expect(enterpriseRecord).toMatch(/production-facility/i);
  await expect(page.getByRole('img', { name: /living room, street crossing, and supermarket/i })).toHaveAttribute(
    'src',
    '/media/generated/editorial/cycling-without-age-empathy-v3.webp',
  );
  await expect(page.getByRole('heading', { name: 'Sources and links' })).toBeVisible();
  await expect(page.locator('.prose p').filter({ hasText: /immersive lab.*Mumbai office/i })).toBeVisible();
});

test('enterprise facility preview uses the AI-enhanced poster while playback keeps the original tour', async ({ page }) => {
  await page.goto('/work/enterprise-immersive-systems/');
  const figure = page.locator('[data-case-part="contribution"] .project-media');
  const video = figure.locator('video');
  await expect(video).toHaveAttribute('poster', '/media/generated/editorial/landing/enterprise-xr-poster-v2.webp');
  await expect(video).toHaveAttribute('width', '1600');
  await expect(video).toHaveAttribute('height', '900');
  await expect(video.locator('source')).toHaveAttribute('src', '/media/work/enterprise-immersive-systems/facility-loop.mp4');
  await expect(video).toHaveJSProperty('paused', true);
  await figure.getByRole('button', { name: /^Play / }).click();
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(false);
});

test('MysticMojo record includes Nazara and the Chhota Bheem flying-game concept', async ({ page }) => {
  await page.goto('/work/mysticmojo/');

  const record = await page.locator('main').textContent();
  for (const detail of ['Nazara', 'Chhota Bheem Jungle Rescue', 'Google Play', 'flies across Dholakpur', 'water']) {
    expect(record).toContain(detail);
  }
  await expect(page.getByRole('img', { name: /Chhota Bheem Jungle Rescue/ })).toHaveAttribute(
    'src',
    '/media/career/chhota-bheem-jungle-rescue/concept-screens.webp',
  );
  await expect(page.getByRole('link', { name: /public gameplay/i })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=0c2jPM_p5_M');
  await expect(page.locator('.project-story__evidence')).toContainText(/alpha in April 2020.*Google Play release in October/i);
});

test('work detail exposes useful source links and CreativeWork structured data', async ({ page }) => {
  await page.goto('/work/kinema/');

  await expect(page.getByRole('heading', { name: 'Sources and links' })).toBeVisible();
  await expect(page.getByRole('link', { name: /GitHub repository/ })).toHaveAttribute(
    'href',
    'https://github.com/2600th/Kinema',
  );
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '[]');
  const creativeWork = jsonLd.find((entry: { '@type'?: string }) => entry['@type'] === 'CreativeWork');
  expect(creativeWork.name).toBe('Kinema | Case study');
  expect(creativeWork.about.name).toBe('Kinema');
  expect(creativeWork.citation).toContain('https://github.com/2600th/Kinema');
  expect(creativeWork.sameAs).toBeUndefined();
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});

test('note detail exposes article metadata and original source attribution', async ({ page }) => {
  await page.goto('/notes/ai-video-control/');

  await expect(page.getByText(/Adapted from my original post/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Read the original post/ })).toHaveAttribute(
    'href',
    'https://x.com/2600th/status/2091937799310393656',
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('Article');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});

test('unknown routes provide a useful return path', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: /not found/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Return home/i })).toHaveAttribute('href', '/');
});

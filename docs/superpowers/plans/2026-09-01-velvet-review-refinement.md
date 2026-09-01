# Velvet Reveal Adversarial Review Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the browser-review gaps with authentic archive media, disclosed editorial artwork, a responsive footer, visitor-facing copy, and one accessible GSAP motion system.

**Architecture:** Astro remains the semantic and static baseline. Work records own their media and public sources; generated identity/editorial assets live in separate provenance records and never become factual evidence. A route-scoped `site-motion.ts` module dynamically imports GSAP only when motion targets exist and disposes its context across Astro navigation.

**Tech Stack:** Astro 7, TypeScript 6, CSS, GSAP 3.15 with ScrollTrigger, Sharp, ffmpeg, Vitest, Playwright, axe-core, static GitHub Pages output.

**Spec:** `docs/superpowers/specs/2026-08-31-velvet-reveal-portfolio-redesign.md`

## Global Constraints

- Preserve originals and unrelated working-tree changes; write only optimized derivatives into `public/media`.
- Generated media is identity/editorial material only, visibly disclosed and excluded from evidence counts.
- Project video remains paused-first, poster-backed, user-controlled, keyboard-operable, and visibility-aware.
- No scroll hijacking, long pinned sections, automatic audio, inaccessible canvas-only meaning, or duplicate motion runtimes.
- Preserve semantic static HTML, no-JavaScript navigation, WCAG 2.2 AA, reduced motion, 44px touch targets where practical, and 320px containment.
- Describe designesto.ai as launching in 2026.
- Do not deploy, merge, push, or destructively clean.

---

### Task 1: Authentic Archive Media and Provenance

**Files:**
- Create: `public/media/work/the-brutal-spy/trailer-poster.webp`
- Create: `public/media/work/alphaman/gameplay-poster.webp`
- Create: `public/media/work/merkur-magie/store-poster.webp`
- Create: `public/media/work/homelane-spacecraft-pro/public-demo-poster.webp`
- Modify: `src/content/work/the-brutal-spy.md`
- Modify: `src/content/work/alphaman.md`
- Modify: `src/content/work/merkur-magie.md`
- Modify: `src/content/work/homelane-spacecraft-pro.md`
- Modify: `src/data/media-provenance.ts`
- Test: `tests/unit/career-content.test.ts`
- Test: `tests/unit/media.test.ts`
- Test: `tests/e2e/routes.spec.ts`

**Interfaces:**
- Consumes: public YouTube IDs `dB1g0Z5u3QU`, `bGEhhltqLmw`, `yDFFZskBKaA`; Google Play package `com.Gauselmann.MerkurMagie`.
- Produces: four 16:9 or 4:3 responsive WebP poster paths referenced by `heroMedia.src`; exact public URLs in `sources` and `MEDIA_PROVENANCE`.

- [ ] **Step 1: Add failing content and route assertions**

```ts
const requiredArchiveMedia = new Map([
  ['the-brutal-spy', '/media/work/the-brutal-spy/trailer-poster.webp'],
  ['alphaman', '/media/work/alphaman/gameplay-poster.webp'],
  ['merkur-magie', '/media/work/merkur-magie/store-poster.webp'],
]);
for (const record of readWorkRecords()) {
  const expected = requiredArchiveMedia.get(record.slug);
  if (expected) expect(record.heroMedia?.src).toBe(expected);
}
```

Add a Playwright assertion that the first three `[data-work-item]` rows contain `img` elements and that SpaceCraft uses `public-demo-poster.webp`.

- [ ] **Step 2: Run the focused tests and confirm the missing-media failure**

Run: `npm test -- tests/unit/career-content.test.ts tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts --grep "archive"`

Expected: FAIL because the first three records have no `heroMedia` and the derivative files do not exist.

- [ ] **Step 3: Acquire and optimize only public media**

Use the public YouTube thumbnails or downloaded public video frames, plus official Play Store artwork. Crop for legibility, encode with Sharp at WebP quality 82, preserve the downloaded originals outside shipping media, and record the exact source URL. Select frames that show the shipped experience rather than title cards when possible.

- [ ] **Step 4: Connect content and provenance**

Add frontmatter shaped like:

```yaml
heroMedia:
  src: /media/work/the-brutal-spy/trailer-poster.webp
  alt: The Brutal Spy top-down stealth gameplay from the official launch trailer
  width: 1280
  height: 720
sources:
  - label: Official launch trailer
    url: https://www.youtube.com/watch?v=dB1g0Z5u3QU
    type: official-source
```

Use equivalent factual labels for Alphaman, Merkur Magie, and SpaceCraft; do not expand unsupported claims.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- tests/unit/career-content.test.ts tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts --grep "archive"`

Expected: PASS.

Commit only Task 1 paths with message `feat: add authentic archive media`.

### Task 2: Generated Editorial and Character-World Assets

**Files:**
- Create: `public/media/generated/editorial/defense-systems-diorama.webp`
- Create: `public/media/generated/identity/2600th-operator-diorama.webp`
- Create: `public/media/generated/identity/2600th-equipment-inventory.webp`
- Modify: `public/media/generated/identity/provenance.json`
- Modify: `src/data/media-provenance.ts`
- Modify: `src/content/work/defense-simulation-systems.md`
- Test: `tests/unit/media.test.ts`
- Test: `tests/e2e/routes.spec.ts`

**Interfaces:**
- Consumes: the supplied 2600th character reference and the existing generated-character provenance convention.
- Produces: three prompt-embedded WebP assets with `evidenceUse: false`; a defense hero image whose caption explicitly says `Generated editorial illustration · not client documentation`.

- [ ] **Step 1: Add failing disclosure and provenance tests**

```ts
expect(MEDIA_PROVENANCE['/media/generated/editorial/defense-systems-diorama.webp']).toMatchObject({
  status: 'generated-editorial',
  evidenceUse: false,
});
```

Extend the route test to require the defense caption disclosure and keep generated images out of evidence surfaces.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts --grep "defense"`

Expected: FAIL because the assets and generated-media provenance type do not exist.

- [ ] **Step 3: Generate and inspect the three assets**

Generate the defense diorama as an abstract training-systems environment with no insignia, weapons, or identifiable military hardware. Generate the operator diorama and equipment inventory from the supplied identity reference with a VR headset, controller, sensors, compact case, notebook, and workstation objects; preserve face, glasses, beard, broad build, black technical clothing, and restrained cobalt accents. Reject outputs with illegible anatomy, fake logos, franchise mimicry, or project-claim text.

- [ ] **Step 4: Optimize, embed prompts, and record provenance**

Use Sharp to create WebP derivatives under 500 KB where visual quality permits, then run:

```powershell
node C:\Users\Machine\.agents\skills\impeccable\scripts\embed-prompt.mjs public/media/generated/editorial/defense-systems-diorama.webp --prompt "Premium editorial systems diorama for a portfolio: an abstract modular training simulation environment built from a dark circular command table, sensor arcs, tracked motion markers, instructor station, evaluation screens, and restrained cobalt and warm-gold light; cinematic three-quarter view, black velvet background, no people, no logos, no readable UI, no weapons, no identifiable military hardware, no text, clearly conceptual rather than documentary."
node C:\Users\Machine\.agents\skills\impeccable\scripts\embed-prompt.mjs public/media/generated/identity/2600th-operator-diorama.webp --prompt "Use the supplied 2600th character reference as identity and wardrobe guidance. Create a premium cinematic miniature operator workshop diorama: the same Indian man with tall black hair, full beard, bold black glasses, broad build, layered black technical coat and restrained cobalt accents, standing calmly beside a modular workbench with VR headset, spatial controller, compact field case, small sensors, notebook and workstation equipment; black velvet environment, warm gold practical light, precise cobalt system light, no logos, no weapons, no franchise resemblance, no text, no client or product claims."
node C:\Users\Machine\.agents\skills\impeccable\scripts\embed-prompt.mjs public/media/generated/identity/2600th-equipment-inventory.webp --prompt "Use the supplied 2600th character reference for material and color language only. Create a premium top-down modular equipment inventory arranged on black velvet: VR headset, spatial controllers, compact rugged field case, small tracking sensors, foldable keyboard, black notebook, stylus, cables and adapters, all in matte black technical materials with restrained cobalt details and tiny warm-gold highlights; spacious editorial composition, no person, no logos, no weapons, no text, no fake interfaces."
```

Record the reference path, prompt, generation date, `evidenceUse: false`, and `status: generated-editorial` or `generated-identity`.

- [ ] **Step 5: Connect the defense illustration, run tests, and commit**

Run: `npm test -- tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts --grep "defense"`

Expected: PASS with the disclosure visible and no generated asset inside `[data-evidence-surface]`.

Commit only Task 2 paths with message `feat: expand disclosed editorial artwork`.

### Task 3: Visitor-Facing Copy and Responsive Footer

**Files:**
- Modify: `src/pages/work/index.astro`
- Modify: `src/components/shared/SiteFooter.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/routes.spec.ts`
- Test: `tests/e2e/release.spec.ts`

**Interfaces:**
- Consumes: existing `.site-footer__invitation` and route-opening structures.
- Produces: visitor-facing archive opening copy and a two-line `.site-footer__invitation-line` lockup contained at 1186, 946, 390, and 320px.

- [ ] **Step 1: Add failing copy and geometry tests**

```ts
await expect(page.getByText(/Full cases go deep/i)).toHaveCount(0);
for (const width of [1186, 946, 390, 320]) {
  await page.setViewportSize({ width, height: 912 });
  await page.goto('/work/');
  const box = await page.locator('.site-footer__invitation > a').boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? width + 1)).toBeLessThanOrEqual(width);
}
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts --grep "footer|archive copy"`

Expected: FAIL on the old inward-facing copy or footer geometry.

- [ ] **Step 3: Implement the copy and lockup**

Replace the archive introduction with language that helps visitors choose relevant work. Split the footer CTA into authored line spans, use `font-size: clamp(2.9rem, 7vw, 7.8rem)`, `line-height: 0.9`, and `letter-spacing: -0.045em`, and ensure the arrow remains aligned without contributing to line wrapping.

- [ ] **Step 4: Run focused tests and commit**

Run: `npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts --grep "footer|archive copy"`

Expected: PASS.

Commit only Task 3 paths with message `fix: clarify archive and contain footer type`.

### Task 4: About Atlas, Hero Signals, and Route-Scoped GSAP

**Files:**
- Create: `src/scripts/site-motion.ts`
- Create: `tests/unit/site-motion.test.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/home/VelvetHero.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/styles/content-pages.css`
- Modify: `src/styles/global.css`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/routes.spec.ts`

**Interfaces:**
- Produces: `initSiteMotion(root: ParentNode = document): () => void`; `data-motion-scope`, `data-motion-reveal`, `data-hero-signal`, and `data-operating-atlas` hooks.
- Consumes: GSAP core and ScrollTrigger through dynamic imports; generated identity assets from Task 2.

- [ ] **Step 1: Add failing unit and browser behavior tests**

```ts
expect(resolveMotionMode({ reducedMotion: true, hasTargets: true })).toBe('static');
expect(resolveMotionMode({ reducedMotion: false, hasTargets: true })).toBe('enhanced');
expect(resolveMotionMode({ reducedMotion: false, hasTargets: false })).toBe('none');
```

Add browser assertions for one semantic hero signal sentence, three About atlas acts, the generated-art disclosure, and static opacity/transform values under reduced motion.

- [ ] **Step 2: Run tests and confirm the missing-motion failure**

Run: `npm test -- tests/unit/site-motion.test.ts && npx playwright test tests/e2e/home.spec.ts tests/e2e/routes.spec.ts --grep "motion|atlas|hero signal"`

Expected: FAIL because `site-motion.ts` and the DOM hooks do not exist.

- [ ] **Step 3: Install GSAP and implement the pure mode resolver**

Run: `npm install gsap@3.15.0`

Implement:

```ts
export type MotionMode = 'none' | 'static' | 'enhanced';
export function resolveMotionMode(input: { reducedMotion: boolean; hasTargets: boolean }): MotionMode {
  if (!input.hasTargets) return 'none';
  return input.reducedMotion ? 'static' : 'enhanced';
}
```

- [ ] **Step 4: Implement disposable route motion**

`initSiteMotion` checks targets before dynamically importing GSAP, creates one `gsap.context`, registers ScrollTrigger once, uses `gsap.matchMedia()` for reduced motion and desktop pointer depth, and returns a cleanup that reverts match media/context and kills only triggers created by that scope. Bind cleanup before Astro `after-swap` reinitialization.

- [ ] **Step 5: Build static-first hero signals and About atlas**

Keep a complete visible sentence in the hero, use animated domain emphasis only as enhancement, and add the three-act atlas plus character/equipment diorama to About. Use `aria-hidden="true"` only on duplicated decorative labels; the semantic career acts remain ordinary HTML.

- [ ] **Step 6: Run focused tests and commit**

Run: `npm test -- tests/unit/site-motion.test.ts && npx playwright test tests/e2e/home.spec.ts tests/e2e/routes.spec.ts --grep "motion|atlas|hero signal"`

Expected: PASS with reduced motion static and no duplicate listeners after navigation.

Commit only Task 4 paths with message `feat: add accessible cinematic motion system`.

### Task 5: Visual QA, Mechanical Audit, and Release Gate

**Files:**
- Create: `.impeccable/review/velvet-refinement/`
- Modify: only files implicated by verified findings

**Interfaces:**
- Consumes: all earlier tasks.
- Produces: reviewed screenshots at 1440, 1186, 946, 390, and 320px plus a fresh authoritative verification result.

- [ ] **Step 1: Load the Impeccable craft floor immediately before UI edits finish**

Read `C:\Users\Machine\.agents\skills\impeccable\reference\craft-floor.md` completely and apply its bans and quality floor to the changed surfaces.

- [ ] **Step 2: Run the one required mechanical detector pass**

Run:

```powershell
node C:\Users\Machine\.agents\skills\impeccable\scripts\detect.mjs --json src/components/home/VelvetHero.astro src/components/shared/SiteFooter.astro src/pages/about.astro src/pages/work/index.astro src/styles/global.css src/styles/content-pages.css
```

Fix material findings once; do not loop the detector.

- [ ] **Step 3: Capture and inspect the complete path**

Capture home, work, About, defense, SpaceCraft, notes, Lab, and 404. Inspect the exact 1186px footer and the 1440/946/390/320 layout set in one batch. Verify keyboard focus, reduced motion, JavaScript-disabled content, video pause state, generated-art disclosure, and absence of horizontal overflow.

- [ ] **Step 4: Apply one batched visual correction and confirm once**

Address every material defect found in Step 3 together, rerun only affected tests, and capture one confirmation set. Stop polishing after the confirmation pass.

- [ ] **Step 5: Run the authoritative gate**

Run: `npm run verify`

Expected: Astro check has 0 errors/warnings/hints; Vitest and Playwright pass; production build and artifact verification succeed with 17 work routes and the existing canonical route counts.

- [ ] **Step 6: Review the source diff and report**

Inspect `git diff --check`, `git status --short`, and the changed-file diff. Remove accidental churn and orphaned temporary references while preserving unrelated work. Do not push, merge, deploy, or destructively clean.

# Cinematic Route Media Refinement Implementation Plan

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the Velvet hero’s responsive typography and replay behavior, turn its operating-domain list into character-linked signals, and add fast, art-directed media to the Work and Notes openings.

**Architecture:** Keep Astro pages server-rendered and useful without JavaScript. Use native `<picture>` elements with AVIF-first and WebP fallback sources, reserve intrinsic dimensions, and add motion only as progressive enhancement through the existing GSAP site-motion layer. The cinematic intro becomes load-scoped rather than session-scoped, while reduced-motion and canvas-unavailable paths remain static.

**Tech Stack:** Astro 7, TypeScript, GSAP 3, Sharp 0.35, Vitest, Playwright.

**Spec:** Approved conversation direction for the 2600th Operator–Advisor portfolio; existing visual contract in `DESIGN.md`.

## Global Constraints

- Preserve all source media and unrelated working-tree changes; create only optimized derivatives.
- Do not deploy, push, merge, clean, or create a broad commit from the dirty working tree.
- Keep authentic project media distinct from generated editorial imagery and retain provenance records.
- Support 320px mobile, keyboard access, reduced motion, no-JavaScript rendering, and contained layouts.
- Use AVIF first with WebP fallback, explicit image dimensions, `decoding="async"`, and lazy loading for route-opening media.
- Keep `2600 / OP/ADV`; remove only the visible hero sentence `Generated 2600th identity study · not project evidence`.

---

### Task 1: Specify the corrected hero behavior

**Files:**
- Modify: `tests/unit/cinematic-intro.test.ts`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `src/scripts/cinematic-intro.ts`
- Modify: `src/components/home/VelvetHero.astro`
- Modify: `src/scripts/site-motion.ts`

**Interfaces:**
- Consumes: `[data-velvet-hero]`, `[data-cinematic-skip]`, `[data-domain-trace]`, the existing `initSiteMotion()` entrypoint.
- Produces: `getCinematicMode({ reducedMotion, canvasAvailable })`, load-scoped intro playback, and `data-domain-target` anchors for glasses, harness, and boots.

- [ ] **Step 1: Write failing unit and browser tests**

  Change the unit contract so motion-capable loads always return `play`; keep reduced-motion and missing-canvas results deterministic. Change browser coverage so skipping settles only the current playback, reloading starts another playback, the visible disclosure is absent, `2600 / OP/ADV` remains, and three domain signals expose distinct target anchors. Add a 946px geometry assertion that every rendered title line has positive line-box separation and remains inside the copy plane.

- [ ] **Step 2: Run tests and verify the expected failures**

  Run: `npm test -- tests/unit/cinematic-intro.test.ts && npx playwright test tests/e2e/home.spec.ts`

  Expected failures: the old session state settles after reload; the disclosure still exists; domain target anchors are absent; current title geometry crowds at 946px.

- [ ] **Step 3: Implement the minimal hero correction**

  Remove session storage from the intro decision and settle path. Keep Escape and Skip as current-playback controls. Replace the visible disclosure with no DOM copy while retaining provenance files. Relax title stretch/tracking/line-height and cap the intermediate viewport size. Give each domain signal a named target and a CSS connector/marker aligned to the corresponding character region. Update GSAP to animate the active signal and its matching marker without moving the label into text.

- [ ] **Step 4: Re-run focused tests**

  Run: `npm test -- tests/unit/cinematic-intro.test.ts && npx playwright test tests/e2e/home.spec.ts`

  Expected: all focused tests pass.

---

### Task 2: Add optimized Work and Notes opening media

**Files:**
- Create: `scripts/build-route-opening-media.mjs`
- Create: `public/media/routes/work/*.avif`
- Create: `public/media/routes/work/*.webp`
- Create: `public/media/routes/notes/notes-aperture-*.avif`
- Create: `public/media/routes/notes/notes-aperture-*.webp`
- Modify: `src/pages/work/index.astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/styles/content-pages.css`
- Modify: `tests/e2e/routes.spec.ts`
- Modify: `tests/e2e/release.spec.ts`
- Modify: `tests/unit/media.test.ts`

**Interfaces:**
- Consumes: authentic IRA VR, SpaceCraft Pro, and designesto.ai poster sources plus the generated editorial Notes aperture.
- Produces: `[data-work-opening-media]` with three linked evidence frames and `[data-notes-opening-media]` with one editorial picture and provenance-aware caption.

- [ ] **Step 1: Write failing route and media tests**

  Assert that Work exposes three linked pictures with AVIF and WebP sources, project-specific accessible names, fixed dimensions, lazy loading, and no generated media. Assert that Notes exposes one art-directed AVIF/WebP picture with an editorial caption, lazy loading, and fixed dimensions. Add 320px, 390px, 946px, and 1280px containment checks and a derivative-size ceiling of 180 KB per route-opening image.

- [ ] **Step 2: Run tests and verify the expected failures**

  Run: `npm test -- tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts`

  Expected failures: opening media selectors and optimized derivative files do not yet exist.

- [ ] **Step 3: Build responsive derivatives without touching originals**

  Implement a deterministic Sharp script that writes 640px and 960px AVIF/WebP derivatives, strips metadata, and refuses unknown inputs. Run: `node scripts/build-route-opening-media.mjs`.

- [ ] **Step 4: Implement the two opening compositions**

  In Work, replace the empty upper negative plane with a staggered three-frame evidence reel linking to IRA VR, SpaceCraft Pro, and designesto.ai. In Notes, place the Notes aperture as an editorial workbench field with a concise generated-editorial caption. Use CSS grid and `object-position` values that remain legible when stacked; hover/focus may lift a frame, but the content remains complete without motion or JavaScript.

- [ ] **Step 5: Re-run focused route and media tests**

  Run: `npm test -- tests/unit/media.test.ts && npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts`

  Expected: all focused tests pass.

---

### Task 3: Progressive motion, adversarial review, and release verification

**Files:**
- Modify if findings require it: `src/scripts/site-motion.ts`
- Modify if findings require it: `src/styles/content-pages.css`
- Create: `.impeccable/review/route-media-refinement/*.png`

**Interfaces:**
- Consumes: route-opening media selectors and the existing `data-motion-scope` contract.
- Produces: restrained reveal/parallax behavior with reduced-motion static fallback and verified review captures.

- [ ] **Step 1: Add failing motion/containment coverage if visual inspection exposes a reproducible defect**

  For each reproducible issue, name the break in a focused Playwright assertion before changing production CSS or script behavior.

- [ ] **Step 2: Add only the motion needed by the approved surfaces**

  Reveal the Work frames in a short stagger and give the Notes image a bounded light sweep/parallax on fine pointers. Keep all transforms off for reduced motion and never autoplay route-opening video.

- [ ] **Step 3: Run specialist adversarial review**

  Review Home at 946px and 390px, plus Work and Notes at 1280px, 946px, 390px, and 320px. Check hierarchy, cropping, focus, copy overlap, reduced motion, layout shift, and load priorities. Address all critical and important findings.

- [ ] **Step 4: Run the required Impeccable detector**

  Run: `node C:\Users\Machine\.agents\skills\impeccable\scripts\detect.mjs --json src/components/home/VelvetHero.astro src/pages/work/index.astro src/pages/notes/index.astro src/styles/content-pages.css src/scripts/cinematic-intro.ts src/scripts/site-motion.ts`

- [ ] **Step 5: Run the full authoritative verification gate**

  Run: `npm run verify`

  Expected: Astro check has zero errors/warnings/hints; Vitest and Playwright have zero failures; production build and artifact verification succeed.

- [ ] **Step 6: Inspect the final diff without committing**

  Run: `git diff --check` and a scoped `git status --short` review. Confirm no source originals, unrelated user files, deployment state, or Git history were changed.

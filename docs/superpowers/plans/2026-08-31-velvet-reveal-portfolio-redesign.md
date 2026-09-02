# Velvet Reveal Portfolio Redesign Implementation Plan

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

**Goal:** Rebuild every public portfolio surface around the approved cinematic Velvet Reveal direction while preserving factual evidence, static resilience, accessibility, and performance.

**Architecture:** Astro keeps the complete semantic and evidence layer. A shared dark editorial shell and route-level compositions provide the visual system. The homepage alone progressively enhances its static hero with a small, disposable particle/seam runtime; authentic project media remains independent and user controlled.

**Tech Stack:** Astro 7, TypeScript 6, CSS, Three.js points/lines only, Vitest, Playwright, axe-core, Sharp, static GitHub Pages output.

**Spec:** `docs/superpowers/specs/2026-08-31-velvet-reveal-portfolio-redesign.md`

**Constraints:** Preserve originals, unrelated changes, verified claims, evidence provenance, and every published route. Generated imagery is identity/editorial material only. Do not deploy, merge, push, or destructively clean.

## Task 1: Freeze the reference and executable contract

**Files:**
- Modify: `.impeccable/mocks/decision/54-velvet-reveal-2600th.json`
- Create: `.impeccable/surfaces/velvet-reveal.md`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/routes.spec.ts`
- Create: `tests/unit/cinematic-intro.test.ts`

- [ ] Mark the selected comp approved and record the responsive, evidence, motion, and disclosure decisions in the surface brief.
- [ ] Replace old positive/negative homepage expectations with the new semantic hero, selected-work, disclosure, no-JS, skip, repeat-session, reduced-motion, video, footer, and 320px contracts.
- [ ] Add pure cinematic-state tests for first visit, session-seen, reduced motion, and missing canvas/WebGL support.
- [ ] Run the targeted tests and record the expected failures before production changes.

## Task 2: Produce the 2600th identity asset

**Files:**
- Create: `public/media/generated/identity/2600th-velvet-character.webp`
- Create: `public/media/generated/identity/2600th-velvet-character-640.webp`
- Create: `public/media/generated/identity/provenance.json`
- Modify: `src/data/media-provenance.ts`
- Modify: `tests/unit/media.test.ts`

- [ ] Generate a production-resolution transparent or clean dark-background character asset from the supplied reference, with no text, logos, weapon, or franchise mimicry.
- [ ] Inspect the output at full resolution, remove weak generations, create responsive WebP copies, and preserve the source generation outside factual project media.
- [ ] Embed the exact prompt and add provenance plus an explicit `evidenceUse: false` classification.
- [ ] Make the provenance test pass before the asset is used by the page.

## Task 3: Rebuild the shared shell and visual system

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/shared/SiteHeader.astro`
- Modify: `src/components/shared/SiteFooter.astro`
- Modify: `src/styles/global.css`
- Modify: `src/data/site.ts`
- Modify: `public/lab/terminal/style.css`

- [ ] Replace the split palette with the velvet/cobalt/gold token system, authored focus/selection/scrollbar states, fluid type, and responsive spacing.
- [ ] Build the compact global navigation and dark continuous footer; keep archive and Lab discoverable without a blue footer block.
- [ ] Preserve canonical metadata, JSON-LD, social metadata, theme-color correctness, and no-JS navigation.
- [ ] Run Astro check and shared route/accessibility regressions.

## Task 4: Build the static hero and cinematic enhancement

**Files:**
- Create: `src/components/home/VelvetHero.astro`
- Create: `src/scripts/cinematic-intro.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Implement the approved static composition first: protected reading plane, character picture, domain traces, disclosure, and CTA.
- [ ] Implement a bounded first-session particle/seam reveal with skip/Escape, page-visibility pause, DPR/particle adaptation, reduced motion, repeat-session bypass, and complete disposal.
- [ ] Keep all meaningful copy and controls outside the canvas; ensure failure of the enhancement leaves the final composition intact.
- [ ] Make unit and homepage behavior tests pass.

## Task 5: Recompose the homepage below the fold

**Files:**
- Modify: `src/components/home/SignalWork.astro`
- Modify: `src/components/home/ProofLine.astro`
- Modify: `src/components/home/PublicBuild.astro`
- Modify: `src/components/home/ConversationClose.astro`
- Modify: `src/pages/index.astro`
- Modify: `tests/e2e/home.spec.ts`

- [ ] Reduce the homepage to three large authentic evidence planes, three operating-problem rows, a concise proof ledger, one current-build signal, and one contact close.
- [ ] Preserve paused-first, poster-backed, user-controlled media and honest evidence language.
- [ ] Remove duplicate résumé copy, generic cards, and any claim that designesto.ai has already launched.
- [ ] Verify keyboard use, reduced motion, no-JS content, and responsive containment.

## Task 6: Carry the system through every surface

**Files:**
- Modify: `src/styles/content-pages.css`
- Modify: `src/pages/work/index.astro`
- Modify: `src/pages/work/[slug].astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/lab/index.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/components/work/ProjectMedia.astro`
- Modify: `src/components/work/EvidenceSources.astro`
- Modify: `tests/e2e/routes.spec.ts`
- Modify: `tests/e2e/release.spec.ts`

- [ ] Recompose the Work index, case-study shell, About dossier, Notes reading surfaces, Lab ledger, and 404 in the same velvet editorial system.
- [ ] Keep all source links, uncertainty markers, route counts, evidence media, accessible labels, and structured data intact.
- [ ] Remove residual positive/negative and blue-footer visual logic.
- [ ] Run focused route, SEO, accessibility, and content tests.

## Task 7: Adversarial visual and performance review

**Files:**
- Create: `.impeccable/review/velvet-final/`
- Modify: only files implicated by verified findings

- [ ] Capture home, work, one case, notes, about, lab, and 404 at 1440px, 946px, 390px, and 320px.
- [ ] Compare the first viewport with the approved reference; audit hierarchy, density, crop, character disclosure, touch targets, contrast, overflow, focus, motion, video behavior, and loading.
- [ ] Inspect the generated identity asset and all selected authentic project media rather than judging filenames alone.
- [ ] Address material findings and rerun the affected tests.

## Task 8: Complete release verification

**Files:**
- Modify: only files implicated by verification failures

- [ ] Scan shipping raster directories for embedded generation prompts and provenance.
- [ ] Run `npm run verify` from a fresh production build and retain exact results.
- [ ] Inspect final pages in a real browser with normal motion, reduced motion, keyboard navigation, disabled JavaScript, and mobile widths.
- [ ] Report the outcome and any honest remaining limitation; do not deploy, merge, or push.

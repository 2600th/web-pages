# Positive / Negative Portfolio Reconstruction Implementation Plan

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the complete Astro portfolio around the approved Positive / Negative reference while preserving evidence truth, routes, accessibility, and static deployment.

**Architecture:** Keep Astro content collections and optimized authentic media as the factual layer. Replace the shared shell, homepage composition, interior route shells, and closing/footer structure with a single split optical system. CSS and small progressive-enhancement scripts provide interaction; semantic HTML remains complete without JavaScript.

**Tech Stack:** Astro 7, TypeScript 6, CSS, Vitest, Playwright, axe-core, static GitHub Pages output.

**Spec:** `docs/superpowers/specs/2026-08-27-positive-negative-portfolio-redesign.md`

## Global Constraints

- `.impeccable/mocks/clarity-round/32-positive-negative.png` is the visual authority for the first viewport.
- Preserve every verified claim, route, evidence boundary, and authentic-media provenance record.
- designesto.ai must read `launching in 2026`, never already launched.
- Cobalt `#2457ff` is limited to the exposure boundary, focus, active state, and compact evidence signals; no full-blue footer, contact plane, or evidence region.
- Generated media is identity material only, never project or career evidence.
- Static Astro output, reduced motion, WCAG 2.2 AA, keyboard access, poster fallbacks, and 320px containment are mandatory.
- Do not deploy, merge, push, or rewrite unrelated source material.

---

### Task 1: Lock the reconstruction contract and rebuild the shared shell

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/release.spec.ts`
- Modify: `tests/e2e/routes.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/shared/SiteHeader.astro`
- Modify: `src/components/shared/SiteFooter.astro`
- Modify: `src/styles/global.css`
- Modify: `public/lab/terminal/style.css`

**Interfaces:**
- Produces a shared header/footer, polarity tokens, archive URL contract, and behavior selectors consumed by all later tasks.

- [ ] Write Playwright regressions that assert a split conversation/footer close without a full-blue background, visible light/dark primary CTA text, a working `/lab/terminal/index.html` archive link, and a non-overlapping mobile archive return action.
- [ ] Run the targeted tests and confirm they fail for the current blue close, CTA specificity collision, directory archive URL, or fixed mobile overlay.
- [ ] Rebuild the shared shell and footer. Keep Work/Lab/Notes/Contact navigation, make the footer part of a positive/negative closing plane, fix the CTA specificity contract, use the explicit archive file path, and place the archive return action in mobile flow.
- [ ] Run `npm run check` and targeted Playwright tests until the shell contract passes.
- [ ] Commit only this task's files and report the exact commands and results.

### Task 2: Reconstruct the homepage from the approved comp

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/home/PositiveNegativeHero.astro`
- Modify: `src/components/home/SignalWork.astro`
- Modify: `src/components/home/ProofLine.astro`
- Modify: `src/components/home/PublicBuild.astro`
- Modify: `src/components/home/RecentThinking.astro`
- Modify: `src/components/home/ConversationClose.astro`
- Modify: `src/scripts/exposure-hero.ts`
- Modify: `src/scripts/signal-work.ts`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes the Task 1 shell and polarity tokens.
- Produces the final homepage section contract and selectors used in the release suite.

- [ ] Add failing behavior tests for one H1, the exposure control, three featured work chapters, authentic media, compact proof index, public-build ledger, three notes, one conversation close, reduced motion, and 320px containment.
- [ ] Verify the new contract fails against the current homepage before implementation.
- [ ] Reproduce the approved hero: true 50/50 planes, monumental image-filled name spanning the divide, boundary control, sparse navigation relationship, lower-left positioning, and outlined work action.
- [ ] Replace the current six unrelated layouts with the specified editorial sequence. Restrict cobalt to signals; move Kinema into Public Build; remove the full-blue close.
- [ ] Keep media poster-first, paused outside view, and still under reduced motion.
- [ ] Capture the comp-sized hero into `.impeccable/review/hero-repro.png` and compare it beside the approved reference before building past the first viewport.
- [ ] Run targeted homepage tests and `npm run check`.
- [ ] Commit only this task's files and report the exact commands and results.

### Task 3: Recompose every interior surface

**Files:**
- Modify: `src/styles/content-pages.css`
- Modify: `src/pages/work/index.astro`
- Modify: `src/pages/work/[slug].astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/lab/index.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/components/work/EvidenceSources.astro`
- Modify: `src/components/work/ProjectMedia.astro`
- Modify: `tests/e2e/routes.spec.ts`
- Modify: `tests/e2e/release.spec.ts`

**Interfaces:**
- Consumes the shared split shell and homepage typography/rule system.
- Produces consistent route openings, evidence ledgers, reading surfaces, filters, and media controls.

- [ ] Add failing route tests for 17 Work items, all filters, six Notes, split route openings, evidence-source visibility, one H1, 320px containment, and absence of full-cobalt evidence panels.
- [ ] Verify the route contract fails before implementation.
- [ ] Replace generated aperture openings with route-specific split typography; preserve generated assets and provenance files unless they become genuinely unused after the full build.
- [ ] Recompose Work as an inspectable index, Lab as a public-build ledger, Notes as a reading index, About as an operating dossier, and 404 as a concise split surface.
- [ ] Reorganize case pages into thesis, contribution, system, evidence, and sources while preserving every factual claim, link, media item, and evidence boundary.
- [ ] Run route, release, accessibility, and 320px tests plus `npm run check`.
- [ ] Commit only this task's files and report exact commands and results.

### Task 4: Integrate, review, and verify the reconstructed site

**Files:**
- Modify: UI/test files from Tasks 1-3 only when integration findings require it.
- Replace: `DESIGN.md`
- Add or replace: `.impeccable/review/desktop.png`
- Add or replace: `.impeccable/review/mobile.png`
- Add or replace: `.impeccable/review/user-946.png`

**Interfaces:**
- Consumes all prior tasks and produces a verified, documented branch state.

- [ ] Run one batched visual inspection at 1440px, the user's 946px viewport, 390px, and the 320px floor across homepage, Work, a long case, Notes, About, Lab, 404, and the console archive.
- [ ] Check the hero side-by-side against the approved comp and batch all material visual fixes.
- [ ] Run the Impeccable detector once over every changed UI target and resolve material findings.
- [ ] Run the shipped Impeccable finish reviewer with the approved comp, contract, screenshots, and craft-floor reference; apply one bounded fix batch if required and re-review.
- [ ] Rewrite `DESIGN.md` from the implemented world, including palette, typography, layout, motion, evidence, accessibility, and responsive rules.
- [ ] Run `npm run verify`; inspect the production build locally; confirm all routes and static artifacts.
- [ ] Commit only integration/documentation changes and report the exact verification evidence without deploying or pushing.

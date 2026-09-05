# Approved layout integration and release

> Execute with subagent-driven-development. User explicitly approved integration and deployment on the existing main checkout; preserve preceding release work.

**Goal:** Ship the selected Orbital hero, approved image-led Work gallery, and approved compact project-reading layout on 2600th.com.

**Architecture:** Adapt the approved local prototypes into existing Astro components. Use one canonical set of content entries, existing responsive image delivery, native links, and the existing motion preference. Publish through the existing verified GitHub Pages workflow.

**Spec:** `design-previews/hero-directions/stage.html` (C), `layouts.html`, `gallery-direction.md`, and the user's approval in this conversation.

## Global Constraints

- Preserve Velvet Reveal palette, Mona Sans, character and factual content. No new imagery, facts, autoplay video or dependencies.
- All 19 visible projects remain available. The compatibility record stays out of the archive. Domain routes, no-JS links and chronological ordering remain usable.
- Preserve the existing pending source/media refinements and originals. Production excludes design-previews and private research.
- Reduced motion and the shared motion toggle must stop animation. Static composition remains usable. Mobile orbit follows the portrait and stays out of text.
- Integration and deployment are authorized; no force push, branch deletion, history rewriting, or unrelated cleanup.
- Workers own distinct files and never commit/push; controller reviews the combined release and owns the commit and deployment.

## Task 1: Orbital hero

Files: `src/components/home/VelvetHero.astro`, `src/scripts/cinematic-intro.ts`, an optional pure `src/scripts/orbital-geometry.ts`, hero-specific unit/e2e tests.
Consumes: approved C draw geometry and portrait layout from stage.html, existing shared motion preference.
Produces: production Orbital hero with the same content/hooks, native marker controls and responsive layout.

- [ ] Add a failing geometry test for 320/390/430/700px containment and portrait alignment, and mobile hero browser assertions (portrait beside headline, actions below full copy, no overflow).
- [ ] Replace the grid rendering with the approved C geometry; measure portrait/canvas relative bounds on resize, not viewport-only proportions. Retain pause/reduced-motion/visibility/dispose lifecycle. Remove obsolete grid code only within the owned script.
- [ ] Match compact mobile composition: ~330px portrait at the right of the heading, full intro beneath, two 44px+ actions. Desktop retains larger portrait and left copy. Preserve all content, but remove the redundant identity kicker absent in approved preview.
- [ ] Run covering unit/e2e tests and write a report to `.superpowers/sdd/approved-layout-integration/hero-report.md`.

## Task 2: Production Work gallery

Files: `src/pages/work/index.astro`, Work list/gallery component(s), domain route if needed, new gallery-scoped CSS, gallery-specific unit/e2e tests. Do not edit shared content-pages.css.
Consumes: full work collection and domain metadata; ResponsiveImage component; approved layouts.html gallery.
Produces: one semantic project collection with featured/default and filtered/chronological layouts.

- [ ] Add failing browser tests for featured hierarchy, all 19 links, domain filtering, chronological order, no-JS navigation and mobile single-column containment.
- [ ] Replace decorative opening collage with compact Projects heading and introduction. Default feature is Blocks with Designesto and IRA VR beside it; remaining records use two columns. Use existing sourced project data and optimized images, and native project links.
- [ ] Keep all records once in DOM; on filtering or chronological ordering use uniform two-column grid. Mobile is one image-led column with a native selector. Preserve live result count, source-backed domain routes and keyboard focus. Reuse current archive sorting logic with the new list selector.
- [ ] Run covering tests and write `.superpowers/sdd/approved-layout-integration/gallery-report.md`.

## Task 3: Approved project reading

Files: `src/pages/work/[slug].astro`, `src/styles/content-pages.css`, optional shared project contents component, reading-specific tests. Do not edit hero/gallery components or global.css.
Consumes: existing case/narrative/evidence-note content and ProjectMedia; approved layouts.html project example.
Produces: compact opening grouping title, summary, metadata and image; bounded readable body with optional contents navigation.

- [ ] Add failing checks for compact header grouping on desktop/mobile and readable body width, while preserving meaningful existing structural/source tests.
- [ ] Bring title/summary/role/period and media together as in approved example; avoid empty fixed-height panels. Preserve every substantive section, captions, video behavior, sources and related links for every record type.
- [ ] Provide desktop section navigation where useful and collapsible mobile navigation; keep native heading anchors and a single h1. Do not remove content to shorten the page. Scope any CSS changes to work detail pages; existing Notes/About layout refinements remain.
- [ ] Run covering tests and write `.superpowers/sdd/approved-layout-integration/reading-report.md`.

## Task 4: Review, verification and release

- [ ] Review each task diff and its tests for spec compliance and quality. Run `npm run verify` on combined tree; resolve real failures without weakening unrelated checks.
- [ ] Inspect built homepage, Work gallery and representative project pages at desktop/mobile. Check reduced motion, menu, filters, captions, source links and no horizontal overflow. Update current docs from implemented truth.
- [ ] Inspect staged files, preserve known-good release metadata/artifact, commit approved source and optimized media to main, then `git push origin main`.
- [ ] Follow GitHub Actions to successful deployment for that commit; verify live homepage, Work and representative case routes/assets on www.2600th.com. Report release revision and any unresolved gaps honestly.

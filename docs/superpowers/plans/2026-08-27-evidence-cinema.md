# Evidence Cinema Implementation Plan

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

> **Execution:** Use subagent-driven research for independent source discovery and local TDD for implementation. Verify every externally sourced claim and media item before publication.

**Goal:** Turn the approved Career Atlas into a richer, motion-led portfolio using authentic evidence, clear editorial illustrations, stronger recognition proof, complete metadata, and a clean GitHub Pages repository.

**Spec:** `docs/superpowers/specs/2026-08-27-evidence-cinema-design.md`

## Task 1: Lock the release contract with tests

- Add failing unit/build assertions for the web manifest, icon set, Open Graph image metadata, Twitter creator, Article JSON-LD, motion provenance, and future-launch language.
- Add failing browser assertions for six proof tiles, reduced-motion posters, case-study video, and the preserved terminal route.
- Run targeted tests and retain the RED evidence before implementation.

## Task 2: Acquire and audit motion sources

- Fetch only shortlisted IRA VR, GreyKernel, and approved source files into ignored `_media-source/` directories.
- Inspect contact sheets and representative frames before selecting excerpts.
- Record title, source URL, attribution, privacy state, crop, timestamps, and publication status.
- Reject participant-bearing, sensitive, ambiguous, or low-quality footage.

## Task 3: Build optimized media derivatives

- Extend the media recipe and typed manifest for poster, MP4, and optional WebM outputs.
- Produce short IRA VR/Newton, GreyKernel, and existing-game excerpts.
- Capture first-party Kinema, Web Ocean 3D, and Safed Sagar loops.
- Keep each normal loop within the configured budget and preserve a poster fallback.

## Task 4: Create editorial illustrations

- Generate a consistent source set for media-poor records using the approved palette and visual language.
- Inspect each output, reject generic or falsely documentary images, and optimize approved images.
- Label every generated asset as an editorial illustration in content and provenance data.

## Task 5: Implement Evidence Cinema

- Expand the homepage proof section to six asymmetric tiles.
- Add controlled motion apertures to the Living Wordmark only where readability remains strong.
- Extend `ProjectMedia` and work content to support video with poster and reduced-motion behavior.
- Replace repeated IRA VR, Machine Hunter, and MysticMojo media with distinct evidence.
- Add first-party motion to current browser-project cards and pages.

## Task 6: Strengthen content and recognition

- Correct designesto.ai to a 2026 launch framing.
- Add a source-linked recognition/coverage ledger.
- Incorporate only newly verified projects or claims from the parallel research log.
- Improve missing work-page social images and remove unrelated fallbacks.

## Task 7: Complete metadata and cleanup

- Add the new favicon/icon/manifest set and metadata fields.
- Complete JSON-LD and canonical behavior.
- Update README and deployment/media documentation.
- Remove only the verified obsolete files listed in the design specification and rerun the legacy-console tests.

## Task 8: Verify and review

- Run Astro check, unit tests, production build verification, and the full Playwright suite.
- Inspect desktop/mobile, light/dark, motion-on/off, reduced-motion, and representative work pages in the in-app Browser.
- Ask an adversarial agent to review content, structure, media, accessibility, performance, and visual quality.
- Address findings and rerun the complete fresh suite before declaring the release shippable.


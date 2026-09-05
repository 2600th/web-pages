# Approved layout integration — 6 September 2026

## Included

- Orbital C hero, with mobile geometry measured from the portrait and confined above the introduction. Static touch/reduced-motion presentation and the saved motion preference remain available.
- Image-led Work gallery: Blocks leads, Designesto and IRA VR follow in both visual and document order. All 19 projects remain available; domain routes, native links and chronological ordering are preserved.
- Compact project openings with grouped summary, metadata and media. Captions remain visible. Longer projects use native heading-derived contents links and a bounded reading column, without the old nested marker column.
- Previously approved typography, content, Notes/Lab, responsive-media and Blocks v2 image refinements. Originals and private source masters remain excluded from the public build.

## Verification

- Astro diagnostics: 97 files, no errors, warnings or hints.
- Unit tests: 66 passed in 16 files.
- Playwright: 183 passed, with no retries.
- Production build: 41 pages.
- Artifact validation: 57 required artifacts, 20 work routes (including the compatibility route), six domain routes, nine Notes, and 38 LLM guide links.
- Production-preview captures: Home, Work and Blocks at 1440×1000 and touch-emulated 390×844. No horizontal overflow or unloaded images; Work contains 19 entries at both widths.
- Independent code review approved the release. Independent visual review returned **ship** for the six viewport captures and their full-page counterparts. Documentation was checked against the implementation.

The first browser run exposed three assertions for the replaced Work opening; they now test its approved compact structure while preserving other route contracts. The generated-homepage check likewise now checks the current introduction rather than the removed identity kicker. Review also caught and corrected native heading-ID parity, the 700px hero breakpoint, particles behind mobile prose, clipped captions, and nested reading columns.

The development-only Astro audit occasionally logged a non-fatal fetch failure during browser tests. The production preview has no development toolbar. Automated accessibility checks are included in the browser suite, but this is not a complete screen-reader audit, real-device certification or field Core Web Vitals measurement.

## Publishing and recovery

The user approved pushing to `main` and deployment. The workflow for the commit containing this report is the authoritative deployment record; local verification alone does not establish live status.

The preceding successful deployment was `31d075d3594f208640fc40fcfcc8585d258284ac` (workflow run `33751333593`). Its downloadable Pages artifact had expired. A source archive and verified Git history bundle were preserved locally instead; no history was rewritten.

The source-dependent follow-ups in [the preceding refinement report](visual-content-refinement-report.md#remaining-source-dependent-work) are unchanged. No footage, private interface or benchmark comparison was invented to close them.

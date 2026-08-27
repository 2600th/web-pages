# Task 3 — Interior surface recomposition

## Outcome

Recomposed every interior route around the approved positive/negative visual language. Work now reads as a disciplined 17-record index with domain filters; case studies follow thesis, contribution, system, evidence, and sources; Notes is a reading-first archive; About is an operating dossier; Lab is a public build ledger; and the 404 is a concise split return surface.

Generated aperture openings were removed from route presentation while source/provenance assets and verified claims remain intact. Cobalt is reserved for boundary and signal details; evidence/source surfaces are planar and the negative-plane labels use AA-safe colors.

## Red-first evidence

Restored the deferred Round 2 route/release inventory before implementation and ran the focused browser suite against the pre-recomposition interiors:

```text
npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts -g "all 17|every work domain|route openings|case detail|six note|lab and about|compact split|all interior routes|case-study motion|reduced motion"
10 tests, 6 failed (expected red state)
```

The failures covered the missing split opening contract, case-part contract, reading surface, build ledger, and reduced-motion case structure. The restored route-specific content and release assertions were then completed before the green pass.

## Green evidence

- `npx playwright test tests/e2e/routes.spec.ts tests/e2e/release.spec.ts` — 52 passed (26.2s), including all deferred route/content/release assertions.
- `npm run check` — 0 errors, 0 warnings, 0 hints across 67 files.
- `npm test` — 8 test files passed; 32 tests passed.
- `npm run build` — 29 static pages built successfully.
- `npm run test:build` — 40 production artifacts, 17 work routes, and 6 note routes verified.
- `git diff --check -- <Task 3 files>` — no whitespace errors.

The focused green coverage includes the 17 work records, all six notes, every domain subset, canonical metadata, source/evidence links, CreativeWork and Article structured data, no-JavaScript Work links, 404 return behavior, 320/390/946/1440 containment, mobile filters, long case-title bounds, touch-safe media controls, reduced motion, and serious/critical axe checks on the interior route set.

## Screenshot method and visual inspection

Production preview captures were inspected at desktop and 390px mobile widths after a clean build. Lazy case media was explicitly warmed by scrolling before the loaded case capture. Reviewed surfaces include:

- Work index: split opening, 17 editorial rows, compact domain select, and no generated editorial apertures.
- Enterprise case: split hero, loaded evidence media, one-line section markers, thesis/contribution/system/evidence flow, and planar evidence/source ledger.
- Notes index/detail: reading rail, sparse metadata, source attribution, and no hero aperture.
- About: split operating opening, three career acts, patent record, principles, and conversation CTA.
- Lab: split build opening, art-directed Kinema media, five-row ledger, archive links, and corrected mobile arrow alignment.
- 404: concise split message with contained Return home action.

Representative captures are under `.impeccable/review/task3-*-production-*.png`; the latest loaded case and Lab mobile captures are `task3-case-production-desktop-loaded.png` and `task3-lab-production-mobile-latest.png`.

## Self-review

- All 17 work routes, six note routes, existing media, evidence links, source links, videos, and verified factual records remain available.
- Case information is explicit and inspectable through `data-case-part` regions; evidence sources are no longer a full cobalt panel.
- Route openings use paired positive/negative planes and split typography, with responsive stacking at compact widths and no generated editorial image references.
- Lab retains both archive destinations and its mobile picture source; video controls remain user-controlled and touch-safe.
- Existing parent/homepage and source/content changes outside Task 3 were preserved and not staged.
- No deploy, push, merge, detector rerun, or destructive command was performed.

## Impeccable review

The required Impeccable context setup was run against the Work index and returned `MANUAL_DETECTOR_REQUIRED`. The detector was not rerun because the task explicitly prohibited a detector rerun; visual inspection, axe checks, containment checks, and production screenshots are the available review evidence.

## Commit

`f36d915` — `feat: recompose interior portfolio surfaces`

## Concerns

- Automated detector evidence is intentionally absent per the explicit no-rerun constraint.
- Production screenshots remain untracked review artifacts and are not part of the Task 3 commit.
- The surrounding worktree contains preserved parent-task changes; only the Task 3 paths and this report are intended for the commit.

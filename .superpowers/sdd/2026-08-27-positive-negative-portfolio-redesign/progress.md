# SDD ledger — plan: docs/superpowers/plans/2026-08-27-positive-negative-portfolio-redesign.md

## Baseline

- Workspace: user-selected checkout `D:\Github\web-pages` on `codex/portfolio-redesign`; existing uncommitted evidence work is authoritative and must be preserved.
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm test`: 8 files, 32 tests passed.

## Preflight interface scan

| Tasks | Shared file/interface | Producer → consumer | Finding |
| --- | --- | --- | --- |
| 1 → 2 | `tests/e2e/home.spec.ts` | Shell selectors and closing/footer contract → homepage behavior | Compatible; Task 2 extends rather than replaces Task 1 assertions. |
| 1 → 3 | `tests/e2e/routes.spec.ts`, `tests/e2e/release.spec.ts` | Shared shell/archive contract → interior route coverage | Compatible; preserve Task 1 archive and CTA regressions. |
| 1 → 2 | shared shell/tokens | `global.css`, header, footer → homepage components | Compatible; Task 2 consumes split tokens and may not reintroduce full-cobalt surfaces. |
| 1 → 3 | shared shell/tokens | `global.css`, header, footer → interior pages | Compatible; Task 3 changes content-page styling only. |
| 2 → 4 | homepage UI and screenshots | homepage contract → integration review | Compatible; Task 4 may fix defects but must preserve the selected comp authority. |
| 3 → 4 | interior route UI | route contract → integration review | Compatible; Task 4 verifies rather than redesigns. |
| 1 | tests against shell implementation | Failing regressions precede shared-shell changes | Internally consistent. |
| 2 | tests, hero reproduction, homepage implementation | Failing behavior contract precedes code; hero is proven before downstream sections | Internally consistent. |
| 3 | route tests and route recomposition | Failing route contract precedes implementation | Internally consistent. |
| 4 | visual review, detector, documentation, full verification | Integrated build precedes final documentation and verification | Internally consistent. |

No plan/spec conflict found.

Task 1: Ruling: allow the fix round to include `src/components/home/ConversationClose.astro`, `src/pages/lab/index.astro`, and `public/fonts/mona-sans-latin.woff2` even though the initial task file list assigned the first two to later tasks — the preserved dirty continuation state made the shell contract depend on them, and the spec requires a reproducible footer/archive/font implementation now — cost if wrong: Task 1 becomes broader and later tasks must treat these files as existing interfaces rather than fresh ownership.

Task 1: fix round 1/5 (6 addressed, 3 open — committed homepage tests still depend on uncommitted Task 2 markup; missing mobile Lab asset; desktop focus order regression; commits d582565..94bcf8b)

Task 1: Ruling: Task 1 tests must cover only the shared-shell contract and may remove homepage reconstruction assertions until Task 2 reintroduces them red-first; `public/media/work/kinema/inside-mobile.webp` may be committed if the authorized Lab page retains that source — this restores a self-contained Task 1 tree — cost if wrong: Task 2 must explicitly restore every deferred homepage assertion and the Task 1 commit gains one additional media asset.

Task 1: fix round 2/5 (3 addressed, 0 open — self-contained test scope, tracked mobile asset, desktop/mobile focus order; commits 94bcf8b..0b1e063)
Task 1: complete (commits 395258f..0b1e063, review clean)

Task 2: Ruling: required hero and enterprise media plus their provenance records may be committed with the homepage task even when they were preserved as untracked evidence assets — a clean static release must reproduce every referenced image/video — cost if wrong: the Task 2 commit becomes media-heavy, but the originals and provenance remain intact.
Task 2: Ruling: on negative planes, small labels use warm-white/muted foreground while cobalt remains a line, marker, focus, or large-state accent — WCAG AA outranks literal cobalt text, while the one-signal visual rule remains intact — cost if wrong: fewer blue text labels than the initial comp-derived palette.

Task 2: fix round 1/5 (6 addressed, 1 open — generated identity disclosure hidden at 390px/320px; commits 4674f4f..b7d252b)

Task 2: fix round 2/5 (1 addressed, 0 open — mobile generated-identity disclosure remains visible and contained; commits b7d252b..4dd220a)
Task 2: complete (commits 0b1e063..4dd220a, review clean)

Task 3: Ruling: treat the apparently blank lower Work-index images in the full-page capture as a lazy-loading state only after reproducing the route at 946x912, scrolling through the archive, and confirming all 14 main images completed with non-zero natural width — cost if wrong: a real media omission could be masked, so the final integration sweep must repeat production scrolling on the Work route.
Task 3: complete (commits 4dd220a..1fd33f1, SPEC PASS, QUALITY PASS; no Critical or Important findings)

Task 4: Ruling: the Impeccable detector's earlier run satisfies the plan's one-run requirement; Task 4 must consume its findings and use production screenshots, axe/browser coverage, and the shipped finish reviewer rather than rerun it — cost if wrong: no second automated detector delta exists, so remaining judgment depends on the audited visual and test evidence.
Task 4: Ruling: keep the intentionally deferred home theme control at 2% idle opacity because it remains keyboard-visible and the finish reviewer classified it as Minor; do not dilute the controlling hero composition for a non-blocking discoverability tradeoff — cost if wrong: pointer-only visitors may not immediately notice the theme affordance.
Task 4: complete (commit 5c5cdd1; npm run verify green; Impeccable disposition SHIP with no Critical or Important findings)

Final code review: fix round 1/5 (case-media opt-in playback and six static Work domain routes added; rereview found the custom no-JS control, stale client-history metadata, inert mobile select, and dirty-HomeLane-dependent tests still open; commits 9798568..0c1f4f0)
Final code review: Ruling: static domain anchors and the enhanced mobile select perform real navigation instead of pushState filtering, so canonical/title/OG metadata always match the visible route — cost if wrong: filtering is a page navigation rather than an instant in-place transition.
Final code review: Ruling: case tests use the already tracked IRA VR MP4 evidence, and custom controls remain hidden until binding while native controls are the no-JS surface — cost if wrong: the browser's native video chrome appears briefly or permanently when enhancement is unavailable.
Final code review: fix round 2/5 (all I1, M1, N1, and N2 findings addressed; no new Critical/Important findings; focused rereview 7/7; commits 0c1f4f0..72b1d60)
Final code review: complete (Ready: Yes)

# Final code review — Positive / Negative portfolio redesign

**Review scope:** `395258f93849f93ace15f0bccf8b8cbf50699c35..9798568b6fe904e64c5c100ceaa8c26f8242714c` in `D:\Github\web-pages`.

**Review method:** The review was performed in passes because the range is large (48 files, approximately 3.5k inserted lines). I read the approved spec and plan, the task reports/reviews and `DESIGN.md`, then inspected the shared shell, homepage interaction/media components, interior route templates/styles, archive handoff, and the release tests. I also performed a bounded browser check of the case-study video state. I did not run the Impeccable detector, deploy, merge, push, or modify application source.

## Assessment

**Ready to merge: With fixes.**

There is no Critical finding in the inspected range. The positive/negative system is coherent, the route/content architecture is understandable, the shared shell and archive URL fixes are clean, and the recorded verification is broad. One Important behavior defect remains in case-study media: videos begin playing without an explicit user request. A second Important progressive-enhancement gap leaves Work domain filters inert or incorrect without JavaScript. One Minor test gap makes the case-study reduced-motion assertion vacuous.

## Strengths

- The implementation follows the approved sequence and keeps the first viewport as a real positive/negative composition rather than reverting to a card grid. The hero has semantic H1 text, a native range control, a single work CTA, and an explicit generated-identity disclosure.
- Shared shell responsibilities are concentrated in `BaseLayout`, `SiteHeader`, `SiteFooter`, and global tokens. The footer/contact close uses neutral polarity planes, the CTA specificity fix is explicit, and the archive uses `/lab/terminal/index.html`.
- Interior templates preserve the 17 work routes and six note routes while exposing the requested thesis/contribution/system/evidence/sources structure. `ProjectMedia` supplies dimensions and poster-first video markup; `EvidenceSources` keeps private-review boundaries separate from public links.
- The checked-in provenance records and generated-media manifest make the identity-only boundary inspectable. Homepage selected-work media is sourced through `MEDIA_PROVENANCE`, while generated editorial media is kept out of interior evidence imagery.
- The release suite covers static artifacts, canonical/structured metadata, 320/390/946/1440 containment, focus order, theme contrast, no-JavaScript work links, archive flow, and real homepage motion playback. The Task 4 report records a fresh green `npm run verify` result (Astro 0/0/0, Vitest 32, Playwright 74, 29 pages, and 40 verified artifacts); this review did not rerun that suite or the detector.

## Important findings

### I1 — Case-study videos autoplay on visibility despite the user-controlled media contract

**Location:** `src/scripts/evidence-media.ts:11-19,26-38`; `src/components/work/ProjectMedia.astro:13-22`

**Why it matters:** `userPaused` starts as `false` for normal users. Once an evidence video intersects the viewport, `sync()` calls `video.play()` without a click. The media component has `preload="none"` and no native `controls`; its only control is the JavaScript button, whose server-rendered initial label is `Pause` even while the video is paused. This causes unsolicited motion and media transfer while scrolling and contradicts the spec/DESIGN contract that videos are poster-first and user-controlled. A JavaScript failure or disabled-JavaScript session leaves the user with a misleading, non-functional play/pause control.

I reproduced the first visible case video on `/work/homelane-spacecraft-pro/` in a normal browser context: after load it was `paused: false` with a non-zero `currentTime`, and the button label was `Pause` without any user click.

**Fix:** Start case videos in an explicit paused state (`userPaused = true`) and call `play()` only from the associated button (or expose an explicit opt-in autoplay setting that is off by default). Add `play`/`pause` event synchronization so the button state cannot drift. Provide native `controls` or a deliberate no-JavaScript poster fallback; initialize the button label to `Play` whenever the server state is paused. Re-run normal/reduced-motion, out-of-view, keyboard, and failure-to-play checks against a case page that actually contains videos.

### I2 — Work domain filters are JavaScript-only and do not honor their advertised URL without JS

**Location:** `src/pages/work/index.astro:31-40,56-104`; mobile fallback CSS at `src/pages/work/index.astro:125-128`

**Why it matters:** The static page always renders all 17 records and hard-codes `All domains` as the active link. Only the client script reads `location.search` and hides non-matching records. With JavaScript disabled, a desktop filter link navigates to `?domain=xr` but still shows all 17 records; on mobile the only filter is the native `<select>`, which has no submit/action fallback. That weakens the stated “all Work filters return their correct subsets” contract and makes copied filter URLs misleading, even though the unfiltered archive remains available.

**Fix:** Add a no-JavaScript filter path: generate static filtered route outputs (or a set of crawlable filter routes) and point both desktop links and a mobile fallback link list at them. Keep the current client-side history enhancement for instant filtering, but derive the initial active label/count from the same route data so JS and no-JS states cannot disagree.

## Minor findings

### M1 — Reduced-motion case-media test is vacuous

**Location:** `tests/e2e/release.spec.ts:162-169`

**Why it matters:** The test navigates to `/work/kinema/`, which has no `<video>` elements in the current content, then asserts `every(video => video.paused)`. `Array.prototype.every` returns `true` for an empty array, so this release gate never exercises `src/scripts/evidence-media.ts`, case autoplay, or case poster behavior. The homepage reduced-motion checks are useful, but they do not cover the separate case-media implementation.

**Fix:** Point the test at `/work/homelane-spacecraft-pro/` or another case with videos, assert a positive video count, assert paused state under reduced motion, and add an explicit normal-motion test that verifies no playback occurs before the user presses Play.

## Unreviewed / not independently re-run

- I did not rerun `npm run verify`, the full Playwright suite, production build, artifact verifier, axe scans, or a fresh multi-route screenshot sweep; the exact results above are taken from `task-4-report.md` and earlier task reports.
- I did not rerun or inspect the Impeccable detector output, per the review instruction and the documented one-run ceiling.
- I did not independently recrawl external source URLs or validate third-party liveness, permissions, or launch status.
- I did not review the preserved uncommitted content/media changes outside the requested Git range as implementation changes; they remain outside this review package.


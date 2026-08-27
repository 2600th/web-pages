# Final-fix re-review 2 — Positive / Negative portfolio redesign

**Scope:** `0c1f4f0..72b1d60` in `D:\Github\web-pages`, including implementation commit `17029fc` and the updated fix report. The worktree remains dirty with unrelated/out-of-range content and media changes; those were not treated as part of this range.

**Method:** Inspected the complete diff, committed source, committed tests, and the prior re-review findings. I did not edit application source, deploy, push, merge, or run the Impeccable detector. A bounded focused run was executed in the shared dirty worktree:

```text
npx playwright test tests/e2e/release.spec.ts -g "desktop domain navigation|case-study videos remain|case-study video controls|case-study JavaScript binding|case-study motion controls|no-JavaScript mobile domain fallback|work filtering announces"
7 passed (7.5s)
```

`git diff --check 0c1f4f0..72b1d60` also completed without output. Commit-object inspection confirms the reviewed source references the two tracked IRA VR clips (`newton-loop.mp4` and `classroom-loop.mp4`).

## Finding status

| Finding | Status | Review result |
|---|---|---|
| I1 — case-study videos autoplay / media-state contract | **ADDRESSED** | Videos have no autoplay path; explicit custom playback, event-synchronized state, out-of-view pause/no-resume, reduced-motion pause, and a truthful native no-JavaScript fallback are all present. |
| M1 — reduced-motion case test is vacuous | **ADDRESSED** | Media tests now use the committed IRA VR case, require a positive count, and force/readiness-check a real clip before explicit playback. |
| N1 — client filter navigation leaves URL and canonical/SEO metadata inconsistent | **ADDRESSED** | Desktop anchors and the mobile select perform real navigation; tests verify static-route URL, title, canonical, and `og:url`. |
| N2 — mobile no-JavaScript exposes an inert domain select | **ADDRESSED** | The select is server-hidden and only revealed after binding; no-JavaScript fallback links remain visible and navigate at both 320px and 390px. |

## I1 — ADDRESSED

`src/components/work/ProjectMedia.astro:13,22` keeps native `controls` in the static HTML while the custom button starts with `hidden` and `aria-pressed="false"`. `src/scripts/evidence-media.ts:5-10` only hands control to the custom UI after both elements exist and binding succeeds: it disables native controls and reveals the custom button at that point. With JavaScript disabled (or the module not loaded), the custom button stays hidden and the native video controls remain available, removing the prior inert affordance.

The playback code at `evidence-media.ts:35-66` has its sole `video.play()` call inside the explicit toggle handler. Initialization pauses the video; IntersectionObserver only pauses on exit; visibility and reduced-motion changes pause and never resume. `play`, `pause`, and `ended` events keep text, `aria-label`, and `aria-pressed` synchronized. The focused tests passed for initial paused state, explicit Play/Pause, out-of-view no-resume, reduced motion, native no-JavaScript controls, and successful custom binding.

## M1 — ADDRESSED

The media tests in `tests/e2e/release.spec.ts:203-305` now use `/work/ira-vr/`, whose committed source contains `newton-loop.mp4` and `classroom-loop.mp4`. They assert a positive video count, matching toggle/video counts, paused `Play` state, and `readyState >= 2` after `load()` before clicking Play. The no-JavaScript test checks every native video has controls and every custom toggle is hidden. This is non-vacuous against the requested commit range; the focused run passed all seven targeted tests.

## N1 — ADDRESSED

The root archive no longer intercepts desktop anchor clicks or calls `history.pushState` (`src/pages/work/index.astro:97-105`). Its select uses `window.location.assign`, and the static-domain select does the same (`src/pages/work/domain/[domain].astro:82-96`). Consequently, the browser loads the actual generated domain document rather than leaving the root document under a changed URL. The added desktop-navigation test verifies the XR URL, title, canonical URL, and `og:url`; the select test verifies the static simulation URL and canonical URL.

## N2 — ADDRESSED

Both work pages render `.domain-filter-select` with the HTML `hidden` attribute and remove it only after the select change handler is attached. The mobile CSS also explicitly honors `[hidden]`. The `<noscript>` link grid remains available as the no-JavaScript mobile path. `tests/e2e/release.spec.ts:290-309` runs at both 320px and 390px, verifies the select is hidden, verifies the XR fallback link, follows it, and confirms the six-item subset. The focused run passed.

## Other checks

- **New Critical findings:** none.
- **New Important findings:** none found in the reviewed range.
- **Static domain artifacts/subsets:** the prior six static routes and artifact verifier remain intact; this range only changes navigation behavior and fallback visibility, not the collection filtering.
- **320px behavior:** the focused no-JavaScript fallback test passes at 320px; the existing multi-route containment coverage remains in the release spec.
- **Verification boundary:** the full `npm run verify`, production build, complete Playwright suite, accessibility sweep, and visual sweep were not rerun for this re-review. The status above is based on committed-source inspection, commit-object checks, and the focused seven-test run in the shared dirty worktree.

## Ready

**Ready: Yes**, for the scoped findings and commits reviewed here.

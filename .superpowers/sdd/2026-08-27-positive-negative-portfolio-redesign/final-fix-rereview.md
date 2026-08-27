# Final-fix re-review — Positive / Negative portfolio redesign

**Scope:** `9798568..0c1f4f0` in `D:\Github\web-pages`, primarily implementation commit `d00d104` and its verification report. The worktree was already dirty; out-of-range changes were preserved and were not treated as part of this review.

**Method:** Read `final-code-review.md`, `final-fix-report.md`, the complete fix diff, the committed source and tests, and the relevant content/schema/layout files. I did not edit application source, commit, deploy, push, merge, run the Impeccable detector, or rerun the full verification suite. `git diff --check 9798568..0c1f4f0` completed without output. A commit-object check confirmed that the reviewed commit has zero HomeLane `mp4` references/files but two IRA VR `mp4` references.

## Finding status

| Finding | Status | Review result |
|---|---|---|
| I1 — case-study videos autoplay / media-state contract | **OPEN** | Autoplay and out-of-view resume are fixed in code, but the server-rendered custom Play button remains visible and inert with JavaScript disabled. Native controls exist, so playback is available, but the no-JavaScript control surface is still misleading. |
| I2 — Work domain filters lack truthful no-JavaScript routes | **ADDRESSED** | Six static routes are generated from the canonical collection, use canonical URLs, and are linked from desktop and mobile fallback markup. The client-history canonical problem and inert no-JavaScript select are new follow-ups below. |
| M1 — reduced-motion case test is vacuous | **OPEN** | The new tests assert positive video counts, but target HomeLane media that is not present in `0c1f4f0`; they fail against the clean reviewed range and only pass with out-of-range dirty content. |

## I1 — OPEN

The primary playback defect is addressed by `src/scripts/evidence-media.ts:12,33-64` and `src/components/work/ProjectMedia.astro:13,22`: there is no `autoplay` attribute, the only `video.play()` call is inside the explicit custom-control handler, initialization calls `pause()`, and the IntersectionObserver only pauses when the video leaves view. There is no visibility-entry or reduced-motion resume path. `play`, `pause`, and `ended` events synchronize the custom label and `aria-pressed` state. Native `controls` provide a real browser fallback.

The no-JavaScript fallback is not fully truthful, however. `ProjectMedia.astro:20-23` always emits the custom button. Without the module script, it remains an ordinary visible button labelled `Play` with no event handler, while the native video controls are also present. A keyboard or pointer user can activate the apparent custom control and receive no result. The new test at `tests/e2e/release.spec.ts:227-236` checks that this inert button still says `Play`; it should instead verify that the custom control is hidden/absent without JavaScript (while native controls remain available), or otherwise prove a deliberate fallback.

Normal-motion explicit play, event-state synchronization, out-of-view pause/no-resume, and reduced-motion initial pause are otherwise sound in the reviewed implementation. The status remains OPEN because the requested I1 contract explicitly includes controls and no-JavaScript behavior.

## I2 — ADDRESSED

`src/pages/work/domain/[domain].astro:10-19` creates one static path for each of the six `CAREER_DOMAIN_META` keys and filters the canonical `work` collection by domain. Its `BaseLayout` call at lines 33-37 sets the domain canonical URL. `WorkList` receives only the filtered collection, so the case links are unique within each subset. `scripts/verify-build.mjs:11-27` requires all six domain artifacts, and `tests/e2e/release.spec.ts:94-116` checks direct no-JavaScript responses, canonical URLs, counts, and unique canonical case links. Desktop links and the `<noscript>` mobile links point to those static paths.

The six direct static routes therefore address the original I2 finding. The remaining progressive-enhancement issues are recorded as new Important findings below: client-side history changes do not update document metadata, and the mobile no-JavaScript select remains visible despite having no native submit/action behavior.

## M1 — OPEN

The new media tests at `tests/e2e/release.spec.ts:190-260` navigate to `/work/homelane-spacecraft-pro/` and require two videos. In the reviewed commit, `src/content/work/homelane-spacecraft-pro.md` is an `evidence-note` with only a poster `heroMedia`; it contains no `mp4`, and `0c1f4f0` tracks no HomeLane `.mp4` under `public/media/work/homelane-spacecraft-pro/`. By contrast, the committed IRA VR case has two real `mp4` references (`src/content/work/ira-vr.md:24,43`). Thus the normal-motion, native-fallback, touch-target, and reduced-motion tests fail at their video-count assertions against a clean checkout of the requested range. The green results in `final-fix-report.md` depended on the already-dirty, out-of-range HomeLane content/media changes visible in the worktree. Retarget these tests to a case with media in the reviewed commit, or include the content/media changes in the reviewed implementation commit, then rerun them from a clean state.

## New Important findings

### N1 — Client filter navigation leaves the URL and canonical/SEO metadata inconsistent

**Location:** `src/pages/work/index.astro:97-108`, with the root canonical set at lines 13-16.

The root archive intercepts every domain-link click, calls `history.pushState({}, '', link.href)`, and only re-renders the existing 17-item DOM. After a user clicks XR, the address bar is `/work/domain/xr/`, but the document is still the root page: its `<link rel="canonical">`, `og:url`, title, and description remain those of `/work/`. A copied URL will be correct after a reload, but the live page and its history entry are not a coherent canonical route. Use a real navigation for static route links, or update all route metadata when using history enhancement; add a test that checks canonical/title after the click.

### N2 — Mobile no-JavaScript still exposes an inert domain select

**Location:** `src/pages/work/index.astro:35-47,56-68` and `src/styles/content-pages.css:287-294`.

The `<noscript>` link grid is a valid mobile fallback, but `.domain-filter-select` is also displayed at mobile widths regardless of JavaScript. The select has no form, action, or native fallback; with JavaScript disabled, changing “Choose a work domain” does nothing. The working links below it make the route reachable, but the visible control remains a misleading keyboard/accessibility affordance. Hide the select unless the enhancement binds it, or give it a real no-JavaScript form/navigation path, and cover that state at the 320px floor.

## Other checks

- **Critical findings:** none found in the reviewed range.
- **Static artifact counting:** the six required domain artifacts and route-level h1/canonical checks are present. The verifier’s domain list duplicates `CAREER_DOMAIN_META`, which is a low-level drift risk but not an Important failure for the current six keys.
- **Desktop/mobile/320 layout:** the added fallback grid uses `repeat(2, minmax(0, 1fr))` and 2.75rem minimum link height, so its long labels can wrap without an apparent horizontal overflow. The committed tests exercise the new route at 320px with JavaScript enabled and at 390px without JavaScript; a no-JavaScript 320px browser run was not independently performed.
- **Verification boundary:** no full `npm run verify`, production build, Playwright suite, accessibility sweep, or visual sweep was rerun for this re-review. The conclusions above are based on the committed source/test inspection and the focused static checks stated above.

## Ready

**Ready: No.** I1 and M1 remain open, and N1 is an Important canonical/history regression. N2 should also be resolved before calling the mobile no-JavaScript contract complete.

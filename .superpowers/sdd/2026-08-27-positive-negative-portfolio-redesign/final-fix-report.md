# Final code-review fix round — video control and Work domain routes

## Outcome

Closed the remaining Important and Minor review findings from `final-code-review.md`.

- Case-study videos are poster-first and explicitly user-controlled. They initialize paused, keep the custom control hidden until its JavaScript binding succeeds, synchronize labels and `aria-pressed` state from real media events, pause when out of view or when the document is hidden, and never start from IntersectionObserver. Native video controls remain available as the no-JavaScript fallback.
- Work domains now have six static crawlable routes under `/work/domain/<domain>/`, each rendered from the canonical work collection with its own canonical URL and filtered records. Desktop anchors and no-JavaScript mobile fallback links perform real navigation to those routes; the `/work/` enhancement retains truthful legacy `?domain=` rendering and uses navigation for its select.
- Reduced-motion coverage now exercises committed IRA VR media, asserts a positive video count, and verifies paused `Play` state plus explicit playback behavior.

## Red-first evidence

Added the fix-round regressions before implementation and ran them against the review state:

```text
npx playwright test tests/e2e/release.spec.ts -g "domain links|crawlable work|case-study videos|native no-JavaScript|reduced motion keeps"
4 failed, 1 passed (25.5s)
```

The red failures reproduced inert query-only filters, absent static routes/mobile fallback links, case-video autoplay, and the missing native controls fallback. The reduced-motion test was already green because it had been redirected to the real video case before the implementation pass.

## Focused green evidence

```text
npx playwright test tests/e2e/release.spec.ts tests/e2e/routes.spec.ts -g "domain links|crawlable work|case-study videos|native no-JavaScript|reduced motion keeps|work archive|every work domain"
8 passed (6.5s)
```

## Full verification

```text
npm run verify
Astro check: 0 errors, 0 warnings, 0 hints across 68 files
Vitest: 8 files passed, 32 tests passed
Playwright: 78 passed (37.3s)
Astro build: 35 pages built
Build verifier: Verified 46 production artifacts, 17 work routes, 6 domain routes, and 6 note routes.
```

The full verification includes the 320/390/946/1440 containment checks, static domain canonical checks, all-domain no-JavaScript filtered subsets, case-video normal/reduced-motion behavior, click Play/Pause synchronization, out-of-view pause/no-resume, native fallback controls, and existing homepage/interior release gates.

## Self-review

- No video playback call remains on initial load, visibility entry, document visibility, or reduced-motion changes; the only `play()` call is inside explicit custom-control activation, while native controls provide the no-JavaScript activation path.
- The six domain outputs reuse the canonical `work` collection and preserve canonical case links without generating duplicate case routes.
- Desktop filters, mobile no-JavaScript links, and client history enhancement all resolve to `/work/domain/<domain>/` paths; root query compatibility remains client-enhanced for existing copied links.
- The build verifier now checks every domain artifact, so static route regressions fail release verification.
- Existing unrelated dirty content/media changes remain untouched and unstaged.
- No deploy, push, merge, destructive command, or Impeccable detector rerun was performed.

## Commit

Fix-round implementation commit: `d00d104` — `fix: close media and domain route review gaps`.

## Concerns

- The Impeccable detector was not rerun, per explicit instruction and the project’s detector ceiling.
- The report is force-added because the `.superpowers/sdd` tree is ignored by the repository.

## Round 2 rereview closure

The rereview findings were verified against the shared dirty worktree before implementation. The reviewed HEAD contains two IRA VR MP4 references (`newton-loop.mp4` and `classroom-loop.mp4`); HomeLane media remains unrelated dirty content and was not staged.

### Red-first evidence

After retargeting media tests to IRA VR and adding the no-JavaScript and canonical-navigation regressions, the focused run was red for the three intended gaps:

```text
npx playwright test tests/e2e/release.spec.ts -g "case-study videos|native no-JavaScript|JavaScript binding|reduced motion keeps|no-JavaScript mobile domain fallback|work domain links target"
3 failed, 3 passed (17.9s)
```

The failures were the visible no-JavaScript custom buttons, native controls not being handed off after binding, and the visible mobile enhancement select without JavaScript.

### Focused green evidence

```text
npx playwright test tests/e2e/release.spec.ts -g "desktop domain navigation|work filtering announces|case-study videos|native no-JavaScript|JavaScript binding|reduced motion keeps|no-JavaScript mobile domain fallback|work domain links target"
8 passed (7.8s)
```

This covers positive IRA media counts, real Play/Pause and out-of-view pause behavior, reduced-motion pause, native controls with the custom control hidden in no-JavaScript mode, real desktop/select navigation, canonical/OG metadata, and 320/390 fallback links.

### Full verification and source/object proof

```text
npm run verify
Astro check: 0 errors, 0 warnings, 0 hints across 68 files
Vitest: 8 files passed, 32 tests passed
Playwright: 81 passed (37.4s)
Astro build: 35 pages built
Build verifier: Verified 46 production artifacts, 17 work routes, 6 domain routes, and 6 note routes.

HEAD:17029fc5f16bab6fdc8d8491e7d786ecca6daa5f
IRA_HEAD_MP4_REFS=2
media/career/ira-vr/newton-loop.mp4 -> HEAD:public/media/career/ira-vr/newton-loop.mp4 OK
media/career/ira-vr/classroom-loop.mp4 -> HEAD:public/media/career/ira-vr/classroom-loop.mp4 OK
```

The object check reads the IRA VR MP4 references from the committed source at HEAD and verifies each corresponding media object exists in that same HEAD. No HomeLane content or media was staged. The focused and full suites ran in the required shared dirty worktree; a clean-worktree rerun was not practical without disturbing preserved parent changes.

### Round 2 implementation status

- `ProjectMedia` emits native `controls` and a hidden custom button server-side; successful binding disables native controls and reveals the working custom control.
- Domain anchors no longer intercept clicks or call `pushState`; the select uses `window.location.assign`, and both root and static-domain selects remain hidden until their change handlers bind.
- Round 2 implementation commit: `17029fc5f16bab6fdc8d8491e7d786ecca6daa5f` — `fix: close rereview media and route gaps`.
- The relevant implementation/tests/report files are the only files intended for this fix commit. No deploy, push, merge, destructive command, or detector rerun was performed.

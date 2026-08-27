# Final code-review fix round — video control and Work domain routes

## Outcome

Closed the remaining Important and Minor review findings from `final-code-review.md`.

- Case-study videos are poster-first and explicitly user-controlled. They initialize paused with `Play` controls, synchronize labels and `aria-pressed` state from real media events, pause when out of view or when the document is hidden, and never start from IntersectionObserver. Native video controls remain available as the no-JavaScript fallback.
- Work domains now have six static crawlable routes under `/work/domain/<domain>/`, each rendered from the canonical work collection with its own canonical URL and filtered records. Desktop links and no-JavaScript mobile fallback links target those routes; the `/work/` client enhancement still filters instantly and understands static-path state.
- Reduced-motion coverage now exercises HomeLane SpaceCraft Pro, the case with two actual videos, and asserts a positive video count plus paused `Play` state.

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

Fix-round implementation commit: pending at report creation; the final hash is recorded after staging and commit.

## Concerns

- The Impeccable detector was not rerun, per explicit instruction and the project’s detector ceiling.
- The report is force-added because the `.superpowers/sdd` tree is ignored by the repository.

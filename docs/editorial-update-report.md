# Editorial site update

Implementation record, 3 September 2026. This report describes the recovered Astro source, not a deployed release. The existing `gh-pages` checkout and production site were not modified, and no source commit, push, deployment or dependency upgrade was performed.

## Implemented in source

Home keeps the Velvet Reveal identity and normal-motion grid, particles and character hotspots. It introduces Pranshul as a product and technology leader and builder, with the approved 14+ years positioning, two actions, four linked proof items, five distinct featured cases, one product-workflow thesis and current writing. Navigation is Home / Work / Notes / Lab / About. The shared contact invitation is employment-compatible and appears once per page.

Work contains 20 public routes, of which 19 appear in the main archive. Selected systems come first, followed by the earlier archive. The native order control offers earliest-first chronology, including `domain=all` and unknown-domain fallback URLs. Static domain routes remain crawlable without JavaScript. Domain memberships are games 9, XR 6, training/simulation 6, robotics 2, design technology 4 and applied AI 5. A record can belong to several domains.

| Route | Result and contribution boundary |
|---|---|
| `/work/blocks/` | Separate professional design/production case. Team leadership is not presented as sole implementation. |
| `/work/designesto/` | Separate visual-exploration and revision case, standalone branding, development-and-rollout status. Deeper costing/execution integration remains a boundary or roadmap, not a shipped claim. |
| `/work/propvr-ai-craft/` | Initial 22-tool/five-studio MVP, implementation choices, handoff and current public Craft direction. Explicit credit: “Initial PropVR AI MVP: Pranshul Chandhok. Current Craft platform: PropVR Technology team.” |
| `/work/blocks-inco-ai/` | Useful self-canonical compatibility page linking Blocks and Designesto. Indexable and in the sitemap, but absent from featured work, main archive and LLM project guide. It is not a one-to-two redirect. |
| `/lab/dwarkesh-jensen/index.html` | Exact hosted URL for the self-contained, unofficial interview companion. Self-canonical and registered once in the sitemap. |
| `/lab/terminal/index.html` | Preserved Ghost Terminal archive, crawlable with `noindex,follow`, outside the sitemap and LLM guide. The portfolio remains the root page. |

Craft's public pages were checked on 2 September 2026. They list 30+ tools, disagree on studio grouping/count, describe Agentic 1.0 and Arc 1.0 as early access, and place Forge/native AEC integrations on the roadmap. The case does not assert one current studio count or independently tested production performance. Current-state copy is centralized in `src/data/craft.ts`.

## Redirects

No new redirect was introduced. `/work/blocks-inco-ai/` stays a useful indexable compatibility page because one legacy URL cannot redirect meaningfully to two distinct products. Its canonical remains itself. The companion uses its exact `index.html` path with no duplicate wrapper. The existing production apex-to-`www` HTTPS redirect was checked separately and not changed.

About remains first-person, uses the verified current role, explains contribution boundaries, states the handle origin once and connects tools to relevant public Work or Notes. Unsupported advisory positioning was removed from source metadata as well as visible copy. The historical career-era value `operator` and original asset filenames remain unchanged.

## Writing and evidence

Eight Notes are published: four Field Notes, three Technical Teardowns and one Essay. The six original slugs, publication dates and exact original source URLs are preserved. All eight have unique 1200×630 local social cards. Original-source links compare normalized origin and trailing-slash path, so a legitimate external same-path original is retained and a local self-link is omitted.

| Article | Type | Source-backed scope |
|---|---|---|
| `/notes/ocean-reliability/` | Technical Teardown | Repository performance notes, loader, reference results and benchmark script. Dressing-texture allocation fell from 762.3 to 79.9 MiB while download weight rose from 33.7 to 40.7 MiB. These are source-recorded asset figures, not total GPU/process memory or a new matched FPS benchmark. The reference benchmark predates the asset pass. |
| `/notes/ai-floorplan-parsing/` | Technical Teardown | Inspected pipeline architecture: staged processing, bounded retries, model fallback, response handling and file-existence resume. Canonical results, fingerprinting, adaptive scheduling, spreadsheet intake, evaluation and budgets are proposed extensions. No private prompts/schema, customer drawings, accuracy, cost or latency claims are published. |
| `/notes/ai-video-control/` | Technical Teardown | Authored thirty-second experiment and inspected saved H3 reference/first-last-frame workflow graphs. The original 12-second six-beat courier plan is a proposal, not a successful generated film. Graph validation is not visual-quality or continuity proof. No copyrighted reference frames are published. |
| `/notes/generative-and-deterministic-systems/` | Essay | A product argument grounded in Designesto exploration/revision, Blocks structured design/production information, and the initial PropVR AI MVP. Principles are not falsely attributed as current implemented Craft capabilities. |
| `/notes/ai-native-game-development-reflection/` | Field Note | Reflection on the retained 2023 essay source. |
| `/notes/from-pixels-to-intelligent-systems/` | Field Note | Personal building/career reflection with the original Substack source. |
| `/notes/technology-and-human-agency/` | Field Note | Product control and human agency, with the retained original source. |
| `/notes/browser-flight-experiment/` | Field Note | Fictional browser-flight experiment prompted by a documentary, not a reconstruction or training simulator. |

Reading time comes from visible Markdown at 220 words per minute. Publication order uses the original publication date, not revision date. Visible update dates match Article JSON-LD. `relatedWork` drives reciprocal links from Work to published Notes. Drafts are excluded from routes, indexes, reciprocal lists, RSS, sitemap and the LLM guide.

Original media and approved editorial illustrations remain distinct in provenance. Task 5 changed no image or video source asset. The companion preserves the original DATA/editorial patch content: 92 terms, eight sections, 103 slides and 20 rendered term visuals. There are 39 embedded visual payloads before 19 original overrides, not 39 displayed diagrams. Public copy avoids a diagram count. Only the standalone HTML was integrated, not the transcript/source directory, and no license or interview endorsement is invented.

## Discovery

The existing Astro sitemap integration remains in place. Explicit `updatedAt` values supply Note modification dates. For an existing content file without one, Git history is used only when tracked and clean. Dirty, untracked, aggregate or otherwise undated pages omit unknown `lastmod` instead of receiving a build date. The companion has one exact-file entry, with no duplicate wrapper or directory alias.

Person JSON-LD retains the verified current title and exact LinkedIn, X, GitHub and directly verified Substack profile URLs. Notes use Article markup with matching dates, canonical and image. Work CreativeWork represents the case-study writing, with the product as its subject, the visible role as context and no inferred article creation date from the product's start year. Social dimensions are measured from the actual image file rather than guessed from the hero image.

RSS covers all eight published Notes. The optional LLM guide follows the 19-item Work priority, includes published Notes and the companion, and excludes the compatibility project, terminal and drafts. Robots retains open crawling and the canonical sitemap index. These files support discovery but do not guarantee indexing, ranking, citation or bot adoption.

## Final review fix wave

The final source-only review changes the homepage section heading to **Writing** and selects the newest published representative of each available Note type. With the current corpus, Home therefore contains one Field Note, one Technical Teardown and one Essay; drafts remain excluded, and Notes index/RSS chronological ordering is unchanged. The self-contained Dwarkesh × Jensen companion changes only the three newly authored title strings specified in review: document title, Open Graph title and no-JavaScript heading now use a colon instead of an em dash. No inherited companion DATA, editorial patch prose, media, visual tokens or layout was changed.

The scoped re-review confirmed both findings addressed, with no new breakage or outstanding observations. The parent then ran the complete post-fix verification: 63 unit tests and 151 Chromium browser tests passed, Astro check reported zero diagnostics across 77 files, and build/output validation passed. Raw stdout/stderr and command results are retained in the private Task 6 final receipts. No new screenshot, visual-audit or detector pass was performed because these are selection, label and title-punctuation changes within the established Velvet Reveal presentation.

## Verification

Final local verification: Astro check passed on 77 files with zero errors, warnings or hints. All 63 unit tests passed. The complete Chromium Playwright confirmation passed 151/151 tests with two workers and no retries. The final build generated 40 Astro pages. Generated-output verification passed for 40 indexable URLs, 37 LLM guide links and 56 required artifacts, covering 20 Work, six domain and eight Note routes. The package has no lint script, so no lint run is claimed. Final stdout/stderr is retained in the private Task 6 receipts; the earlier 61-unit/150-browser gate and its initial failures remain in the Task 5 receipts for traceability.

The first complete browser run exposed old brand/signature selectors and eight page-fixture setup timeouts before navigation under automatic worker fan-out. Selectors were migrated while preserving wrapping/focus coverage, and both normal and temporary configurations now use two workers. A hover regression now checks actual 4.5:1 contrast rather than rejecting the existing warm text color. The approved complete confirmation passed after these corrections. The first build checker also counted selector tokens in inline JavaScript as case elements. It now counts article opening tags, and the final build validation passed.

The subsequent copy-compliance review corrected four phrases in the Notes index, two new articles and the Designesto case. The visitor-facing terminology guard now checks rendered text across all 39 main-site routes, including every published Note discovered from the index, while preserving inherited companion/archive prose and internal identifiers. The refreshed-preview confirmation passed all four focused copy/Notes-render tests. Build and generated-output verification also passed with the same route/artifact counts above. A stale Markdown preview cache caused the interim copy failures even though the source and built output were correct; the parent refreshed its owned preview before the passing confirmation. Those four prose changes initially received focused coverage only; the final 151-test suite now also covers them. No additional visual scan was performed.

One visual batch captured Home, Work, About, Notes, Craft and Lab at 320, 360, 768, 1280 and 1600px, plus a normal-motion Home opening. All 30 page/width combinations had zero document overflow and zero WCAG-tagged axe violations. These checks do not establish complete screen-reader compliance or real-device performance. Two concrete regressions were fixed: archive-action clearance from Back to top and selected-case role copy below the preserved 13px floor. Motion, refresh, settled grid, resize, reduced motion, hotspot focus/touch, opt-in playback, no-JavaScript routes and contact regression coverage is retained.

The inherited particle test divided sparse moving pixels by the whole enlarged hero canvas, making blank area affect the pass threshold. It now uses a fixed seed and measures changing gold particle ink, excluding blank space and the stationary cobalt grid. This protects movement rather than lowering the old threshold. A mobile hotspot test now remeasures the art after click-induced scroll instead of comparing stale viewport coordinates.

Impeccable 4.1.3 informed the bounded review and preservation of the approved UI. The earlier Task 3 detector exited 1 with truncated output, including type-ramp and one incumbent color advisory. It was not rerun to manufacture a clean receipt. This report makes no clean-detector or exhaustive accessibility claim.

## Local versus live

The separately recorded live check at 2026-09-02 18:46 UTC returned HTTP 200 for browser, Googlebot and Bingbot requests to the existing root portfolio with the `www` canonical. The apex redirected 301 to `www`, robots allowed crawling and named the sitemap, and Ghost Terminal remained HTTP 200/noindex at its archive route. Fresh Chromium showed the existing Velvet portfolio, not the terminal at root. This establishes the old live release only. None of the new editorial source is claimed deployed.

The external-source check covered 55 unique URLs: 48 successful responses, six HTTP 403 responses and one fetch failure. Exceptions are the Cycling Without Age programme page and annual-report PDF, Gust, Medium/HomeLane, TouchArcade, YourStory and APKTurbo. These are automated-access exceptions, not proven dead links. Historical citations were not replaced with invented alternatives. Craft's primary pages, Substack profile and the primary GitHub article links resolved. Timestamp destinations in the companion were checked structurally, not played at all 92 positions.

## Exclusions and owner follow-ups

- Agent Skills was explicitly excluded. There is no showcase, bundle or missing-skills blocker.
- Gaussian splatting and Hinglish voice remain research/evaluation backlog. They were not turned into thin Work pages or fabricated benchmarks.
- The owner should review sensitive contribution/media boundaries and the remaining external-access exceptions, then explicitly approve source integration and publication.
- After an approved deployment, verify the new routes, response headers, RSS, robots, sitemap, canonical/OG metadata and original-source links on the production domain. Recheck Craft availability if publishing later.
- Search Console property access, sitemap submission, URL Inspection and indexing requests remain owner actions. No submission or account inspection occurred.
- Complete any desired human screen-reader, real-device, original-video playback and real-user performance checks separately. No new GPU/mobile/model benchmark was run.

## Blocked P1 items

Gaussian splatting and Hinglish voice were not promoted to source-based articles or Work cases because the supplied evidence establishes research/evaluation planning rather than implemented, measured systems. They need inspectable implementation evidence and an actual evaluation before publication. This does not block the reviewed editorial source release. Agent Skills is an explicit exclusion, not a blocked or missing item. Production publication and owner Search Console actions still require the owner's approval/access.

Active maintenance guidance is in README, PRODUCT, DESIGN, `docs/discovery.md`, `docs/media.md` and `docs/deployment.md`. Historical plans and source attribution remain historical records. Private review snapshots, transient configs, caches and generated output are ignored, and TypeScript excludes private review copies.

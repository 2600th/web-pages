# 2600th.com update report

Targeted implementation of the live-audit handover, against source revision `31027ac`. The existing visual system, homepage length, project attribution and public/private source boundaries are preserved. This report records implementation and local verification; the release response records the resulting Pages run and live checks.

## Changed

- Home: added a literal space between the heading spans. Visible wording is unchanged; extracted text reads “Make the uncertain operable.”
- Work: removed repeated dates from status labels, updated index metadata, and moved Little Wonder directly after Safed Sagar. Chronological sorting is unchanged.
- Work opening collage: now links Blocks, Designesto and PropVR AI → Craft, retaining responsive layers and reduced-motion behavior.
- Craft: consolidated the current section into one timeline and one scope comparison. It distinguishes the original 22-tool MVP from the current team's 30+ production tools across six studios, with Agentic 1.0 and Arc 1.0 in early access. Current platform credit stays with PropVR Technology's team.
- Designesto: replaced repetitive scope disclaimers with the supplied product-work, current-scope and Blocks-relationship copy. Its case remains separate from Blocks.
- Blocks: clarified the distinction between visual exploration and structured pricing, validation and production decisions without adding private metrics.
- GreyKernel: expanded the founder/CTO chapter, added a portfolio table and five related-project links. Reserved enough width for whole project names in the mobile table.
- SpaceCraft Pro: added “One edit, several consequences” immediately before the project notes, explaining downstream effects of room-editor changes.
- Little Wonder: expanded the workflow, continuity and child-sized interface sections, including an accessible five-step sequence. No child inputs or private family images were added.
- Ocean teardown: added the authentic scene image and a two-panel texture-allocation/download-weight figure, with independent scales and exact values.
- Floorplan teardown: replaced the plain text chain with an ordered, captioned seven-stage figure; no accuracy-validation claim was added.
- AI-video teardown: consolidated the experiment disclosure near the introduction while preserving the distinction between the original experiment, later saved graphs and a proposed next sequence.
- Archive social images: Humanoid Robot Control System, The Brutal Spy, Alphaman and Merkur Magie use their existing project-specific images with actual image dimensions.
- Discovery: added `/sitemap.xml` as an XML compatibility index for the existing generated sitemap. Updated discovery documentation and removed a stale deployment instruction referring to a `gh-pages` branch.
- Release-gate correction: excluded button links from the general route-opening hover colour rule. The 404 return button now retains white text on cobalt after its transition, rather than dropping below 4.5:1 contrast.

## Content lengths after editing

Same-method DOM text-node counts, excluding navigation, breadcrumbs, source cards, header and footer. These numbers are not directly interchangeable with the reviewer's whole-`main` counts.

| Page | Before | After |
|---|---:|---:|
| Home | 555 | 555 |
| Work index | 901 | 898 |
| Blocks | 574 | 594 |
| Designesto | 532 | 503 |
| PropVR AI → Craft | 744 | 761 |
| GreyKernel | 204 | 595 |
| SpaceCraft Pro | 378 | 533 |
| Little Wonder | 158 | 439 |
| Ocean reliability | 1,248 | 1,304 |
| Floorplan parsing | 1,366 | 1,377 |
| AI-video control | 1,261 | 1,253 |
| Notes index | 450 | 450 |
| About | 581 | 581 |
| Lab | 192 | 192 |

For comparison with the reviewer's visible-main method, `main.innerText` counts are GreyKernel **233 → 626**, SpaceCraft Pro **441 → 596**, and Little Wonder **191 → 472**. Short archive bodies, the four Field Notes and the generative/deterministic essay were not expanded.

## Assets added

Eight responsive derivatives, generated with the existing Sharp pipeline. All use 16:9 dimensions: 640×360 or 960×540. Originals remain unchanged.

| Files | Existing source | Use |
|---|---|---|
| `public/media/routes/work/blocks-{640,960}.{avif,webp}` | `public/media/generated/editorial/blocks-design-production-v1.webp` | Blocks collage card; retains its existing editorial provenance |
| `public/media/routes/work/craft-{640,960}.{avif,webp}` | `public/media/work/propvr-ai-craft/craft-public-home-20260902.webp` | Craft collage card; contained rather than cropped to preserve the public interface |

The eight files total **123,443 bytes**. The Ocean figure reuses `public/media/work/web-ocean-3d/hero.webp` (1600×900), an authentic project capture. The budget and workflow figures are semantic HTML/CSS, not generated screenshots or invented application UI. No new AI-generated assets were needed.

## Preserved claim boundaries

- Craft availability: checked the public [tools index](https://craft.propvr.ai/tools), [platform](https://craft.propvr.ai/platform), [Arc page](https://craft.propvr.ai/arc) and [About page](https://craft.propvr.ai/about). This verifies published availability language, not an authenticated product test. Initial MVP authorship and current team ownership remain separate.
- Blocks and Designesto: no private metrics, customer results or execution-ready Designesto claims were introduced. Earlier InCo integration does not establish that all structured Blocks capabilities are already in Designesto.
- Ocean: texture allocation falls from **762.3 to 79.9 MiB** while the download comparison rises from **33.7 to 40.7 MiB**. They are different budgets, not a combined memory total or a universal performance result.
- Floorplan: the stage figure describes dependency order, not demonstrated geometry accuracy. Proprietary fields, credentials, private prompts and customer plans remain excluded.
- AI video: later graph structure is not presented as proof of a successful render or as a recovered shot-by-shot production log. The proposed six-beat sequence remains proposed.
- Historical and patent cases remain concise. Existing credit, role and project boundaries were not rewritten to imply sole ownership or current employment permission.

## Skipped conditional work

- AI-video original clip/contact sheet and sanitized H3 graph screenshot: no publication-ready source assets were available in the portfolio media inventory. No substitute or fabricated experiment image was added.
- Ocean broken/compressed-versus-correct comparison: no matched known-good pair was available. The authentic scene and accurate two-budget figure were added instead.
- Agent Skills showcase: intentionally excluded under the owner's explicit direction, despite the reviewer's conditional suggestion. No private skill bundles were published.

## Verification

- Regression tests cover semantic heading whitespace, Work order/status labels, collage destinations, Craft consolidation/availability/credit, article figures, the sitemap alias and mobile portfolio-name wrapping. Each new behavior was checked against the failing state before its fix.
- `npm run verify`: passed. Astro checked 82 files with zero errors, warnings or hints; **65 unit tests** and **158 Chromium tests** passed; 40 pages built; generated checks verified 56 required artifacts, 20 Work routes, six domain routes and eight Notes. There is no separate lint command in this repository.
- Production-preview audit: 14 routes at **360, 768, 1280 and 1600 px**; 56 route/viewport checks, no horizontal page overflow, missing above-the-fold images, duplicate H1s or browser console/page errors. Automated WCAG 2 A/AA and 2.1 AA checks on those 14 main-content surfaces reported no violations at 360 px.
- Checked 40 unique internal link destinations locally. The production build validates the complete 40-URL indexable route set, plus retained terminal assets and the old Blocks/InCo compatibility route.
- Generated discovery checks cover eight published Notes, dates, sitemap coverage, canonical URLs, draft exclusion and the 37-link LLM guide. Browser tests cover Open Graph/Twitter image dimensions, authorship and JSON-LD.
- Independent source review reported no blocking defects. The Impeccable pass retained the established visual system and prompted the narrow-table correction; detector output contained existing advisory typography/token findings and was not represented as a clean scan.
- Development-mode tests emitted intermittent Astro toolbar audit-fetch warnings. Production-preview browser checks are separate and did not reproduce those console errors. Automated checks do not replace physical-device or screen-reader testing.
- The first CI attempt stopped before deployment on the settled 404-button hover contrast (4.31:1). The local test was strengthened to wait for CSS animations to finish, reproduced the same failure, and the selector was corrected rather than weakening the threshold. The live site was not replaced by the failed run.

## Manual follow-up

- Owner-authenticated Google Search Console: submit/check the sitemap and inspect important URLs. Indexing and real-user performance are not established by a successful deployment.
- Supply and approve the original AI-video experiment clip/contact sheet and a sanitized graph image if those conditional figures are still desired.
- Any future Ocean comparison must use a genuinely matched before/after scene pair rather than visually similar substitutes.

Deployment verification must confirm the intended commit's Pages workflow succeeds, all 41 retained content URLs and referenced assets return successfully, the live files match the post-commit build, discovery endpoints serve current content, and `2600th.com` redirects to `www.2600th.com`.

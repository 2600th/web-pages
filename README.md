# Pranshul Chandhok / 2600th

The static Astro portfolio source for Pranshul Chandhok’s product, AI, real-time 3D, and spatial-systems work. The configured public URL is [www.2600th.com](https://www.2600th.com); this README describes the source checkout, not a verified live deployment.

## Current site

The homepage uses `VelvetHero` and `VelvetHomeSections`: a dark cinematic introduction, two actions, four proof links, five selected projects, a product-workflow thesis, recent writing, and “Let’s compare notes” contact. The introduction replays on reload when motion is enabled. Escape settles it. The approved Orbital composition surrounds the character with restrained cobalt arcs and a moving gold detail; its mobile geometry follows the portrait. Fine pointers receive a restrained halo outside reading content. Motion can be paused across pages. Touch and reduced-motion devices receive static detail. Domain labels appear on hover, focus, or activation.

Primary navigation is Home / Work / Notes / Lab / About. Work is an image-led gallery of 19 projects: Blocks leads the selected view, with Designesto and IRA VR alongside it. Domain browsing and chronological order use a uniform gallery; compact screens use a single column. Project pages group their introduction, metadata and image, followed by bounded reading content and section navigation where useful. The old combined `/work/blocks-inco-ai/` is a self-canonical compatibility page, not a main archive item. Separate cases cover Blocks, Designesto and PropVR AI → Craft, distinguishing the initial MVP from the PropVR Technology team's later work. Notes has nine articles: four Field Notes, three Technical Teardowns and two Essays. Videos start only after a user playback request. Shared pages have one contact invitation and a floating Back to top link after 300px of scrolling. Native links remain available without JavaScript.

The original console is preserved separately at `/lab/terminal/index.html` with `noindex,follow` and a return link. Lab also hosts the self-contained, unofficial interview companion at `/lab/dwarkesh-jensen/index.html`. Use that exact file URL, not an unserved development directory alias.

## Local development

```powershell
npm ci
npm run dev
```

Use `npm run build` followed by `npm run preview` for a local production preview. `npm run verify` runs Astro diagnostics, unit tests, Playwright browser journeys, the production build, and generated-artifact checks. The browser suite targets Chromium at `http://127.0.0.1:4321`; ensure any existing server on that port belongs to this checkout. If its browser binary is missing, install it with `npx playwright install chromium`.

Passing checks establish local build/test status, not live deployment or approval to publish. Inspect changed pages in the browser as part of review.

## Career content and media

Career records live in `src/content/work/`; writing lives in `src/content/notes/`. The content contracts are in `src/content/schemas.ts` and `src/content/evidence.ts`. Work records carry sources, evidence status, era, domains, role, and supported public claims. Use `recordType: evidence-note` when the available material does not justify a full case study; never manufacture depth to fill the template.

For a Note, supply its stable slug, honest `type`, original `publishedAt`, `draft` flag, summary, topics, source attribution and unique 1200×630 `ogImage`. Use `updatedAt` only for a significant editorial update. `canonicalUrl` is an optional original external publication, not the local article canonical. Add `relatedWork` slugs or local `relatedLab` links only when relevant. Reciprocal Work links derive from the published Note, and reading time derives from its body. Drafts stay out of routes, indexes, RSS, sitemap and the LLM guide. Keep private code, customer material, invented measurements and proposed features out of statements of completed work.

Current implementation and source boundaries are documented in [the editorial update report](docs/editorial-update-report.md). `scripts/sitemap-metadata.mjs` uses explicit modification dates or clean, tracked file history. Dirty, untracked or aggregate pages without a trustworthy content date omit `lastmod`, never use the build clock.

Reviewed downloads, public-video masters, browser captures, and generated-image masters belong in the gitignored `_media-source/` directory. Preserve originals. Publish only reviewed, optimized derivatives in `public/media/`, with provenance in `src/data/media-provenance.ts` and `src/data/career-media.ts`.

Authentic video sources remain distinct from generated editorial/enhanced posters. Generated provenance and `evidenceUse: false` remain internal metadata; reader-facing captions explain the project or depicted scene without turning illustration into proof of shipped work.

Shared image rendering uses a checked-in responsive manifest and AVIF/WebP candidates for Work thumbnails, still homepage cards and case figures. After changing content image sources, run `npm run media:responsive:build`; this creates content-hashed delivery derivatives without replacing originals. The manifest and `public/media/responsive/` outputs ship together. No source-master download or image generation is required for this command.

Media regeneration is a separate maintenance task, not a prerequisite for ordinary development or deployment. Run only the applicable commands after reviewing their input/output scope:

```powershell
npm run media:career:inspect
npm run media:career:build
node scripts/build-route-opening-media.mjs
npm run media:social:build
npm run media:icons:build
npm run media:responsive:build
npm run verify
```

The career builder requires local source masters and regenerates only configured recipes; it is not a complete rebuild of all curated media. See [the media workflow](docs/media.md) for capture, responsive formats, approval boundaries, and provenance maintenance.

## Publishing

`main` is the source and default branch. Pushing reviewed changes to `main` triggers `.github/workflows/pages.yml`: locked dependency installation, Astro/unit/browser checks, production build, output validation, then GitHub Pages deployment of `dist/` only.

```powershell
npm run verify
git push origin main
```

The workflow can also be started with **Run workflow** on GitHub Actions for `main`. GitHub Pages uses the GitHub Actions publishing source and retains `www.2600th.com`; no generated-output branch is required. The previous `npm run deploy` branch-publishing shortcut was removed so it cannot recreate `gh-pages`. Push to `main` only with release approval, never for a preview.

See [deployment and rollback](docs/deployment.md), [current design guidance](DESIGN.md), and [the documentation index](docs/README.md). Dated specs and plans are historical decision records, not the current operating instructions.

# Pranshul Chandhok / 2600th

The source for [www.2600th.com](https://www.2600th.com): a static Astro portfolio for Pranshul Chandhok’s product, AI, real-time 3D, and spatial-systems work.

## Local development

```powershell
npm ci
npm run dev
```

`npm run verify` runs Astro diagnostics, unit tests, browser journeys, the production build, and generated-artifact checks.

## Career content and media

Career records live in `src/content/work/`. Every record requires a public source, evidence status, era, domain, role, and public claim. Use `recordType: evidence-note` when the available evidence does not justify a full case study; never manufacture depth to fill the template.

Reviewed Drive downloads, public-video masters, browser captures, and generated-image masters belong only in the gitignored `_media-source/` directory. The repository publishes optimized poster frames and short, muted loops—not raw source files.

Every published media path must have an entry in `src/data/media-provenance.ts` or be generated from a record in `src/data/career-media.ts`. Editorial illustrations are labelled as such in the work record; they must never be presented as product screenshots.

The media workflow is:

```powershell
npm run media:career:inspect
npm run media:career:build
npm run media:social:build
npm run media:icons:build
npm run verify
```

`scripts/capture-first-party-media.mjs` records a short first-party browser session for later editing. Final clips should be MP4/H.264, muted, short, and configured with `preload="none"`; poster images should be WebP. See [docs/media.md](docs/media.md) for the evidence and performance rules.

The homepage now includes 17 evidence-backed career records, a six-clip motion ledger, precisely labelled recognition and coverage, and the original console preserved at `/lab/terminal/`.

## Publishing

The site remains compatible with a free GitHub account. Source lives on a source branch; the locally generated `dist/` directory is published to the repository’s `gh-pages` branch.

```powershell
npm run deploy
```

That command pushes generated files. Do not run it for a preview. See [docs/deployment.md](docs/deployment.md) for the first-release branch migration, GitHub Pages settings, verification, and rollback procedure.

The original console portfolio is preserved at `/lab/terminal/` and marked `noindex,follow`.

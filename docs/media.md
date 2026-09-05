# Media and provenance workflow

This is the current maintenance guide. [DESIGN.md](../DESIGN.md) covers presentation; dated redesign specs and plans preserve history rather than overriding the current source.

## Sources, derivatives, and private material

- Keep authentic source downloads, browser captures, and generated-image masters in the gitignored `_media-source/` directory. Preserve originals and inspect copies; do not optimize a master in place.
- Publish only reviewed derivatives under `public/media/`. Everything under `public/`, including JSON sidecars and provenance manifests, is copied into the static site: review it for private details before release.
- `src/data/career-media.ts` records career assets and their source/status. `src/data/media-provenance.ts` incorporates those paths and maps other published media, including responsive route derivatives and generated art.
- Generated editorial/enhanced imagery is not documentary evidence. Keep its generation receipt/source, `generated-editorial` classification, and `evidenceUse: false` metadata. Retain the relevant manifests under `public/media/generated/`; do not confuse an enhanced poster with the authentic clip it introduces.
- Reader-facing captions should describe the project, scene, workflow, or contribution. Internal provenance labels are not boilerplate captions, but neither captions nor copy may imply generated details prove an interface, award, metric, or shipped capability.

Private email, Drive records, and internal archives may corroborate dates, scope, or responsibilities without being suitable for publication. Do not publish raw correspondence, commercial terms, personal contact details, private links, confidential metrics, or sensitive operational material. Review public summaries and `reviewedEvidence` entries as public copy, not as a private ledger. Material marked `approval-enhanced` needs explicit release approval; metadata is not an automatic publishing barrier.

## Current presentation and playback

The homepage presents five selected projects through `VelvetHomeSections`. Blocks and Craft use stills. Designesto, SpaceCraft Pro and Enterprise XR use authentic MP4 sources with separately attributed posters. The original recordings are unchanged. Other project imagery and clips are supplied by work frontmatter and `ProjectMedia`. Each of the nine Notes and Craft has a distinct 1200×630 social card, not an inferred rendering or measurement of the described system.

Images use WebP, with AVIF alternatives where supplied. Preserve the intended aspect ratio, explicit dimensions, descriptive alternative text, and eager/high-priority loading only for important opening images. Work and Notes opening media use 640px and 960px responsive AVIF/WebP derivatives with `srcset` and `sizes`.

Videos use short, muted, inline loops with `preload="none"` and a poster. The career builder encodes H.264 MP4 with `faststart`; optional VP9 WebM is retained only when it saves enough space. The build checker limits individual public-media files to 2,200,000 bytes.

Playback begins with a user request, not on initial viewport entry. Homepage playback can resume on re-entry after the user has requested it; project media pauses when it leaves view. Reduced-motion conditions do not start playback automatically and preference changes pause motion, but explicit Play remains available. Preserve the distinctions in `src/scripts/signal-work.ts` and `src/scripts/evidence-media.ts` when changing behavior. `ProjectMedia` retains native video controls without JavaScript.

## Capture and regeneration

Run commands from the repository root. These commands write derivatives or reports; review their destinations before use and inspect the resulting diff afterward. They are not all required for each change.

```powershell
node scripts/capture-first-party-media.mjs <url> [output-directory] [button-label]
npm run media:career:inspect
npm run media:career:build
node scripts/build-route-opening-media.mjs
npm run media:social:build
npm run media:icons:build
```

The capture helper records a 1280 × 720 first-party browser session, optionally clicking the named button, into `_media-source/browser-captures` by default. Review the recording for privacy and rights before editing or publishing any excerpt.

The career inspect/build commands read every recipe in `scripts/career-media.config.mjs`, including internal-only sources. They require the local source masters and write `test-results/career-media-report.json` with source checksums and, for builds, output details. Recipes marked `internal-reference-only` or `excluded` must have no public outputs. The build overwrites configured derivatives; it does not regenerate the entire curated media library or update the TypeScript provenance records automatically. Reconcile recipes, published paths, and provenance before rebuilding so an older recipe does not replace a reviewed asset unintentionally.

`scripts/build-route-opening-media.mjs` creates the Work and Notes opening derivatives from its four explicit sources. If a source or output stem changes, update the builder, page references, and route-opening entries in `src/data/media-provenance.ts` together. It does not regenerate the underlying editorial art or authentic poster masters.

### Responsive delivery derivatives

`npm run media:responsive:build` reads Work/Note media sources and writes 320, 640,
960 and up-to-1600px AVIF/WebP variants, without upscaling. Source-content hashes
version the filenames. It preserves every original and existing provenance entry;
these are delivery-size conversions, not new editorial compositions.

Commit `src/data/responsive-media.json` and its `public/media/responsive/` outputs
together. `ResponsiveImage` consumes the manifest for archive thumbnails,
homepage stills and case figures; video playback retains original clips and
reviewed posters. Browser `sizes` values reflect each rendering context. Rebuild
the manifest after changing content image sources. Do not replace authentic
technical captures with generated interpretations merely to improve appearance.

### Favicon derivatives

`public/favicon.svg` is the canonical, manually reconstructed vector for the approved concept A 26 ligature. `npm run media:icons:build` runs `scripts/create-icons.mjs` to derive `public/favicon.ico` (32px) and `public/apple-touch-icon.png` (180px) deterministically from it; no image generation is used for these derivatives. The Apple PNG carries an auxiliary origin note. Regeneration strips that metadata, so restore it when retaining embedded provenance; the SVG source comment remains the durable origin record. Keep the shared layout links and manifest sizes aligned with the outputs. The historical console's separate icon remains unchanged.

## Review gate

1. Establish the supported public claim and publication suitability independently. Confirm any required release approval.
2. Preserve source masters and provenance. Add or update the narrowest applicable recipe and path records.
3. Inspect representative images and video frames for private data, readable UI text, misleading generated details, rights ambiguity, and unintended crops.
4. Check the actual affected pages at desktop and mobile sizes, including poster-to-video transitions, explicit Play/Pause, keyboard behavior, and reduced motion.
5. Run `npm run verify` and inspect the generated output. The automated media/path checks do not establish rights, visual fidelity, confidentiality, or release approval.

The self-contained console archive stays under `public/lab/terminal/`. Preserve its assets independently of current portfolio media and do not use its retained files as evidence that a new asset is safe to publish.

# Media and evidence workflow

The public portfolio uses three kinds of media. They must remain visibly distinct.

## 1. Authentic product media

Use first-party screenshots, authored demos, public repositories, public gameplay, or reviewed company archives. Keep the source master in `_media-source/`; publish only a compressed derivative in `public/media/`.

- Images: WebP, normally 1600 × 900 or the source aspect ratio.
- Motion: H.264 MP4, muted, generally 6–10 seconds, with `faststart` and a WebP poster.
- Playback: `preload="none"`, `muted`, `playsinline`, intersection-aware, paused when hidden, and disabled for reduced motion.
- Attribution: add every manual derivative to `src/data/media-provenance.ts`.

The current public motion set includes designesto.ai development footage, IRA VR/Newton, a GreyKernel showreel excerpt, Machine Hunter, Web Ocean 3D, and Oye Tippa Run. Chhota Bheem Jungle Rescue uses reviewed concept screens and links to the public YouTube gameplay record rather than redistributing third-party footage.

## 2. Editorial illustrations

Use generated illustration only when a real screen is unavailable, private, or materially weaker than a conceptual explanation. Label it `Editorial illustration` in frontmatter. Never generate fake dashboards, product interfaces, client logos, awards, or evidence.

The 2026 editorial set uses mineral white, optical black, and cobalt technical traces for the humanoid-robot patent, HomeLane SpaceCraft Pro, enterprise immersive systems, and the AI-native game thesis.

## 3. Private evidence

Mail and Drive records can corroborate dates, delivery, responsibilities, and client context. Do not publish raw email, commercial terms, personal contact details, private links, or internal metrics. Public copy should state only the supported claim; the reviewed-evidence ledger records the kind and date of the underlying evidence.

## Capture and build commands

```powershell
node scripts/capture-first-party-media.mjs <url> <output-directory> [button-label]
npm run media:career:inspect
npm run media:career:build
npm run media:social:build
npm run media:icons:build
npm run verify
```

The original console remains self-contained under `public/lab/terminal/`. Root-level copies and unused icon folders were intentionally removed.

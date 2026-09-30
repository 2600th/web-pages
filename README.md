# Pranshul Chandhok / 2600th

The static Astro source for [www.2600th.com](https://www.2600th.com), the portfolio of Pranshul Chandhok: product, AI, real-time 3D and spatial-systems work. This README describes the source checkout; it is not proof of a live deployment.

## The site

The whole site uses one design system, **Signal** (see [DESIGN.md](DESIGN.md)), built on the 2600 Hz tone behind the handle.

- **Homepage** (`src/pages/index.astro`, scripts in `src/signal/`): a one-page scroll story. A Three.js point-cloud portrait assembles from noise, locks onto 2600 Hz and morphs into oscilloscope traces while the origin story plays: computers and games from an early age, college from 2007 to 2011, a hacking documentary, the 2600 Hz tone, the Cap’n Crunch whistle, the blue box and Kevin Mitnick. Then proof, six selected systems on a tunable monitor, a four-era career log, the Lab, the four latest notes and a working MF blue box.
- **Work**: a switchboard of 20 projects across six bands (the band labels filter), then the gallery with chronological order. Each case page opens with a shell-path breadcrumb, a readout and, where there is something to open, the same endpoint rows the Lab uses (Live, Site, Source, Notes, Open), with a hero monitor that tunes in on its channel; ← → change channel. The old combined `/work/blocks-inco-ai/` stays as a self-canonical compatibility page outside the archive.
- **Lab**: independent builds as cartridges in an arcade cabinet with a WebGL CRT, led by DLSS 5 Video Player; each card keeps its endpoint rows. It also links the unofficial Dwarkesh × Jensen companion (`/lab/dwarkesh-jensen/index.html`, a standalone deck) and the original Ghost Terminal (`/lab/terminal/index.html`, archived with `noindex,follow`). Use those exact file URLs.
- **Notes**: nine articles typed as Field Note, Technical Teardown or Essay, tuned on a receiver. Each note's waveform signature is drawn from its sections and doubles as its contents.
- **About**: why 2600th told as two 2600s, the Atari 2600 console (a 3D model you load cartridges into) and the 2600 Hz tone, then a conference badge whose display tunes in on the homepage character and whose LEDs, one per year since 2012, read out each year's work, then the career in three acts, tools in use, the patent and how I work.

Every page shares the header, the dial-in footer, the backtick console and the Hang up return to the top. Sound is synthesized with Web Audio and off by default. The 3D engine loads lazily and only with motion on; reduced motion, no WebGL and no JavaScript all get a static portrait and the full content. One motion preference (`2600th-ambient-motion`) covers every page. Easter eggs (the console, the Konami code, dialling 2600) are keyboard-gated per WCAG 2.1.4 and can be switched off. Native links work without JavaScript.

## Local development

```powershell
npm ci
npm run dev
```

`npm run build` then `npm run preview` gives a local production preview. `npm run verify` runs Astro diagnostics, unit tests, the Playwright browser suite, the production build and the generated-artifact checks. The browser suite targets Chromium at `http://127.0.0.1:4321`; make sure any server already on that port belongs to this checkout, and install the browser with `npx playwright install chromium` if it is missing. Passing checks are local evidence, not a live deployment or approval to publish.

## Source layout

| Path | What it holds |
| --- | --- |
| `src/layouts/SiteLayout.astro` | The one page layout: head, header, footer, back to top, cursor and toast |
| `src/components/site/` | Signal components: header, footer, openings, path, trace, signatures, notes log, endpoints, build cards, transmissions |
| `src/components/work/`, `src/components/about/`, `src/components/shared/` | Switchboard, gallery, case media, sources, the About badge, responsive images, SEO head |
| `src/styles/signal/` | `tokens.css`, `chrome.css` (shared chrome), `pages.css` (interior pages) and one sheet per section signature |
| `src/signal/` | Homepage engine, audio, console and site-wide behaviour (`chrome.js`) |
| `src/signal/scenes/` | Interior scenes: the lazy scene loader, receiver, reading, switchboard, case monitor, arcade, badge and 404 intercept |
| `src/content/` | Work and Notes content with their schemas |
| `src/data/` | Site identity, builds and endpoints, work order, notes helpers, media provenance |
| `public/lab/` | The standalone companion deck and the archived Ghost Terminal |
| `scripts/` | Build verification, sitemap dates and media tools |

## Content and media

Work records live in `src/content/work/`, notes in `src/content/notes/`; the contracts are in `src/content/schemas.ts` and `src/content/evidence.ts`. Work records carry sources, evidence status, era, domains, role and supported public claims. Use `recordType: evidence-note` when the material does not justify a full case study; never manufacture depth to fill the template. Independent builds and their endpoint rows are defined once in `src/data/builds.ts` and shared by the homepage, the Lab and case pages.

A Note needs a stable slug, an honest `type`, the original `publishedAt`, a `draft` flag, summary, topics, source attribution and a unique 1200×630 `ogImage`. Use `updatedAt` only for a significant editorial update. `canonicalUrl` is an optional original external publication. Drafts stay out of routes, indexes, RSS, sitemap and the LLM guide. Keep private code, customer material, invented measurements and proposed features out of statements of completed work.

Source masters belong in the gitignored `_media-source/`. Publish only reviewed, optimized derivatives in `public/media/`, with provenance in `src/data/media-provenance.ts` and `src/data/career-media.ts`. Generated imagery keeps `evidenceUse: false` in provenance, and captions never present it as proof of shipped work. Regeneration commands are maintenance tasks, not part of ordinary development:

```powershell
npm run media:career:inspect
npm run media:career:build
npm run media:social:build
npm run media:icons:build
npm run media:responsive:build
npm run verify
```

See [the media workflow](docs/media.md) for capture, responsive formats and provenance.

## Publishing

`main` is the default branch. Pushing reviewed changes to `main` runs `.github/workflows/pages.yml`: locked install, `npm run verify`, then a GitHub Pages deployment of `dist/` only. It can also be started with **Run workflow** on `main`. Push to `main` only with release approval, never for a preview.

See [deployment and rollback](docs/deployment.md), [search and AI discovery](docs/discovery.md) and [the documentation index](docs/README.md).

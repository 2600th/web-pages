---
name: Pranshul Chandhok / 2600th
description: A positive-negative evidence system for an operator, advisor, and public builder.
---

<!--
THESIS: One optical split turns Pranshul Chandhok's identity into the interface, then lets authentic work carry the argument.
OWN-WORLD: Warm mineral paper, optical black, one cobalt signal, monumental Mona Sans, documentary media, and hard editorial planes.
STORY: Identity -> operating thesis -> three decisive cases -> evidence trail -> public build -> notes -> conversation.
FIRST VIEWPORT: A 50/50 positive-negative field, an image-filled PRANSHUL CHANDHOK crossing the boundary, a cobalt exposure line and handle, one lower-left action, and a visible generated-identity disclosure.
FORM: Modern retro-futurism through optical systems and exposure, with hacker culture expressed as inspectable evidence rather than terminal decoration.
-->

# Design system: Positive / Negative

## Creative north star

The site is an evidence-led identity system, not a resume grid and not a themed terminal. Its central gesture is a photographic positive/negative split: warm editorial paper on the left, optical black on the right, and a precise cobalt exposure line between them. Pranshul's name crosses that boundary as the largest object in the interface.

The result should feel engineered and authored at once—clear enough for an executive scan, unusual enough to be memorable, and deep enough for technical scrutiny. Retro-futurism comes from optical machinery, exposure, typography, and measured motion. Hacker culture comes from source-visible public work, factual ledgers, reproducible artifacts, and preserved archives.

The approved visual authority is `.impeccable/mocks/clarity-round/32-positive-negative.png`. The production screenshots in `.impeccable/review/desktop.png`, `user-946.png`, and `mobile.png` document the implemented interpretation.

## Experience principles

1. **Identity is immediate.** The first viewport states the person, operating posture, and route into the work without requiring interaction.
2. **Evidence does the persuasion.** Authentic media, precise claims, dates, sources, and public artifacts outrank decorative technology language.
3. **One signal is enough.** Cobalt identifies exposure, focus, active state, or a compact primary action. It never becomes a large decorative surface.
4. **Polarity creates rhythm.** Warm and black planes alternate deliberately; they are not generic cards placed on a background.
5. **Depth remains inspectable.** Every interactive or cinematic presentation has semantic text, direct case links, and usable controls.
6. **Play follows clarity.** The 2600th signature and console archive are present, but the operator proposition is always legible first.

## Palette and material

The canonical tokens live in `src/styles/global.css`.

- **Positive** `#f1f0ea`: the main warm-paper plane.
- **Positive raised** `#fbfaf5`: a quiet highlight plane.
- **Negative** `#080908`: the main optical-black plane.
- **Negative raised** `#111210`: subtle depth on black.
- **Signal cobalt** `#2457ff`: exposure line, focus, selected state, and compact action.
- **Signal cobalt dark** `#173dcc`: pressed or strengthened signal.
- **Graphite** `#4f514c`: secondary copy on positive planes.
- **Fog** `#bfc0b9`: metadata and quiet lines on negative planes.

Authentic project color is not normalized to the brand palette. Media is allowed to supply orange, aqua, skin tones, game color, and environmental texture. Avoid cobalt washes, gradient fog, glass panels, purple AI glow, and large blue footers.

Small text on negative planes uses warm white or fog for contrast. Cobalt remains a non-text marker unless the text size and contrast are demonstrably safe.

## Typography

Use the locally hosted variable subset of **Mona Sans** for the complete system.

- Display settings are wide, heavy, tightly tracked, and compact in line-height.
- The hero name is monumental and may cross or crop against the viewport, but both names must remain recognizable.
- Section statements use editorial scale and short measures rather than generic centered marketing headings.
- Body copy is plain, direct, and measure-limited; utility labels are compact uppercase only where they aid scanning.
- Do not add faux-code monospace or nostalgic pixel fonts to manufacture “hacker” atmosphere.

The mobile hero is independently composed as two large stacked lines. It is not a uniformly scaled desktop lockup.

## Global layout

The page gutter is responsive, and wide layouts use the full editorial field rather than a narrow centered container. Hairlines and plane changes do most of the grouping; rounded card chrome and drop-shadow stacks are avoided.

### Desktop and wide screens

- The homepage opens with an exact 50/50 split.
- The name crosses the boundary and dominates the first viewport.
- Positioning and the single **Explore the work** action sit in the lower-left positive plane.
- Navigation remains peripheral on the negative plane.
- Project chapters alternate copy and decisive media at cinematic scale.
- The evidence trail, public build ledger, notes, and conversation close gradually reduce spectacle and increase scan density.

### 946px working viewport

This is a first-class composition, not a desktop afterthought. The split remains legible, the name retains scale, project media stays decisive, and ledger content remains readable without horizontal overflow.

### 390px and 320px

- The split hero remains a composed positive-negative field.
- The generated-identity disclosure stays visible and contained.
- Project chapters stack media and copy with no tiny desktop remnants.
- Work filtering becomes a labeled native select.
- All essential controls remain at least 44 CSS pixels where practical.
- No action depends on hover, horizontal drag, landscape orientation, or pointer precision.

## Homepage sequence

### PositiveNegativeHero

The hero is the primary identity artifact. A cobalt boundary and eclipse-like handle suggest an exposure instrument. The image-filled name may respond to pointer, touch, or keyboard input, but the resting composition must already look finished. The label **Generated identity study** is mandatory wherever generated imagery contributes to the identity treatment.

There is one primary action in the first viewport: **Explore the work**. Additional conversation prompts belong later in the page.

### Operating thesis

“From ambiguity to an operable system.” is the bridge between identity and proof. It is intentionally quieter and gives the first project chapter room to arrive.

### Featured work

The three lead chapters are:

1. **Blocks + designesto.ai** — current product direction, always described as launching in 2026.
2. **IRA VR** — classroom platform and immersive education evidence, using authentic Dalton/Newton material.
3. **Enterprise XR** — production, training, simulation, hotel 360, research/water-solution, shipping training, and intergenerational learning where supported by evidence.

Media is user-controlled. Play controls are explicit; meaningful stills remain available; reduced motion never removes the underlying case link or explanation.

### Evidence, public build, and notes

The proof index is a compact trail of dated work. The public-build section pairs designesto.ai positioning with a black source-visible ledger for Kinema, Web Ocean 3D, Safed Sagar, GitHub, and the console archive. Notes uses a reading-first index rather than article cards.

### Conversation close

The close returns to a large positive/negative split. It names the kinds of problems Pranshul can help with and keeps email visible. The footer continues the same neutral system; it must never become a cobalt slab.

## Interior surfaces

### Work index

Work is an inspectable 17-record editorial archive. Desktop uses numbered rows, documentary thumbnails, precise status/year/domain metadata, and direct links. Below-fold media is lazy-loaded and must reveal cleanly under real scrolling. Mobile keeps the same records and uses a native domain select.

### Case studies

Every case follows an explicit sequence:

1. Thesis
2. Contribution
3. System
4. Evidence
5. Sources

Claims retain evidence boundaries and source provenance. Evidence areas are planar neutral surfaces, never full-cobalt panels. Generated media is not used as proof of shipped work.

### Notes

Notes is reading-first: strong title, date, compact summary, source attribution, narrow article measure, and a quiet path back to the archive.

### About

About is an operating dossier, not a generic biography. It connects enterprise immersive systems, product/operator work, public building, patents or recognition where verified, and a clear conversation route.

### Lab and console archive

Lab is a public-build ledger with source-visible experiments and authentic media. The former terminal site remains available at `/lab/terminal/index.html` as a preserved, noindex archive. Archive return actions must not obscure mobile content.

### 404

The error page is a concise split surface with an immediate return path. It should feel part of the system without becoming a novelty interaction.

## Motion and interaction

Motion behaves like a controlled optical instrument:

- exposure shifts, local image reveals, and short plane transitions;
- direct, fast feedback for play, theme, filter, and focus states;
- no smooth-scroll hijacking, cursor replacement, inertial page chrome, or autoplay audio;
- no animation may delay navigation or reading.

With `prefers-reduced-motion: reduce`, remove spatial interpolation, parallax, and non-essential transform motion. Preserve static posters, semantic content, native controls, and short state feedback.

## Media and provenance

- Prefer original/public screenshots, product recordings, footage, diagrams, and approved archives.
- Preserve originals; web assets are optimized derivatives with explicit dimensions and modern formats.
- Meaningful images have useful alt text. Decorative identity layers are hidden from assistive technology.
- Videos use posters and remain user-controlled.
- Source, evidence status, and local derivative provenance live with the content records.
- Generated imagery may support identity or illustration only when authentic media is unavailable or inappropriate. It must be labeled and must never imply a shipped product result.

## Accessibility

Target WCAG 2.2 AA.

- Semantic landmarks and one descriptive `h1` per page.
- Keyboard-complete navigation, media, theme, filtering, and disclosure behavior.
- A visible skip link and high-contrast focus treatment.
- Sufficient contrast on both polarities; no meaning conveyed by cobalt alone.
- 320px containment and readable zoom behavior.
- Static HTML retains the argument and every essential destination without JavaScript.

## SEO and credibility

The visual system is progressive enhancement over crawlable static pages. Preserve canonical metadata, sitemap, RSS, robots rules, social metadata, and structured data for the person, site, creative work, articles, and breadcrumbs. Public claims must remain factual, dated where relevant, and linked to sources. Do not invent metrics, clients, awards, testimonials, or launch status.

## Performance

- Static HTML is the baseline.
- Use the local variable-font subset.
- Keep below-fold media lazy and provide dimensions to protect layout stability.
- Use responsive images, WebP/AVIF where useful, efficient MP4 loops, and poster fallbacks.
- Hydrate only behavior that materially improves the experience.
- Protect p75 targets: LCP below 2.5s, INP below 200ms, CLS below 0.1.

## Anti-goals

- No generic YC landing-page shell, bento resume grid, SaaS card wall, or skill meters.
- No nostalgic CRT treatment on the primary portfolio.
- No large blue footer or evidence panel.
- No purple-blue AI gradients, blobs, excessive glass, or floating chrome.
- No invented evidence, hidden contact route, pointer-only navigation, autoplay audio, or scroll-jacking.
- No preservation of an old structure merely because it already exists; every surface must serve clarity, proof, and the approved positive-negative world.

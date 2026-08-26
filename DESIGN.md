---
name: Pranshul Chandhok / 2600th
description: A living typographic identity that turns real work into an explorable record of product judgment.
---

<!--
THESIS: Pranshul's name is the interface; real project media and authored depth replace the generic portfolio hero, resume grid, and decorative technology theatre.
OWN-WORLD: Mineral white, optical black, and one cobalt signal; monumental variable grotesk lettering; hard image masks; exact captions; no card chrome.
STORY: Visitors identify a hands-on operator, see proof at increasing depth, understand the 15-year arc, and start a relevant conversation.
FIRST VIEWPORT: PRANSHUL CHANDHOK spans and exceeds the frame; selected letterforms reveal project imagery; concise positioning sits upper-right; the primary action sits lower-left; the O contains the eclipse theme control.
FORM: Living Wordmark leads, Three Distances structures selected work, and Motion Study carries the archive. Direction seed 8f453d22; staged with three authored viewing distances.
-->

# Design System: Pranshul Chandhok / 2600th

## Creative North Star

**The Living Wordmark**

Pranshul Chandhok is the primary, searchable identity. His name is also the site's central interaction surface: an oversized variable wordmark whose width, optical rhythm, and image apertures react to the work being explored. Project media appears through the letterforms rather than inside generic portfolio cards. The effect should feel like a custom identity program, not a typography demo.

The system has two supporting experiences:

- **Three Distances** presents selected work at `OUT`, `NEAR`, and `INSIDE`: outcome and thesis, product experience and system, then decisions and technical detail.
- **Motion Study** presents the broader career and archive as a scrub-able sequence of evolving frames instead of a chronological resume dump.

The name `2600th` is the experimental signature, lab mark, and place for deeper play. It never replaces Pranshul's name on the primary professional surface.

Approved references:

- `docs/design/references/living-wordmark-hero.png`
- `docs/design/references/three-distances-hero.png`
- `docs/design/references/motion-study-hero.png`

The references establish ambition, composition, and interaction. They are not pixel-perfect implementation screenshots, and their differing accent colors must be reconciled into the single cobalt system below.

## Experience Principles

1. **Identity before interface.** The first viewport must make the person, positioning, and action immediately legible.
2. **Evidence before labels.** Real project imagery and precise captions carry expertise; category words support rather than substitute for proof.
3. **Depth is authored.** `OUT`, `NEAR`, and `INSIDE` expose different material, not the same image scaled three times.
4. **Motion reveals structure.** Animation explains transformations, chronology, or depth. It never delays navigation or reading.
5. **The lab is earned.** Playful 2600th behavior appears after the professional proposition is clear.

## Color and Material

Use a restrained strategy: two neutral poles, one cobalt signal, and color supplied by real project media.

- **Mineral** `#F3F2EE`: primary light ground.
- **Optical Black** `#090909`: primary dark ground and light-mode type.
- **Warm White** `#FAF9F5`: dark-mode primary type.
- **Cobalt Signal** `#1547FF`: focus, current state, theme affordance, timeline marker, and primary action.
- **Graphite** `#666661`: secondary copy on light surfaces.
- **Fog** `#B8B7B0`: inactive controls, hairlines, and quiet metadata.

Project imagery remains in honest color. Do not recolor projects to fit the palette. Cobalt may appear as a line, cursor, or selected state but must not wash over the media.

### Positive and Negative Modes

Light mode is a bright editorial studio: mineral surface, black letterforms, project color visible through typographic apertures. Dark mode is a photographic negative room: optical black surface, warm-white letterforms, and luminous project color.

The transition originates from the eclipse control integrated into the wordmark's `O`, then propagates across the page as a controlled positive/negative exposure change. It is not a simple CSS inversion. On first visit, respect `prefers-color-scheme`; afterward, persist the explicit choice.

## Typography

### Wordmark and Display

Use locally hosted **Mona Sans Variable**, licensed under SIL Open Font License 1.1. Its width, weight, optical-size, and italic axes support both the living wordmark and readable body settings without adding a second family. The wordmark may change width, italic state, and optical spacing, but each name must remain readable at rest and during interaction.

Rules:

- The full name is monumental or compact; avoid generic medium-sized marketing headings.
- Cropping at viewport edges is intentional on desktop but never removes name recognition.
- Letterforms may mask project media; supporting copy never does.
- Variable-axis motion is limited to the hero and section transitions.
- Mobile receives an authored stacked composition rather than a scaled desktop wordmark.

### Body and Utility

Use the same family in restrained settings for body copy and navigation unless testing proves a dedicated reading face materially improves long-form notes. Body copy stays plain, direct, and comfortably measure-limited. Captions use tabular numerals where dates and sequences benefit.

Do not introduce decorative serif, faux-code mono, or multiple display families to manufacture variety.

## Layout

### Desktop

The homepage uses an editorial field rather than a centered marketing container. The first viewport is dominated by the Living Wordmark. Supporting copy occupies a quiet upper-right region; navigation is light and peripheral; the primary conversation action anchors the lower-left.

Selected work uses large media planes and authored depth states. The archive uses a continuous horizontal exposure band with one frame allowed to break the baseline. Reading sections use narrower measures and calmer vertical spacing.

### Mobile

The mobile layout is separately composed:

- The name stacks in two large readable lines.
- Project imagery occupies full-width apertures or bands rather than tiny letter masks.
- `OUT / NEAR / INSIDE` becomes a three-position segmented control with large tap targets.
- Motion Study becomes a swipe-optional, button- and range-input-operable sequence.
- The conversation action remains visible without completing the interactive experience.

No essential action depends on horizontal drag, hover, pointer precision, or landscape orientation.

## Components

### Living Wordmark

- Semantic heading text remains in the DOM.
- Media masks are decorative enhancements layered behind or clipped through the text.
- Pointer movement bends a local axis field; keyboard focus and touch select named disciplines instead.
- The resting state is fully composed and requires no pointer movement to look finished.

### Eclipse Theme Control

- A real button with an accessible label and visible focus treatment.
- Integrated visually into the `O` on large screens; duplicated in the navigation when the wordmark is not visible.
- Its state is understandable without color or animation.

### Three Distances Viewer

- Each project provides three authored payloads: `out`, `near`, and `inside`.
- Switching distance changes image source or crop, copy density, evidence, and layout.
- The URL can deep-link to a project and distance.
- A semantic case-study link always exists outside the interactive viewer.

### Motion Study

- A chronological strip of real work, experiments, and career moments.
- A native range control and previous/next controls provide complete keyboard operation.
- The visual scrubber may add inertia and frame cadence, but the content remains a semantic ordered list.
- Dates and project names must be factual; missing public evidence is omitted rather than invented.

### Conversation Close

- One primary action: **Start a conversation**.
- Supporting prompts may identify advisory work, difficult 0-to-1 product problems, product/technology leadership, collaboration, and speaking.
- Email remains visible and copyable; LinkedIn is the fallback channel.
- No fake urgency, qualification score, or elaborate lead form in the first release.

## Motion

Use one orchestrated motion language: optical transformation.

- Wordmark axes respond locally and settle quickly.
- Theme changes behave like a positive/negative exposure transition.
- Three Distances uses a precise camera cut or FLIP-style plane transition.
- Motion Study scrubs through frames with controlled cadence.
- Page navigation may use native View Transitions when available.

Prefer CSS, the Web Animations API, and native scroll-linked behavior. Add one small motion library only if it reduces complexity and remains tree-shakeable. Do not add smooth-scroll hijacking.

For `prefers-reduced-motion: reduce`, remove axis interpolation, parallax, inertial scrubbing, and spatial zoom. Preserve short opacity changes under 150 ms where useful for state feedback.

## Audio

Audio is optional, off by default, and unlocked only after explicit user action. If enabled, it may provide a subtle theme-change click, distance-step tick, and scrub detent. No music or ambient bed autoplays. A persistent mute control must be reachable by keyboard, and all meaning must remain visual and textual.

## Imagery

- Use public project imagery, public video frames, approved archive media, or purpose-made diagrams.
- Prefer large decisive crops over thumbnail grids.
- Every image has useful alternative text or is explicitly decorative.
- Case-study imagery includes source and evidence status in content metadata.
- Generated concept imagery is never presented as shipped work.

## Surfaces

- **Home:** identity, positioning, selected proof, career arc, recent thinking, and conversation.
- **Work index:** all public case studies and experiments with filtering that remains link-based and crawlable.
- **Work detail:** long-form case study with role, context, constraints, contribution, decisions, outcome, evidence, and related notes.
- **Notes index and detail:** first-person technical and product writing.
- **About:** concise career narrative, expertise, public credentials, and contact.
- **Lab:** optional experimental index. The current CRT terminal may survive here as a preserved `2600th v1` artifact, not as the new homepage.

## SEO and Semantics

The visual experience must be progressive enhancement over complete static HTML.

- One descriptive `h1` per page and logical heading order.
- Person-first titles and descriptions, not `2600th`-only branding.
- Canonical URLs, Open Graph metadata, social preview images, XML sitemap, RSS for notes, and robots policy.
- `Person` and `WebSite` JSON-LD globally; appropriate `CreativeWork`, `SoftwareApplication`, `Article`, and `BreadcrumbList` schemas per page.
- Public citations, dates, authorship, and first-hand project evidence support trust.
- No important text exists only inside canvas, SVG paths, CSS masks, video, or motion state.

## Accessibility

Target WCAG 2.2 AA.

- Semantic landmarks, skip link, keyboard-complete controls, and visible focus.
- Minimum 44-by-44 CSS-pixel touch targets for primary interactive controls.
- Sufficient contrast in both exposure modes.
- Captions or transcripts for meaningful video and audio.
- No information conveyed by color, sound, hover, or motion alone.
- The site remains navigable and persuasive with JavaScript disabled.

## Performance

- Static HTML is the baseline; hydrate only interactive islands.
- Keep first-view JavaScript below 90 kB compressed where practical.
- Keep first-view media below 1.2 MB on mobile and 2 MB on desktop.
- Lazy-load below-fold media and expensive interaction code.
- Use responsive images, modern formats, explicit dimensions, and local fonts with subsets.
- Protect p75 Core Web Vitals: LCP below 2.5 s, INP below 200 ms, CLS below 0.1.
- WebGL is optional, lazy, and never required for the approved direction.

## Explicit Anti-Goals

- No green CRT or terminal homepage.
- No bento portfolio grid, generic SaaS cards, skill-meter bars, or logo wall.
- No invented metrics, clients, outcomes, testimonials, or technical claims.
- No purple-blue AI glow, decorative blobs, stacked glass panels, or floating 3D chrome.
- No autoplay audio, scroll-jacking, cursor replacement, or pointer-only navigation.
- No hidden contact route or art experience that must be completed before proof is available.

# Velvet Reveal Portfolio Redesign Specification

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

## Outcome

Rebuild the 2600th portfolio as a premium, cinematic Operator–Advisor experience. The approved `54-velvet-reveal-2600th.webp` concept is the first-viewport art-direction authority; the finished site must remain clearer, faster, more accessible, and more evidence-led than a literal image reproduction.

## Experience principles

- Pranshul Chandhok is the human identity; 2600th is a clearly disclosed generated alter ego used as identity art, never as career evidence.
- The homepage opens with one authored reveal: velvet darkness, a restrained field of gold particles, electric-blue seam traces, and the 2600th character resolving beside the line “Make the uncertain operable.”
- The landing page is sparse. It establishes mood, positioning, three operating domains, and a direct route into selected work without front-loading a résumé.
- Project pages remain factual and evidence-first. Authentic screenshots, demos, clips, sources, dates, and uncertainty labels outrank generated imagery.
- Every surface belongs to the same world: black velvet, warm white type, cobalt system light, solar-gold evidence markers, thin technical rules, generous space, and editorial rather than dashboard composition.
- Motion communicates state and sequence. It does not scatter generic entrance animations across the page.

## Information architecture

### Global navigation

- Brand: `2600TH / PRANSHUL CHANDHOK`
- Primary: Work, About, Notes, Talk
- Lab remains accessible from contextual links and the footer.
- The header is compact, keyboard accessible, and usable at 320px without horizontal overflow.

### Homepage

1. Cinematic hero
   - H1: `Make the uncertain operable.`
   - Supporting line: `AI products, spatial systems, and difficult 0→1 work.`
   - Positioning: Operator–Advisor, integrated into the identity copy rather than a generic section kicker.
   - CTA: `Enter the work` → `#selected-work`.
   - Three domain traces: AI products, immersive systems, real-time 3D.
   - Visible generated-media disclosure.
2. Selected operating cases
   - Three large evidence planes: Blocks / designesto.ai, IRA VR, and enterprise immersive systems.
   - Authentic media only; video remains user-controlled and poster-first.
3. What I help make operable
   - Three concise problem statements, not a service-card grid.
4. Proof ledger
   - A compact set of defensible outcomes and links with source-aware language.
5. Current build
   - designesto.ai described as launching in 2026.
6. Contact close
   - One decisive invitation and direct email action.

### Interior surfaces

- Work: editorial project index with clear evidence strength and domain cues.
- Case studies: dark reading surface, authentic media, decision/outcome/evidence structure, sources and uncertainties preserved.
- About: an operating dossier, not a biography wall.
- Notes: warm-dark long-form reading experience.
- Lab: active-build ledger with honest status language.
- 404 and archive: visually consistent, functional, and low-friction.

## Motion and interaction contract

- The static HTML contains the complete hero message, image, CTA, and navigation before JavaScript runs.
- A first-session enhancement lasts at most 3.6 seconds, never locks scrolling, and can be skipped by button or Escape.
- Repeat views in the same session settle immediately.
- `prefers-reduced-motion: reduce` serves the final composition with no particle animation or reveal choreography.
- When the document is hidden, animation pauses. All observers, RAF loops, WebGL resources, and listeners are disposed when no longer needed.
- WebGL is optional. A CSS/static final-frame fallback is mandatory.
- Sound is not required for launch; the experience is silent by default.
- Project video behavior remains explicit, paused-first, poster-backed, and compatible with keyboard and reduced motion.

## Visual system

- Velvet: `#030405`
- Raised black: `#0a0c0f`
- Warm text: `#edeae2`
- Muted text: `#a8a7a1`
- Electric cobalt: `#315ef5`
- Solar gold: `#d6a248`
- Cobalt indicates system/interaction; gold indicates proof/evidence. Neither becomes a full-page decorative fill.
- Use the existing self-hosted Mona Sans family with purposeful width and weight changes.
- Large type remains fluid and contained; body measure stays readable; focus, selection, and scrollbar states are authored.
- No generic card grids, dense HUD chrome, terminal cosplay, neon cyberpunk clutter, superhero logos, weapons, masks, or copied franchise imagery.

## Generated identity asset

- Create a production-resolution three-quarter or full-body 2600th character cutout based on the supplied reference.
- Preserve the recognizable hair, beard, glasses, broad build, layered black technical coat, restrained blue accents, and calm intelligent expression.
- No text, brand logos, weapons, famous props, armor, or character-sheet layout.
- Store the exact generation prompt and source reference in provenance metadata and embed the prompt into the shipping raster.
- Label it on the page as a generated identity study and exclude it from evidence counts.

## Performance and accessibility budgets

- Static Astro output and semantic navigation work without JavaScript.
- Target initial hero imagery under 500 KB per responsive candidate and lazy-load below-fold media.
- Keep the cinematic runtime isolated to the homepage; no heavy runtime on article and index routes.
- Cap rendering DPR, adapt particle count on small/coarse-pointer devices, and avoid large 3D models.
- WCAG 2.2 AA contrast, visible focus, 44px touch targets where practical, correct headings, keyboard operation, and 320px containment are mandatory.
- No automatic audio or inaccessible canvas-only information.

## Acceptance criteria

- The approved composition is recognizable in the first viewport at 1440px and remains coherent at 946px, 390px, and 320px.
- With JavaScript disabled, the page still communicates identity, positioning, selected work, and contact route.
- Reduced-motion and repeat-session states skip the cinematic choreography.
- The old blue footer and positive/negative split no longer appear on any primary surface.
- All existing routes, canonical metadata, JSON-LD, sitemap/RSS behavior, archive access, evidence sources, and media provenance remain valid.
- Astro check, Vitest, Playwright, production build, and artifact verification pass on the finished tree.
- Final browser review covers home, work, a representative case study, notes, about, lab, and 404 on desktop and mobile.

## Adversarial-review refinement

The browser review identified a second-pass gap between the approved visual world and the implemented interior routes. This refinement closes that gap without weakening the evidence boundary.

### Work archive media

- Replace the empty 2012 and 2013 year tiles with optimized stills derived from the public launch trailer for The Brutal Spy and the public Alphaman gameplay demonstration. Add the public videos to their source records.
- Replace the empty Merkur Magie tile with official Google Play or publisher artwork and link the official store record.
- Replace the weak SpaceCraft archive frame with a legible still or short user-controlled loop derived from HomeLane's official public SpaceCraft video.
- Create one generated defense-systems editorial illustration only because the available diagram is visually weak. It must be labeled as generated editorial art, recorded in provenance, and kept outside evidence counts and factual proof areas.

### Character world

- Extend the supplied 2600th identity reference into one coherent character-and-equipment diorama and one modular equipment/inventory composition for the hero or About route.
- Generated character-world assets may include a headset, spatial controller, compact field case, sketchbook, sensors, and workstation objects. They must not include weapons, client logos, proprietary interfaces, or project claims.
- The hero gains a compact live operating signal: the three domains receive changing emphasis, the character and equipment gain restrained depth, and short supporting phrases may change visually while an equivalent complete semantic statement remains in static HTML.
- About gains a three-act operating atlas and character-world composition so its opening plane is intentionally occupied rather than merely decorated.

### Motion system

- Use GSAP as the single authored motion runtime. Do not install Anime.js alongside it.
- Load motion only on routes that declare motion targets. Preserve static complete layouts before the module loads.
- Use `gsap.matchMedia()` to exclude non-essential transforms under `prefers-reduced-motion: reduce` and to scope desktop-only depth behavior.
- ScrollTrigger may reveal media, advance the operating atlas, and coordinate short signal transitions. It may not hijack scrolling, pin long reading sections, replace native navigation, or delay interaction.
- Astro view transitions must dispose and recreate GSAP contexts without duplicate listeners or stale triggers.

### Copy and typography corrections

- Rewrite evidence-system language on the work opening into visitor-facing language that helps people find relevant work; internal publication mechanics remain in source notes, not promotional copy.
- Recompose the footer invitation as an explicit responsive lockup with safe line breaks, readable line-height, and no glyph collision from 320px through wide desktop.
- Audit other primary-route openings for inward-facing implementation language and change only copy whose factual meaning is preserved.

### Additional verification

- Review the footer and route openings specifically at 1186px in addition to the existing 1440px, 946px, 390px, and 320px widths.
- Test that the first three work records expose authentic media, generated media is disclosed, motion is absent under reduced-motion, static content survives JavaScript failure, and GSAP instances are cleaned up across navigation.

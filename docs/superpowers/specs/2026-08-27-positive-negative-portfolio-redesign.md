# Positive / Negative Portfolio Reconstruction

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

**Date:** 2026-08-27  
**Status:** Approved for implementation  
**Authority:** `.impeccable/mocks/clarity-round/32-positive-negative.png`  
**Positioning:** Operator–Advisor  
**Mode:** Experience with a Persuade outcome

## Goal

Reconstruct 2600th.com around the approved Positive / Negative composition rather than polishing the current layout. The first viewport must be memorable as one optical object: Pranshul Chandhok on the positive plane, 2600th on the negative plane, joined by a draggable exposure boundary. The remainder of the site must inherit that restraint, scale, and duality while making career evidence easier to inspect.

## Product truth

- Pranshul Chandhok is the human identity; 2600th is the experimental signature.
- Positioning remains Operator–Advisor, grounded in implementation.
- Existing verified claims, routes, provenance, and public/private evidence boundaries remain intact.
- designesto.ai remains explicitly **launching in 2026**.
- Generated imagery is identity material only and may never be presented as project or career evidence.
- The original console site remains a noindex archive.
- No deployment, merge, push, invented metric, or unsupported claim is in scope.

## Visual contract

### Thesis

The site is a photographic exposure between accountable operator and public experiment. It refuses the conventional portfolio hero, résumé card grid, giant colored marketing footer, and decorative hacker interface.

### First viewport

- A true 50/50 warm-white and near-black field fills the viewport.
- The header is almost invisible: `PRANSHUL` at the positive edge; `WORK / LAB / NOTES / CONTACT / 2600TH` on the negative plane.
- `PRANSHUL CHANDHOK` is one monumental image-filled typographic object crossing the exposure boundary.
- The exposure boundary is a cobalt 1px line with one circular eclipse handle and a short `DRAG THE LIGHT` instruction.
- Positioning and a single outlined `EXPLORE THE WORK` action sit in the lower positive quadrant.
- The composition remains understandable without JavaScript and at 320px.

### Palette and typography

- Warm optical white `#f1f0ea`, optical black `#080908`, and white foreground.
- Cobalt `#2457ff` is limited to the exposure boundary, focus, active state, and compact evidence signals. It must not fill the footer, contact close, or evidence regions.
- Mona Sans remains the self-hosted family. Width, stretch, and weight create hierarchy; monospace is reserved for real data and state.
- No gradients, glass, rounded card system, generic cyberpunk decoration, or decorative grid wallpaper.

### Homepage sequence

1. **Exposure hero:** faithful reconstruction of the approved comp.
2. **Three work chapters:** Blocks/designesto.ai, IRA VR, and enterprise immersive systems. Each chapter owns one full editorial field with authentic media, a concise operating thesis, role/state, and a direct case link. Kinema moves to the public-build ledger.
3. **Proof index:** a compact chronological line for Greykernel, defense systems, HomeLane, robotics patent, awards, and public work; no giant cobalt panel.
4. **Public-build ledger:** Kinema, Web Ocean 3D, Safed Sagar, GitHub, and the console archive as a black/white source-visible index.
5. **Notes:** three current observations with generous reading rhythm.
6. **Conversation close and footer:** one split positive/negative closing plane. No full-blue background. Contact is visually dominant but calm; footer navigation and provenance are integrated into the same close.

### Interior routes

- Work, Lab, Notes, and About use route-specific split typographic openings rather than generated editorial aperture images.
- Work archive remains 17 items with functional domain filters, but becomes a disciplined index rather than a résumé list or card grid.
- Case pages keep all evidence and media, while reorganizing long copy into: thesis, contribution, system, evidence, and sources. Cobalt is restricted to rules, focus, and small evidence markers.
- Notes prioritize reading; About becomes a concise operating dossier; Lab becomes a source/build ledger.
- The 404 page inherits the split visual system.

### Media and motion

- Use authentic images and existing optimized poster/video derivatives.
- The hero may use an editorial identity image inside the name, visibly treated as identity material.
- One authored motion system: exposure shifts, polarity inverts, and media reveals through a restrained clip transition. No scattered entrance effects.
- Videos remain user-controlled, poster-first, muted, and paused out of view; reduced-motion disables automatic movement.

### Footer and archive corrections

- Remove the cobalt conversation/footer block.
- Ensure primary button text remains visible in both themes.
- Use `/lab/terminal/index.html` for local and static archive access.
- Reposition the archive return action in mobile flow so it never obscures content.

## Accessibility and resilience

- WCAG 2.2 AA contrast in both polarities.
- One H1 per route; semantic landmarks and crawlable content.
- Keyboard-operable exposure, theme, filters, media controls, and links.
- Visible focus and 44px primary touch targets.
- No horizontal overflow at 320px, 390px, 946px, or 1440px.
- No-JavaScript identity, work, and contact paths remain available.

## Performance

- Astro static output and GitHub Pages compatibility remain unchanged.
- No frontend framework or heavy animation runtime.
- Reuse optimized WebP/MP4 media and poster fallbacks.
- Keep font, media, and initial-page budgets at or below the current production build unless a measured visual improvement justifies a documented exception.

## Acceptance criteria

- The desktop hero reproduces the reference composition at its own aspect and saves `.impeccable/review/hero-repro.png`.
- Homepage and all interior surfaces use one coherent Positive / Negative world.
- No giant cobalt footer, contact field, or evidence block remains.
- All 17 work routes, six note routes, About, Lab, 404, RSS, sitemap, robots, manifest, and console archive build.
- The About CTA, local archive path, and mobile archive overlay defects are resolved.
- All Work filters return their correct subsets.
- Desktop, user viewport, 390px mobile, and 320px containment are visually verified.
- Astro check, Vitest, Playwright, production build, artifact verification, and the Impeccable detector pass.

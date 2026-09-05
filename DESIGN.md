---
name: Pranshul Chandhok / 2600th
description: Velvet Reveal, a dark editorial portfolio for product and technology work.
colors:
  velvet: "#030405"
  velvet-raised: "#0a0c0f"
  velvet-soft: "#111419"
  warm: "#edeae2"
  muted: "#a8a7a1"
  dim: "#898b85"
  cobalt: "#315ef5"
  cobalt-bright: "#6f8dff"
  signal-blue-dark: "#244bd1"
  gold: "#d6a248"
  line: "rgb(237 234 226 / 0.16)"
  line-strong: "rgb(237 234 226 / 0.32)"
typography:
  display:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(3.1rem, 7vw, 6rem)"
    fontWeight: 730
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)"
    fontWeight: 730
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(1.55rem, 2.8vw, 2.7rem)"
    fontWeight: 730
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(1rem, 0.32vw + 0.93rem, 1.16rem)"
    fontWeight: 400
    lineHeight: 1.58
  navigation:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 680
    letterSpacing: "0.1em"
rounded:
  square: "0"
  circle: "50%"
spacing:
  page-gutter: "clamp(1rem, 3.2vw, 3.75rem)"
  action: "0.7rem 1rem"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#fff"
    rounded: "{rounded.square}"
    padding: "{spacing.action}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.warm}"
    rounded: "{rounded.square}"
    padding: "{spacing.action}"
  back-to-top:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.warm}"
    rounded: "{rounded.square}"
    width: "3rem"
    height: "3rem"
  back-to-top-hover:
    textColor: "{colors.gold}"
---

# Design system: Velvet Reveal

## Overview

**Creative North Star: "Velvet Reveal"**

A continuous velvet-black environment, warm editorial type, cobalt traces, and small gold accents frame the work. The opening character and short reveal establish the identity; project descriptions, images, and original recordings do the explaining.

This is a personal portfolio, not a dashboard or a service-sales page. Reading and navigation remain available before animation starts. Motion adds atmosphere without becoming a gate.

**Key Characteristics:**

- A continuous dark surface from header through footer.
- Large readable headings, restrained labels, and generous image fields.
- Square controls, thin rules, and a few circular character markers.
- Optional motion over complete static content.
- Scroll entrances must not hide text or links from the accessibility tree or keyboard navigation; use movement rather than visibility-based reveals for reading content.
- Project-specific imagery and plain-language captions.

This document describes the current implementation. [Global styles](src/styles/global.css) and the active components are the implementation reference; keep these tokens synchronized when implementation changes. Older [specs and plans](docs/superpowers/) retain historical decisions, not current instructions.

## Colors

### Primary

Cobalt is the cool system accent. Cobalt bright supports focus and small interactive details; signal blue dark is a stronger state color. Keep these as accents rather than large page fills.

### Secondary

Solar gold marks active underlines, small highlights, and hover feedback. It supplies warmth without becoming a second surface theme.

### Neutral

Velvet, raised velvet, and soft velvet provide quiet tonal separation. Warm is the main text color; muted supports paragraphs and dim supports low-emphasis metadata. Hairlines use the two line tokens. Project imagery keeps its own colors.

## Typography

Mona Sans is locally hosted with variable weight and width. Shared headings use a more open width and -0.02em tracking; the signature hero retains its 84% width. Display sizes stop at 6rem. Do not apply the condensed signature setting indiscriminately to every section.

Shared headings have a short measure (up to 22ch), balanced wrapping, and enough line height to keep letters separate. Body text stays left-aligned, with a reading measure up to 68ch. Do not fully justify paragraphs or use negative spacing to force text into a narrow column. Monospace is limited to short dates, indices, and utility labels.

## Layout

The responsive gutter frames a maximum content width of 110rem. Wide pages use image and reading planes rather than a wall of equal cards. Long-form content uses a narrower measure.

The homepage places copy and character in one stage. Interior openings stack as space tightens; image crops, metadata, and captions must remain inside their own layout cells. Homepage details live in the [surface brief](docs/design/velvet-reveal.md), tracked with the project rather than local-only tool state.

The implementation has component-specific breakpoints. Interior layouts commonly change at 64rem; the shared header becomes two rows at 46rem. Work filters become a labeled native select in the compact layout. Verify desktop, intermediate widths, 390px, and 320px; include full-screen widths when changing hero geometry.

## Elevation & Depth

Depth comes primarily from tonal planes, photography, illustrations, and faint line work. Most interface containers stay flat. The shared plane shadow is reserved for elements that need separation, not every section. Hero orbital arcs and particles remain a low-contrast background after the opening reveal; they must not cover reading text or disappear because the viewport changes. On mobile, measure the portrait bounds to place the orbit behind the character.

## Shapes

Actions and reading planes are square, with thin borders or underlines. Circular shapes belong to the character hotspots and large background arcs. Do not introduce a rounded-card system or ornamental pills. Interactive hit areas should reach 44px where practical; the floating up arrow is 48px square.

## Components

### Navigation and actions

Primary navigation is Home, Work, Notes, Lab, and About. Gold underlines indicate the active page and hover state. Social links and the preserved console remain footer destinations. The hero has exactly two actions, selected work and technical notes. Buttons use primary cobalt or a transparent secondary treatment, a subtle hover lift, and a visible cobalt-bright focus ring.

### Favicon

The approved 26 ligature pairs warm numerals sharing a diagonal with a cobalt slash on a square velvet field. It is a static identity mark, optically enlarged for browser tabs, with no font or external asset dependencies. `public/favicon.svg` is canonical; the existing icon builder derives the 32px ICO and 180px Apple icon. Keep the historical console's independent icon unchanged.

### Hero and hotspots

The intro replays on full refresh when ambient motion is enabled; no Skip Intro control is rendered. Escape settles the reveal. Persistent orbital geometry carries a restrained moving gold detail. Orbits and particles pause offscreen or when the document is hidden and resume on return. The Motion control remembers an explicit preference between pages. Reduced-motion and coarse-pointer devices receive a settled static canvas, not a missing composition. Preference changes apply immediately.

Fine-pointer navigation and artwork have a soft cobalt cursor halo that warms to gold over actions. It never replaces the native cursor, captures pointer events, or lights long-form prose. Its position updates only after pointer movement, not in a continuous render loop. Touch, reduced motion and Motion off suppress it. The approved halo and bounded hero gradients are deliberate exceptions to generic decoration warnings, not a reason to introduce glowing cards across the site.

Numbered character markers remain visible. Labels appear on hover or keyboard focus and can be pinned by click/tap. Anchor markers to the character, keep the first marker away from the face, and constrain labels at every supported width. Preserve the small 2600 line ornament. Current positioning is product and technology leader / builder.

### Project media and filters

Five selected-work cards use a dedicated media wrapper so play controls stay on the image when the layout stacks. Blocks and Craft use stills. Designesto, SpaceCraft Pro and Enterprise XR have original project recordings. Playback is explicit, silent, and backed by a poster. Approved editorial stills remain distinct from product evidence. The archive action reserves clearance from the floating up arrow, and role copy stays at least 13px.

Work filtering exposes links on larger screens and a labeled select on compact screens. Archive and domain lists prioritise selected current systems, then historical work. The archive has 19 visible records and an optional chronological sort. The useful old combined route stays outside primary lists. Case-study figures need a useful project or scene caption. Images already attached directly to a named card or introduction do not need redundant captions. Responsive WebP/AVIF derivatives keep consistent aspect ratios within each section.

### Route openings and reading sections

Work, About, Notes, domain pages, and project pages share dark editorial planes. Image and text occupy separate space; metadata must not collapse into tiny parallel columns. About's portrait should retain headroom. Case-study copy explains the project, contribution, decisions, and result; internal provenance terminology is not a visitor-facing section scheme.

Work opens with a compact introduction and filters, followed directly by the image-led gallery. The selected layout features Blocks with Designesto and IRA VR; other projects continue in two columns, or one on mobile. Filtered and chronological views use uniform cards. Project openings group the title, summary, metadata and image without fixed-height empty planes. Long Notes and projects provide native section navigation derived from actual headings. Tables retain native headers inside labelled, keyboard-scrollable regions rather than compressing paragraphs into narrow columns. Editorial images are captioned as editorial; technical examples use original captures where available. Conceptual worked examples must say so and never imply unpublished product behavior or results.

### Contact and footer

The invitation is “Let’s compare notes.” Render it once in the shared footer, not again at the end of Home or About. Every primary page owns a native `#contact` destination and direct email link. Keep the conversational paragraph compatible with current employment, without soliciting competing consulting work. The footer continues the dark surface, contains the email and secondary links, and reserves clearance for the up arrow. Footer navigation links have at least 44px of width and height and wrap rather than crowding their neighbors.

### Back to top

The shared layout supplies a fixed bottom-right up arrow on primary pages. It appears after 300px of scrolling, not only in the footer. It uses a native `#page-top` link, safe-area offsets, warm default color, gold hover, and the shared focus ring. Without JavaScript it stays available; reduced motion uses immediate scrolling; print hides it. The historical console keeps its own interface.

## Do's and Don'ts

### Do

- Do preserve complete semantic content, direct links, and static posters without JavaScript.
- Do verify keyboard interaction, reduced motion, readable contrast, and 320px containment.
- Do preserve original media and record generated derivatives in internal provenance.
- Do use first-person, factual copy and specific image captions.
- Do keep the design documentation synchronized with the active components.

### Don't

- Don't revive the retired theme switch, optical split hero, or interactive Career Atlas.
- Don't add overlapping display letters, scroll-jacking, autoplay audio, or navigation delays.
- Don't use generic gradients, decorative terminal logs, or an unrelated blue footer.
- Don't present generated imagery as an authentic product screenshot or invent project claims.
- Don't add internal labels such as “not project evidence” to visitor-facing images.

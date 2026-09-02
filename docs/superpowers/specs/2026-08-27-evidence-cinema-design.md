# Evidence Cinema Design Specification

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

**Status:** Approved for implementation

**Date:** 2026-08-27

**Extends:** `docs/superpowers/specs/2026-08-26-portfolio-career-atlas-design.md`

## 1. Decision

The portfolio will adopt an **Evidence Cinema** layer: short, silent, source-grounded motion excerpts will make shipped systems legible without turning the site into an autoplay showreel. Motion is proof first, atmosphere second.

The existing Living Wordmark, editorial light/dark identity, Three Distances case-study structure, Career Atlas, static Astro architecture, and GitHub Pages deployment model remain intact.

## 2. Experience Spine

### Living Wordmark

Selected letter apertures may contain restrained motion from first-party or reviewed sources. Only a few letters move at once; the identity must remain readable, fast, and useful when motion is disabled.

### Proof in Motion

The current four-tile section becomes a six-tile asymmetric evidence field:

1. designesto.ai product editing
2. IRA VR / Newton experiential learning
3. GreyKernel founding-era showreel
4. Machine Hunter embodied VR interaction
5. Browser-native systems, led by Web Ocean 3D or Kinema
6. Safed Sagar or another current first-party simulation

The authored defense systems map remains static because its value is legibility and system context, not spectacle.

### Case studies

Media must progress rather than repeat. A full case uses different media for:

- `OUT`: the product or result;
- `NEAR`: the interaction or user experience;
- `INSIDE`: the system boundary, editor, workflow, or decision evidence.

IRA VR receives the deepest correction: Newton/Dalton micro-motion, classroom or Solar System footage, and a panoramic client/system view replace the same poster repeated across every distance.

Machine Hunter and MysticMojo surface their existing video excerpts on detail pages. Kinema, Web Ocean 3D, and Safed Sagar use locally recorded first-party clips. GreyKernel uses one short reviewed showreel excerpt. JPMC and other enterprise work use motion only when an excerpt is directly identifiable and publication-safe.

### Career Atlas

Atlas nodes use motion selectively. Media-backed records may play only after selection or viewport entry. Typographic evidence notes remain typographic unless an editorial illustration materially improves comprehension.

### Recognition and coverage

A compact recognition ledger will distinguish:

- verified institutional recognition;
- editorial coverage;
- executive or launch acknowledgement;
- unverified award leads that remain unpublished.

Generic paid-award, speaking, and headline solicitations are excluded.

## 3. Media Hierarchy

Use sources in this order:

1. first-party product capture or repository-owned media;
2. reviewed Drive or mail-linked source footage with attributable context;
3. public launch media linked to its publisher;
4. authored diagrams or code-native animation;
5. clearly labeled editorial illustration generated for records with no defensible authentic media.

Generated media must never resemble documentary proof. Captions and alt text must use terms such as “editorial illustration” or “authored reconstruction” where applicable.

## 4. Candidate Source Set

### Approved for inspection and excerpting

- IRA VR `Newton_23sec.mp4` mail-linked source.
- The two small MP4 files inside the Drive `GIF` folder, with Dalton/Newton labels assigned only after visual confirmation.
- IRA VR experiential-classroom, Solar System, VRLab, and VR recordings.
- GreyKernel Promo and GK_Demoreel.
- Existing Machine Hunter and Oye Tippa Run reviewed excerpts.
- First-party live Kinema, Web Ocean 3D, and Safed Sagar experiences.
- Existing designesto.ai capture and product imagery.

### Link rather than rehost by default

- Blocks / Interior Company launch media on LinkedIn.
- InCo AI launch and executive recognition posts.
- Third-party editorial features and publication images.

### Restricted to corroboration unless a safe public excerpt is identified

- JPMC archive packages and private application links.
- Anglian Water workshop assets.
- private client praise and internal launch threads.
- defense, industrial, medical, or participant-bearing footage.

## 5. Motion System

- Visual loops are delivered as MP4/H.264 and WebM when beneficial, even when the source is called a GIF.
- Normal loops are 4–8 seconds, muted, `playsinline`, and poster-backed.
- Target delivery is 1280×720 or smaller and normally under 1.5 MB per format.
- Videos load near the viewport and pause when offscreen or when the tab is hidden.
- The existing Motion control governs all ambient playback.
- `prefers-reduced-motion` receives still imagery and direct state changes.
- No autoplay audio, scroll hijacking, persistent WebGL background, or cursor replacement.
- Meaningful spoken footage is not autoplayed; it receives an explicit control and adjacent summary.

## 6. Editorial Illustrations

Where authentic public media remains unavailable, create one coherent illustration family for:

- The Brutal Spy
- Alphaman
- Merkur Magie
- GreyKernel company-building
- Enterprise immersive systems
- HomeLane SpaceCraft Pro
- Humanoid Robot Control System
- AI-native game development thesis

The family uses the current mineral/cobalt/black palette, strong graphic silhouettes, systems annotations, and era-specific visual cues. It avoids generic neon-AI imagery and fabricated UI.

## 7. Content Corrections

- `designesto.ai` is described as launching in 2026, not as already launched.
- Historical InCo AI/Blocks material is distinguished from the upcoming designesto.ai product.
- Nazara’s public Chhota Bheem Jungle Rescue launch may be cited; private client praise is not quoted without permission.
- JPMC is supported by a private artifact trail but receives no invented launch or outcome claim.
- GreyKernel’s DIPP recognition and strong editorial coverage may appear with direct sources.
- Secondary award listings are published only after primary confirmation.

## 8. Metadata and Discovery

- Replace the terminal-era favicon with a 2600th/Pranshul identity set: SVG favicon, ICO fallback, Apple touch icon, and web manifest.
- Add `og:image:alt`, image dimensions, and Twitter creator metadata.
- Add complete visible-source-aligned Article and CreativeWork JSON-LD fields.
- Give each work page a semantically relevant social image rather than a generic or unrelated fallback.
- Preserve original canonicals for excerpts; materially rewritten local notes may self-canonicalize.
- Extend production verification to require the manifest, icon assets, social metadata, and safe media provenance.

## 9. Cleanup

After confirming build parity, remove:

- obsolete root legacy duplicates (`404.html`, `index.html`, `style.css`, `script.js`, `pingpong.js`, `my_font.ttf`, root `favicon.ico`, and root `ico/`);
- unused terminal icon copies and `Thumbs.db` files that have no references;
- `scripts/optimize-media.mjs`;
- unreferenced `designesto-before.webp`;
- obsolete defense abstract poster recipes and derivatives after replacing the recipe with the authored system map.

The archived console at `/lab/terminal/` must remain functional and `noindex`.

## 10. Acceptance Criteria

The release is complete only when:

- the homepage contains six visually distinct evidence tiles with no blank or misleading frame;
- IRA VR, Machine Hunter, and MysticMojo detail pages use motion rather than repeating one poster;
- current first-party browser projects show authentic movement;
- generated imagery is visibly editorial and correctly labeled;
- designesto.ai is framed as launching in 2026;
- recognition and coverage claims have direct evidence;
- favicon, manifest, canonical, Open Graph, Twitter, and JSON-LD outputs validate;
- media budgets, reduced motion, keyboard use, no-JavaScript content, and mobile layouts pass tests;
- the legacy console still works;
- README and deployment/media documentation match the actual repository;
- an adversarial content/design review and a fresh browser verification find no critical issues.


# Hero and layout directions

Local review prototypes, not production routes. Start with:

```sh
node design-previews/hero-directions/server.mjs
```

Open `http://127.0.0.1:4324/` for three animated directions with shared copy, typography and portrait:

- A: Architectural floor — planar grid, coherent perspective and slow forward travel.
- B: Contour field — softly moving elevation lines.
- C: Orbital stage — elliptical ground plane and a restrained meridian arc.

The controls switch direction, mobile framing, motion and line strength. Reduced motion stays static. Hero geometry is code-native canvas; the character is the existing approved asset. No hero direction is committed to the main site by these previews.

Orbital C is now the user-selected default in the comparison and standalone previews. Its mobile orbit follows the portrait bounds; canvas geometry checks pass at 320, 390, 430 and 700px, with visual confirmation at 390px. This selection remains local to the preview.

Mobile previews share a compact headline/portrait composition, with the complete introduction and actions below. Background geometry stays within the visual area, and the comparison frame follows the hero height instead of introducing nested scrolling. Browser checks at 320px and 390px confirmed no horizontal overflow; the hero measured approximately 687px and 661px respectively. The first hotspot sits below the headline on narrow screens. Preview settings collapse on phones; the standalone hero link allows review without the comparison controls.

`/layouts.html` shows an image-led Work gallery and the existing focused project-reading example. Both use real site copy with clearly labelled excerpts. The gallery follows [gallery-direction.md](gallery-direction.md): Blocks leads beside stacked Designesto and IRA VR, then Enterprise XR, PropVR AI → Craft, SpaceCraft Pro and MysticMojo + Nazara continue in a two-column grid. Mobile uses one column. These seven excerpts are a preview selection, not the complete archive.

The gallery retains Velvet Reveal's dark surface, warm type, square image fields, thin rules, cobalt focus and gold links. Domain controls filter the actual projects; the tested Applied AI and Games selections return two and one projects respectively. All images reuse existing site assets and their established provenance; this gallery adds no new media.

Finish-review verdict: **ship for first-viewport local design confirmation only**, supported by [desktop](../../.impeccable/review/gallery-preview/desktop.png) and [mobile](../../.impeccable/review/gallery-preview/mobile.png) captures. This is not production integration, deployment approval, or a complete accessibility and performance audit. The gallery composition is documented here because it has not been adopted as production design; root `DESIGN.md`, `PRODUCT.md` and `.impeccable/design.json` continue to describe the existing site and are unchanged by this preview.

The server binds only to loopback and serves this preview's HTML and the site's public media. These files sit outside Astro's public and source route trees, so the production build does not publish them.

## Blocks image

The new image is an editorial illustration, not a Blocks interface or customer project. Its full kitchen and one exploded cabinet assembly replace the earlier three competing compositions. The original v1 remains preserved. The v2 is wired into the homepage card, Blocks route, social image and regenerated Work opening thumbnails. Internal provenance records the generation receipt.

- Built-in image generation used; receipt: `exec-827f03a5-b295-4bea-bf7f-2571b59e7dd1`.
- Source preserved locally in `_media-source/blocks-design-production-v2.png` (not published).
- Delivery: `public/media/generated/editorial/blocks-design-production-v2.webp` and `.avif`, 1600 × 900, plus responsive candidates.
- Exact generation prompt: [blocks-image-prompt.md](blocks-image-prompt.md).

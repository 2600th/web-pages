# 3D redesign directions

Review prototypes for reimagining 2600th.com around the 3D character scan. They are not production routes. They live outside Astro's `src/` and `public/` trees, have their own `package.json`, and never ship with the site build.

```sh
cd design-previews/3d-directions
npm install
npm run dev        # http://127.0.0.1:4330/
```

Open the hub at `/` for the comparison, or go straight to `/signal/`, `/scan/` or `/glyph/`. Every page uses real site copy, the five featured projects and four recent notes, and links out to the live routes.

## Directions

| | Concept | 3D technique | Signature interaction |
|---|---|---|---|
| **01 Signal** | The 2600 Hz phone-phreaking tone | 70k–170k surface samples in a custom point shader, weighted toward the face | Native range tuner detunes and relocks the portrait. Opt-in 2600 Hz tone. Scrolling morphs the figure into an oscilloscope trace. |
| **02 Scan** (recommended) | Inspection bay | PBR mesh with a patched shader: contour rings and Bayer-dithered ghost fill above a laser plane, full texture below | Cursor steers the scan. HUD callouts are anchored to snapped surface points. Scroll-driven camera shots map glasses, harness and boots to Applied AI, Immersive systems and Real-time 3D. |
| **03 Glyph** | The builder rendered in code, on paper | Cell-resolution clay pass feeding a shape-aware ASCII shader (luminance ramp plus Sobel edge glyphs, cobalt for blue source pixels). Full render only inside the lens. | Masthead-behind-subject hero, cursor lens with a chromatic rim, 1-bit Bayer-dithered imagery that reveals colour on hover. |

The Signal story assumes the handle refers to 2600 Hz. The page flags this as draft copy until it is confirmed.

## Shared floor

- All content is semantic HTML. The canvas is decorative (`aria-hidden`) and every page reads completely without it.
- `prefers-reduced-motion` and the persisted **Motion** toggle stop time-based animation. The scene still renders once, and pointer-driven effects still respond.
- Without WebGL2, each direction shows the existing character poster (`html.no-webgl`).
- Render loops pause off-screen and in hidden tabs. DPR is capped at 1.5–1.75.
- Phones, coarse pointers and devices reporting ≤4 GB memory load the 60k-triangle model.
- Audio (Signal) never plays until the visitor turns it on.

## Model pipeline

`npm run model:build` reads the source master from the repo's gitignored `_media-source/2600th-character-source.glb` and writes two derivatives to `src/assets/models/`.

| Variant | Triangles | Textures | Size |
|---|---|---|---|
| Source (not committed) | 2,000,000 | 8192² JPEG base colour + 8192² metal/rough | 12.6 MB |
| `2600th-hi.glb` | 199,994 | 2048² / 1024² WebP | 1.87 MB |
| `2600th-lo.glb` | 59,996 | 1024² / 512² WebP | 0.63 MB |

Steps: dequantize, weld, meshoptimizer simplify, add position-welded smooth normals (the source had none), WebP resize, quantize, meshopt compress. The loader expands the quantized attributes to float before baking the node transform. Without that, positions overflow and the head wraps below the feet.

Before production:

- Encode textures as KTX2 (ETC1S base colour, UASTC ORM). This needs `toktx`, which isn't installed here. It cuts GPU memory another 4–8×.
- Consider a baked normal map for the 60k variant.
- Lazy-load Three.js (162 KB gzip) after first paint.

## Verification

```sh
npm run build && npm run preview &   # http://127.0.0.1:4331/
npm run verify                        # console errors, overflow at 1440/390/320, reduced motion, no-WebGL fallback, axe WCAG A/AA
npm run shoot -- http://127.0.0.1:4331/scan/index.html out.png 1440 900 12000
```

`verify` passed on 29 Sep 2026 in headless Chromium with SwiftShader: no console errors, no overflow at any width, and zero axe violations on all four pages. Software rendering can't measure real-device frame rate. Check that on a mid-range phone before choosing.

## Provenance

The character model was supplied by the site owner for this redesign. Project images are resized copies of existing site media (see `src/data/media-provenance.ts` in the site). Editorial illustrations keep their existing editorial status. Fonts are self-hosted under the SIL Open Font License: Mona Sans, Anybody, Martian Mono, Doto and JetBrains Mono.

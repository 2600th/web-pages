---
title: Web Ocean 3D
slug: web-ocean-3d
summary: A real-time spectral ocean and tropical island rendered in the browser with WebGPU, physically motivated water optics, responsive weather, buoyancy, wakes, and a measured fallback path.
yearStart: 2026
status: Active open-source experiment
role: Creator and graphics engineer
disciplines:
  - Real-time graphics
  - WebGPU and TSL
  - Simulation
  - Performance engineering
visibility: public
featuredOrder: 3
recordType: case
era: operator
domains: [simulation]
careerOrder: 170
relationships: [kinema, safed-sagar]
evidenceStatus: public-approved
publicClaims:
  - The public repository and live build support the visible rendering, interaction, and compatibility description.
engagementPath: product-collaboration
heroMedia: &hero
  src: /media/work/web-ocean-3d/hero.webp
  alt: Web Ocean 3D boat moving across a spectral ocean toward a tropical island
  width: 1600
  height: 900
out:
  thesis: Browser graphics become convincing when ocean motion, light, weather, optics, physics, and performance are designed as one system rather than stacked as isolated effects.
  audience: Graphics developers, technical artists, and product teams exploring high-fidelity browser experiences.
  outcome: A public real-time ocean environment with nine coordinated presets, boat and camera modes, underwater transitions, reproducible visual captures, and a WebGL2 fallback.
  media: *hero
near:
  experience: Visitors can orbit, fly, pilot a boat, enter an authored cinematic tour, change weather and sea conditions, and cross the waterline into a complete underwater state.
  contribution: Built the rendering, simulation, asset, interaction, measurement, and reproducible capture systems as a coherent browser product.
  system: Three spectral cascades drive the ocean while depth, refraction, reflection, foam persistence, buoyancy, wake deposition, atmosphere, lens behavior, and quality tiers share a measured real-time pipeline.
  media:
    src: /media/work/web-ocean-3d/near.webp
    alt: Web Ocean 3D underwater view beneath the boat and illuminated water surface
    width: 1600
    height: 900
inside:
  decisions:
    - Regenerate the complete README gallery from the current renderer so visual evidence cannot silently drift from the code.
    - Maintain the WebGPU and WebGL2 paths from the same shader source to keep compatibility work observable.
    - Move raw source assets outside the public build and optimize only the models and textures that actually ship.
  constraints:
    - High-fidelity water and island scenes must remain interactive across widely different GPU and browser capabilities.
  evidence:
    - The repository documents algorithms, controls, asset licensing, capture automation, performance reasoning, and the live static deployment.
  media:
    src: /media/work/web-ocean-3d/inside.webp
    alt: Web Ocean 3D interface showing ocean controls, HUD, and buoyancy probes
    width: 1600
    height: 900
sources:
  - label: GitHub repository and technical README
    url: https://github.com/2600th/web-ocean-3d
    type: repository
  - label: Live browser build
    url: https://web-ocean-3d.vercel.app/
    type: live-demo
  - label: Authored reliability update
    url: https://x.com/2600th/status/2086351606124281887
    type: authored-post
seo:
  title: Web Ocean 3D — Real-time browser graphics by Pranshul Chandhok
  description: "Inside Web Ocean 3D: Pranshul Chandhok’s WebGPU spectral ocean, tropical island, boat physics, weather, underwater optics, measured fallbacks, and reproducible captures."
  socialImage: /media/work/web-ocean-3d/hero.webp
---

Web Ocean 3D treats the browser as a serious graphics target. Its sea state, weather, atmosphere, water optics, island, boat response, camera, and photographic treatment change together so each preset reads as a place rather than a filter.

The less visible work matters equally: a compatibility renderer, deterministic visual capture, license-aware asset tooling, and a build that stopped shipping hundreds of megabytes of unused source material.

---
title: Web Ocean 3D
slug: web-ocean-3d
summary: I built an interactive ocean in the browser, with changing weather, underwater views, and a boat that responds to the waves. The project also explores graphics performance across devices.
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
  src: /media/generated/editorial/enhanced/web-ocean-hero-v2.webp
  avif: /media/generated/editorial/enhanced/web-ocean-hero-v2.avif
  label: Editorial visual based on Web Ocean 3D, with a boat approaching the island.
  alt: Editorial illustration of a boat crossing the ocean toward a tropical island
  width: 1600
  height: 900
out:
  thesis: An ocean I could explore in the browser.
  audience: Graphics developers, technical artists, and product teams exploring high-fidelity browser experiences.
  outcome: An open-source ocean environment with nine presets, boat and camera modes, underwater views, and a WebGL2 fallback for browsers without WebGPU support.
  media:
    src: /media/work/web-ocean-3d/hero.webp
    label: Original browser capture from the Web Ocean 3D repository.
    alt: Web Ocean 3D browser scene with its ocean and island environment
    width: 1600
    height: 900
near:
  experience: Take a boat out, change the weather, or look beneath the surface.
  contribution: I built the rendering and simulation, along with the controls, asset tools, and performance checks. I also added repeatable captures to compare changes to the graphics.
  system: Three spectral wave layers drive the ocean. The renderer combines reflection and refraction with foam and underwater effects. The same wave simulation feeds the boat’s buoyancy and wake.
  media:
    src: /media/generated/editorial/enhanced/web-ocean-clip-v2.webp
    avif: /media/generated/editorial/enhanced/web-ocean-clip-v2.avif
    label: Waves moving around the island. Enhanced editorial poster; playback shows the original browser recording.
    mp4: /media/work/web-ocean-3d/clip.mp4
    alt: Live Web Ocean 3D browser capture showing spectral waves moving around the island environment
    width: 1600
    height: 900
inside:
  decisions:
    - Use repeatable visual captures to compare rendering changes under the same conditions.
    - Maintain WebGPU and WebGL2 paths from the same shader source to reduce differences between them.
    - Keep unused source assets out of the download and optimise the models and textures that the browser actually needs.
  constraints:
    - High-fidelity water and island scenes must remain interactive across widely different GPU and browser capabilities.
  evidence:
    - When people tried the ocean on their own devices, some managed to crash it. I went back to the loading and memory use, and the next build worked on more devices.
  media:
    src: /media/work/web-ocean-3d/inside.webp
    label: Original browser capture of ocean settings and the probes used to inspect boat buoyancy.
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

I’ve always enjoyed graphics work, and an ocean is a good way to get absorbed in it. The light, waves, and weather all affect how the scene feels. Then there is the boat: it needs to react to the same water the player is looking at.

Getting it to run on more devices became a substantial part of the project. I worked through the loading path, reduced memory use, and removed unused source assets from the public build. The repository includes the rendering code and capture tools if you want to see how it works.

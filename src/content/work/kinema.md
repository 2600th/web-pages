---
title: Kinema
slug: kinema
summary: A browser-native third-person gameplay lab that combines a playable runtime, WebGPU-first rendering, physics, and an in-browser level editor in one TypeScript codebase.
yearStart: 2026
status: Active open-source experiment
role: Creator and engineer
disciplines:
  - Browser game systems
  - WebGPU and Three.js
  - Product prototyping
  - Level-editing tools
visibility: public
featuredOrder: 4
recordType: case
era: operator
domains: [games]
careerOrder: 180
relationships: [web-ocean-3d, safed-sagar]
evidenceStatus: public-approved
publicClaims:
  - The public repository and live build support the visible product and technical description.
engagementPath: product-collaboration
heroMedia: &hero
  src: /media/work/kinema/hero.webp
  alt: Kinema browser gameplay scene inside its procedural showcase corridor
  width: 1600
  height: 900
out:
  thesis: A serious gameplay prototyping environment can live entirely in the browser without separating the editor from the thing being played.
  audience: Developers exploring browser-native gameplay, rendering, and level workflows.
  outcome: A public MIT-licensed lab with a playable showcase, fourteen feature stations, and a level editor that can move directly into play-testing.
  media: *hero
near:
  experience: Players move through a procedural showcase, test movement and interactions, enter vehicles, and jump directly to feature stations. F1 opens the editor; a second shortcut starts play-testing.
  contribution: Designed and built the product surface, gameplay architecture, editor workflow, rendering paths, input systems, and test harness.
  system: TypeScript and Three.js coordinate Rapier physics, WebGPU-first rendering with WebGL compatibility, keyboard/gamepad/touch input, runtime systems, and a lazy-loaded browser editor.
  media:
    src: /media/work/kinema/editor.webp
    alt: Kinema in-browser level editor with scene tools and a live gameplay viewport
    width: 1600
    height: 900
inside:
  decisions:
    - Keep building and play-testing in one application so iteration does not cross a tooling boundary.
    - Treat WebGL and Safari behavior as a maintained compatibility path rather than an afterthought.
    - Organize the showcase as named feature stations so individual systems can be reviewed and debugged directly.
  constraints:
    - The same project must remain useful across desktop gameplay, mobile validation, and browser rendering differences.
  evidence:
    - The repository documents the architecture, controls, compatibility behavior, unit tests, Playwright coverage, and production build workflow.
  media:
    src: /media/work/kinema/inside.webp
    alt: Kinema target arena station demonstrating gameplay systems and visual effects
    width: 1600
    height: 900
sources:
  - label: GitHub repository and technical README
    url: https://github.com/2600th/Kinema
    type: repository
  - label: Live browser build
    url: https://kinema-play.vercel.app/
    type: live-demo
seo:
  title: Kinema — Browser-native gameplay lab by Pranshul Chandhok
  description: How Pranshul Chandhok built Kinema, a browser-native Three.js gameplay lab with WebGPU rendering, physics, compatibility paths, and an in-browser level editor.
  socialImage: /media/work/kinema/hero.webp
---

Kinema asks a practical question: how much of a modern gameplay-development loop can happen at a URL?

The answer is deliberately larger than a rendering demo. The repository joins a third-person controller, interactions, vehicles, hazards, collectibles, rendering profiles, input across device classes, and an editor with brushes, gizmos, hierarchy, inspector, undo/redo, import, and play-test mode.

The public repository is the evidence record. It includes an architectural map, compatibility notes, development entry points, verification commands, asset credits, and an MIT license.

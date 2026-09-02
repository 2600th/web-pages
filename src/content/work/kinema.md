---
title: Kinema
slug: kinema
summary: I’m building Kinema to explore game development in the browser, with third-person gameplay, physics, and a level editor in the same TypeScript application.
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
  src: /media/generated/editorial/enhanced/kinema-hero-v2.webp
  avif: /media/generated/editorial/enhanced/kinema-hero-v2.avif
  label: Kinema · The menu for playing levels and opening the editor.
  alt: Kinema browser gameplay scene inside its procedural showcase corridor
  width: 1600
  height: 900
out:
  thesis: Build a level and play it in the same browser tab.
  audience: Developers exploring browser-native gameplay, rendering, and level workflows.
  outcome: A public MIT-licensed lab with a playable showcase, fourteen feature stations, and a level editor that can move directly into play-testing.
  media: *hero
near:
  experience: Try the gameplay, then open the editor and change the level.
  contribution: I designed and built Kinema’s gameplay systems, browser editor, and rendering paths. I also work on input support and the tests used to check changes.
  system: TypeScript and Three.js coordinate Rapier physics, WebGPU-first rendering with WebGL compatibility, keyboard/gamepad/touch input, runtime systems, and a lazy-loaded browser editor.
  media:
    src: /media/generated/editorial/enhanced/kinema-editor-v2.webp
    avif: /media/generated/editorial/enhanced/kinema-editor-v2.avif
    label: Kinema · Editing a level while keeping the game in view.
    alt: Kinema in-browser level editor with scene tools and a live gameplay viewport
    width: 1600
    height: 900
inside:
  decisions:
    - Keep the editor and play-testing in the same application so changes can be tried immediately.
    - Maintain a WebGL compatibility path alongside WebGPU and test browser-specific behaviour, including Safari.
    - Give the showcase named feature stations so I can go straight to the system I’m testing.
  constraints:
    - The same project must remain useful across desktop gameplay, mobile validation, and browser rendering differences.
  evidence:
    - Kinema is an active experiment. The MIT-licensed repository includes setup instructions and tests for anyone who wants to work with it.
  media:
    src: /media/generated/editorial/enhanced/kinema-inside-v2.webp
    avif: /media/generated/editorial/enhanced/kinema-inside-v2.avif
    label: Kinema · A target arena for testing gameplay and visual effects.
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

I started Kinema to see how much of game development I could bring into the browser. I wanted to be able to build a level and play it without moving between separate applications.

The current showcase includes a third-person controller, vehicles, hazards, and collectibles. F1 opens the editor, where you can use brushes and transform tools, inspect objects, undo changes, and enter play-test mode. Fourteen feature stations provide quick ways to try individual systems.

I’m still working on it. The repository has an architecture overview, compatibility notes, and commands for running the checks locally if you want to explore or extend it.

---
title: Safed Sagar
slug: safed-sagar
summary: A browser-native fictional reconnaissance flight experience inspired in tone by Operation Safed Sagar, built as a compact experiment in authored atmosphere, flight systems, and AI-assisted production.
yearStart: 2026
status: Public browser experiment
role: Creator and engineer
disciplines:
  - Browser games
  - Real-time terrain and atmosphere
  - Product direction
  - AI-assisted engineering
visibility: public
featuredOrder: 3
recordType: case
era: operator
domains: [games, simulation]
careerOrder: 175
relationships: [kinema, web-ocean-3d]
evidenceStatus: public-approved
publicClaims:
  - The public repository and authored launch material support the visible product and technical description.
engagementPath: product-collaboration
heroMedia: &hero
  src: /media/work/safed-sagar/hero.webp
  alt: Safed Sagar MiG-21 flying through a snowy high-altitude mountain environment
  width: 1600
  height: 900
out:
  thesis: A compact browser experience can carry flight, atmosphere, mission structure, and historical respect without requiring an install or a conventional game-engine download.
  audience: Players and builders interested in authored real-time experiences delivered directly through the web.
  outcome: A public fictional reconnaissance sortie where the player navigates mountain terrain and photographs positions from a MiG-21-inspired aircraft.
  media: *hero
near:
  experience: The player flies through snowy terrain, reads flight instruments, searches broad sectors, frames reconnaissance photographs, and completes a seeded sortie with keyboard, gamepad, or touch controls.
  contribution: Directed and built the browser experience, flight and mission systems, terrain and atmosphere pipeline, adaptive quality behavior, interaction design, and verification tools.
  system: A Three.js application combines a flight model, assist modes, GPU effects, geometric terrain, volumetric atmosphere, mission scoring, adaptive resolution, and a testable development harness.
  media:
    src: /media/work/safed-sagar/near.webp
    alt: Safed Sagar reconnaissance optic framing a target in snowy mountain terrain
    width: 1600
    height: 900
inside:
  decisions:
    - Make objective positions discoverable through sectors and range bands instead of exposing exact bearings before visual acquisition.
    - Tie adaptive resolution and quality tiers to measured cost so lower-power devices retain the experience rather than a frozen visual target.
    - Keep remembrance separate from scoring and state clearly that the work is fictional and not affiliated with India’s armed forces.
  constraints:
    - The experience must communicate respectfully while using fictional callsigns, positions, events, and no official insignia.
  evidence:
    - The public repository documents the architecture, accessibility modes, performance target, test count, credits, changelog, and historical disclaimer.
  media:
    src: /media/work/safed-sagar/inside.webp
    alt: Safed Sagar cockpit interface with flight instruments over the mountain landscape
    width: 1600
    height: 900
sources:
  - label: GitHub repository and technical README
    url: https://github.com/2600th/oss-web-3d
    type: repository
  - label: Authored launch post and video
    url: https://x.com/2600th/status/2088580221041885561
    type: authored-post
seo:
  title: Safed Sagar — Browser flight experiment by Pranshul Chandhok
  description: How Pranshul Chandhok built Safed Sagar, a fictional browser reconnaissance flight experience with terrain, atmosphere, adaptive performance, accessibility, and tested systems.
  socialImage: /media/work/safed-sagar/hero.webp
---

Safed Sagar began with a tight creative constraint: open a browser and fly a reconnaissance mission through a high-altitude landscape. The build treats controls, mission legibility, terrain light, performance, and sound as one authored experience.

The project is explicitly a work of fiction. It is not affiliated with or endorsed by the Indian Air Force, Indian Army, Ministry of Defence, or any broadcaster. Its public documentation keeps remembrance separate from score.

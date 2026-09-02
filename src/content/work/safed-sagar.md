---
title: Safed Sagar
slug: safed-sagar
summary: I built a fictional MiG-21-inspired reconnaissance flight for the browser, with mountain terrain, flight instruments, and a photography mission. It uses AI-assisted development.
yearStart: 2026
status: Public browser experiment
role: Creator and engineer
disciplines:
  - Browser games
  - Real-time terrain and atmosphere
  - Product direction
  - AI-assisted engineering
visibility: public
featuredOrder: 0
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
  src: /media/generated/editorial/enhanced/safed-sagar-hero-v2.webp
  avif: /media/generated/editorial/enhanced/safed-sagar-hero-v2.avif
  label: Safed Sagar · Flying above the mountains in a fictional reconnaissance mission.
  alt: Safed Sagar MiG-21 flying through a snowy high-altitude mountain environment
  width: 1600
  height: 900
out:
  thesis: A reconnaissance flight you can try in a browser.
  audience: Players interested in flight experiences, and developers exploring browser games.
  outcome: A public fictional reconnaissance sortie where the player navigates mountain terrain and photographs positions from a MiG-21-inspired aircraft.
  media: *hero
near:
  experience: Fly through the mountains and photograph the mission’s targets.
  contribution: I designed and built the flight experience, including the mission systems, terrain, controls, and adaptive graphics settings. I used AI-assisted development and added tools to test the result.
  system: The Three.js application combines a flight model with procedural terrain and atmospheric effects. It supports keyboard, gamepad, and touch controls, with assist modes and adaptive resolution for different devices.
  media:
    src: /media/generated/editorial/enhanced/safed-sagar-near-v2.webp
    avif: /media/generated/editorial/enhanced/safed-sagar-near-v2.avif
    label: Safed Sagar · Finding a mission target through the reconnaissance camera.
    alt: Safed Sagar reconnaissance optic framing a target in snowy mountain terrain
    width: 1600
    height: 900
inside:
  decisions:
    - Make objective positions discoverable through sectors and range bands instead of exposing exact bearings before visual acquisition.
    - Adjust resolution and visual quality according to rendering cost so the flight remains responsive on lower-power devices.
    - Keep remembrance separate from scoring and state clearly that the work is fictional and not affiliated with India’s armed forces.
  constraints:
    - The experience must communicate respectfully while using fictional callsigns, positions, events, and no official insignia.
  evidence:
    - The project is available to play in the browser. Its repository includes controls, accessibility options, development instructions, and asset credits.
  media:
    src: /media/generated/editorial/enhanced/safed-sagar-inside-v2.webp
    avif: /media/generated/editorial/enhanced/safed-sagar-inside-v2.avif
    label: Safed Sagar · Flight instruments and controls over the mountain landscape.
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

After watching *Operation Safed Sagar*, I wanted to try building a high-altitude reconnaissance flight in the browser. Within a few days, I had an experiment running. The player flies a MiG-21-inspired aircraft through mountain terrain and uses a camera to photograph positions.

I spent time on the controls and on making the search understandable. Targets are described through sectors and range bands, so the player has to look for them. Graphics settings adapt to the device rather than assuming everyone has the same GPU.

The project is explicitly a work of fiction. It is not affiliated with or endorsed by the Indian Air Force, Indian Army, Ministry of Defence, or any broadcaster. Its public documentation keeps remembrance separate from score.

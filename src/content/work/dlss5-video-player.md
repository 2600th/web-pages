---
title: DLSS 5 Video Player
slug: dlss5-video-player
summary: I built a free, open-source Windows player that puts any video through NVIDIA’s DLSS 5 neural renderer and checks every rendered frame against the original.
yearStart: 2026
status: Open-source release
role: Creator and engineer
disciplines:
  - Neural rendering
  - Video tooling
  - Graphics engineering
  - Open source
visibility: public
featuredOrder: 0
recordType: evidence-note
era: operator
domains: [applied-ai]
careerOrder: 200
relationships: [web-ocean-3d, kinema]
evidenceStatus: public-approved
publicClaims:
  - The public repository, README, technical overview and release page support this description.
engagementPath: product-collaboration
storyLabel: OPEN-SOURCE TOOL
storyHeading: Show what the model changed, frame by frame.
heroLabel: Player interface and demo clip
heroMedia:
  src: /media/signal/dlss.webp
  label: Player UI and demo clip from the project. Game footage from 007 First Light © IO Interactive, shown for comparison.
  alt: DLSS 5 Video Player comparing a source frame with its neural render, split down the middle
  width: 1100
  height: 592
  mp4: /media/signal/dlss.mp4
sources:
  - label: Source code, README and usage guide
    url: https://github.com/2600th/dlss5-video-player
    type: repository
  - label: Project website
    url: https://2600th.github.io/dlss5-video-player/
    type: official-source
    contextLabel: Site
  - label: Release v0.26.2
    description: Complete and core Windows packages, each with a checksum; the core package also has a build attestation.
    url: https://github.com/2600th/dlss5-video-player/releases/tag/dlss5-video-player-v0.26.2
    type: repository
    contextLabel: Release
seo:
  title: DLSS 5 Video Player, an open-source neural video player
  description: A free, open-source Windows player by Pranshul Chandhok that renders any video through DLSS 5 and compares every frame with the original.
  socialImage: /media/signal/dlss.webp
---
I built DLSS 5 Video Player to answer a simple question honestly: what does a neural renderer actually do to a picture? Open a video, photo or GIF, press `D`, and within seconds the render plays while the rest of the video renders behind the playhead, nearest frames first. The original is always one key away, on the same frame.

## Comparison is the product

Most tools stop at showing the result. This one is built around checking it. Split, Wipe, Difference (the change, amplified), Side by side and 2 × 2 views share one timeline, with a mix slider, zoom to 8x and a 4x loupe. Switching views never moves the playhead. The project’s own comparison stills include a frame where the model makes the picture worse.

Saving a comparison image writes exactly what the picture shows, with a footer that records the video, frame, view, neural settings and runtime, so anyone can check the comparison later.

## Rendering behind the playhead

A session collects a four-second lead, then plays rendered frames while the render continues ahead of the playhead. Rendered frames play wherever they exist; elsewhere the original plays while the render catches up. A whole-video render is reused as long as the source, runtime and settings still match.

## Honest about what it is

This is a community project, not an NVIDIA product. The player calls NVIDIA NGX Super Resolution, and a separate runtime add-on observes those calls to perform experimental neural rendering. It is not an official DLSS 5 SDK integration, and motion and depth derived from video are estimates.

The neural runtime is an unsigned community build, so the release documents how to verify every file or supply the runtime yourself. Each package has a checksum, and the core package also has a build attestation. Neural rendering needs Windows, an NVIDIA RTX card and driver 610.47 or newer; the README lists the tested GPUs and measured frame costs.

---
name: Pranshul Chandhok / 2600th
description: Signal, a dark, tuned-in portfolio built on the 2600 Hz phreaking story.
colors:
  void: "#03040a"
  panel: "#0a0d18"
  panel-2: "#10152a"
  ink: "#eae8e1"
  muted: "#a4a7b3"
  dim: "#858a99"
  cobalt: "#4d74ff"
  cobalt-deep: "#2447d8"
  phosphor: "#9db6ff"
  gold: "#e8b45a"
  live: "#5fe0a2"
  term: "#7cf0b0"
  line: "rgb(234 232 225 / 0.1)"
  line-strong: "rgb(234 232 225 / 0.22)"
typography:
  display:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(2.8rem, 7.5vw, 7rem)"
    fontWeight: 780
    fontStretch: "114%"
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  accent:
    fontFamily: "Doto, JetBrains Mono, monospace"
    fontWeight: 800
    use: "One accent word per display line, numbers, years and readouts"
  body:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(1rem, 0.3vw + 0.94rem, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.6875rem to 0.75rem"
    fontWeight: 500
    letterSpacing: "0.08em to 0.14em"
    textTransform: uppercase
rounded:
  square: "0"
  console: "8px"
  circle: "50%"
spacing:
  gutter: "clamp(1rem, 3.2vw, 3.5rem)"
  measure: "68ch"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    hover: "cobalt wipe from below with glow"
  button-ghost:
    backgroundColor: "transparent"
    border: "{colors.line-strong}"
  readout:
    background: "panel gradient"
    accent: "cobalt corner bracket, top left"
  endpoints:
    rows: "LIVE / SITE / SOURCE / NOTES / OPEN, then the address itself"
---

# Design system: Signal

## Overview

The whole site is one idea: a 2600 Hz line you tune, seize and dial. The handle 2600th comes from the tone that once told the long-distance network a line was idle, so the visual language borrows from oscilloscopes, switchboards and terminals, and uses them to organise real content rather than decorate it. The homepage tells the story with a point-cloud portrait, oscilloscope traces and a working MF blue box. Every interior page shares the same chrome and components so that clicking through never leaves the story.

Source of truth: `src/styles/signal/tokens.css` (tokens, fonts, base), `src/styles/signal/chrome.css` (header, footer, console, builds, endpoints, transmissions) and `src/styles/signal/pages.css` (openings, archive, case files, reading, about, lab, 404). The homepage adds `src/signal/style.css`.

## Colors

- **Void** is the ground everywhere. Panels step up to `panel` and `panel-2`.
- **Cobalt** is the signal: focus, active states, the accent word, traces.
- **Phosphor** is for readouts, numbers and dates set in Doto.
- **Gold** marks state that deserves attention: context lines, new builds, "site" endpoints, the seize button.
- **Live** green is reserved for builds you can open right now. **Term** green is the shell prompt.
- Phreak mode (Konami code) swaps the tokens to a blue-box palette site-wide.

## Typography

Mona Sans at a wide stretch carries display and body. Doto, a dot-matrix face, sets at most one accent word per display heading (never more, and short enough to fit a 320px screen), plus years, counts and readouts. JetBrains Mono sets labels, paths, eyebrows and anything the visitor would type.

## Layout

- Header with the mark, primary navigation, line status, and sound and motion chips. It is fixed over the homepage stage and sticky on interior pages. On phones a Menu button opens one panel holding the navigation and the sound and motion switches, so focus order matches what is on screen.
- Interior pages open with a shell path (`guest@2600th: ~ / work / blocks`), a numbered eyebrow, a display title, a lede, a bracketed readout, and a waveform strip that differs per section (square for work, sine for notes, saw for about, noise for the lab, rising tones for 404). Index pages whose content is the list below (Work and its domain bands) use the compact opening so the first project shows in the first screen.
- Case files and note articles open with the shell path, a gold context line (dates and type) in place of the numbered eyebrow, the title, a summary and the section's trace. Case files pair the copy, readout and endpoint rows with media in a monitor bezel, then a sticky contents rail, the story, sources, related notes and a previous/next line. On phones, article readout rows that repeat the context line are hidden so the reading starts sooner.
- Reading measure stays near 68 characters.

## Components

- **Readout**: label/value pairs in a panel with a cobalt corner bracket.
- **Endpoints**: every build lists its links the same way, one row per link: kind, address, arrow (↗ leaves the site, → stays on it). The featured build, the cards and case pages all use the same rows. The kind says what is behind the link: LIVE for a running web app, SITE for a project or product site, SOURCE, NOTES, OPEN for a page on this site. Sources and links on case pages use the same words.
- **Channel cards**: the work archive's image cards, with the year and role in the meta line and scanlines on hover. Nothing is laid over the project image.
- **Transmissions**: notes as a call log with Doto dates.
- **Console**: a modal terminal window opened with the backtick key or the footer's Console switch on every page: a title bar, aligned output and a scrim. While open the page behind is inert; Esc, backtick, Close or a press on the scrim closes it and focus returns where it was.
- **Footer**: "Dial in" with the address as the link and a copy button, then a switchboard bar: identity, site map, console and shortcut switches, and "Hang up" back to top. The homepage adds the blue box.

## Motion and sound

Motion is movement only: reading content is never hidden or dimmed at rest. The one deliberate exception is **Hang up** in the footer: the picture switches off like a CRT into the idle 2600 Hz trace, the trace flattens to a dot, the page returns to the top under the cover and the line comes back, all in under a second. It never runs with motion off; the link is then a plain jump to the top. One motion preference covers the whole site and respects `prefers-reduced-motion`; reduced motion never downloads the 3D engine. Sound is synthesized with Web Audio, off by default, and follows the visitor between pages once they turn it on.

## Do's and Don'ts

### Do

- Do preserve complete semantic content, direct links and static posters without JavaScript.
- Do verify keyboard interaction, reduced motion, readable contrast and 320px containment.
- Do preserve original media and record generated derivatives in internal provenance.
- Do use first-person, factual copy and specific image captions.
- Do keep terminal and telephony motifs tied to real behaviour: a path is a real breadcrumb, a readout holds real facts, the console runs real commands.

### Don't

- Don't add a second visual language; every page uses Signal's tokens and chrome.
- Don't add scroll-jacking, autoplaying audio or navigation delays.
- Don't use terminal styling as decoration without a function behind it.
- Don't present generated imagery as an authentic product screenshot or invent project claims.
- Don't add internal labels such as “not project evidence” to visitor-facing images.

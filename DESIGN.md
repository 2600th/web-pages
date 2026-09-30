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

Source of truth: `src/styles/signal/tokens.css` (tokens, fonts, base, page transitions), `src/styles/signal/chrome.css` (header, footer, console, builds, endpoints, transmissions) and `src/styles/signal/pages.css` (openings, archive, case files, reading, 404). Each section's signature piece has its own sheet: `notes.css`, `work.css`, `case.css`, `lab.css` and `about.css`. The homepage adds `src/signal/style.css`.

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
- **Signatures** (one per section, each tied to real content):
  - *Notes*: a receiver whose stations are the note types, over a waterfall canvas. Every note gets a waveform signature drawn from its own sections and word counts, in its type's tone (field note phosphor and sine, teardown cobalt and square, essay ink and saw). In an article the signature is the contents: its marks are the sections, a head tracks the reading, and the transmission ends with EOT and the next channels.
  - *Work*: a switchboard. Bands are trunk lines, each project is a jack at the year it started, cords join a project across bands and link work that grew out of other work. The band labels are the domain filter. Hidden below 64rem, where the domain menu and gallery remain.
  - *Case files*: the hero is a monitor that tunes in through static with the channel number, over an on-screen-display chin (channel, band tags, year, CAPTURE or EDITORIAL). Captures get a 2× loupe; ← → change channel to the previous or next case.
  - *Lab*: an arcade cabinet with a WebGL CRT. The roster is the build list; number keys load a cartridge, Enter or A starts it, S opens its source. Until someone plays, attract mode cycles the cartridges.
  - *About, why 2600th*: two 2600s. An Atari 2600 (the first console in the house) in front of a colour TV, as 3D models: pick a cartridge and it seats in the slot, and the TV warms up on channel 3 with a title card for it; take it out and the TV switches off to a dot. A still of the set with motion off. The models are credited under it (CC BY 4.0).
  - *Side B* (`/side-b/`, reached from "Flip the tape" at the end of About): a Sony Walkman and four tapes, two of Linkin Park, one of rock classics and one of the line's own tones. Pick a tape: it slides into the Walkman, the J-card lists the side, and the songs stream from their official YouTube uploads in a player on the J-card. YouTube loads only when a tape is first played. The reels turn while music plays and follow the position through the side; flip for side B. Full tracklists with links sit below for everyone; a still of the Walkman with motion off.
  - *About, toolchain*: a 90s PC and four floppy disks, one per row of tools. Load a disk and the monitor, in the shell's term green, lists that row's tools and the work they were used on, and the row lights. The rows keep the full text and links for everyone.
  - *About*: a conference badge. The silkscreen carries the facts, and the display shows the homepage's 2600th character, tuning in from static and locking at 2600 Hz (B retunes; a brief sync slip a few times per visit while it is on screen; a still picture with motion off). One LED per year since 2012 is wired to the display: a year's LED reads out that year's role and the projects running.
  - *404*: an intercept operator with the SIT tones, the dialled path and the closest real routes.
- **Header status**: the line status reads the page's state (a channel, a cartridge, RX progress while reading) and returns to rest.
- **Console**: a modal terminal window opened with the backtick key or the footer's Console switch on every page: a title bar, aligned output and a scrim. While open the page behind is inert; Esc, backtick, Close or a press on the scrim closes it and focus returns where it was.
- **Footer**: "Dial in" with the address as the link and a copy button, then a switchboard bar: identity, site map, console and shortcut switches, and "Hang up" back to top. The homepage adds the blue box.

## Motion and sound

Motion is movement only: reading content is never hidden or dimmed at rest. Pages change with a short channel-change view transition. Scenes (canvas, WebGL) mount lazily when they scroll into view and only run with motion on. The one deliberate exception is **Hang up** in the footer: the picture switches off like a CRT into the idle 2600 Hz trace, the trace flattens to a dot, the page returns to the top under the cover and the line comes back, all in under a second. It never runs with motion off; the link is then a plain jump to the top. One motion preference covers the whole site and respects `prefers-reduced-motion`; reduced motion never downloads the 3D engine. Sound is synthesized with Web Audio, off by default, and follows the visitor between pages once they turn it on.

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

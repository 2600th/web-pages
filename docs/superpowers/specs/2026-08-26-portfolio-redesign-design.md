# Pranshul Chandhok / 2600th Portfolio Redesign Specification

> Historical document. Retained for design and implementation history; checklists, counts, and code paths below describe the work at that time. Do not treat them as current instructions or a pending backlog. Use [current documentation](../../README.md) and [DESIGN.md](../../../DESIGN.md) for maintenance.

**Status:** Approved visual direction; written specification awaiting review

**Date:** 2026-08-26

**Product source:** `PRODUCT.md`

**Design-system source:** `DESIGN.md`

## 1. Decision

The redesign uses the approved **B-led hybrid**:

1. **Living Wordmark** is the homepage identity and first-view interaction.
2. **Three Distances** structures selected-work exploration.
3. **Motion Study** presents the wider career and project archive.

Pranshul Chandhok is the primary human and searchable identity. `2600th` is the experimental signature and lab identity. The new site replaces the existing CRT-terminal visual world on the homepage rather than blending with it.

## 2. Job, Audience, and Outcome

### Primary audience

Founders, executives, and senior product or technology leaders arriving from LinkedIn, X, GitHub, referrals, or branded search. They are evaluating Pranshul for strategic advisory, founder collaboration, difficult 0-to-1 product work, speaking, or selective product/technology leadership opportunities.

### Primary job

Within the first viewport, a qualified visitor must be able to answer:

- Who is this?
- What kind of problems does he solve?
- What makes the combination of experience unusual?
- Where is the proof?
- How do I start a relevant conversation?

### Success criteria

- Pranshul's name and operator-builder positioning are legible without interaction.
- At least two strong public work examples are reachable within one action.
- Visitors can move from high-level result to detailed technical evidence without losing context.
- The primary conversation action remains visible and usable on desktop and mobile.
- Search engines and non-JavaScript clients receive complete, meaningful HTML.

## 3. Product Narrative

The narrative is not “multidisciplinary technologist.” It is:

> Pranshul repeatedly turns emerging AI and spatial technologies into products people can use.

The proof progresses through three levels:

1. **Identity:** product and technology operator, builder, and advisor.
2. **Selected work:** concrete public systems and product decisions.
3. **Career arc:** 15-plus years across AI, real-time 3D, games, XR, robotics, and production engineering.

The site must not read like a job-seeker resume, an agency landing page, or a speculative AI-art portfolio.

## 4. Information Architecture

### Required first-release routes

| Route | Purpose | Primary action |
| --- | --- | --- |
| `/` | Identity, selected proof, career arc, recent thinking, conversation | Start a conversation |
| `/work/` | Crawlable index of public work and experiments | Open a case study |
| `/work/[slug]/` | Evidence-rich case study | Discuss a related problem |
| `/notes/` | Index of first-person posts and essays | Read a note |
| `/notes/[slug]/` | Searchable long-form content | Read related work / contact |
| `/about/` | Career narrative, credentials, expertise, and availability | Start a conversation |
| `/lab/` | Optional experimental index and preserved older artifacts | Explore or return to work |

### Initial selected work

The initial homepage should support three to four selected cases. The first two are mandatory because strong public evidence is already available:

1. **Kinema** — browser-native gameplay lab and level editor.
2. **Web Ocean 3D** — real-time spectral ocean and tropical island renderer.
3. **Blocks / public Square Yards work** — only approved public claims and media.
4. **INCO-AI or another public AI system** — only approved public claims and media.

Cases 3 and 4 may ship as shorter evidence pages if public material is insufficient for the full Three Distances treatment. No missing metrics or confidential architecture may be inferred.

## 5. Homepage Sequence

### 5.1 Living Wordmark hero

- Full name dominates the viewport in a variable typographic composition.
- Selected letterforms reveal real Kinema and Web Ocean imagery.
- Supporting copy states the operator-builder proposition in one short block.
- Primary CTA: **Start a conversation**.
- Secondary CTA: **See the work**.
- Navigation: Work, Notes, About.
- The eclipse in the `O` toggles positive and negative modes.

The hero remains complete when interaction, image masking, or variable-axis animation is unavailable.

### 5.2 Credibility sentence

A quiet transition states the compound advantage in direct language: long-term real-time systems experience plus current applied AI and product leadership. This section must cite or link to supporting evidence rather than use logo decoration.

### 5.3 Selected work / Three Distances

Each selected project exposes:

- `OUT`: what exists, whom it serves, and why it matters.
- `NEAR`: the product experience, system boundary, and Pranshul's contribution.
- `INSIDE`: key decisions, constraints, trade-offs, and evidence.

The viewer changes actual payloads and images. A normal case-study link remains available in every state.

### 5.4 Motion Study

A scrub-able chronological strip shows factual work and experiments from 2011 to the present. The ordered list underneath or alongside it is semantic and complete. The timeline is not a decorative career graphic; every frame links to a case, note, public source, or concise evidence record.

### 5.5 Recent thinking

Show three recent notes or public posts with date, topic, title, and a short authored summary. Prefer locally owned canonical notes. External LinkedIn, X, or Substack posts may be linked, but the site should gradually become the canonical content home.

### 5.6 About and conversation close

Close with a concise first-person statement, location/working context, and one conversation action. Offer relevant conversation prompts without a complex form:

- Advisory and difficult 0-to-1 product problems
- Product and technology leadership
- AI, 3D, spatial, and interactive systems collaboration
- Speaking, writing, or technical conversation

Email is visible and copyable, with LinkedIn as fallback.

## 6. Content Model

Use typed content collections for `work` and `notes`.

### Work fields

- `title`
- `slug`
- `summary`
- `yearStart` and optional `yearEnd`
- `status`
- `role`
- `disciplines`
- `visibility`: `public`, `approval-enhanced`, or `private-excluded`
- `featuredOrder`
- `heroMedia`
- `out`: thesis, audience, outcome, media
- `near`: experience, contribution, system, media
- `inside`: decisions, constraints, evidence, media
- `sources`: labeled public URLs
- `seo`: title, description, social image

### Note fields

- `title`
- `slug`
- `summary`
- `publishedAt`
- optional `updatedAt`
- `topics`
- `canonicalUrl`
- `sourceAttribution`
- `heroMedia`
- `draft`

Content validation must reject a featured work item without an `OUT` payload, a source record, alternative text, and SEO description.

## 7. Technical Architecture

### Rendering model

Migrate the current hand-authored single page to a statically generated Astro site. Astro is selected because the portfolio is content-led, needs multiple crawlable pages, and benefits from sending little JavaScript by default while hydrating only the interactive experiences.

### Progressive enhancement

- Astro renders all routes, content, metadata, links, and structured data to static HTML.
- Living Wordmark, Three Distances, Motion Study, theme transitions, and optional audio are isolated client components.
- Prefer framework-free TypeScript or small web components for interactions. Add a component framework only if implementation evidence shows a clear reduction in complexity.
- Prefer CSS, the Web Animations API, native View Transitions, and semantic controls.
- No smooth-scroll library and no global single-page-app shell.

### Typography asset

Self-host Mona Sans Variable under the SIL Open Font License 1.1. Use its width, weight, optical-size, and italic axes for the wordmark; subset and preload only the above-the-fold file actually used.

### Deployment

Retain the `2600th.com` custom domain and static-hosting compatibility. The build must emit a deployable static directory and preserve the custom-domain file required by the current host. The specific hosting workflow is verified during implementation before replacing the live deployment.

### Legacy preservation

The existing terminal experience is not used as a component library for the redesign. It may be moved intact to `/lab/terminal/` as `2600th v1` if doing so does not delay the first release. Otherwise, preserve it in version history and schedule the lab route after launch.

## 8. Theme, Motion, and Audio Behavior

### Theme

- First visit follows `prefers-color-scheme`.
- Explicit choice persists locally.
- A native button exposes current state and action to assistive technology.
- Theme transition never blocks input and completes quickly.
- Printed pages and forced-colors mode receive usable neutral styling.

### Motion

- Wordmark response is local to pointer/focus position and settles when idle.
- Three Distances uses source/layout replacement, not continuous zoom alone.
- Motion Study supports pointer scrub, touch, keyboard, and a range input.
- Reduced-motion mode removes parallax, inertia, and variable-axis interpolation.
- Background tabs and offscreen sections pause continuous work.

### Audio

- Off by default; no autoplay.
- One explicit opt-in control.
- Persistent mute state.
- Only short interface cues in the first release; music is excluded from MVP.

## 9. SEO and AI-Search Architecture

### Technical foundation

- Unique title, description, canonical URL, `h1`, and social image per indexable page.
- XML sitemap covering canonical public routes.
- RSS feed for notes.
- Robots policy allows public pages and excludes drafts, previews, and internal assets.
- Correct status handling for missing routes and redirects from replaced URLs.
- Responsive images with descriptive filenames, width/height, modern formats, and meaningful alternative text.

### Entity and structured data

- Global `Person` entity for Pranshul Chandhok with stable `@id` and verified `sameAs` links.
- Global `WebSite` entity referencing the Person as author/creator.
- `CreativeWork` or `SoftwareApplication` only where the public evidence supports that type.
- `Article` for notes with author, publication date, modification date, canonical image, and main entity.
- `BreadcrumbList` on nested pages.
- Structured data must match visible content exactly.

### Content authority

- First-person case studies state role, constraints, decisions, and sources.
- Public evidence links to GitHub, product pages, posts, talks, patents, or other primary sources.
- Dates and revisions remain visible.
- Important answers use clear headings and self-contained passages without keyword stuffing.
- Do not manufacture FAQ sections solely for schema or AI search.

### Verification workflow

At implementation and before launch, use the Codex-first SEO suite to run technical, page, schema, performance, visual, GEO, and search-experience checks. Treat its output as prioritized evidence, then verify material findings in Chrome and against primary Google guidance. Capture a pre-launch baseline so future content changes can be compared for SEO drift.

## 10. Accessibility

Target WCAG 2.2 AA.

- Skip link, semantic landmarks, logical heading order, and visible focus.
- Every custom control has a native semantic equivalent.
- Complete keyboard paths for theme, distance, scrubber, navigation, and contact.
- Touch targets are at least 44 by 44 CSS pixels for primary controls.
- Color contrast is tested in both themes and over real media.
- Video has captions or transcripts; audio is optional and nonessential.
- JavaScript-disabled rendering still communicates identity, work, chronology, and contact.
- Forced colors, zoom to 200%, coarse pointer, and reduced motion receive explicit browser tests.

## 11. Performance Budgets

- p75 LCP below 2.5 seconds.
- p75 INP below 200 milliseconds.
- CLS below 0.1.
- First-view JavaScript target below 90 kB compressed.
- First-view media target below 1.2 MB mobile and 2 MB desktop.
- Locally hosted font files are subset and preloaded only when used above the fold.
- Below-fold interactive code and media are lazy-loaded.
- Continuous animation is limited to visible sections and composited properties where possible.
- WebGL is not required for the approved direction and cannot enter the critical path.

## 12. Analytics and Conversion Measurement

Preserve the existing GA4 property unless the user asks to remove it. Add a small, documented event vocabulary:

- `contact_start` with channel and context
- `work_open` with slug and entry section
- `work_depth_change` with slug and distance
- `motion_study_seek` with year/project, sampled rather than fired on every frame
- `theme_change` with selected mode
- `audio_opt_in`

Analytics must not block rendering, and no sensitive inquiry text is captured.

## 13. Error and Fallback States

- Missing optional media falls back to a typographic project treatment, never a broken blank.
- A failed interactive component leaves its static content and links visible.
- Unsupported View Transitions use immediate state changes or short opacity transitions.
- Unsupported variable-font behavior uses a stable wordmark instance.
- Missing work routes return a useful 404 with links to Work and Home.
- External-source failures do not remove locally authored summaries or evidence labels.

## 14. Testing and Acceptance

### Automated

- Content-schema validation for work and notes.
- Unit tests for theme persistence, distance-state routing, and scrubber mapping.
- Build test proving every public content item produces a route.
- Metadata and JSON-LD snapshots for representative pages.
- Playwright coverage at mobile, tablet, and desktop widths.
- Keyboard, reduced-motion, forced-colors, and no-JavaScript scenarios.
- Automated accessibility scan on all page templates.
- Lighthouse or equivalent budget checks on representative pages.

### Browser verification

Use Chrome for final visual and interaction verification:

- Living Wordmark resting and interactive states
- Both themes and the eclipse transition
- Three Distances at all states
- Motion Study pointer, touch, and keyboard behavior
- Deep links and browser back/forward behavior
- Mobile compositions at representative narrow widths
- Contact actions and external links

### Acceptance test

A first-time visitor should be able to identify Pranshul, understand the proposition, open relevant proof, and start a conversation within 60 seconds without enabling audio, using a high-performance GPU, or discovering a hidden gesture.

## 15. Boundaries

### Included

- Full visual replacement of the homepage
- Multi-route static content architecture
- Initial public case studies and notes infrastructure
- Approved identity, depth viewer, career motion study, theme system, optional interface audio
- SEO, structured data, accessibility, performance, analytics, and browser verification

### Excluded from first release

- CMS, authentication, database, or server-rendered personalized content
- Automated social-feed ingestion
- Full music player or autoplay ambient soundtrack
- WebGL-only navigation
- Private employer/client evidence
- Programmatic SEO page generation
- Complex CRM or qualification form

## 16. Specification Self-Review

- No placeholder claims or metrics are permitted.
- The B-led hybrid is consistent across identity, work, and archive.
- The single cobalt accent resolves the three concept references into one system.
- Static semantics and progressive enhancement satisfy both SEO and accessibility goals.
- The first release remains one coherent portfolio system rather than separate experimental microsites.

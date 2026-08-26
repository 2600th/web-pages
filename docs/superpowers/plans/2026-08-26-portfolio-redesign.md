# Pranshul Chandhok / 2600th Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CRT homepage with a statically generated, evidence-led portfolio that converts qualified visitors while preserving the complete console experience at `/lab/terminal/`.

**Architecture:** Astro 7 generates semantic HTML for every public route. Typed content collections own work and notes, while framework-free TypeScript modules progressively enhance theme, Three Distances, Motion Study, and analytics. The original console remains an isolated static artifact under `public/lab/terminal/`, and GitHub Pages receives only the generated `dist/` output.

**Tech Stack:** Astro 7.2.7, TypeScript 7.0.2, Zod through Astro content collections, Vitest 4.1.11, Playwright 1.62.1, axe-core 4.13.0, local Mona Sans Variable, CSS Custom Properties, Web Animations API, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-26-portfolio-redesign-design.md`

## Global Constraints

- Preserve the custom domain `www.2600th.com` through `public/CNAME`.
- Keep all important content and links in static HTML; JavaScript is progressive enhancement only.
- Use only public evidence, publicly shared screenshots, open-source material, and explicitly shared Drive media.
- Do not invent outcomes, metrics, clients, testimonials, dates, or technical claims.
- Target WCAG 2.2 AA, keyboard-complete controls, reduced motion, forced colors, and useful no-JavaScript rendering.
- Keep first-view JavaScript below 90 kB compressed and first-view media below 1.2 MB mobile / 2 MB desktop.
- Audio is off by default and excluded from the first implementation unless all other acceptance gates are complete.
- The existing terminal is preserved at `/lab/terminal/`, titled `2600th v1 — Console Archive`, linked from Lab and the footer, and marked `noindex,follow`.
- Preserve GA4 property `G-XR0S4Q293G`; analytics never blocks rendering.

---

## File Structure

- `astro.config.mjs` — static output, canonical site URL, sitemap integration.
- `package.json`, `tsconfig.json` — scripts, pinned tools, strict TypeScript.
- `src/content.config.ts` — typed `work` and `notes` schemas and validation.
- `src/content/work/*.md` — public case-study evidence and Three Distances payloads.
- `src/content/notes/*.md` — locally owned summaries of public posts with canonical attribution.
- `src/data/site.ts` — stable identity, navigation, social, timeline, and contact constants.
- `src/layouts/BaseLayout.astro` — metadata, JSON-LD, skip link, header, footer, analytics.
- `src/components/home/*.astro` — Living Wordmark, Three Distances, Motion Study, Recent Thinking, Conversation Close.
- `src/components/shared/*.astro` — project media, evidence list, breadcrumbs, theme control.
- `src/scripts/*.ts` — small independently testable interaction modules.
- `src/styles/global.css` — committed mineral/black/cobalt world, responsive and accessibility states.
- `src/pages/**` — home, Work, Notes, About, Lab, RSS, robots, and 404 routes.
- `public/media/**` — optimized, source-traceable public screenshots.
- `public/lab/terminal/**` — intact legacy site and its relative assets.
- `tests/unit/*.test.ts` — theme, distance URL, and timeline mapping tests.
- `tests/e2e/site.spec.ts` — route, keyboard, no-JS, responsive, and accessibility coverage.

### Task 1: Static Astro Foundation

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `tests/unit/foundation.test.ts`
- Create: `src/data/site.ts`
- Move: `CNAME` to `public/CNAME`

**Interfaces:**
- Produces `SITE`, `PERSON`, `NAVIGATION`, `SOCIAL_LINKS`, and `CONTACT_EMAIL` constants for all routes.

- [ ] **Step 1: Create package scripts and a failing foundation test**

```ts
import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, PERSON, SITE } from '../../src/data/site';

describe('site identity', () => {
  it('uses the human identity and canonical production URL', () => {
    expect(PERSON.name).toBe('Pranshul Chandhok');
    expect(SITE.url).toBe('https://www.2600th.com');
    expect(CONTACT_EMAIL).toBe('2600th@gmail.com');
  });
});
```

- [ ] **Step 2: Run `npm install && npm test -- foundation` and verify RED because `src/data/site.ts` is absent.**
- [ ] **Step 3: Implement the typed constants, static Astro config, sitemap integration, and `public/CNAME`.**
- [ ] **Step 4: Run `npm test -- foundation` and `npm run check`; verify GREEN.**
- [ ] **Step 5: Commit with `chore: scaffold static Astro portfolio`.**

### Task 2: Typed Evidence Content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/work/{kinema,web-ocean-3d,safed-sagar,blocks-inco-ai}.md`
- Create: `src/content/notes/{ai-video-control,browser-flight-experiment,ocean-reliability}.md`
- Create: `tests/unit/content.test.ts`

**Interfaces:**
- Produces `work` entries with `out`, `near`, `inside`, `sources`, `heroMedia`, `featuredOrder`, and `seo`.
- Produces `notes` entries with `publishedAt`, `topics`, `canonicalUrl`, `sourceAttribution`, and `draft`.

- [ ] **Step 1: Write a failing test that loads every collection entry and asserts each featured work item has an OUT thesis, source URL, alt text, and SEO description.**
- [ ] **Step 2: Run `npm test -- content` and verify RED because the collections do not exist.**
- [ ] **Step 3: Implement the schemas and evidence-backed entries using only GitHub README claims and authored LinkedIn/X posts recorded during research.**
- [ ] **Step 4: Run `npm test -- content` and `npm run check`; verify GREEN.**
- [ ] **Step 5: Commit with `feat: add typed public portfolio evidence`.**

### Task 3: Media Acquisition and Provenance

**Files:**
- Create: `public/media/work/{kinema,web-ocean-3d,safed-sagar,blocks-inco-ai}/**`
- Create: `src/data/media-provenance.ts`
- Create: `tests/unit/media.test.ts`

**Interfaces:**
- Produces local `/media/work/...` URLs with source URL, license/evidence status, dimensions, and alternative text.

- [ ] **Step 1: Write a failing test that verifies every content media path exists and has a matching provenance record.**
- [ ] **Step 2: Run `npm test -- media` and verify RED on missing media files.**
- [ ] **Step 3: Download public GitHub screenshots and explicitly shared Drive frames; optimize responsive AVIF/WebP/JPEG variants with `sharp` without materially altering evidence.**
- [ ] **Step 4: Record exact source and usage status for each asset and update content paths.**
- [ ] **Step 5: Run `npm test -- media` and verify GREEN; inspect key crops visually.**
- [ ] **Step 6: Commit with `feat: add sourced portfolio media`.**

### Task 4: Global Layout, Theme, SEO, and Structured Data

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/shared/{SiteHeader,SiteFooter,ThemeControl,Breadcrumbs}.astro`
- Create: `src/scripts/{theme,analytics}.ts`
- Create: `src/styles/global.css`
- Create: `tests/unit/theme.test.ts`

**Interfaces:**
- `getInitialTheme(stored: string | null, prefersDark: boolean): 'light' | 'dark'`
- `setTheme(theme)` updates `data-theme`, persistence, control label, and optional analytics.
- Layout accepts `title`, `description`, `canonical`, `image`, `robots`, `jsonLd`, and `breadcrumbs`.

- [ ] **Step 1: Write failing tests for system preference, stored preference precedence, and invalid stored values.**
- [ ] **Step 2: Run `npm test -- theme` and verify RED because the theme module is absent.**
- [ ] **Step 3: Implement theme logic and the semantic layout with Person/WebSite JSON-LD, canonical, Open Graph, skip link, GA4, and persistent controls.**
- [ ] **Step 4: Implement the mineral/optical-black/cobalt tokens, local Mona Sans loading, focus, reduced-motion, forced-colors, print, desktop, and authored mobile rules.**
- [ ] **Step 5: Run unit tests and `npm run check`; verify GREEN.**
- [ ] **Step 6: Commit with `feat: establish portfolio shell and theme`.**

### Task 5: Living Wordmark Homepage

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/components/home/{LivingWordmark,CredibilityStatement}.astro`
- Create: `src/scripts/wordmark.ts`
- Create: `tests/e2e/home.spec.ts`

**Interfaces:**
- Wordmark exposes semantic `h1`, real project links, eclipse theme button, and decorative media masks.

- [ ] **Step 1: Write Playwright assertions for visible name, proposition, Start a conversation, See the work, and a complete no-JS first viewport.**
- [ ] **Step 2: Run the targeted Playwright test and verify RED because `/` is absent.**
- [ ] **Step 3: Implement the monumental two-line wordmark, letter apertures, editorial supporting copy, fixed conversation marker, and progressive pointer/focus axis response.**
- [ ] **Step 4: Add reduced-motion and narrow-screen compositions that do not rely on clipping or pointer input.**
- [ ] **Step 5: Run the targeted Playwright test and `npm run check`; verify GREEN.**
- [ ] **Step 6: Commit with `feat: build living wordmark homepage`.**

### Task 6: Three Distances Selected Work

**Files:**
- Create: `src/components/home/ThreeDistances.astro`
- Create: `src/scripts/distance-state.ts`
- Create: `tests/unit/distance-state.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `readDistance(search: string): 'out' | 'near' | 'inside'`
- `writeDistance(url: URL, slug: string, distance): URL`
- Each project renders all three semantic payloads before enhancement; script controls presentation and history.

- [ ] **Step 1: Write failing tests for defaults, valid deep links, invalid distance fallback, URL updates, and browser back/forward restoration.**
- [ ] **Step 2: Run `npm test -- distance-state` and verify RED.**
- [ ] **Step 3: Implement the state helpers, segmented controls, real payload/media swaps, case links, arrow-key behavior, and sampled analytics.**
- [ ] **Step 4: Run unit and homepage browser tests; verify GREEN.**
- [ ] **Step 5: Commit with `feat: add three distances work viewer`.**

### Task 7: Motion Study, Thinking, and Conversation Close

**Files:**
- Create: `src/components/home/{MotionStudy,RecentThinking,ConversationClose}.astro`
- Create: `src/scripts/motion-study.ts`
- Create: `tests/unit/motion-study.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `indexForRange(value, count): number` clamps and maps the native range input.
- Timeline data comes from `TIMELINE` in `src/data/site.ts` and remains an ordered semantic list.

- [ ] **Step 1: Write failing unit tests for lower bound, upper bound, midpoint, and empty-sequence handling.**
- [ ] **Step 2: Run `npm test -- motion-study` and verify RED.**
- [ ] **Step 3: Implement the scrubber with native range, previous/next buttons, factual frames, keyboard support, reduced motion, and sampled analytics.**
- [ ] **Step 4: Add three recent notes and the first-person conversation close with visible email and LinkedIn fallback.**
- [ ] **Step 5: Run unit, browser, and accessibility tests; verify GREEN.**
- [ ] **Step 6: Commit with `feat: add career motion study and conversation close`.**

### Task 8: Crawlable Work, Notes, About, and Lab Routes

**Files:**
- Create: `src/pages/work/{index,[slug]}.astro`
- Create: `src/pages/notes/{index,[slug]}.astro`
- Create: `src/pages/{about,lab,index}.astro` as route directories where needed
- Create: `src/components/shared/{WorkList,EvidenceSources,ProjectMedia}.astro`
- Create: `tests/e2e/routes.spec.ts`

**Interfaces:**
- `getStaticPaths()` emits one route per non-draft work/note entry.
- Work details emit CreativeWork/SoftwareApplication plus BreadcrumbList only when visible evidence supports the type.
- Notes emit Article plus BreadcrumbList.

- [ ] **Step 1: Write a failing route test for every content slug, unique metadata, one `h1`, canonical, visible source links, and useful 404 behavior.**
- [ ] **Step 2: Run the targeted route test and verify RED.**
- [ ] **Step 3: Implement indexes and detail templates, calm long-form reading layouts, About narrative, and Lab index.**
- [ ] **Step 4: Run route tests and `npm run check`; verify GREEN.**
- [ ] **Step 5: Commit with `feat: add portfolio content routes`.**

### Task 9: Preserve `2600th v1` Console Archive

**Files:**
- Copy: existing `index.html`, `style.css`, `script.js`, `pingpong.js`, `my_font.ttf`, `favicon.ico`, `ico/**`, and `assets/**` into `public/lab/terminal/`
- Modify: `public/lab/terminal/index.html`
- Create: `tests/e2e/legacy.spec.ts`

**Interfaces:**
- `/lab/terminal/` remains self-contained and its original relative paths resolve.

- [ ] **Step 1: Write a failing browser test for archive title, `noindex,follow`, return link, terminal toggle, and zero missing critical assets.**
- [ ] **Step 2: Run the targeted test and verify RED.**
- [ ] **Step 3: Copy the original experience intact, update only title/metadata, and add a keyboard-visible Return to Pranshul Chandhok link.**
- [ ] **Step 4: Run the legacy test and visually verify the CRT, terminal, audio opt-in, and Ping Pong behavior.**
- [ ] **Step 5: Commit with `feat: preserve 2600th console archive`.**

### Task 10: Feeds, Robots, Deployment, and Full Verification

**Files:**
- Create: `src/pages/rss.xml.ts`, `src/pages/robots.txt.ts`, `src/pages/404.astro`
- Create: `playwright.config.ts`, `tests/e2e/site.spec.ts`
- Create: `scripts/deploy-gh-pages.mjs`
- Create: `DEPLOYMENT.md`
- Update: `README.md`, `DESIGN.md`

**Interfaces:**
- `npm run build` produces the complete deployable `dist/` including `CNAME`, sitemap, RSS, robots, and legacy archive.
- `npm run deploy:local` commits generated output to `gh-pages` only after explicit user approval.

- [ ] **Step 1: Write failing checks for sitemap coverage, RSS, robots, CNAME, structured data, responsive pages, keyboard paths, reduced motion, forced colors, and no-JS.**
- [ ] **Step 2: Run the relevant tests and verify RED.**
- [ ] **Step 3: Implement feeds, error route, deployment script/documentation, and surviving design tokens in `DESIGN.md`.**
- [ ] **Step 4: Run `npm test`, `npm run check`, `npm run build`, and the full Playwright suite.**
- [ ] **Step 5: Run Impeccable detector once over changed UI targets and resolve material findings without a second detector run.**
- [ ] **Step 6: Start the production preview and use Chrome to verify desktop/mobile, both themes, all distance states, timeline input methods, deep links, contact links, and the legacy archive.**
- [ ] **Step 7: Inspect compressed JavaScript and first-view media against budgets; document measured values.**
- [ ] **Step 8: Commit with `test: verify portfolio release candidate`.**
- [ ] **Step 9: Stop before deployment and present the tested local URL, branch, commit, verification evidence, and exact deployment command for user approval.**

## Self-Review

- Spec coverage: all required routes, four selected cases, Living Wordmark, Three Distances, Motion Study, notes, contact, theme, analytics, SEO, structured data, accessibility, performance, legacy archive, and GitHub Pages output map to Tasks 1–10.
- Placeholder scan: implementation content cannot contain unresolved markers, invented metrics, empty case-study fields, or broken-media stand-ins.
- Type consistency: `out | near | inside` is the only distance union across schema, URL helpers, controls, analytics, and tests; collection and layout field names match the approved spec.
- Deployment boundary: no push, branch replacement, or live-site mutation occurs without explicit user approval after the local release candidate is demonstrated.

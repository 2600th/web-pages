# Career Atlas Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand 2600th.com into a media-rich, privacy-safe Career Atlas that accurately communicates Pranshul Chandhok's fifteen-year progression from games and immersive systems to design technology and production AI.

**Architecture:** Extend the existing Astro work collection so one typed record powers the Atlas, work index, and detail routes. Keep complete static HTML as the baseline, then progressively enhance the Atlas with a small TypeScript controller. Acquire Drive media into a gitignored source area, generate only reviewed public derivatives, and require provenance metadata for every published asset.

**Tech Stack:** Astro 7, TypeScript 6, Zod 4, Vitest 4, Playwright 1.62, Sharp 0.35, FFmpeg/FFprobe, static GitHub Pages deployment

**Spec:** `docs/superpowers/specs/2026-08-26-portfolio-career-atlas-design.md`

## Global Constraints

- Preserve the Living Wordmark, Three Distances, human-first identity, light/dark exposure system, static Astro foundation, and current conversion goals.
- Exact dates, titles, employer names, and client names must be verified from primary or first-person public sources before publication.
- Only `public-approved`, `public-corroborated`, and explicitly confirmed `approval-enhanced` media may enter the public build.
- Exclude personal contact data, participant data, internal architecture, credentials, confidential metrics, unannounced products, and sensitive defence, medical, industrial, or operational detail.
- First-view JavaScript target remains below 90 kB compressed.
- First-view media remains below 1.2 MB mobile and 2 MB desktop.
- No video enters the critical rendering path; normal clips are 1280x720 or smaller and target 0.8–2 MB.
- Target WCAG 2.2 AA with complete keyboard, touch, reduced-motion, forced-colors, 200% zoom, and no-JavaScript paths.
- Static GitHub Pages deployment and the existing `CNAME` remain intact.
- Do not add a component framework, smooth-scroll library, cursor replacement, persistent WebGL scene, autoplay audio, or autoplay soundtrack.

---

## File Structure

### New files

- `src/content/evidence.ts` — shared enums and evidence/media types used by schemas and UI.
- `src/data/career-domains.ts` — domain and era labels, descriptions, and stable ordering.
- `src/data/career-media.ts` — public derivative manifest and provenance metadata.
- `src/scripts/career-atlas.ts` — progressively enhanced selection/filter/URL-state controller.
- `src/components/home/CareerAtlas.astro` — static Atlas markup, filters, media stage, and fallback index.
- `scripts/career-media.config.mjs` — selected source-to-derivative processing recipes.
- `scripts/prepare-career-media.mjs` — FFprobe/FFmpeg/Sharp pipeline and manifest report.
- `tests/unit/career-content.test.ts` — schema, factual spine, and provenance requirements.
- `tests/unit/career-atlas.test.ts` — pure Atlas selection and URL-state behavior.
- `tests/unit/career-media-pipeline.test.ts` — media config and public-output budget checks.
- `_media-source/` — gitignored temporary Drive downloads; never deployed or committed.
- `public/media/career/**` — reviewed optimized derivatives only.

### Modified files

- `.gitignore` — excludes source downloads and generated inspection reports.
- `package.json` — adds media-inspection and media-build scripts.
- `src/content/schemas.ts` — supports feature, case, and evidence-note records with career metadata.
- `src/content/work/*.md` — enriches current records and adds verified career records.
- `src/content/notes/*.md` — adds Substack-derived reflections.
- `src/data/media-provenance.ts` — delegates to the richer career media manifest while preserving current entries.
- `src/data/site.ts` — replaces the seven-item timeline and expands conversation paths.
- `src/components/home/LivingWordmark.astro` — updates proposition and Atlas CTA.
- `src/components/home/ThreeDistances.astro` — presents four compound practice pillars.
- `src/components/home/MotionStudy.astro` — removed after Career Atlas parity is complete.
- `src/components/work/WorkList.astro` — domain grouping and record-type-aware rendering.
- `src/pages/index.astro` — mounts Career Atlas in the homepage narrative.
- `src/pages/work/index.astro` — adds link-based domain filters.
- `src/pages/work/[slug].astro` — renders full and evidence-note records safely.
- `src/pages/about.astro` — three-act factual narrative and patent credential.
- `src/layouts/BaseLayout.astro` — expands verified Person/entity metadata.
- `src/styles/global.css` and `src/styles/content-pages.css` — Atlas visual system and responsive states.
- `tests/unit/content.test.ts` and `tests/unit/media.test.ts` — updated collection and provenance assertions.
- `tests/e2e/home.spec.ts`, `tests/e2e/routes.spec.ts`, and `tests/e2e/release.spec.ts` — Atlas, filters, responsive, accessibility, and release budgets.

---

### Task 1: Evidence-safe career content model

**Files:**
- Create: `src/content/evidence.ts`
- Create: `src/data/career-domains.ts`
- Create: `tests/unit/career-content.test.ts`
- Modify: `src/content/schemas.ts`
- Modify: `src/content/work/kinema.md`
- Modify: `src/content/work/web-ocean-3d.md`
- Modify: `src/content/work/safed-sagar.md`
- Modify: `src/content/work/blocks-inco-ai.md`

**Interfaces:**
- Produces: `RecordType`, `EvidenceStatus`, `CareerEra`, and `CareerDomain` union types.
- Produces: `workSchema` records with `recordType`, `era`, `domains`, `careerOrder`, `relationships`, `evidenceStatus`, `publicClaims`, and `engagementPath`.
- Preserves: current full-case `out`, `near`, and `inside` fields for the four existing records.

- [ ] **Step 1: Write the failing content-model test**

```ts
import { describe, expect, it } from 'vitest';
import { workSchema } from '../../src/content/schemas';

const evidenceNote = {
  title: 'The Brutal Spy',
  slug: 'the-brutal-spy',
  summary: 'An early game-programming milestone in a career that moved from real-time entertainment into immersive and intelligent systems.',
  yearStart: 2012,
  status: 'Historical work',
  role: 'Game programmer',
  disciplines: ['Games', 'Real-time systems'],
  visibility: 'public',
  featuredOrder: 0,
  recordType: 'evidence-note',
  era: 'programmer',
  domains: ['games'],
  careerOrder: 10,
  relationships: ['alphaman'],
  evidenceStatus: 'public-corroborated',
  publicClaims: ['Listed in the author\'s public career narrative.'],
  engagementPath: 'product-collaboration',
  sources: [{ label: 'From Pixels to Metaverse', url: 'https://2600th.substack.com/', type: 'authored-post' }],
  seo: {
    title: 'The Brutal Spy — Early Game Work by Pranshul Chandhok',
    description: 'An early game-programming milestone in Pranshul Chandhok\'s progression across games, immersive systems, design technology, and applied AI.',
    socialImage: '/media/social/career-atlas.webp',
  },
} as const;

describe('career work model', () => {
  it('accepts a sourced evidence note without invented case-study depth', () => {
    const entry = workSchema.parse(evidenceNote);
    expect(entry.recordType).toBe('evidence-note');
    expect(entry.out).toBeUndefined();
  });

  it('rejects publication of private-excluded records', () => {
    const result = workSchema.safeParse({ ...evidenceNote, visibility: 'private-excluded' });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run tests/unit/career-content.test.ts`

Expected: FAIL because the new career fields and evidence-note variant do not exist.

- [ ] **Step 3: Define the shared unions and ordered taxonomy**

```ts
export const RECORD_TYPES = ['feature', 'case', 'evidence-note'] as const;
export const EVIDENCE_STATUSES = ['public-approved', 'public-corroborated', 'approval-enhanced'] as const;
export const CAREER_ERAS = ['programmer', 'founder', 'operator'] as const;
export const CAREER_DOMAINS = ['games', 'xr', 'simulation', 'robotics', 'design-tech', 'applied-ai'] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type CareerEra = (typeof CAREER_ERAS)[number];
export type CareerDomain = (typeof CAREER_DOMAINS)[number];
```

Define `CAREER_ERA_META` and `CAREER_DOMAIN_META` as readonly records containing label, short description, and order. No component may duplicate these labels.

- [ ] **Step 4: Implement a discriminated work schema**

Create a shared base schema, then define:

```ts
const evidenceNoteSchema = workBaseSchema.extend({
  recordType: z.literal('evidence-note'),
  heroMedia: mediaSchema.optional(),
  out: z.undefined().optional(),
  near: z.undefined().optional(),
  inside: z.undefined().optional(),
});

const caseSchema = workBaseSchema.extend({
  recordType: z.enum(['feature', 'case']),
  heroMedia: mediaSchema,
  out: outSchema,
  near: nearSchema,
  inside: insideSchema,
});

export const workSchema = z.discriminatedUnion('recordType', [evidenceNoteSchema, caseSchema]);
```

The base schema uses `featuredOrder: z.number().int().min(0)` and refuses `visibility: 'private-excluded'` because excluded records must not exist in the public collection.

- [ ] **Step 5: Migrate the four current records**

Add factual values to each existing frontmatter block:

```yaml
recordType: case
era: operator
domains: [applied-ai]
careerOrder: 140
relationships: [homelane-spacecraft-pro]
evidenceStatus: public-corroborated
publicClaims:
  - Public project material supports the visible system description.
engagementPath: operator-advisory
```

Use appropriate domains and relationships per record. Do not change existing claims during this schema migration.

- [ ] **Step 6: Run focused and baseline tests**

Run: `npx vitest run tests/unit/career-content.test.ts tests/unit/content.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the content model**

```bash
git add src/content/evidence.ts src/data/career-domains.ts src/content/schemas.ts src/content/work tests/unit/career-content.test.ts
git commit -m "feat: add evidence-safe career content model"
```

---

### Task 2: Auditable media acquisition and optimization pipeline

**Files:**
- Create: `scripts/career-media.config.mjs`
- Create: `scripts/prepare-career-media.mjs`
- Create: `src/data/career-media.ts`
- Create: `tests/unit/career-media-pipeline.test.ts`
- Create: `_media-source/.gitkeep`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `src/data/media-provenance.ts`

**Interfaces:**
- Consumes: Drive downloads placed under `_media-source/<sourceKey>/original.<ext>`.
- Produces: `public/media/career/<assetKey>/{poster-640.webp,poster-1280.webp,clip.mp4,clip.webm}` as configured.
- Produces: `CAREER_MEDIA: Record<string, CareerMediaRecord>` with publication status, source URL, source label, alt text, dimensions, and derivative paths.

- [ ] **Step 1: Write failing configuration and safety tests**

```ts
import { describe, expect, it } from 'vitest';
import config from '../../scripts/career-media.config.mjs';

describe('career media pipeline', () => {
  it('never publishes internal-reference-only or excluded recipes', () => {
    for (const recipe of config.recipes) {
      if (['internal-reference-only', 'excluded'].includes(recipe.status)) {
        expect(recipe.outputs).toEqual([]);
      }
    }
  });

  it('keeps delivery clips bounded', () => {
    for (const recipe of config.recipes.filter((item) => item.kind === 'video')) {
      expect(recipe.durationSeconds).toBeLessThanOrEqual(8);
      expect(recipe.width).toBeLessThanOrEqual(1280);
      expect(recipe.height).toBeLessThanOrEqual(720);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run tests/unit/career-media-pipeline.test.ts`

Expected: FAIL because the processing configuration does not exist.

- [ ] **Step 3: Create the reviewed recipe configuration**

Add recipes for the initial shortlist with stable keys:

```js
export default {
  sourceRoot: '_media-source',
  outputRoot: 'public/media/career',
  recipes: [
    {
      key: 'ira-vr',
      sourceFile: 'ira-vr/IRA VR public promo.mp4',
      sourceUrl: 'https://drive.google.com/drive/folders/1iGe_XFt1vLsyJHp9dGW64QxxTUqp3XVm',
      status: 'public-corroborated',
      kind: 'video',
      startSeconds: 2,
      durationSeconds: 6,
      width: 1280,
      height: 720,
      outputs: ['poster-640.webp', 'poster-1280.webp', 'clip.mp4', 'clip.webm'],
    },
  ],
};
```

Also configure Machine Hunter, Oye Tippa Run, Celeste AR, ArchViz, Virtual Theatre, TheMathCompany, and Kave. Configure defence/industrial sources as `approval-enhanced` and retain them outside the public output until the visual review is complete.

Create `public/media/social/career-atlas.webp` from a purpose-made typographic Career Atlas composition; it must not depict generated work as a shipped project.

- [ ] **Step 4: Implement deterministic inspection and processing**

The script must:

1. Verify FFmpeg and FFprobe availability.
2. Refuse recipes with missing sources rather than generating empty files.
3. Run FFprobe and reject zero-duration, corrupt, or unexpectedly high-resolution inputs.
4. Extract posters with `ffmpeg -ss <time> -frames:v 1`.
5. Encode MP4 using H.264, `-an`, `-movflags +faststart`, and a constrained quality preset.
6. Encode WebM only when it is at least 10% smaller than MP4.
7. Use Sharp for 640 and 1280 pixel WebP/AVIF still outputs.
8. Print a JSON report with input checksum, output byte size, duration, dimensions, and recipe status.
9. Exit non-zero when any public output exceeds 2.2 MB or any source marked excluded produces an output.

- [ ] **Step 5: Add safe repository boundaries and scripts**

Add to `.gitignore`:

```gitignore
_media-source/*
!_media-source/.gitkeep
test-results/career-media-report.json
```

Add package scripts:

```json
"media:career:inspect": "node scripts/prepare-career-media.mjs --inspect",
"media:career:build": "node scripts/prepare-career-media.mjs --build"
```

- [ ] **Step 6: Download and visually inspect the shortlist**

Use the connected Google Drive session to download only configured sources to their exact `_media-source` paths. For large videos, download temporarily and retain only derived excerpts. Review representative frames for participant data, private interfaces, internal metrics, personal information, sensitive operational detail, and rights ambiguity. Change unsafe recipes to `internal-reference-only` or `excluded` before building derivatives.

- [ ] **Step 7: Generate derivatives and the typed manifest**

Run:

```bash
npm run media:career:inspect
npm run media:career:build
```

Create `CAREER_MEDIA` entries only for successful reviewed outputs. Merge current public-repository and authored-public-post provenance into the new `EvidenceStatus` model without weakening existing attribution.

- [ ] **Step 8: Verify outputs and commit public derivatives only**

Run: `npx vitest run tests/unit/career-media-pipeline.test.ts tests/unit/media.test.ts`

Expected: PASS and no `_media-source` file appears in `git status`.

```bash
git add .gitignore package.json scripts/career-media.config.mjs scripts/prepare-career-media.mjs src/data/career-media.ts src/data/media-provenance.ts tests/unit/career-media-pipeline.test.ts public/media/career _media-source/.gitkeep
git commit -m "feat: add audited career media pipeline"
```

---

### Task 3: Verified career records and evidence ledger

**Files:**
- Create: `src/content/work/the-brutal-spy.md`
- Create: `src/content/work/alphaman.md`
- Create: `src/content/work/merkur-magie.md`
- Create: `src/content/work/greykernel.md`
- Create: `src/content/work/ira-vr.md`
- Create: `src/content/work/machine-hunter.md`
- Create: `src/content/work/mysticmojo.md`
- Create: `src/content/work/enterprise-immersive-systems.md`
- Create: `src/content/work/humanoid-robot-control-system.md`
- Create: `src/content/work/homelane-spacecraft-pro.md`
- Create: `src/content/work/ai-native-game-thesis.md`
- Modify: `tests/unit/career-content.test.ts`
- Modify: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: career taxonomy and optional keys from `CAREER_MEDIA`.
- Produces: at least fifteen ordered public work records from one collection.
- Guarantees: every public claim has at least one primary or first-person public source.

- [ ] **Step 1: Add the failing career-spine test**

```ts
it('contains the approved factual career spine in chronological order', () => {
  const records = readWorkRecords().sort((a, b) => a.careerOrder - b.careerOrder);
  expect(records.length).toBeGreaterThanOrEqual(15);
  expect(records.map((entry) => entry.slug)).toEqual(expect.arrayContaining([
    'the-brutal-spy',
    'greykernel',
    'ira-vr',
    'machine-hunter',
    'mysticmojo',
    'humanoid-robot-control-system',
    'homelane-spacecraft-pro',
    'blocks-inco-ai',
  ]));
  expect(new Set(records.map((entry) => entry.careerOrder)).size).toBe(records.length);
  expect(records.every((entry) => entry.sources.length > 0)).toBe(true);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run tests/unit/career-content.test.ts`

Expected: FAIL because the career records do not exist.

- [ ] **Step 3: Verify every proposed claim before authoring**

For every record, capture:

- exact public title and date;
- Pranshul's role;
- one-sentence significance;
- source URL and source type;
- safe domain/era relationships;
- media key or an explicit typographic fallback.

Use Substack first-person statements for the historical spine, the public patent grant for filing/grant facts, and employer/repository material for current systems. Do not use private deck language as public copy.

- [ ] **Step 4: Create evidence-note records for early and lightly documented work**

Use `recordType: evidence-note`, concise first-person-safe summaries, no invented outcomes, and no required media for The Brutal Spy, Alphaman, Merkur Magie, and the 2023 AI-native game thesis.

- [ ] **Step 5: Create case and feature records for media-supported systems**

Use `recordType: case` or `feature` only where enough public evidence exists for real `OUT`, `NEAR`, and `INSIDE` payloads. Treat grouped enterprise/defence work conservatively and avoid sensitive detail.

- [ ] **Step 6: Validate content and route generation**

Run:

```bash
npx vitest run tests/unit/career-content.test.ts tests/unit/content.test.ts
npm run check
npm run build
```

Expected: all records validate and every slug produces a static route.

- [ ] **Step 7: Commit the factual spine**

```bash
git add src/content/work tests/unit/career-content.test.ts tests/unit/content.test.ts
git commit -m "content: restore the full career evidence spine"
```

---

### Task 4: Static-first Career Atlas interaction

**Files:**
- Create: `src/scripts/career-atlas.ts`
- Create: `src/components/home/CareerAtlas.astro`
- Create: `tests/unit/career-atlas.test.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Remove after parity: `src/components/home/MotionStudy.astro`
- Remove after parity: `src/scripts/motion-study.ts`
- Modify: `tests/unit/motion-study.test.ts`

**Interfaces:**
- Consumes: sorted `CollectionEntry<'work'>[]` and career taxonomy.
- Produces: `parseAtlasState(search, records)`, `serializeAtlasState(state)`, and `selectRelated(records, slug)` pure helpers.
- Produces: URL state `?career=<slug>&domain=<domain>#career-atlas`.

- [ ] **Step 1: Write failing pure-state tests**

```ts
import { describe, expect, it } from 'vitest';
import { parseAtlasState, serializeAtlasState } from '../../src/scripts/career-atlas';

describe('Career Atlas state', () => {
  it('uses a valid selected record and domain from the URL', () => {
    const records = [{ slug: 'ira-vr', domains: ['xr'] }, { slug: 'kinema', domains: ['games'] }];
    expect(parseAtlasState('?career=ira-vr&domain=xr', records)).toEqual({ selected: 'ira-vr', domain: 'xr' });
  });

  it('falls back safely when the URL is invalid', () => {
    const records = [{ slug: 'ira-vr', domains: ['xr'] }];
    expect(parseAtlasState('?career=missing&domain=unknown', records)).toEqual({ selected: 'ira-vr', domain: 'all' });
  });

  it('serializes stable linkable state', () => {
    expect(serializeAtlasState({ selected: 'machine-hunter', domain: 'xr' })).toBe('career=machine-hunter&domain=xr');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run tests/unit/career-atlas.test.ts`

Expected: FAIL because the Atlas controller does not exist.

- [ ] **Step 3: Implement pure state helpers**

Keep URL parsing, validation, selection, filtering, and relationship lookup free of DOM dependencies. Use `history.replaceState` for filter changes and `history.pushState` for deliberate node selection.

- [ ] **Step 4: Render the complete static Atlas**

`CareerAtlas.astro` must render:

- section heading and explanatory copy;
- six domain links/buttons;
- three era groups;
- one button or anchor per record;
- one selected media/detail stage;
- previous/next controls;
- an ordered list containing every record and evidence link.

With JavaScript disabled, the ordered list remains complete and each record links to `/work/<slug>/`.

- [ ] **Step 5: Add progressive enhancement**

Initialize only inside `[data-career-atlas]`. Update selected media, title, period, role, significance, source link, filter visibility, `aria-pressed`, and URL state. Do not inject public claims from untrusted HTML. Pause animation when offscreen or when `document.hidden` is true.

- [ ] **Step 6: Implement responsive and theme-layer styling**

Desktop uses an editorial field with era bands and connection lines. Mobile uses stacked era sections and an inline media stage. Light mode emphasizes biography and captions; dark mode increases system/domain metadata without hiding any light-mode content. Forced-colors removes decorative connection paths.

- [ ] **Step 7: Replace Motion Study only after parity tests pass**

Run:

```bash
npx vitest run tests/unit/career-atlas.test.ts tests/unit/motion-study.test.ts
npm run check
```

After the Atlas renders all historical entries and has previous/next/range-equivalent keyboard behavior, remove Motion Study and its obsolete test.

- [ ] **Step 8: Commit the Atlas**

```bash
git add src/components/home/CareerAtlas.astro src/scripts/career-atlas.ts src/pages/index.astro src/styles/global.css tests/unit/career-atlas.test.ts
git add -u src/components/home/MotionStudy.astro src/scripts/motion-study.ts tests/unit/motion-study.test.ts
git commit -m "feat: replace the timeline with a career atlas"
```

---

### Task 5: Rebalance homepage proof and conversion paths

**Files:**
- Modify: `src/components/home/LivingWordmark.astro`
- Modify: `src/components/home/ThreeDistances.astro`
- Modify: `src/components/home/CredibilityStatement.astro`
- Modify: `src/components/home/ConversationClose.astro`
- Modify: `src/data/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: four featured practice pillars from work content.
- Produces: hero CTAs `Discuss an opportunity` and `Explore the Career Atlas`.
- Produces: stable engagement keys `operator-advisory`, `product-collaboration`, and `speaking-writing`.

- [ ] **Step 1: Write failing homepage acceptance tests**

```ts
test('the first viewport identifies the operator proposition and Atlas path', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Pranshul Chandhok' })).toBeVisible();
  await expect(page.getByText(/fifteen years.*games.*AI/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discuss an opportunity' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the Career Atlas' })).toHaveAttribute('href', '#career-atlas');
});

test('shows four compound practice pillars', async ({ page }) => {
  await page.goto('/#selected-work');
  for (const label of ['Production AI', 'Design Technology', 'Immersive Systems', 'Browser-native Lab']) {
    await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
  }
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npx playwright test tests/e2e/home.spec.ts`

Expected: FAIL on the new copy, Atlas CTA, and practice pillars.

- [ ] **Step 3: Update hero and credibility copy**

Keep the first viewport concise. State the present operator value first and the fifteen-year range second. Ensure both CTAs are present without interaction and remain correct without JavaScript.

- [ ] **Step 4: Present four practice pillars in Three Distances**

Group existing and newly added work into the four approved pillars. Each pillar opens a representative case and offers crawlable links to its related records. Preserve the `OUT`, `NEAR`, and `INSIDE` URL behavior.

- [ ] **Step 5: Implement three engagement paths**

Update the conversation close with direct mailto links whose subject lines identify the context without capturing sensitive free-text analytics. Track only engagement key and originating section.

- [ ] **Step 6: Run homepage, no-JavaScript, and keyboard tests**

Run: `npx playwright test tests/e2e/home.spec.ts`

Expected: PASS.

- [ ] **Step 7: Commit the homepage rebalance**

```bash
git add src/components/home src/data/site.ts src/pages/index.astro tests/e2e/home.spec.ts
git commit -m "feat: rebalance portfolio proof and conversion"
```

---

### Task 6: Expand work index, detail routes, About, and authored notes

**Files:**
- Create: `src/content/notes/from-pixels-to-intelligent-systems.md`
- Create: `src/content/notes/ai-native-game-development-reflection.md`
- Create: `src/content/notes/technology-and-human-agency.md`
- Modify: `src/components/work/WorkList.astro`
- Modify: `src/pages/work/index.astro`
- Modify: `src/pages/work/[slug].astro`
- Modify: `src/pages/about.astro`
- Modify: `src/components/home/RecentThinking.astro`
- Modify: `src/styles/content-pages.css`
- Modify: `tests/e2e/routes.spec.ts`

**Interfaces:**
- Consumes: record type, domain, era, evidence status, media, and Substack source metadata.
- Produces: link-based `/work/?domain=<domain>` filtering and record-type-aware detail pages.
- Produces: three local reflections with visible original-source attribution.

- [ ] **Step 1: Write failing route tests**

```ts
test('work archive groups records by domain and supports link filters', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByRole('heading', { name: 'Games' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Applied AI' })).toBeVisible();
  await page.getByRole('link', { name: 'XR and spatial computing' }).click();
  await expect(page).toHaveURL(/domain=xr/);
  await expect(page.getByRole('link', { name: /IRA VR/ })).toBeVisible();
});

test('evidence notes render without empty case-study sections', async ({ page }) => {
  await page.goto('/work/the-brutal-spy/');
  await expect(page.getByRole('heading', { name: 'The Brutal Spy' })).toBeVisible();
  await expect(page.getByText(/public career narrative/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside' })).toHaveCount(0);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npx playwright test tests/e2e/routes.spec.ts`

Expected: FAIL because grouping and evidence-note rendering do not exist.

- [ ] **Step 3: Build the grouped work index and conditional detail template**

Group records using `CAREER_DOMAIN_META`. Use normal links for domain filters and enhance them only for faster local state changes. Full case records keep Three Distances sections; evidence notes show period, role, significance, relationships, and sources without blank `OUT/NEAR/INSIDE` shells.

- [ ] **Step 4: Rewrite About as a three-act narrative**

Structure the page as programmer/game maker, founder/immersive-systems builder, and design-tech/AI operator. Include the patent filing/grant facts and current availability only after verifying them. Link every concrete project claim to its work record or public source.

- [ ] **Step 5: Author three source-attributed reflections**

Write materially new first-person pieces rather than copying Substack text. Each note includes original-post attribution and a direct link. Do not imply that a 2023 prediction proves a 2026 outcome; clearly distinguish the original thesis from current reflection.

- [ ] **Step 6: Run content, route, and RSS tests**

Run:

```bash
npx vitest run tests/unit/content.test.ts
npx playwright test tests/e2e/routes.spec.ts
npm run build
```

Expected: PASS with the new work and note routes present in the build.

- [ ] **Step 7: Commit the expanded public archive**

```bash
git add src/content/notes src/components/work src/components/home/RecentThinking.astro src/pages/work src/pages/about.astro src/styles/content-pages.css tests/e2e/routes.spec.ts
git commit -m "content: expand career archive and authored thinking"
```

---

### Task 7: SEO, structured data, media semantics, and release verification

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/work/ProjectMedia.astro`
- Modify: `src/pages/notes/[slug].astro`
- Modify: `scripts/verify-build.mjs`
- Modify: `tests/unit/media.test.ts`
- Modify: `tests/e2e/release.spec.ts`
- Modify: `README.md`
- Modify: `docs/deployment.md`

**Interfaces:**
- Consumes: verified content and `CAREER_MEDIA` provenance.
- Produces: visible-source-aligned Person, CreativeWork/SoftwareApplication, Article, BreadcrumbList, and optional VideoObject JSON-LD.
- Produces: build verification that rejects missing routes, missing media, unsafe status, oversized media, and missing canonical metadata.

- [ ] **Step 1: Write failing release assertions**

Add tests that assert:

```ts
expect(person.sameAs).toEqual(expect.arrayContaining([
  'https://www.linkedin.com/in/pranshulchandhok/',
  'https://x.com/2600th',
]));
expect(publicMedia.every((item) => item.bytes <= 2_200_000)).toBe(true);
expect(publicMedia.every((item) => !['internal-reference-only', 'excluded'].includes(item.status))).toBe(true);
```

Add Playwright assertions for canonical URLs, one `h1`, visible evidence labels, image dimensions, lazy video behavior, reduced motion, forced colors, keyboard selection, and no-JavaScript Atlas links.

- [ ] **Step 2: Run release tests and verify RED**

Run:

```bash
npx vitest run tests/unit/media.test.ts
npx playwright test tests/e2e/release.spec.ts
```

Expected: FAIL until entity data, media semantics, and release gates are updated.

- [ ] **Step 3: Align visible content and structured data**

Expand Person data only with verified public facts. Use record-specific schema types only when the visible page supports them. Add `VideoObject` only for local clips with thumbnail, duration, upload/publication context, and accessible adjacent description. Preserve source attribution in visible HTML.

- [ ] **Step 4: Harden the production build gate**

Extend `verify-build.mjs` to:

- require all public work and note routes;
- reject a public media manifest entry with unsafe status;
- reject a missing derivative, missing poster, or asset above its configured budget;
- assert sitemap, RSS, robots, CNAME, canonical metadata, and 404 output;
- assert no `_media-source` path appears under `dist`.

- [ ] **Step 5: Document the editorial and deployment workflow**

Document how to add a career record, review media, run inspection/build scripts, mark `approval-enhanced` items, execute local verification, and deploy the static `dist` directory through GitHub Pages.

- [ ] **Step 6: Run the complete fresh verification suite**

Stop any stale dev server, rebuild, then run:

```bash
npm run check
npm test
npm run build
npm run test:build
npm run test:e2e
```

Expected:

- Astro check: zero errors and zero warnings.
- Vitest: all tests pass.
- Production build: all intended routes emitted.
- Build assertions: all pass.
- Playwright: desktop/mobile, JavaScript-disabled, keyboard, reduced-motion, and accessibility checks pass.

- [ ] **Step 7: Perform browser visual verification**

Open the fresh local production preview in the in-app Browser and verify:

- hero composition in light and dark modes;
- Atlas default, selected, filtered, keyboard, touch-sized, and reduced-motion states;
- representative media crops and clip loading;
- grouped work index and evidence-note pages;
- About narrative and contact paths;
- mobile layouts at narrow widths;
- no sensitive data appears in any selected media frame.

- [ ] **Step 8: Commit the release hardening**

```bash
git add src/layouts/BaseLayout.astro src/components/work/ProjectMedia.astro src/pages/notes scripts/verify-build.mjs tests README.md docs/deployment.md
git commit -m "feat: harden career atlas release"
```

---

## Plan Self-Review

### Spec coverage

- Career narrative, three eras, and six domains: Tasks 1, 3, and 4.
- Four practice pillars and conversion paths: Task 5.
- Drive media acquisition, optimization, provenance, privacy, and budgets: Task 2.
- Static semantic fallback and accessible interaction: Task 4.
- Expanded archive, About, and Substack-derived writing: Task 6.
- SEO/entities, performance, accessibility, GitHub Pages compatibility, and browser verification: Task 7.
- Approval-enhanced media cannot enter deployment without confirmation: Tasks 2 and 7.

### Placeholder scan

The plan contains no unresolved placeholders, inferred metrics, vague failure handling, or undefined cross-task functions. Every task names its files, interfaces, failing test, implementation behavior, verification command, and commit.

### Type consistency

- `RecordType`, `EvidenceStatus`, `CareerEra`, and `CareerDomain` originate in `src/content/evidence.ts`.
- `workSchema` is the only public content contract consumed by the Atlas, work index, and detail pages.
- `CAREER_MEDIA` is the only published-media manifest used by content validation and release checks.
- Atlas URL state consistently uses `career` and `domain` query parameters.
- Engagement paths consistently use `operator-advisory`, `product-collaboration`, and `speaking-writing`.

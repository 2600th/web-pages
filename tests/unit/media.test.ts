import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import sharp from 'sharp';
import { MEDIA_PROVENANCE } from '../../src/data/media-provenance';
import { CAREER_MEDIA } from '../../src/data/career-media';

function workMediaPaths() {
  const directory = join(process.cwd(), 'src/content/work');
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .flatMap((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      const data = parse(match[1]);
      const media = [data.heroMedia, data.out?.media, data.near?.media, data.inside?.media].filter(Boolean);
      return [...media.flatMap((item) => [item.src, item.avif, item.mp4, item.webm]), data.seo.socialImage]
        .filter((path): path is string => typeof path === 'string');
    });
}

function workEntries() {
  const directory = join(process.cwd(), 'src/content/work');
  return readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(directory, filename), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${filename} has no YAML frontmatter`);
      return parse(match[1]);
    });
}

describe('portfolio media', () => {
  it('keeps route-opening AVIF and WebP derivatives inside the fast-load budget', () => {
    const filenames = [
      'routes/work/ira-vr-v2-640.avif',
      'routes/work/ira-vr-v2-640.webp',
      'routes/work/ira-vr-v2-960.avif',
      'routes/work/ira-vr-v2-960.webp',
      'routes/work/spacecraft-pro-640.avif',
      'routes/work/spacecraft-pro-640.webp',
      'routes/work/spacecraft-pro-960.avif',
      'routes/work/spacecraft-pro-960.webp',
      'routes/work/designesto-ai-640.avif',
      'routes/work/designesto-ai-640.webp',
      'routes/work/designesto-ai-960.avif',
      'routes/work/designesto-ai-960.webp',
      'routes/notes/notes-aperture-640.avif',
      'routes/notes/notes-aperture-640.webp',
      'routes/notes/notes-aperture-960.avif',
      'routes/notes/notes-aperture-960.webp',
    ];

    for (const filename of filenames) {
      const absolute = join(process.cwd(), 'public', 'media', filename);
      expect(existsSync(absolute), filename).toBe(true);
      expect(statSync(absolute).size, filename).toBeLessThanOrEqual(180_000);
    }
  });

  it('ships a release-sized Latin variable font derivative', () => {
    const font = join(process.cwd(), 'public', 'fonts', 'mona-sans-latin.woff2');
    expect(existsSync(font)).toBe(true);
    expect(statSync(font).size).toBeLessThanOrEqual(200_000);

    const layout = readFileSync(join(process.cwd(), 'src', 'layouts', 'BaseLayout.astro'), 'utf8');
    const styles = readFileSync(join(process.cwd(), 'src', 'styles', 'global.css'), 'utf8');
    expect(layout).toContain('/fonts/mona-sans-latin.woff2');
    expect(styles).toContain('/fonts/mona-sans-latin.woff2');
  });

  it('keeps every referenced work medium local and traceable to provenance', () => {
    const paths = [...new Set(workMediaPaths())];
    expect(paths.length).toBeGreaterThanOrEqual(12);

    for (const path of paths) {
      expect(existsSync(join(process.cwd(), 'public', path))).toBe(true);
      expect(statSync(join(process.cwd(), 'public', path)).size, path).toBeLessThanOrEqual(2_200_000);
      const provenance = MEDIA_PROVENANCE[path];
      expect(provenance?.sourceUrl).toMatch(/^(https|generated):\/\//);
      expect([
        'public-repository',
        'authored-public-post',
        'public-approved',
        'public-corroborated',
        'approval-enhanced',
        'generated-identity',
        'generated-editorial',
      ]).toContain(provenance?.status);
    }
  });

  it('publishes only safe career derivatives within the public media budget', () => {
    for (const media of Object.values(CAREER_MEDIA)) {
      expect(['public-approved', 'public-corroborated', 'approval-enhanced']).toContain(media.status);
      for (const path of Object.values(media.derivatives)) {
        if (!path) continue;
        const absolute = join(process.cwd(), 'public', path);
        expect(existsSync(absolute)).toBe(true);
        expect(statSync(absolute).size).toBeLessThanOrEqual(2_200_000);
      }
    }
  });

  it('gives motion-backed cases local poster and clip derivatives', () => {
    for (const key of ['ira-vr', 'machine-hunter', 'oye-tippa-run']) {
      const media = CAREER_MEDIA[key];
      expect(media, key).toBeDefined();
      expect(media.derivatives.poster1280).toMatch(/^\/media\//);
      expect(media.derivatives.clipMp4).toMatch(/^\/media\/.+\.mp4$/);
    }
  });

  it('keeps generated identity art small, disclosed, and outside the evidence layer', () => {
    const directory = join(process.cwd(), 'public', 'media', 'generated', 'identity');
    const provenance = JSON.parse(readFileSync(join(directory, 'provenance.json'), 'utf8')) as {
      evidenceUse: boolean;
      classification: string;
      assets: Array<{ files: string[]; prompt: string }>;
    };

    expect(provenance.evidenceUse).toBe(false);
    expect(provenance.classification).toMatch(/generated identity/i);
    expect(provenance.assets[0]?.prompt).toContain('chroma green');
    for (const filename of provenance.assets[0]?.files ?? []) {
      expect(existsSync(join(directory, filename))).toBe(true);
      expect(statSync(join(directory, filename)).size, filename).toBeLessThanOrEqual(500_000);
      expect(existsSync(join(directory, `${filename}.json`)), `${filename} prompt sidecar`).toBe(true);
    }
  });

  it('keeps new character-world and defense art disclosed outside evidence', () => {
    const expected = [
      '/media/generated/editorial/defense-systems-atlas-v2.webp',
      '/media/generated/editorial/defense-systems-atlas-v2.avif',
      '/media/generated/editorial/blocks-design-production-v1.webp',
      '/media/generated/editorial/blocks-design-production-v1.avif',
      '/media/generated/identity/2600th-operator-diorama.webp',
      '/media/generated/identity/2600th-equipment-inventory.webp',
    ];
    const provenance = MEDIA_PROVENANCE as Record<
      string,
      { sourceUrl?: string; status?: string; evidenceUse?: boolean }
    >;

    for (const path of expected) {
      expect(existsSync(join(process.cwd(), 'public', path)), path).toBe(true);
      expect(statSync(join(process.cwd(), 'public', path)).size, path).toBeLessThanOrEqual(500_000);
      expect(existsSync(join(process.cwd(), 'public', `${path}.json`)), `${path} prompt sidecar`).toBe(true);
      expect(provenance[path]?.sourceUrl).toMatch(/^generated:\/\//);
      expect(provenance[path]?.status).toMatch(/^generated-/);
      expect(provenance[path]?.evidenceUse).toBe(false);
    }
  });

  it('keeps landing editorial posters optimized, disclosed, and outside project proof', () => {
    const expected = [
      'blocks-designesto-poster-v2',
      'ira-vr-poster-v2',
      'enterprise-xr-poster-v2',
    ];
    const directory = join(process.cwd(), 'public', 'media', 'generated', 'editorial', 'landing');
    const provenance = MEDIA_PROVENANCE as Record<
      string,
      { sourceUrl?: string; status?: string; evidenceUse?: boolean }
    >;

    for (const stem of expected) {
      for (const extension of ['webp', 'avif']) {
        const filename = `${stem}.${extension}`;
        const publicPath = `/media/generated/editorial/landing/${filename}`;
        expect(existsSync(join(directory, filename)), publicPath).toBe(true);
        expect(statSync(join(directory, filename)).size, publicPath).toBeLessThanOrEqual(500_000);
        expect(existsSync(join(directory, `${filename}.json`)), `${publicPath} prompt sidecar`).toBe(true);
        expect(provenance[publicPath]?.sourceUrl).toMatch(/^generated:\/\//);
        expect(provenance[publicPath]?.status).toBe('generated-editorial');
        expect(provenance[publicPath]?.evidenceUse).toBe(false);
      }
    }
  });

  it('gives every full case-study image a useful reader-facing caption', () => {
    const fullCases = workEntries().filter((entry) => ['feature', 'case'].includes(entry.recordType));
    const genericCaption = /^(out|near|inside)\s*·|project view|inside\s*·\s*system/i;

    for (const entry of fullCases) {
      for (const [slot, media] of [
        ['hero', entry.heroMedia],
        ['out', entry.out?.media],
        ['near', entry.near?.media],
        ['inside', entry.inside?.media],
      ] as const) {
        expect(media?.label, `${entry.slug} ${slot} caption`).toBeTypeOf('string');
        expect(media.label.trim().length, `${entry.slug} ${slot} caption`).toBeGreaterThanOrEqual(24);
        expect(media.label, `${entry.slug} ${slot} caption`).not.toMatch(genericCaption);
      }
    }
  });

  it('keeps Machine Hunter story beats visually distinct', () => {
    const entry = workEntries().find((candidate) => candidate.slug === 'machine-hunter');
    const posters = [entry.heroMedia.src, entry.out.media.src, entry.near.media.src, entry.inside.media.src];
    expect(new Set(posters).size).toBe(4);
  });

  it('keeps the revised Cycling Without Age editorial visual at the case-study media size', async () => {
    const expected = [
      '/media/generated/editorial/cycling-without-age-empathy-v3.webp',
      '/media/generated/editorial/cycling-without-age-empathy-v3.avif',
    ];
    const provenance = MEDIA_PROVENANCE as Record<
      string,
      { sourceUrl?: string; status?: string; evidenceUse?: boolean }
    >;

    for (const publicPath of expected) {
      const diskPath = join(process.cwd(), 'public', publicPath);
      expect(existsSync(diskPath), publicPath).toBe(true);
      expect(statSync(diskPath).size, publicPath).toBeLessThanOrEqual(500_000);
      expect(existsSync(`${diskPath}.json`), `${publicPath} prompt sidecar`).toBe(true);
      expect(provenance[publicPath]?.sourceUrl).toMatch(/^generated:\/\//);
      expect(provenance[publicPath]?.status).toBe('generated-editorial');
      expect(provenance[publicPath]?.evidenceUse).toBe(false);
      const metadata = await sharp(diskPath).metadata();
      expect({ width: metadata.width, height: metadata.height }).toEqual({ width: 1600, height: 900 });
    }

    const entry = workEntries().find((candidate) => candidate.slug === 'enterprise-immersive-systems');
    expect(entry.inside.media.src).toBe(expected[0]);
    expect(entry.inside.media.avif).toBe(expected[1]);
    expect(entry.inside.media.label).toBe(
      'Cycling Without Age Singapore · Three everyday scenarios structured the VR ageing-empathy journey.',
    );
  });
});

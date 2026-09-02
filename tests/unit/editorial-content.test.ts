import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { workSchema } from '../../src/content/schemas';

function record(slug: string) {
  const path = `src/content/work/${slug}.md`;
  expect(existsSync(path), `${slug} has a durable Work route`).toBe(true);
  const source = readFileSync(path, 'utf8');
  const [, frontmatter, body] = source.split(/^---\s*$/m);
  return { data: workSchema.parse(parse(frontmatter)), body };
}

describe('editorial Work contracts', () => {
  it('supports substantive narrative records without legacy four-image fields', () => {
    for (const slug of ['blocks', 'designesto', 'propvr-ai-craft']) {
      const { data } = record(slug);
      expect(data.recordType).toBe('narrative');
      expect(data.heroMedia?.label).toBeTruthy();
      expect('out' in data).toBe(false);
    }
  });

  it('keeps the combined URL available but outside the archive', () => {
    const { data, body } = record('blocks-inco-ai');
    expect(data.archive).toBe(false);
    expect(body).toContain('/work/blocks/');
    expect(body).toContain('/work/designesto/');
  });

  it('keeps Designesto standalone with truthful context and roadmap boundaries', () => {
    const { data, body } = record('designesto');
    expect(`${data.title} ${data.summary}`).not.toMatch(/Interior Company|Square Yards|launching in 2026/i);
    expect(data.context).toBe('Built as part of my current product leadership work');
    expect(body).toMatch(/costing.*roadmap/i);
  });

  it('preserves Craft contribution credit without freezing current counts in the narrative', () => {
    const { body } = record('propvr-ai-craft');
    expect(body).toContain('Initial PropVR AI MVP: Pranshul Chandhok. Current Craft platform: PropVR Technology team.');
    expect(body).toContain('22 specialist tools');
    expect(body).not.toMatch(/30\+|six studios|three studios|Agentic 1\.0/);
  });
});

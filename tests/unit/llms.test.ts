import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../../src/data/llms';

const project = {
  slug: 'sample-project', title: 'Sample project', summary: 'A public project summary.', careerOrder: 1, yearStart: 2020,
};
const note = {
  slug: 'sample-note', title: 'Sample note', summary: 'A public note summary.',
  publishedAt: new Date('2026-01-01'), draft: false,
};

describe('LLM discovery guide', () => {
  it('excludes compatibility projects and starts with the selected systems', () => {
    const output = buildLlmsTxt([
      { ...project, slug: 'blocks-inco-ai', archive: false },
      { ...project, slug: 'old-project', yearStart: 2010 },
      { ...project, slug: 'designesto', yearStart: 2026 },
      { ...project, slug: 'blocks', yearStart: 2024 },
    ], []);
    expect(output).not.toContain('/blocks-inco-ai/');
    expect(output.indexOf('/blocks/')).toBeLessThan(output.indexOf('/designesto/'));
    expect(output.indexOf('/designesto/')).toBeLessThan(output.indexOf('/old-project/'));
    expect(output).toContain('/lab/dwarkesh-jensen/index.html');
  });
  it('publishes summaries without serializing private fields or draft notes', () => {
    const withInternalFields = { ...project, reviewedEvidence: 'PRIVATE_RECORD', body: 'PRIVATE_BODY', visibility: 'approval-enhanced' };
    const draft = { ...note, slug: 'draft-note', title: 'DRAFT_TITLE', summary: 'DRAFT_SUMMARY', draft: true };
    const output = buildLlmsTxt([withInternalFields], [note, draft]);

    expect(output).toContain('[Sample project](https://www.2600th.com/work/sample-project/): A public project summary.');
    expect(output).toContain('[Sample note](https://www.2600th.com/notes/sample-note/): A public note summary.');
    expect(output).not.toMatch(/PRIVATE_|DRAFT_|draft-note|approval-enhanced/);
  });

  it('keeps changed titles and summaries on one safe Markdown list line', () => {
    const output = buildLlmsTxt([{ ...project, title: 'Room [B] \\ test', summary: 'Updated *details*.\n\n## Not a section\n[link](https://example.com)' }], []);
    expect(output).toContain('- [Room \\[B\\] \\\\ test](https://www.2600th.com/work/sample-project/): Updated \\*details\\*. \\#\\# Not a section \\[link\\]\\(https://example.com\\)');
    expect(output).not.toContain('\n## Not a section');
  });

  it('orders projects chronologically and notes newest first without mutating collections', () => {
    const work = [{ ...project, slug: 'recent-project', careerOrder: 3 }, { ...project, slug: 'early-project', careerOrder: 1 }];
    const notes = [{ ...note, slug: 'old-note' }, { ...note, slug: 'new-note', publishedAt: new Date('2026-02-01') }];
    const output = buildLlmsTxt(work, notes);
    expect(output.indexOf('/early-project/')).toBeLessThan(output.indexOf('/recent-project/'));
    expect(output.indexOf('/new-note/')).toBeLessThan(output.indexOf('/old-note/'));
    expect(work[0].slug).toBe('recent-project');
    expect(notes[0].slug).toBe('old-note');
    expect(output).toBe(buildLlmsTxt(work, notes));
  });
});

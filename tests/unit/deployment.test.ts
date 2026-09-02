import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import playwright from '../../playwright.config';

describe('main-only GitHub Pages deployment', () => {
  it('validates the site before deploying a dist-only artifact from main', () => {
    const path = '.github/workflows/pages.yml';
    expect(existsSync(path)).toBe(true);
    const workflow = parse(readFileSync(path, 'utf8'));
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on).toHaveProperty('workflow_dispatch');
    expect(workflow.permissions).toEqual({ contents: 'read' });
    const steps = workflow.jobs.build.steps;
    const verification = steps.findIndex((step: { run?: string }) => step.run === 'npm run verify');
    const upload = steps.findIndex((step: { uses?: string }) => step.uses?.startsWith('actions/upload-pages-artifact@'));
    expect(verification).toBeGreaterThan(-1);
    expect(upload).toBeGreaterThan(verification);
    expect(steps[upload].with.path).toBe('dist');
    expect(workflow.jobs.deploy.needs).toBe('build');
    expect(workflow.jobs.deploy.permissions).toEqual({ 'pages': 'write', 'id-token': 'write' });
    expect(workflow.jobs.deploy.environment.name).toBe('github-pages');
    for (const step of [...steps, ...workflow.jobs.deploy.steps]) {
      if (step.uses) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
    }
  });

  it('starts the same browser test server on Windows and Linux', () => {
    expect(playwright.webServer).toMatchObject({
      command: 'npx astro dev --host=127.0.0.1 --port=4321',
      env: { ASTRO_DEV_BACKGROUND: '0' },
    });
  });
});

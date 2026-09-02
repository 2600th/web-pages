import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

export function discoveryEntry(data, history) {
  if (data.draft) return undefined;
  const value = data.updatedAt ?? (history.clean ? history.gitDate : undefined);
  if (!value || Number.isNaN(new Date(value).valueOf())) return {};
  return { lastmod: new Date(value).toISOString().slice(0, 10) };
}

// A dirty/untracked file's previous commit cannot date its current content.
function historyFor(root, path) {
  const file = relative(root, path).replaceAll('\\', '/');
  try {
    const options = { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
    const status = execFileSync('git', ['status', '--porcelain', '--', file], options).trim();
    if (status) return { clean: false };
    const gitDate = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], options).trim();
    return { clean: Boolean(gitDate), gitDate };
  } catch { return {}; }
}

export function loadDiscoveryMetadata(root) {
  const entries = new Map();
  for (const collection of ['work', 'notes']) {
    const directory = join(root, 'src/content', collection);
    for (const file of readdirSync(directory).filter(file => file.endsWith('.md'))) {
      const path = join(directory, file);
      const data = parse(readFileSync(path, 'utf8').split(/^---\s*$/m)[1]);
      entries.set(`/${collection}/${data.slug}/`, discoveryEntry(data, historyFor(root, path)));
    }
  }
  // Aggregate/index/template pages have no explicit editorial date. Omit unknowns.
  return entries;
}

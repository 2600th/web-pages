# GitHub Pages deployment

## Recommended topology

- `main`: Astro source, content, tests, and design documentation.
- `gh-pages`: generated contents of `dist/` only.
- GitHub Pages setting: **Deploy from a branch → `gh-pages` → `/ (root)`**.
- Custom domain: `www.2600th.com`; the generated output retains `CNAME` and `.nojekyll`.

This works on a free GitHub account for the existing public repository. The build happens locally; no paid hosting or server runtime is required.

## First release

The repository historically used `gh-pages` as both its default branch and the published website. Before the first redesign release:

1. Preserve the approved Astro source on a new `main` branch and push it.
2. In GitHub repository settings, make `main` the default branch.
3. Keep Pages configured to publish `gh-pages` from the branch root.
4. Confirm the worktree is clean and `main` contains the reviewed release.
5. Run `npm ci`, then `npm run verify`.
6. Run `npm run deploy` only after explicit release approval.

`npm run deploy` repeats the complete verification, builds locally, and uses the pinned `gh-pages` package to publish only `dist/` to `origin/gh-pages`. It does not modify the checked-out source branch.

## Post-deploy checks

- `https://www.2600th.com/` identifies Pranshul Chandhok and exposes the contact path.
- `/work/kinema/`, `/notes/`, `/about/`, and `/lab/` resolve.
- `/lab/terminal/` opens the preserved console and its return link works.
- `/robots.txt`, `/rss.xml`, and `/sitemap-index.xml` resolve.
- GitHub Pages reports the custom domain and HTTPS as healthy.

## Rollback

Do not rewrite the source branch. Identify the last known-good `gh-pages` deployment commit, restore that generated tree on `gh-pages`, and push it with `--force-with-lease`. The prior console is also preserved inside every new release at `/lab/terminal/`, so its assets do not depend on the rollback.

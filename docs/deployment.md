# GitHub Pages deployment

The approved release consolidates source on `main` and deploys through `.github/workflows/pages.yml`. Local development and preview do not publish. Production success must still be confirmed separately from source configuration.

## Source and output

- `main` holds reviewed Astro source, content, tests and documentation and is the repository default branch.
- The workflow installs the lockfile on Node 24, installs Chromium and runs the complete `npm run verify` gate before uploading only `dist/`.
- Pages uses **GitHub Actions** as its publishing source. No generated-output branch is needed. The `github-pages` environment permits deployment from `main`.
- The configured custom domain is `www.2600th.com`; the build must retain `CNAME` and `.nojekyll`.

Pushes to `main` and manual **Run workflow** requests trigger publication. The build job has read-only source access; only the dependent deployment job receives Pages/OIDC write permissions. Action references are pinned to commit SHAs. This follows the official [GitHub custom-workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Astro deployment guidance](https://docs.astro.build/en/guides/deploy/github/).

## Release checklist

1. Confirm the approved source checkout and commit, the remote repository, and the intended publishing branch. Preserve unrelated work and resolve any uncommitted release changes through review rather than deploying an ambiguous working tree.
2. Confirm explicit approval to publish the reviewed release. Review all `approval-enhanced` content/media and public provenance sidecars; those metadata values do not automatically exclude assets from the build. `_media-source/` and private research must remain outside the published output.
3. Record the current known-good source revision and successful Pages workflow run, and retain a recoverable copy of its generated deployment artifact before replacing it. This workflow does not use a `gh-pages` branch.
4. For a fresh independent checkout, install the lockfile with `npm ci` and ensure Playwright Chromium is available. Do not install or upgrade packages in a recovery checkout that intentionally shares locked dependencies. Identify the owner and source root of any existing preview before reusing it. Never stop another task's server. A temporary ignored Playwright config can target the owned preview via `baseURL` without a `webServer` stanza.
5. Run `npm run verify`. This covers Astro diagnostics, unit and browser tests, the production build, and generated-artifact checks. Separately inspect the affected pages in a browser; passing tests are not visual, confidentiality, or publication approval.
6. Inspect the production preview with `npm run preview`, then commit the approved source to `main` and publish:

   ```powershell
   git push origin main
   ```

Watch **Verify and deploy portfolio** in GitHub Actions until both build and deployment succeed for the intended commit. To redeploy an unchanged commit, use **Run workflow** on `main`. The old `npm run deploy` shortcut was removed to prevent recreating `gh-pages`; the retained legacy publisher package is not invoked. Media regeneration is separate and should run only when required; see [media.md](media.md).

## Post-deploy checks

Verify the deployed release separately from the local build:

- The homepage shows the Velvet introduction, five selected projects, Home / Work / Notes / Lab / About navigation, and a working email contact path.
- `/work/`, representative project pages such as `/work/ira-vr/` and `/work/homelane-spacecraft-pro/`, and `/work/domain/xr/` resolve with images and source links.
- `/notes/`, a note detail page, `/about/`, and `/lab/` resolve. Check responsive opening media and Back to top behavior on a long page.
- Video remains poster-first until Play; keyboard navigation and reduced-motion presentation remain usable.
- `/lab/terminal/index.html` opens the preserved console, retains `noindex,follow`, and its return link works.
- `/lab/dwarkesh-jensen/index.html` opens the unofficial companion, with search, keyboard navigation, timestamp links and a return to Lab. The exact file URL is its canonical and sole sitemap entry.
- Separate Blocks, Designesto and Craft pages retain truthful contribution boundaries. The old combined URL remains useful and self-canonical but does not reappear in the main archive or LLM project guide. Eight typed Notes retain dates, source links and reciprocal Work navigation.
- `/robots.txt`, `/llms.txt`, `/rss.xml`, `/sitemap-index.xml`, and the referenced child sitemap resolve with appropriate content types, and metadata refers to the intended custom domain. See [discovery.md](discovery.md) for policy and generation details.
- GitHub Pages reports the expected deployment, custom domain, and HTTPS state. Check asset responses and caches if live output differs from the approved build.

There is no lint script in this package. `npm run check` is the Astro/TypeScript diagnostic gate, not a claimed lint run. After approved publication, the owner can submit the sitemap and use Google Search Console URL Inspection. Access, indexing requests, real-user performance data and search results are owner/manual follow-ups, not outcomes established by local tests.

## Rollback

Rollback is a separate external write and requires approval for the exact target release. Do not rewrite the source branch or assume force-pushing is necessary.

First record the failed deployment revision and preserve its artifact for diagnosis. Identify the known-good source revision and prefer a reviewed revert commit on `main`, followed by the same verification/deployment workflow. Preserve `CNAME` and `.nojekyll`. Do not recreate a generated-output branch or disable verification to force a failed release through.

If the remote has moved, permissions differ, or the recovery would require history rewriting, stop and review the situation rather than forcing it. Re-run the post-deploy checks after recovery. The console archive is a retained route, not a substitute for a release rollback.

Before branch/worktree cleanup, retain a verified Git bundle and copy unique private review material outside the repository. The bundle preserves deleted branch tips, but not ignored or uncommitted files. Preserve media masters and the main checkout's dependency installation.

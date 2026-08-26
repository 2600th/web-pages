# Pranshul Chandhok / 2600th

The source for [www.2600th.com](https://www.2600th.com): a static Astro portfolio for Pranshul Chandhok’s product, AI, real-time 3D, and spatial-systems work.

## Local development

```powershell
npm ci
npm run dev
```

`npm run verify` runs Astro diagnostics, unit tests, browser journeys, the production build, and generated-artifact checks.

## Publishing

The site remains compatible with a free GitHub account. Source lives on a source branch; the locally generated `dist/` directory is published to the repository’s `gh-pages` branch.

```powershell
npm run deploy
```

That command pushes generated files. Do not run it for a preview. See [docs/deployment.md](docs/deployment.md) for the first-release branch migration, GitHub Pages settings, verification, and rollback procedure.

The original console portfolio is preserved at `/lab/terminal/` and marked `noindex,follow`.

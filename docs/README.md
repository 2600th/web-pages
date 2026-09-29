# Documentation map

- [Repository README](../README.md): the current site, local commands and source layout.
- [Design system: Signal](../DESIGN.md): tokens, components, motion and the do's and don'ts every page follows.
- [Product](../PRODUCT.md): audience, positioning, evidence rules and information architecture.
- [Media and provenance](media.md): originals versus derivatives, generated versus authentic media, regeneration and review.
- [Search and AI discovery](discovery.md): robots policy, sitemaps, RSS, the LLM guide and validation.
- [Deployment](deployment.md): release approval, verification, post-deploy checks and rollback.
- [AI-game thesis claim ledger](ai-game-thesis-claim-ledger.md): the original 2023 claims, primary-source research and review boundaries behind the three-years-later essay.

The running source is the final word on behaviour: `src/layouts/SiteLayout.astro`, the Signal components and styles, the content schemas, scripts and tests. Documentation is not proof of a live deployment or a passing test run.

The local-only, gitignored `research/` folder holds dated content research. Keep private research and source masters out of Git, `public/` and the generated site.

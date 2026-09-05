# Documentation map

Start with the maintained guides:

- [Repository README](../README.md): current site, local commands, and source layout.
- [Design guidance](../DESIGN.md): current presentation and interaction rules.
- [Approved layout integration](approved-layout-integration-report.md): Orbital hero, editorial gallery, project reading and release verification from 6 September 2026.
- [Visual and content refinement report](visual-content-refinement-report.md): the September 2026 visual pass, review dispositions, verification and source-dependent follow-ups.
- [Media and provenance](media.md): originals, generated versus authentic media, regeneration, and publication review.
- [Search and AI discovery](discovery.md): robots policy, generated sitemaps, RSS, the optional LLM guide, and validation.
- [Deployment](deployment.md): explicit release approval, verification, and recoverable rollback.
- [Editorial update report](editorial-update-report.md): implemented routes, article/source boundaries, exclusions, measured verification and remaining manual steps.
- [Live-audit update report](live-audit-update-report.md): reviewer fixes, measured content lengths, responsive figures and conditional follow-ups.
- [Follow-up editorial report](follow-up-editorial-report.md): the September 2026 reassessment, historical-source preservation, release checks and owner-only follow-ups.
- [AI-game thesis claim ledger](ai-game-thesis-claim-ledger.md): the original 2023 claims, primary-source research and pre-draft review boundaries for the new essay.

The current implementation is the final check for behavior: `src/pages/index.astro` composes `VelvetHero` and `VelvetHomeSections`; shared layout, content schemas, scripts, and tests define the rest of the running site. Documentation is not proof of a live deployment or a passing test run.

## Historical and supporting material

`superpowers/specs/` and `superpowers/plans/` contain dated design decisions and implementation plans. They intentionally retain earlier homepage directions, superseded controls, and past acceptance criteria. Read them as history; do not reintroduce old behavior merely because a historical checklist asks for it.

`design/references/` retains earlier visual studies. The local-only, Git-ignored `research/` folder contains dated content-scope research and corrections, not current deployment instructions or permission to publish underlying source material. Keep private research and source masters out of Git, `public/` and the generated site; retain them in the local recovery backup when removing worktrees.

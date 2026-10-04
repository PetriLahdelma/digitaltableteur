# Storybook presentation — isolated refinement

## Baseline and ownership

- Source: `main-work` at `fffd5bfafcd7a70f38d85b4c5b546cd72efc4b16`, also confirmed with `git ls-remote origin refs/heads/main` on 2026-10-04.
- Active development checkout: `.claude/worktrees/contract-design-systems-research-20d0d0`; clean at inspection. The repository root is the older `DT-A11Y-wcag22-remediation` checkout and is not the baseline.
- Implementation is isolated in the Codex-managed `dt-storybook-presentation` worktree, branch `DT-SB-polished-presentation`. No shared dependency/cache directories, no stale-process cleanup scripts, no push/merge.
- No local Storybook listener was present at baseline inspection. The public site's `/storybook/` returned its 404 page. Render and catalogue evidence will come from the verified baseline locally.

## Visual authority and invariants

The production site and `variables.css` establish Satoshi as the single typeface, chartreuse (`--logo-background`, light) for the original mark, dark neutral surfaces, and a restrained editorial scale. Preserve `public/storybook_logo.svg`, all original artwork, favicons and font files byte-for-byte. Do not add substitute illustrations or import another company's design decisions.

This is a Read/Operate surface, not a marketing redesign. Existing custom contract docs, lifecycle badges, review evidence, source transform, implementation switch, annotations, theme/locale/forced-colors controls and interactions remain authoritative. Story exports, contracts, IDs, URLs and categories remain unchanged. The inventory freezes every public asset, font, story, MDX and contract plus the rendered index.

## Implementation sequence

1. Capture baseline index, asset/source hashes and rendered screenshots.
2. Refine manager theme and scoped manager CSS: original mark, chartreuse accents, readable text, selected/hover/focus/open states, calmer sidebar/search/panels.
3. Refine existing docs blocks: responsive masthead, reading rhythm, code/API tables and in-iframe section navigation. Keep selectors out of `.sb-story`/`.docs-story`; do not alter demonstrated component CSS or globals. Preserve explicit story layout intent in framing.
4. Build and verify catalogue/asset identity, desktop/narrow states, font loading, all four themes, Playground, section links and representative form/table/overlay/full-page examples. Run local type/lint/unit/build gates; report pre-existing failures without changing tests.
5. Review source diff and create one focused Conventional/Lore commit. Retain local built preview and screenshots.

## Acceptance evidence

Recorded in [the verification report](../reports/2026-10-04-storybook-presentation.md). No claim of full WCAG conformance is inferred from presentation checks.

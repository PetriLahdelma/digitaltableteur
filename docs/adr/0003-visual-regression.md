# ADR 0003: Self-hosted visual regression

## Status
Accepted

## Decision
Use `@storybook/test-runner` + Playwright + pixelmatch. Baselines in `__visual__/snapshots/__reference__/`. No Chromatic.

# Public API - npm-served design system

Digitaltableteur serves its design-system runtime through private npm packages
under the `@digitaltableteur` scope. The local `@dt/*` alias remains an internal
source-authoring convenience for this monorepo; package consumers should import
from the published package entrypoints.

## Packages

| Package | Purpose | Current role |
|---|---|---|
| `@digitaltableteur/react` | React components, stable patterns, hooks, host adapters, package CSS | Runtime package for app and Storybook consumers |
| `@digitaltableteur/web-components` | Framework-neutral custom elements with hybrid React/native registration modes | Prepared for its first cross-framework package release |
| `@digitaltableteur/tokens` | DTCG JSON, JS token map, Tailwind refs, manifest | Machine-readable token package |
| `@digitaltableteur/tokens-css` | Token CSS and generated brand theme CSS | Runtime CSS token package for second consumers |

The site/root install depends on the React and token packages from npm. The Web
Components package is a separate distribution and is not a marketing-site
runtime dependency. Local `packages/*` folders remain the source used by build,
pack, dry-run, and publish checks, but they are not npm workspaces for the app
install.

## Import Surface

External consumers:

```ts
import { Button, Card, Stack, Text, Title } from "@digitaltableteur/react";
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/react/style.css";
```

Local source files may still use direct `@dt/<Name>` imports when composing
components inside the monorepo. App/provider code that is intentionally testing
the package boundary should import from `@digitaltableteur/react`.

| Rule | Detail |
|---|---|
| Package entrypoint | `@digitaltableteur/react` plus `@digitaltableteur/react/style.css` |
| Token entrypoints | `@digitaltableteur/tokens`, token JSON subpaths, and `@digitaltableteur/tokens-css/tokens.css` |
| Internal alias | `@dt/<ComponentName>` maps to local shared source only |
| Agent manifest | `nextjs-app/shared/foundations/dist/agent-manifest.json` |
| Non-catalog surfaces | `non-agent-surfaces.json` - page assemblies and exempt infra; see [CATALOG-POLICY.md](./CATALOG-POLICY.md) |

## Package Boundary

`@digitaltableteur/react` is deliberately narrow. It exports true design-system
primitives, stable reusable patterns, framework adapters, and runtime hooks.

Do not put product/page code, portfolio case-study content, chat workflows,
booking utilities, maps, CV/download utilities, or docs-only Storybook metadata
into the React package. Those remain app or documentation surfaces.

If another package split becomes necessary, the next candidate is a separate
docs/metadata package for Storybook registry data and agent-facing manifests.
That package should be downstream of the runtime packages and must not become a
back door for app-specific code.

## Stability Tiers

Contract `status` in `<Component>.contract.json` remains the semantic boundary
for package eligibility.

| Status | Package policy | Breaking changes | Promotion gate |
|---|---|---|---|
| `alpha` | Internal catalog only; not exported from `@digitaltableteur/react` | Allowed | Contract + spec only |
| `beta` | Export only when specifically curated and consumer-safe | Additive only; deprecate with explicit flags | Stories, MDX, axe gate, forced-colors story |
| `stable` | Required package surface | Breaking props/layout require ADR + consumer update | AT snapshots, production `consumers[]`, Figma node-id |
| `deprecated` | Frozen until removal window closes | No new use | Listed with replacement metadata |

`check:react-public-surface` enforces the curated package surface and keeps
alpha exposure at zero. `check:react-public-api` freezes the runtime exports and
package subpath entrypoints in `packages/react/public-api.manifest.json`.

## Registry Guards

Use these before claiming the app or Storybook is consuming registry packages:

```bash
npm run check:package-registry-resolution
npm run check:storybook-registry-package
npm run check:registry-token-install
npm run check:react-registry-install
```

`check:package-registry-resolution` fails if root installs resolve
`@digitaltableteur/react`, `@digitaltableteur/tokens`, or
`@digitaltableteur/tokens-css` from local `packages/*` paths or workspace
symlinks. `check:storybook-registry-package` applies the same principle to the
Storybook smoke story and package CSS imports.

## Publish Gate

The React package publish path is intentionally split:

1. Local machines remain the CI-quality authority.
2. `npm run check:react-publish-ready` runs the full local publish readiness gate.
3. `.github/workflows/ds-publish.yml` is the GitHub Actions OIDC transport for
   npm Trusted Publisher publishing.
4. A successful non-dry-run React publish must be followed by
   `npm run check:react-registry-install` and package-boundary dogfood checks.

The workflow must stay OIDC-only. Do not add `NPM_TOKEN` or `NODE_AUTH_TOKEN` to
publish steps. The read-only `NPM_READ_TOKEN` secret is only for installing
private packages during `npm ci` and post-publish registry smoke checks.

## Verification Commands

```bash
npm run check:astryx-roadmap
npm run check:react-public-surface
npm run check:react-public-api
npm run check:package-release-notes
npm run check:package-tarballs
npm run check:package-publish-dry-run
npm run check:site-package-dogfood
npm run check:react-publish-ready
```

For package consumption details, see
[npm-consumer-setup.md](./design-system/npm-consumer-setup.md).

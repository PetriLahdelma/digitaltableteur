# Digitaltableteur npm Consumer Setup

Status: the design-system package sources live in this repository, but the app
install consumes the published private npm packages through `node_modules`.

Packages:

- `@digitaltableteur/tokens`: DTCG JSON, JS token map, Tailwind token export, and manifest.
- `@digitaltableteur/tokens-css`: theme-complete token CSS, including brand theme files.
- `@digitaltableteur/react`: React components, host adapters, hooks, and package CSS.

## Install

This repository redirects npm to `.npm-userconfig` so unrelated machine-wide
registry settings do not leak into installs. The committed `.npm-userconfig`
must stay non-secret. For local private-registry checks, point npm at a private
userconfig that is not committed:

```bash
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npm install
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npm run check:registry-token-install
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npm run check:react-registry-install
```

External consumers can use a normal npm login instead:

```bash
npm config set @digitaltableteur:registry https://registry.npmjs.org/
npm login --scope=@digitaltableteur --registry=https://registry.npmjs.org/
npm install @digitaltableteur/tokens @digitaltableteur/tokens-css @digitaltableteur/react
```

The GitHub Trusted Publisher workflow uses OIDC for `npm publish`. Because the
root app dogfoods private registry packages, that workflow also needs a
read-only `NPM_READ_TOKEN` secret for `npm ci` and post-publish registry smoke
reads. Do not use that token for publish steps.

If the OIDC exchange fails with `OIDC token exchange error - package not found`
while `npm view @digitaltableteur/react` can still read the package, treat it as
an npm Trusted Publisher match failure, not as a missing package or missing npm
token. The npm package access page must match the GitHub claims exactly:

```text
Publisher: GitHub Actions
Organization or user: PetriLahdelma
Repository: digitaltableteur
Workflow filename: ds-publish.yml
Environment name: leave blank
Allowed actions: Allow npm publish
```

The same configuration can be inspected and repaired through npm's official
Trusted Publisher CLI when the npm auth session is allowed to manage trust
relationships:

```bash
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npx npm@11.18.0 trust list @digitaltableteur/react --json
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npx npm@11.18.0 trust github @digitaltableteur/react --repo PetriLahdelma/digitaltableteur --file ds-publish.yml --allow-publish --dry-run --json
NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npx npm@11.18.0 trust github @digitaltableteur/react --repo PetriLahdelma/digitaltableteur --file ds-publish.yml --allow-publish --yes
```

If normal package access is `read-write` but `npm trust list` or
`npm trust github` returns `403 Forbidden` for
`/-/package/@digitaltableteur%2freact/trust`, the token/session cannot manage
Trusted Publisher records. Use an npm auth session that satisfies npm trust
requirements: npm 11.15.0 or newer, write access to the package, account-level
2FA, and a supported auth method.

This monorepo follows the same shape. The root `package.json` depends on the
published packages and intentionally does not declare `packages/*` as npm
workspaces. The source package directories are still used by package build,
pack, dry-run, and publish checks.

## Required CSS

Import token CSS before component CSS once at the app root:

```tsx
import "@digitaltableteur/tokens-css/tokens.css";
import "@digitaltableteur/react/style.css";
```

The Digitaltableteur site still owns its production token globals in
`app/globals.css` through `nextjs-app/shared/styles/variables.css` for exact
visual continuity. Second consumers should use
`@digitaltableteur/tokens-css/tokens.css` unless they intentionally provide an
equivalent token contract themselves.

## Host Adapters

The React package is framework-agnostic. Components fall back to browser
behavior when no provider is installed, but production apps should inject host
runtimes at the root.

```tsx
import {
  ImageProvider,
  LayerProvider,
  LinkProvider,
  NavigationProvider,
  TranslationProvider,
} from "@digitaltableteur/react";
```

Provider responsibilities:

- `LinkProvider`: injects router links such as `next/link`; fallback is `<a>`.
- `ImageProvider`: injects optimized images such as `next/image`; fallback is `<img>`.
- `LayerProvider`: optionally injects the DOM root for portals; fallback is `document.body`.
- `NavigationProvider`: injects pathname and push/replace behavior; fallback uses `window.location`.
- `TranslationProvider`: injects translation and locale runtime; fallback is English package defaults.
- `ToastRuntimeProvider` and `AnimationRuntimeProvider`: optional app services for toasts and motion state.

## Registry Guards

Use these checks before and after package work:

```bash
npm run check:package-registry-resolution
npm run check:registry-token-install
npm run check:react-registry-install
```

`check:package-registry-resolution` proves the app/root install resolves
`@digitaltableteur/react`, `@digitaltableteur/tokens`, and
`@digitaltableteur/tokens-css` from registry `node_modules` entries, not local
workspace symlinks.

## Next Package Split

Keep `@digitaltableteur/react` limited to true design-system primitives, stable
patterns, hooks, and host adapters. Do not move product/page code, portfolio
case-study content, chat workflows, booking utilities, maps, or docs-only
Storybook metadata into the React package.

If the package surface needs another split, the next candidate is a separate
docs/metadata package for Storybook registry data and agent-facing manifests.
That split should stay downstream of the runtime packages and must not become a
back door for app-specific code.

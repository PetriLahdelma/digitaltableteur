# npm registry consumption

Digitaltableteur design-system packages are private npm packages under the
`@digitaltableteur` organization:

- `@digitaltableteur/react`
- `@digitaltableteur/tokens`
- `@digitaltableteur/tokens-css`

The app consumes these packages from the npm registry. Local package verification
still builds from `packages/*` so release checks can prove the source package
before publish.

## Install auth

Private package installs require npm read auth on clean machines. This repo keeps
machine-wide npm config isolated through `.npmrc` and `.npm-userconfig`; provide
a read-only npm token through `NPM_TOKEN` for local installs.

GitHub workflows map either `NPM_READ_TOKEN` or `NPM_TOKEN` into the install
environment. The token is for `npm ci` only. Publish steps must not receive npm
token env; `npm publish` uses GitHub Actions OIDC Trusted Publisher auth.

## Package boundary

`@digitaltableteur/react` contains reusable design-system primitives, host
adapters, providers, and hooks. It must not absorb Digitaltableteur product/app
composition such as site chrome, portfolio pages, blog surfaces, booking/CV
utilities, chat, maps, or route-specific layouts.

## Next split

Do not create another runtime package yet. The next likely split is documentation
metadata, not UI runtime: a package such as `@digitaltableteur/docs` only becomes
useful when a second consumer needs the docs registry, Storybook metadata, or MCP
payloads outside this repo. Until then, those artifacts stay repo-local and are
validated by the existing design-system guards.

#!/usr/bin/env bash
set -euo pipefail

# Installs must use a READ token: the publish path is OIDC-only and install
# auth must never share a publish-capable token. The Vercel project currently
# provides NPM_TOKEN (2026-07-09); accept it as a DEPRECATED fallback until the
# rotated token lands as NPM_READ_TOKEN, then delete this fallback.
token="${NPM_READ_TOKEN:-}"
if [ -z "$token" ] && [ -n "${NPM_TOKEN:-}" ]; then
  echo "::warning::Using deprecated NPM_TOKEN for installs — rename the Vercel env var to NPM_READ_TOKEN (granular, read-only) and remove NPM_TOKEN."
  token="$NPM_TOKEN"
fi

if [ -z "$token" ]; then
  echo "::error::NPM_READ_TOKEN is required to install private @digitaltableteur packages."
  exit 1
fi

umask 077
if [ -n "${VERCEL_NPM_USERCONFIG:-}" ]; then
  npm_userconfig="$VERCEL_NPM_USERCONFIG"
else
  npm_userconfig="$(mktemp "${TMPDIR:-/tmp}/digitaltableteur-vercel-npmrc.XXXXXX")"
  trap 'rm -f "$npm_userconfig"' EXIT
fi

cat > "$npm_userconfig" <<EOF
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${token}
legacy-peer-deps=true
EOF

NPM_CONFIG_USERCONFIG="$npm_userconfig" npm ci

#!/usr/bin/env bash
set -euo pipefail

# Read token only: the publish path is OIDC-only and must never share auth
# with installs, so NPM_TOKEN is intentionally NOT accepted here.
token="${NPM_READ_TOKEN:-}"

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

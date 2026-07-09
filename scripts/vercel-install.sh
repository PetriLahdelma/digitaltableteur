#!/usr/bin/env bash
set -euo pipefail

token="${NPM_READ_TOKEN:-${NPM_TOKEN:-}}"

if [ -z "$token" ]; then
  echo "::error::NPM_TOKEN or NPM_READ_TOKEN is required to install private @digitaltableteur packages."
  exit 1
fi

npm_userconfig="${VERCEL_NPM_USERCONFIG:-${TMPDIR:-/tmp}/digitaltableteur-vercel-npmrc}"

cat > "$npm_userconfig" <<EOF
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${token}
legacy-peer-deps=true
EOF

NPM_CONFIG_USERCONFIG="$npm_userconfig" npm ci

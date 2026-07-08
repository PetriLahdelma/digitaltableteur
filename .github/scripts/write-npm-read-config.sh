#!/bin/bash
# Writes a temporary npm userconfig for installing private @digitaltableteur packages.
# Publishing still uses npm Trusted Publisher OIDC; this token is read-only install auth.
set -euo pipefail

if [ -z "${NPM_READ_TOKEN:-}" ]; then
  echo "::error::NPM_READ_TOKEN secret is required to install private @digitaltableteur packages."
  exit 1
fi

if [ -z "${RUNNER_TEMP:-}" ]; then
  echo "::error::RUNNER_TEMP is not set."
  exit 1
fi

cat > "$RUNNER_TEMP/npm-read.npmrc" <<EOF
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_READ_TOKEN}
EOF

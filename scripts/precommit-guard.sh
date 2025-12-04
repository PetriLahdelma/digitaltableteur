#!/usr/bin/env bash
set -euo pipefail

# Guard against adding files under the wrong path: /shared/components
# Correct location is: nextjs-app/shared/components

changed_files=$(git diff --cached --name-only)

violations=()
while IFS= read -r f; do
  if [[ "$f" == shared/components/* ]]; then
    violations+=("$f")
  fi
done <<< "$changed_files"

if [[ ${#violations[@]} -gt 0 ]]; then
  echo "\n[PRE-COMMIT GUARD] Detected files staged under /shared/components:" >&2
  for v in "${violations[@]}"; do
    echo "  - $v" >&2
  done
  echo "\nPlease move components to nextjs-app/shared/components/<ComponentName>/ and export via index.ts for @dt/<ComponentName>." >&2
  echo "Commit blocked." >&2
  exit 1
fi

exit 0

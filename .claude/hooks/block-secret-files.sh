#!/usr/bin/env bash
# PreToolUse hook: block edits to env and MCP config unless user explicitly approves.
# Exit 2 = block tool call. Claude Code shows stderr to the agent.

set -euo pipefail

paths="${CLAUDE_FILE_PATHS:-}"

if [[ -z "$paths" ]]; then
  exit 0
fi

if echo "$paths" | grep -qE '(^|[[:space:]])\.env(\.|$)|/\.env(\.|$)|mcp\.json|credentials\.json|\.pem$|\.key$'; then
  echo 'BLOCKED: Editing env, MCP config, or credential files requires explicit user approval.' >&2
  echo 'Ask the user first. If approved, they can retry or temporarily disable this hook.' >&2
  exit 2
fi

exit 0

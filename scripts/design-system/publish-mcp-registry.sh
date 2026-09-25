#!/usr/bin/env bash
# Publish server.json to the official MCP Registry (com.digitaltableteur/mcp).
#
# One-time setup: a DNS TXT record on the apex digitaltableteur.com
#   v=MCPv1; k=ed25519; p=SmiYPxP38sIfk5wYNWNhLo8ZMyN6ZWcssKS7TaRrBOA=
# (the same public key is served at /.well-known/mcp-registry-auth, but the
# registry does not follow the apex -> www redirect, so DNS is required).
# The private key lives in the macOS Keychain, never in the repo.
#
# Re-run after bumping server.json "version" (keep it equal to MCP_SERVER_VERSION).
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! dig +short TXT digitaltableteur.com | grep -q "v=MCPv1"; then
  echo "DNS TXT record for the MCP Registry is not visible yet (propagation can take minutes)." >&2
  exit 1
fi

KEY="$(security find-generic-password -a com.digitaltableteur -s mcp-registry-ed25519-private-key -w)"
mcp-publisher login dns --domain digitaltableteur.com --private-key "$KEY"
mcp-publisher publish
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.digitaltableteur" | head -c 400
echo

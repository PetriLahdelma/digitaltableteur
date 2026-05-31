import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";

export const dynamic = "force-static";

/** Served at `/auth.md` via rewrite in next.config.ts (avoids `.md` pageExtension conflict). */
export async function GET() {
  const baseUrl = agentDiscoveryBaseUrl;

  const body = `# Authentication for agents

Digitaltableteur exposes public, read-only agent surfaces for consulting discovery. This document describes how agents should authenticate (or not) when calling each endpoint.

## Summary

| Surface | Auth required | Notes |
|---------|---------------|-------|
| MCP server (\`/mcp\`) | No | Read-only consulting tools; rate-limited |
| WebMCP (in-browser) | No | Same tools via \`navigator.modelContext\` when supported |
| \`/api/chat\` | No | Public AI chat; rate-limited; no PII submission via tools |
| \`/api/contact\` | No | Human contact form POST; rate-limited; do not automate spam |
| Agent skills (\`/.well-known/agent-skills/*\`) | No | Static skill docs for coding agents |
| \`llms.txt\` / \`llms-full.txt\` | No | Public site context |

## MCP server (\`/mcp\`)

- **Transport:** Streamable HTTP
- **Discovery:** \`${baseUrl}/.well-known/mcp/server-card.json\`
- **Authentication:** None for read-only tool calls
- **Authorization model:** All tools are read-only; no write, delete, or admin operations
- **Rate limits:** Best-effort per-IP limits apply (429 when exceeded)
- **Data sensitivity:** Public marketing data only (pricing ranges, case study summaries, services)

Example MCP client configuration:

\`\`\`json
{
  "mcpServers": {
    "digitaltableteur": {
      "url": "${baseUrl}/mcp"
    }
  }
}
\`\`\`

## Chat API (\`/api/chat\`)

- **Authentication:** None
- **Usage:** Streaming AI chat with site context
- **Constraints:** Rate-limited; intended for interactive Q&A, not bulk scraping
- **PII:** Do not submit personal data on behalf of users without consent

## Human contact

For proposals, contracts, or engagements requiring identity verification, direct users to:

- Contact form: ${baseUrl}/contact
- Email: mail@digitaltableteur.com

## OAuth / API keys

No OAuth provider or API keys are issued for public marketing endpoints at this time. If authenticated agent APIs are added in the future, this document will be updated with issuer URLs, scopes, and token endpoints.

## Related discovery

- MCP server card: ${baseUrl}/.well-known/mcp/server-card.json
- A2A agent card: ${baseUrl}/.well-known/agent-card.json
- API catalog: ${baseUrl}/.well-known/api-catalog
- Agent skills: ${baseUrl}/.well-known/agent-skills/index.json
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

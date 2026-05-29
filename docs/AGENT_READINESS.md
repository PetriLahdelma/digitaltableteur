# Agent readiness (isitagentready.com)

Baseline scan for **https://www.digitaltableteur.com** via [isitagentready.com](https://isitagentready.com/) (Cloudflare Agent Readiness).

The share URL `https://isitagentready.com/digitaltableteur.com` is client-rendered and may 404 when fetched directly. Use the scan API or MCP instead:

```bash
curl -sS -X POST "https://isitagentready.com/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.digitaltableteur.com","format":"agent"}'
```

MCP: `POST https://isitagentready.com/mcp` → tool `scan_site`

## Baseline (May 2026) — Level 1/5

| Check | Status |
|-------|--------|
| robots.txt | pass |
| sitemap.xml | pass |
| Link headers | fail → fixed in this branch |
| DNS-AID | fail (DNS infra — not app code) |
| Content Signals | fail → fixed via `app/robots.txt/route.ts` body directive |
| Markdown negotiation | fail → middleware sets `x-accept-markdown`; `/llms.txt` returns `text/markdown` |
| API catalog | fail → `/.well-known/api-catalog` |
| A2A agent card | fail → `/.well-known/agent-card.json` |
| Agent skills index | fail → `/.well-known/agent-skills/index.json` |
| MCP server card | fail (no public MCP server) |
| OAuth / Auth.md | fail (not applicable — public marketing site) |
| WebMCP | fail (optional browser API) |

## Implemented discovery endpoints

| URL | Purpose |
|-----|---------|
| `/llms.txt` | LLM site index |
| `/llms-full.txt` | Expanded context |
| `/.well-known/agent.json` | Legacy agent card |
| `/.well-known/agent-card.json` | A2A agent card |
| `/.well-known/api-catalog` | RFC 9727 API linkset |
| `/.well-known/agent-skills/index.json` | Project `dt-*` skills |
| `/.well-known/agent-skills/{name}` | Individual skill markdown |

## Expected level after deploy

- **Level 2** (Bot-Aware): Content Signals in robots.txt
- **Level 3** (Agent-Readable): + markdown negotiation on `/`
- **Level 4** (Agent-Integrated): + API catalog, A2A card, and/or agent skills index

DNS-AID, OAuth, MCP server card, and WebMCP remain out of scope unless infra/product decisions change.

## Re-scan after deploy

```bash
curl -sS -X POST "https://isitagentready.com/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.digitaltableteur.com","format":"json"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['level'], d['levelName'])"
```

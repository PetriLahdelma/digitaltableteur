# Agent readiness (isitagentready.com)

Scan target: **https://www.digitaltableteur.com** via [isitagentready.com](https://isitagentready.com/) (Cloudflare Agent Readiness).

The share URL `https://isitagentready.com/digitaltableteur.com` is client-rendered and may 404 when fetched directly. Use the scan API or MCP instead:

```bash
curl -sS -X POST "https://isitagentready.com/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.digitaltableteur.com","format":"agent"}'
```

MCP: `POST https://isitagentready.com/mcp` → tool `scan_site`

Quick level check:

```bash
curl -sS -X POST "https://isitagentready.com/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.digitaltableteur.com","format":"json"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['level'], d['levelName'])"
```

---

## Current status (May 2026) — Level 4/5 Agent-Integrated

**Last scan:** 2026-05-29 (post PR #613 + #614 deploy)

| Check | Status |
|-------|--------|
| robots.txt | pass |
| sitemap.xml | pass |
| Link headers | pass |
| Content Signals | pass — `Content-Signal` in robots.txt body |
| Markdown negotiation | pass — `Accept: text/markdown` → `text/markdown` |
| API catalog | pass — `/.well-known/api-catalog` (2 APIs) |
| A2A agent card | pass — `/.well-known/agent-card.json` |
| Agent skills index | pass — 7 `dt-*` skills |
| robots.txt AI rules | pass — wildcard allow |
| DNS-AID | fail — DNS infra (Cloudflare records) |
| MCP server card | fail — no public MCP server |
| OAuth / auth.md | fail — not applicable for public marketing site |
| WebMCP | pending deploy — 9 read-only tools via `WebMcpProvider` |

### Progression

| Date | Level | Trigger |
|------|-------|---------|
| May 2026 (initial) | 1/5 Basic Web Presence | robots + sitemap only |
| May 2026 (PR #613) | 1/5 headline, partial L4 checks | API catalog, A2A card, skills, link headers |
| May 2026 (PR #614) | **4/5 Agent-Integrated** | Content-Signal body + markdown negotiation |

---

## Implemented discovery endpoints

| URL | Purpose |
|-----|---------|
| `/llms.txt` | LLM site index (+ agent skills section) |
| `/llms-full.txt` | Expanded context |
| `/.well-known/agent.json` | Legacy agent card |
| `/.well-known/agent-card.json` | A2A agent card |
| `/.well-known/api-catalog` | RFC 9727 API linkset |
| `/.well-known/agent-skills/index.json` | Project `dt-*` skills |
| `/.well-known/agent-skills/{name}` | Individual skill markdown |
| `/.well-known/agent-skills/{name}/references/{ref}.md` | Skill reference docs (e.g. workflow templates) |

---

## Level 5 (Agent-Native) — remaining gaps

Scanner requirements for next level:

| Check | Effort | Notes |
|-------|--------|-------|
| **auth.md** | Low–medium | Publish `/auth.md` describing how agents authenticate (even if "no auth required for public endpoints") |
| **MCP server card** | High | Requires hosting a public MCP server + `/.well-known/mcp.json` |
| DNS-AID | DNS | `_index._agents` SVCB/HTTPS records at Cloudflare — infra, not app code |

For a public marketing/consultancy site, **Level 4 is the practical target**. Level 5 also implies **auth.md** and a public **MCP server card** unless you productize agent APIs.

### WebMCP tools (in-browser agents)

Implemented in `providers/WebMcpProvider.tsx`. Registered on page load when `navigator.modelContext` exists:

| Tool | Data |
|------|------|
| `list_case_studies` | Portfolio from `projects.ts` |
| `get_case_study` | `{ slug }` |
| `list_pricing_packages` | Fixed packages €8–20k |
| `get_hourly_rate` | €90/h typical, €90–150/h range |
| `list_services` | pseo services catalog |
| `list_expertise_stacks` | React, Next.js, Figma, etc. |
| `list_audiences` | Startups, scaleups, enterprise |
| `get_open_hours` | Europe/Helsinki schedule |
| `get_consulting_fit` | Map problem → service |

Canonical data: `nextjs-app/shared/data/consulting-catalog.ts`

Manual test: Chrome with `#enable-webmcp-testing`, then `navigator.modelContextTesting?.listTools()` in DevTools.

---

## Manual verification commands

```bash
# Content-Signal in robots.txt body
curl -sS https://www.digitaltableteur.com/robots.txt | rg Content-Signal

# Markdown negotiation
curl -sSI https://www.digitaltableteur.com/ -H "Accept: text/markdown" | rg -i content-type

# Agent skills (expect 7 dt-* skills after PR #614)
curl -sS https://www.digitaltableteur.com/.well-known/agent-skills/index.json | python3 -m json.tool

# Workflow templates
curl -sS https://www.digitaltableteur.com/.well-known/agent-skills/dt-workflow/references/templates.md | head
```

# Next.js API routes

> **Scope:** `app/api/`  
> **Skill:** [`.claude/skills/dt-api-routes/SKILL.md`](../../.claude/skills/dt-api-routes/SKILL.md)  
> **Legacy:** [`api-legacy-vercel-functions/AGENTS.md`](../../api-legacy-vercel-functions/AGENTS.md) (being phased out)

---

## Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `app/api/chat/route.ts` | POST | AI chat (Vercel AI SDK, streaming) |
| `app/api/contact/route.ts` | POST | Contact form → MongoDB + email |
| `app/api/gdpr/delete-data/route.ts` | POST | GDPR deletion by email |

---

## Patterns

```tsx
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email) {
    return Response.json({ error: "Email required" }, { status: 400 });
  }
  // ...
  return Response.json({ success: true });
}
```

- Validate input before side effects
- Rate limit sensitive endpoints
- `mongo-sanitize` for MongoDB queries
- `isomorphic-dompurify` for HTML sanitization
- Never return stack traces or secrets to clients

---

## Chat API specifics

- Vercel AI SDK with streaming
- Prompt injection guards, token counting
- Tool typing: use AI SDK `ToolSet` types (see recent `route.ts` fixes)
- Security tests: `npm run test:security`

---

## Environment variables

| Var | Used by |
|-----|---------|
| `OPENAI_API_KEY` | Chat |
| `MONGODB_URI` | Contact, GDPR |
| `AI_GATEWAY_URL` | LLM routing (optional) |

Server-only — no `NEXT_PUBLIC_` prefix. Set in Vercel dashboard for production.

---

## MUST NOT

- Use legacy `pages/api/`
- Skip rate limiting on public POST endpoints
- Log PII in plain text

---

## Quick find

```bash
find app/api -name "route.ts"
rg -n "export async function (GET|POST)" app/api/
```

---

## Pre-change checks

```bash
npm run typecheck
npm run test:security    # after chat changes
```

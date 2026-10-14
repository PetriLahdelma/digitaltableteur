# Donny model migration: gpt-4o-mini to gpt-6-luna

Status: shipped 2026-10-14 (code, eval, Vercel env). Written 2026-10-14.
Hard deadline: **2027-01-14**, when OpenAI removes `gpt-4o-mini-2024-07-18` (and GPT-4o, GPT-4.1, GPT-4.1 mini) from the API.
Target: production cutover by **2026-10-31**, leaving ten weeks of rollback room before the shutdown.

## 1. What Donny runs today

| Path | When it is used | Model it resolves to |
|------|-----------------|----------------------|
| Direct OpenAI (`app/lib/chat-model.ts`) | **Primary.** `OPENAI_API_KEY` is set on Vercel and `CHAT_MODEL_PROVIDER` is not, so `resolvePrimaryChatBackend()` picks `openai`. | `OPENAI_MODEL`, which is **not set** on Vercel, so the hardcoded default `gpt-4o-mini` in `app/api/chat-shared.ts` |
| Vercel AI Gateway | Fallback when the OpenAI call fails | `AI_GATEWAY_MODEL` (Vercel, encrypted); `.env.local` has `openai/gpt-4o-mini-2024-07-18` |

Both paths hit a retiring model. Changing only the Gateway env var would leave the primary path on gpt-4o-mini.

Request shape (`app/api/chat/route.ts`): Responses API via `openai(modelId)`, streaming, up to 13 tools scoped per turn, `stopWhen: stepCountIs(2)`, `temperature: 0.2`, `maxOutputTokens: 900`.

## 2. Recommendation

**`gpt-6-luna` with `reasoningEffort: "none"` on the primary (direct OpenAI) path; `openai/gpt-5.4-nano` on the Gateway fallback**, because the Gateway account is on the free tier, which rejects Luna (see trap 8).

| | gpt-4o-mini (today) | gpt-6-luna |
|---|---|---|
| Input / cached / output per 1M tokens | $0.15 / $0.075 / $0.60 | **$0.10 / $0.01 / $0.50** |
| Context window | 128K | 1.05M |
| Knowledge cutoff | Oct 2023 | May 2026 |
| Function calling, streaming, structured outputs | Yes | Yes |
| On Vercel AI Gateway | Yes | Yes, `openai/gpt-6-luna`, same price |

Why this one:

- It is OpenAI's named replacement for all four retiring models, and its migration article says most GPT-4.x use cases are expected to migrate at reasoning effort `none`.
- It is cheaper than what Donny pays now on every line, and much cheaper on cached input. Donny's large system prompt repeats every turn, so caching matters.
- At effort `none` it produces no reasoning tokens, so latency and output cost stay close to a non-reasoning chat model, and `temperature: 0.2` is still honoured.
- It is a one-line provider change. No new keys, billing, or SDK packages.

Alternatives considered and rejected:

| Model | Price in / out | Why not |
|---|---|---|
| gpt-5-nano | $0.05 / $0.40 | The only cheaper OpenAI option on paper. For a rough conversation of 15K input and 2K output tokens (uncached), Luna costs about $0.0025 and nano about $0.0016, so the saving is about a tenth of a cent per conversation. Two generations old, so it is the likeliest next retirement, and nano tiers are the weakest at multi-tool routing. The saving is negligible at Donny's volume and not worth risking a second migration. |
| gpt-5.6-luna | $0.20 / $1.20 | Previous generation, 2x input and 2.4x output price |
| gpt-5.4-nano | $0.20 / $1.25 | Same, older and pricier |
| gpt-5-mini | $0.25 / $2.00 | Older, 4x output price |
| gpt-6.1-sol | $2.00 / $10.00 | 20x the cost; Donny's job (intake, routing to tools, short answers) does not need it. Keep as the escalation option if the eval fails on quality. |
| Non-OpenAI model via Gateway | varies | Would make the Gateway primary, which had the legacy finish-data bug on 2026-09-25 (`gateway-finish-compat.ts`) and free-tier limits. More moving parts for no clear gain. |

## 3. Traps found during research

These are the reasons this is a plan and not just an env var change.

1. **The installed AI SDK silently breaks `none` for Luna.** `@ai-sdk/openai@4.0.69` lists GPT-6 efforts as `low` to `max` only. Passing `reasoningEffort: "none"` produces a warning and the option is **dropped**, so the model runs at its default `medium`. At the same time it strips `temperature`. Effects: slower replies, reasoning tokens counted against the 900-token output cap (risk of truncated or empty answers), and no temperature control. Fixed in **4.0.90** (`6c59fb1`, "preserve sampling parameters for GPT-6 Sol and Luna when reasoning is disabled"; `none` added to Sol/Luna efforts). Latest is 4.0.93.
2. **Luna's default effort is `medium`, not `none`.** Effort must be passed explicitly on every request.
3. **Stay on the Responses API.** The model page states Chat Completions supports function calling only at effort `none`. `openai(modelId)` already uses Responses; do not switch to `openai.chat()`.
4. **System prompt role changes.** For reasoning-class models the SDK sends the system prompt as a `developer` message. Usually harmless, but tone and rule adherence (one tool per reply, no invented prices) must be re-checked.
5. **Gateway path is unverified with Luna.** The finish-compat shim was written against GPT-4o-era responses. Tool calls through the Gateway need their own test.
6. **Duplicated replies (found in the eval).** On the Responses API, Luna sometimes sends a `phase: "commentary"` preamble followed by a `phase: "final_answer"` with nearly the same text, and the SDK streams both, so the chat bubble showed the reply twice. There is no request option to turn preambles off; OpenAI's guidance is to filter on `phase`. Fixed by `app/lib/openai-phase-filter.ts` on both backends.
7. **Gateway fallback was already broken (pre-existing).** The route sent dotted tool names (`studio.services`) to the Gateway, and OpenAI rejects them (`tools[0].name` must match `^[a-zA-Z0-9_-]+$`). Every Gateway request with tools failed, so the fallback never worked when OpenAI direct went down. Both backends now get underscore names; the client already accepts both forms.
8. **Free-tier Gateway rejects Luna.** `openai/gpt-6-luna`, `gpt-5.6-luna` and `gpt-5.4-mini` return "Free tier users do not have access to this model". `gpt-5.4-nano` works with effort `none` and tool calls, and scored 16/21 in the eval (gpt-4o-mini: 15 to 16). It is the Gateway default until the Gateway gets paid credits; then switch `AI_GATEWAY_MODEL` to `openai/gpt-6-luna`.
9. **Lockfile.** Bumping `@ai-sdk/openai` regenerates `package-lock.json` on macOS, which can strip Linux optional binaries and break the Vercel install. `grep -c linux package-lock.json` is 524 today; it must not drop.

## 4. Plan

### Phase 1: code changes (one PR)

1. Bump `@ai-sdk/openai` to `^4.0.93` (and `ai` / `@ai-sdk/gateway` to latest patch while there). Confirm the Linux count in the lockfile is unchanged.
2. `app/api/chat-shared.ts`: change both defaults to `gpt-6-luna` / `openai/gpt-6-luna` so an unset env var can never resolve to a retired model again.
3. `app/api/chat/route.ts`: add to the stream params
   `providerOptions: { openai: { reasoningEffort: "none" } }`.
   For a rollback to gpt-4o-mini this option is ignored (the SDK only sends `reasoning` for reasoning models), so rollback stays a pure env change.
4. Unit test in `app/lib/chat-model.test.ts` (or the route test): the resolved model ids default to Luna, and the built params carry `reasoningEffort: "none"` and `temperature: 0.2`.
5. Also move the two offline scripts off gpt-4o-mini: `scripts/generate-alt-text.js` (needs vision; Luna's input modalities must be checked first) and `scripts/pseo/generate-pseo-copy.ts`. Update the docs that cite gpt-4o-mini (`docs/donny-chat.md`, `docs/PSEO_LLM_LINK_BUILDING.md`, `docs/OPENAI_SPENDING_LIMITS.md`, `docs/DONNY_MEMORY_ARCHITECTURE.md`). Leave `api-legacy-vercel-functions/` alone unless it is confirmed undeployed and can be deleted.
6. Local gate: typecheck, lint, test, build, all exit 0.

### Phase 2: eval against a baseline

Donny has no eval harness yet. Add a small script (`scripts/donny-model-eval.ts`) that calls the real route params with a fixed prompt set, once per model, and writes a JSON report. Run it against gpt-4o-mini first (baseline), then gpt-6-luna at `none`.

Prompt set, about 20 cases:

- Lead triage intake: client, recruiter, other; checks one question at a time.
- One case per tool: `projectShowcase`, `navigateTo`, `getCaseStudies`, `getServicePackages`, `bookCall`, `createLead` (with and without consent), `composeMailRequest` (cv, portfolio), `draftFollowUp`, `showExpression`, `listExpressions`, `openHours`, `services`, `contactCard`.
- Rules: at most one tool per triage reply; no prices outside tool output; no markdown repeat of rendered cards.
- Finnish and Swedish questions answered in the same language.
- The prompt-injection and abuse cases from `docs/DONNY_SECURITY_TEST_SPEC.md`.

Record per case: tool called and arguments, final text, time to first token, total time, input/cached/output tokens, any SDK warnings (a `reasoningEffort` warning means trap 1 is back).

Pass bar: same or better tool choice on every tool case, no rule regressions, all security cases hold, median time to first token no worse than baseline + 20%. If Luna at `none` misses tool cases, retry those at `low` (raise `maxOutputTokens` to about 2000 first, since reasoning tokens share the cap); if still failing, evaluate `gpt-6.1-sol`.

### Phase 3: preview, then production

1. Deploy the PR to a Vercel preview. Run the eval once more against the preview URL, and test in the browser: a full lead triage, a booking, a tool call with the Gateway forced (`CHAT_MODEL_PROVIDER=gateway` on the preview only).
2. Set on Vercel (all environments): `OPENAI_MODEL=gpt-6-luna`, `AI_GATEWAY_MODEL=openai/gpt-6-luna`. Update `.env.local` to match.
3. Merge and deploy. For 48 hours, watch Sentry for chat error ref codes, Vercel runtime logs for SDK warnings, and the OpenAI usage dashboard for cost per day against the gpt-4o-mini baseline.

### Rollback

Until 2027-01-14: set `OPENAI_MODEL=gpt-4o-mini` and `AI_GATEWAY_MODEL=openai/gpt-4o-mini-2024-07-18` on Vercel and redeploy. No code revert needed. After 2027-01-14 the rollback target is `gpt-6.1-sol`, not gpt-4o-mini.

### Phase 4: cleanup (by 2026-12-15)

- Remove every remaining `gpt-4o-mini` reference, including the CodeSnippet story examples and their a11y snapshots (recapture with `CI=1`).
- Optional guard: a check script that calls `GET /v1/models` and fails when the configured model has a `shutdown_date`, so the next retirement is caught by the gate instead of an email.

## 5. Eval results (2026-10-14)

`scripts/donny-model-eval.ts`, 21 cases, run through the production model stack, tools without `execute` (no side effects).

| Run | gpt-4o-mini pass | gpt-6-luna pass | Median TTFT mini / luna | Notes |
|---|---|---|---|---|
| 1 | 15/21 | 15/21 | 1004 / 952 ms | Luna reply duplicated (commentary + final answer) |
| 2 | 14/21 | 15/21 | 813 / 1020 ms | Phase filter added |
| 3 | 15/21 | 17/21 | 771 / 1023 ms | |
| 5 | 16/21 | 17/21 | 786 / 941 ms | `parallelToolCalls: false`, persona-first prompt rule |
| 6 | 15/21 | 16/21 | 870 / 898 ms | |

- Luna: 0 reasoning tokens and no SDK warnings in every run, so effort `none` is applied.
- Both models break "one tool per reply" without `parallelToolCalls: false`; now enforced at the API.
- Luna is more eager to show packages before asking the persona question; the system prompt now says to ask it first with no tool call. One slip in run 6.
- Four failures are shared by both models every run and are **tool-scoping gaps, not model issues**: `selectDonnyToolsForChat` does not offer `composeMailRequest` for "portfolio", `listExpressions` for "expressions", or `createLead` on a consent reply (it only reads the last message), and both models answer "how much does an audit cost" with `navigateTo` instead of `getServicePackages`.
- **Fixed 2026-10-14 (scoping):** `selectDonnyToolsForChat` now treats a portfolio request or work samples as mail intent, matches plurals ("expressions"), offers lead tools on consent replies and email addresses and for 3 user turns after any lead intent, and drops `navigateTo` for cost questions without navigation words. FI/SV terms match as word-start stems, because JavaScript `\b` is ASCII-only and never matched next to ä/ö. After the fix: gpt-6-luna 21/21 and 20/21, gpt-5.4-nano 18/21 and 19/21.
- Latency: Luna's median time to first token was 3 to 33% slower across runs (about 30 to 250 ms), total time 5 to 19% slower. Part of that is holding back commentary text.

## 6. Sources

- OpenAI deprecations page, entry dated 2026-10-14: https://developers.openai.com/api/docs/deprecations
- gpt-6-luna model page (effort levels, Chat Completions tool restriction, limits, price): https://developers.openai.com/api/docs/models/gpt-6-luna
- OpenAI pricing: https://developers.openai.com/api/docs/pricing
- OpenAI Help Center, "Migrating from GPT-4.x to GPT-6 Luna": https://help.openai.com/en/articles/20001600-migrating-from-gpt-4x-to-gpt-6-luna
- Vercel AI Gateway model page: https://vercel.com/ai-gateway/models/gpt-6-luna
- `@ai-sdk/openai` source, 4.0.69 (installed) vs 4.0.93 (`getOpenAILanguageModelCapabilities`), and CHANGELOG entries 4.0.73, 4.0.78, 4.0.90

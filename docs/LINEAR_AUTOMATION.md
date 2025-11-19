# Linear Automation & AI Issue Intake

Digitaltableteur now includes a scripted Linear workflow that standardizes ticket intake, enriches issue metadata with AI-style heuristics, and protects against misfiled work. This document captures the architecture, configuration, and usage notes so future contributors can extend the automation.

## 1. Architecture Overview

| Concern | Implementation |
| --- | --- |
| API layer | `lib/linear/createIssue.ts` — GraphQL client with env validation, label/assignee lookups, and rate-limit handling |
| Smart metadata | `lib/linear/classify.ts` (domain + auto labels), `lib/linear/componentDetection.ts` (component heuristics), `lib/linear/textImprover.ts` (description rewrite) |
| Trigger | `scripts/linear/create-issue.ts` executed via `npm run linear:new` (readline-based CLI, ready for future Slack/voice triggers) |
| Documentation | This file + env references |
| Labs Setup | `docs/RD_LABS_GUIDE.md` describes the R&D/Labs team workflow |

Key automation stages:

1. **Q&A intake** — prompt for type, title, description, priority, component, labels, assignee.
2. **Classification** — heuristics decide between `design-system` vs `app` and attach labels (`design-system`, `ds-triage`, `ui-app-bug`, etc.). Uncertain calls require confirmation.
3. **Component detection** — scans `/src/components/**` for referenced component names and proposes labels like `comp:Button`. If multiple matches exist the CLI asks which ones apply.
4. **Text rewrite** — description is reorganized into *Problem / Actual / Expected / Steps / Acceptance Criteria* plus the reporter’s raw content.
5. **Confirmation & submission** — user must confirm `Confirm issue creation with: title=X priority=Y labels=Z?` before the script calls Linear’s `issueCreate` mutation.

## 2. Environment Setup

Add these keys to `.env.local` (values managed via 1Password/Linear settings):

```dotenv
LINEAR_API_KEY="lin_api_xxx"
LINEAR_TEAM_ID="team_xxx"
LINEAR_PROJECT_ID="proj_xxx"          # optional default project
LINEAR_WEBHOOK_SECRET=""              # reserved for future inbound sync
```

`LINEAR_API_KEY` needs the `read` + `write` scopes (personal API key is sufficient). `LINEAR_TEAM_ID` is required so tickets land inside DT’s team. `LINEAR_PROJECT_ID` is optional—omit it if the automation should not auto-assign a project. `LINEAR_WEBHOOK_SECRET` is included for parity with upcoming webhook listeners.

## 3. CLI Usage

```bash
npm run linear:new
```

Flow:

1. Answer the prompted questions (title capped at 80 chars, description ≥ 3 sentences).
2. Optionally specify labels/assignee; the tool supports either a Linear user ID or email.
3. Review the summary with derived domain + labels; confirm when the prompt repeats `Confirm issue creation...`.
4. On success the script prints the new issue identifier + URL.

The CLI loads `.env.local`, validates config, and exits with helpful errors if anything is missing. Failures returned by Linear (validation, rate limits, missing labels) are surfaced clearly.

### Updating existing issues

Use the companion helper to adjust an issue without leaving the terminal:

```bash
npm run linear:update -- --issue DIG-123 \
  --state "In Review" \
  --add-label "design-system,comp:Button" \
  --remove-label "needs-triage" \
  --comment "PR opened, ready for stakeholder QA."
```

- `--state` accepts any state available to the issue’s team (case-insensitive).
- `--add-label` / `--remove-label` accept comma-separated names or repeated flags; labels must already exist in Linear (the script validates them).
- `--comment` posts a new Linear comment alongside the state/label change.

## 4. Helper Responsibilities

- `lib/linear/createIssue.ts`
  - Validates env keys up front (`validateLinearEnv`).
  - Converts friendly data into GraphQL `IssueCreateInput`.
  - Looks up label IDs and assignee IDs/emails via secondary queries.
  - Surfaces rate limit errors with retry guidance.
- `lib/linear/classify.ts`
  - Keyword heuristics assign domain and record confidence; low-confidence paths ask the user.
  - `deriveLabels` merges manual + auto labels and returns what was added implicitly.
- `lib/linear/componentDetection.ts`
  - Recursively indexes `/src/components/**` directories/files.
  - Matches CamelCase/kebab tokens found in the user’s answers.
  - Produces labels shaped as `comp:<ComponentName>`.
- `lib/linear/textImprover.ts`
  - Splits reporter text into sentences, categorizes them (problem/expected/actual/steps).
  - Generates deterministic acceptance criteria per issue type.
  - Appends the “User’s Raw Input” block to preserve original wording.

## 5. Trigger Expansion & Future Hooks

The CLI is intentionally stateless and modular:

- Wrap `createIssue` + helper exports in a Slack bot, voice interface, or `/linear` dev panel route by calling the same functions.
- `LINEAR_WEBHOOK_SECRET` is reserved so inbound automation can be wired without reshuffling env names.
- Helpers avoid UI dependencies and only rely on Node stdlib.

## 6. Example Interaction

```
→ Starting Linear ticket flow
Issue type (Bug/Enhancement/Task/Research)? Bug
Short title? Home hero CTA renders wrong gradient
Provide description...
Priority (P1-P4)? P2
Page or component? Home hero CTA block
Labels? accessibility, needs-review
Assignee? alex@digitaltableteur.com
...
Confirm issue creation with: title="Home hero CTA renders wrong gradient" priority="P2" labels="accessibility, needs-review, ui-app-bug, comp:HeroCTA"?
✅ Linear issue created:
• Identifier: DT-512
• URL: https://linear.app/digitaltableteur/issue/DT-512
```

This transcript shows the auto-added labels (`ui-app-bug`, `comp:HeroCTA`) alongside user labels and the final confirmation step.

---

Need updates or want to experiment? Extend the helpers under `lib/linear/*`, keep heuristics deterministic, and refresh this doc with behavioral changes.
- Workspace Labels:
  - Content: `ai-app`, `browser-extension`, `mcp`, `figma-plugin`, `design-tool`, `automation`
  - Value: `R&D`, `Experiment`, `Adoption-candidate`

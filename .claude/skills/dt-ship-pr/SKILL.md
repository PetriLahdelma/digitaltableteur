---
name: dt-ship-pr
description: >-
  Ships Digitaltableteur work via git commit and GitHub pull request using project
  safety rules. Use when the user says "create PR", "open pull request", "ship this",
  "push and PR", or asks to commit and open a PR. Do NOT use for read-only git
  status checks or code changes without shipping intent.
disable-model-invocation: true
metadata:
  version: 1.0.0
  category: git
---

# Ship PR workflow

User-only skill — run only when the user explicitly asks to commit, push, or create a PR.

## Instructions

### Step 1: Gather state (parallel)

```bash
git status
git diff
git diff --staged
git branch -vv
git log -10 --oneline
```

Determine base branch (usually `main`). Run `git diff main...HEAD` (or appropriate base) for full branch history.

### Step 2: Pre-ship validation

Before commit or PR, ensure relevant checks pass:

```bash
npm run typecheck && npm run lint && npm test
```

For agent-doc or skill changes also run:

```bash
npm run validate:agent-docs
```

If checks fail, halt and fix — do not commit or open PR.

### Step 3: Commit (only if user asked to commit)

CRITICAL git safety:

- NEVER update git config
- NEVER force push to main/master
- NEVER skip hooks (`--no-verify`) unless user explicitly requests
- NEVER commit `.env*`, credentials, or secrets — warn if staged
- NEVER use `git commit --amend` unless user requested AND HEAD was your commit AND not pushed
- Only commit when user explicitly asked

```bash
git add <relevant files>
git commit -m "$(cat <<'EOF'
feat: concise summary focusing on why.

EOF
)"
git status
```

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).

### Step 4: Push (only if user asked or PR requires it)

```bash
git push -u origin HEAD
```

Do not force push unless user explicitly requests (warn on main/master).

### Step 5: Create PR with gh

Analyze ALL commits on the branch (not just the latest). Draft summary from full diff.

```bash
gh pr create --title "the pr title" --body "$(cat <<'EOF'
## Summary
- Bullet 1
- Bullet 2

## Test plan
- [ ] typecheck, lint, tests pass
- [ ] Manual verification steps

EOF
)"
```

Return the PR URL to the user.

---

## Examples

### Example 1: "Create a PR for this branch"

Actions:

1. Run parallel git status/diff/log
2. Confirm checks pass (or run them)
3. Push if not tracking remote: `git push -u origin HEAD`
4. `gh pr create` with summary covering all branch commits
5. Return PR URL

### Example 2: "Commit and push these changes"

Actions:

1. Verify no secrets in diff
2. Run validation gates
3. Commit with HEREDOC message
4. Push — do NOT create PR unless also requested

---

## Troubleshooting

### Pre-commit hook failed

Cause: hook auto-modified files or lint/test failure.

Solution: fix issues and create a NEW commit — do not amend unless amend rules satisfied.

### Branch has no upstream

Cause: never pushed.

Solution: `git push -u origin HEAD` before `gh pr create`.

### Nothing to commit

Cause: no staged or unstaged changes.

Solution: report clean tree; do not create empty commit.

---

## Boundaries

- Do not push or create PR without explicit user request
- Do not commit `.planning/` noise unless user wants it
- Ask before editing `.env` files (also blocked by PreToolUse hook)

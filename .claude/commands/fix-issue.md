Analyze and fix GitHub issue: $ARGUMENTS

**Workflow:**

1. **Understand**: Use `gh issue view $ARGUMENTS` to get issue details
2. **Research**: Search codebase for relevant files using `rg -n "pattern"`
3. **Context**: Read CLAUDE.md in relevant directories for patterns
4. **Plan**: Identify affected files and required changes
5. **Implement**: Follow established patterns from similar components
6. **Test**: Write/update tests to verify fix
7. **Quality**: Run `npm run typecheck && npm run lint && npm test`
8. **Commit**: Create descriptive commit message (Conventional Commits format)
9. **PR**: Push and create PR with `gh pr create --fill`

**Critical References:**

- Component creation: `docs/LLM_COMPONENT_GENERATION_RULES.md`
- Testing requirements: Aim for >80% coverage, include accessibility tests
- Translation coverage: Ensure EN/FI/SV keys added

**Quality Gates:**

```bash
npm run typecheck
npm run lint
npm test
npm run test:visual  # If UI changes
npm run build
```

All must pass before creating PR.

**Commit Message Format:**

```
fix(component): brief description

- Detailed change 1
- Detailed change 2

Fixes #$ARGUMENTS
```

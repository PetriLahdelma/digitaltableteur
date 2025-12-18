Create a Linear issue: $ARGUMENTS

**Workflow:**

1. **Parse input**: Extract title and description from $ARGUMENTS
2. **Determine priority**:
   - P1 (0): Critical bugs or blockers
   - P2 (1): Important features/tasks
   - P3 (2): Standard work
   - P4 (3): Nice-to-haves

3. **Select labels** (see `docs/LINEAR_LABELS.md`):
   - Component work: `design-system`
   - Improvements: `Improvement`
   - Bugs: `Bug` or `ui-app-bug`
   - Infrastructure: `automation`, `observability`

4. **Set assignee**: Default to `petri@digitaltableteur.com`

5. **Determine state**:
   - "ticket" or "task" → `stateName: "In Progress"`
   - "todo" → `stateName: "Todo"`
   - Omit state for triage/backlog

6. **Create issue**:

   ```typescript
   import { createLinearIssue } from "./lib/linear/createIssue";

   const result = await createLinearIssue({
     title: "Implement X",
     description: `## Goal\n\n...\n\n## Acceptance Criteria\n- [ ] ...\n\n## Branch\n\`DT-XXX-feat-x\``,
     priority: 1, // P2
     labelNames: ["design-system", "Improvement"],
     assigneeEmail: "petri@digitaltableteur.com",
     stateName: "In Progress",
   });

   console.log(`Created: ${result.identifier} - ${result.url}`);
   ```

7. **Output**: Display issue identifier and URL

**Example Usage:**

```
/create-linear-issue Implement ChatWidget on all pages
```

Creates:

- Title: "Implement ChatWidget on all pages"
- Priority: P2 (1)
- Labels: ["design-system", "Improvement"]
- Assignee: petri@digitaltableteur.com
- State: "In Progress"

**Environment Requirements:**

Ensure `.env.local` contains:

```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...
```

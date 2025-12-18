Create a new component: $ARGUMENTS

**CRITICAL: Read these first:**

- `docs/LLM_COMPONENT_GENERATION_RULES.md` (all 10 sections)
- `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`

**Component Creation Workflow:**

1. **Create folder**: `shared/components/$ARGUMENTS/`

2. **Create 5 required files:**
   - `$ARGUMENTS.tsx` (functional component with TypeScript interface)
   - `$ARGUMENTS.module.css` (CSS Modules with design tokens)
   - `$ARGUMENTS.stories.tsx` (Storybook with WIP badge)
   - `$ARGUMENTS.test.tsx` (Vitest + accessibility tests)
   - `index.ts` (re-export: `export { default } from './$ARGUMENTS'`)

3. **TypeScript Interface:**

   ```tsx
   export interface ${ARGUMENTS}Props {
     /** Prop description */
     propName: type;
   }
   ```

4. **CSS Modules:**
   - Use design tokens from `src/styles/variables.css`
   - Use logical properties (`margin-inline`, `padding-block`)
   - No hardcoded colors

5. **Translations:**
   - Add keys to `shared/locales/en/translation.json`
   - Translate to Finnish (`fi/`) and Swedish (`sv/`)
   - Use `useTranslation()` hook in component

6. **Testing:**
   - Render tests (check DOM output)
   - Interaction tests (click, type, etc.)
   - Accessibility tests with axe-core
   - Aim for >80% coverage

7. **Storybook:**
   - Create at least 3 stories (Default, Variants, Edge Cases)
   - WIP badge present by default
   - Document props with JSDoc

8. **Export:**
   - Add to `src/components/index.ts`:
     ```ts
     export { default as $ARGUMENTS } from "./$ARGUMENTS/$ARGUMENTS";
     ```

9. **Validation:**

   ```bash
   npm run typecheck
   npm run lint
   npm test -- $ARGUMENTS
   npm run test:visual
   ```

10. **Commit:**
    ```bash
    git add shared/components/$ARGUMENTS/
    git commit -m "feat(components): add $ARGUMENTS component"
    ```

**Quality Checklist:**

- [ ] 5 files created (tsx, css, stories, test, index)
- [ ] TypeScript interface with JSDoc
- [ ] CSS uses design tokens (no hardcoded values)
- [ ] Logical properties (no physical directions)
- [ ] Translation keys in EN/FI/SV
- [ ] Unit tests pass (including accessibility)
- [ ] Storybook story created (WIP badge present)
- [ ] Exported in `src/components/index.ts`
- [ ] No console errors or warnings
- [ ] Visual regression baselines reviewed

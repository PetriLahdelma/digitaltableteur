Perform a comprehensive code review of recent changes:

1. **Code Quality**: Check code follows TypeScript and React conventions from CLAUDE.md
2. **Architecture**: Verify component structure (5 files: .tsx, .module.css, .stories.tsx, .test.tsx, index.ts)
3. **Styling**: Ensure CSS uses design tokens (no hardcoded colors) and logical properties
4. **Accessibility**: Review semantic HTML, ARIA labels, keyboard navigation
5. **Testing**: Verify test coverage for new functionality, including accessibility tests
6. **i18n**: Check translation coverage for all user-facing text (EN/FI/SV)
7. **Security**: Look for vulnerabilities (XSS, injection, auth bypasses)
8. **Performance**: Check for bundle size impact, render cycles, memoization
9. **Documentation**: Confirm Storybook stories exist, WIP badge present until verified
10. **Visual Regression**: Remind to run `npm run test:visual` after UI changes

Provide specific, actionable feedback with file/line references.

Before completing review, read:

- `CLAUDE.md` for universal rules
- `docs/LLM_COMPONENT_GENERATION_RULES.md` for component patterns
- Relevant subdirectory CLAUDE.md for context-specific guidance

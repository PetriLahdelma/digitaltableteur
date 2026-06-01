---
name: a11y-ing-checklist
description: >-
  Accessibility review for digitaltableteur using Sanna's a11y.ing demo checklist
  and testing philosophy. Use before shipping UI, when adding pages to the a11y
  registry, or when axe passes but voice control or screen reader UX may still fail.
---

# a11y.ing-inspired accessibility checklist

## Philosophy (from [a11y.ing](https://a11y.ing/en/))

- Accessibility is shared work: design, development, and content must align.
- Automated tools catch a fraction of real failures; plan manual keyboard and screen reader time.
- **"I would if I could"** — if users cannot complete a task, the service failed, not the user.

## When to invoke

- New public route, pricing/PSEO/blog template change, or custom component with ARIA
- Before removing WIP badge from Storybook components
- After adding `aria-label`, `list-style: none`, or CSS `content:` on pseudo-elements
- When expanding `tests/a11y/page-verification/helpers/page-registry.ts`

## Automated pass

```bash
npm run test:a11y:pages
# Targeted:
npx playwright test tests/a11y/operable/label-in-name.spec.ts
npx playwright test tests/a11y/robust/list-semantics.spec.ts
npx playwright test tests/a11y/operable/reduced-motion.spec.ts
npx playwright test tests/a11y/perceivable/table-structure.spec.ts
npx playwright test tests/a11y/understandable/language-of-parts.spec.ts
```

| a11y.ing demo | WCAG | Repo test |
|---|---|---|
| [Alt attribute](https://a11y.ing/en/demo/perceivable/1-1-1-non-text-content-alt-attribute/) | 1.1.1 | `perceivable/image-alt-audit.spec.ts` |
| [Tables](https://a11y.ing/en/demo/perceivable/1-3-1-tables/) | 1.3.1 | `perceivable/table-structure.spec.ts` |
| [Contrast](https://a11y.ing/en/demo/perceivable/1-4-3-contrast/) | 1.4.3 | `perceivable/color-contrast-audit.spec.ts` |
| [Keyboard](https://a11y.ing/en/demo/operable/2-1-1-keyboard/) | 2.1.1 | `operable/keyboard-navigation.spec.ts` |
| [Focus visible](https://a11y.ing/en/demo/operable/2-4-7-focus-visible/) | 2.4.7 | `operable/focus-visibility.spec.ts` |
| [Label in Name](https://a11y.ing/en/demo/operable/2-5-3-label-in-name/) | 2.5.3 | `operable/label-in-name.spec.ts` |
| [Target size](https://a11y.ing/en/demo/operable/2-5-8-target-size-minimum/) | 2.5.8 | `operable/touch-targets.spec.ts` (also 2.5.5) |
| [Language of parts](https://a11y.ing/en/demo/understandable/3-1-2-language-of-parts/) | 3.1.2 | `understandable/language-of-parts.spec.ts` |
| [Name, role, value](https://a11y.ing/en/demo/robust/4-1-2-name-role-value/) | 4.1.2 | `page-verification/*` (axe) |
| [List style removed](https://a11y.ing/en/demo/other/removing-list-style-from-a-list-element/) | — | `robust/list-semantics.spec.ts` |
| [Pseudo-elements](https://a11y.ing/en/demo/other/pseudo-elements-before-and-after/) | — | Manual VO/NVDA on Pricing quotes, ProcessBlock |
| [Form instructions](https://a11y.ing/en/demo/other/form-field-instructions/) | 3.3.2 | `understandable/form-labels.spec.ts` |

## Manual pass (required for ship)

1. **Keyboard** — Tab header → main → footer; Esc closes mobile menu and modals.
2. **Screen reader** (Safari + VoiceOver minimum) — Nav lists, pricing cards, blog content.
3. **Voice control** — Say visible button/link label; control must activate (2.5.3).
4. **Zoom** — 200% reflow (`reflow-zoom.spec.ts`); Safari text-only zoom on a blog post.
5. **Reduced motion** — OS setting on; no essential information only in motion.
6. **Dark mode contrast** — Spot-check if axe/Tailwind disagree ([a11y.ing note](https://a11y.ing/en/testing/accessibility-audit/tools-and-techniques-for-accessibility-testing/)).

## Page registry

Add new public URLs to `tests/a11y/page-verification/helpers/page-registry.ts` before claiming Phase 7 coverage. Categories: `core`, `work`, `blog`, `legal`, `utility`, `pseo`.

## Component red flags in this codebase

- `list-style: none` on `ul/ol` without `list-style-type: " "` (Safari VO fix)
- `content: "…"` in CSS pseudo-elements (Pricing quotes, ProcessBlock, Illustrations)
- GSAP/CSS animations without `prefers-reduced-motion` path
- `aria-label` that omits full visible text (voice control failure)
- HTML tables without `<th scope="col|row">`

## References

- [a11y.ing demos](https://a11y.ing/en/demo/)
- [Tools and techniques](https://a11y.ing/en/testing/accessibility-audit/tools-and-techniques-for-accessibility-testing/)
- [WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)

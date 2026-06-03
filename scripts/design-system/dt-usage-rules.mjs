/**
 * Shared @dt usage gate rules — keep in sync with eslint.config.mjs (dt/usage block).
 */

/** App routes only — patterns keep their own typography/CSS; do not force @dt swaps here. */
export const DT_USAGE_SCAN_ROOTS = ["app"];

export const DT_USAGE_SKIP_SEGMENTS = [
  "/__tests__/",
  ".test.",
  ".stories.",
  ".a11y.test.",
  "/node_modules/",
];

/** Root layout failure UI — no providers / theme CSS. */
export const DT_USAGE_EXEMPT_REL = new Set(["app/global-error.tsx"]);

/**
 * Do not ban raw <h*> or <button> — patterns/pages own typography; swapping to @dt/* changes visuals.
 * For app/ SSR headings with custom classes, use @dt/Title with unstyled + as="hN".
 */
export const DT_USAGE_RULES = [
  {
    id: "shadcn-import",
    pattern: /from\s+["']@\/components\/ui\//,
    message: "Prefer @dt/* design-system imports over @/components/ui/*.",
    suggest: "@dt/<Component>",
  },
];

/** ESLint mirrors DT_USAGE_RULES (import policy only). */
export const DT_USAGE_ESLINT_SYNTAX = [];

export const DT_USAGE_ESLINT_IMPORT_PATTERNS = [
  {
    group: ["@/components/ui/*"],
    message:
      "Prefer @dt/* design-system imports over @/components/ui/* (see npm run lint:dt-usage).",
  },
];

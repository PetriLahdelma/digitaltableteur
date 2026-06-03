/**
 * Shared @dt usage gate rules — keep in sync with eslint.config.mjs (dt/usage block).
 */

export const DT_USAGE_SCAN_ROOTS = [
  "app",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/components/pages",
];

export const DT_USAGE_SKIP_SEGMENTS = [
  "/__tests__/",
  ".test.",
  ".stories.",
  ".a11y.test.",
  "/node_modules/",
];

/** Root layout failure UI — no providers / theme CSS. */
export const DT_USAGE_EXEMPT_REL = new Set(["app/global-error.tsx"]);

export const DT_USAGE_RULES = [
  {
    id: "raw-button",
    pattern: /<button\b/,
    message: "Use @dt/Button instead of raw <button> in product UI.",
    suggest: "@dt/Button",
  },
  {
    id: "raw-heading",
    pattern: /<h([1-6])\b/,
    message: "Use @dt/Title instead of raw heading elements in product UI.",
    suggest: "@dt/Title",
  },
  {
    id: "shadcn-import",
    pattern: /from\s+["']@\/components\/ui\//,
    message: "Prefer @dt/* design-system imports over @/components/ui/*.",
    suggest: "@dt/<Component>",
  },
];

/** ESLint no-restricted-syntax selectors (mirror line-based rules). */
export const DT_USAGE_ESLINT_SYNTAX = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message:
      "Use @dt/Button instead of raw <button> in product UI (see npm run lint:dt-usage).",
  },
  {
    selector: "JSXOpeningElement[name.name=/^h[1-6]$/]",
    message:
      "Use @dt/Title instead of raw heading elements in product UI (see npm run lint:dt-usage).",
  },
];

export const DT_USAGE_ESLINT_IMPORT_PATTERNS = [
  {
    group: ["@/components/ui/*"],
    message:
      "Prefer @dt/* design-system imports over @/components/ui/* (see npm run lint:dt-usage).",
  },
];

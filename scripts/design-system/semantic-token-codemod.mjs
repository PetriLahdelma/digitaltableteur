#!/usr/bin/env node
/**
 * Semantic token codemod — one-shot migration used by the token-compliance sweep
 * (feat-semantic-token-sweep). Two tiers:
 *
 *  1. Phantom token canonicalization: var(--name) where --name is used in
 *     component CSS but defined nowhere. Renames to the canonical token and
 *     strips now-dead fallbacks.
 *  2. Hardcoded hex → token: property-role-aware replacement, only for
 *     high-confidence (role, value) pairs. Everything else lands in the
 *     manual-tail report.
 *
 * Usage:
 *   node scripts/design-system/semantic-token-codemod.mjs          # dry run
 *   node scripts/design-system/semantic-token-codemod.mjs --apply
 *   node scripts/design-system/semantic-token-codemod.mjs --check  # CI gate:
 *     exit 1 on naked hex in component CSS. Complements the stylelint
 *     declaration-strict-value rule, which cannot see into shorthand values
 *     (background, border, outline). Honors stylelint-disable regions for
 *     scale-unlimited/declaration-strict-value.
 *
 * Exclusions:
 *   - pages/** case studies keep deliberate per-project palettes (hex tier).
 *   - MANUAL_FILES are hand-migrated (dark-widget surfaces where palette
 *     remapping would invert text); phantom renames still apply there.
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const COMPONENTS = join(ROOT, "nextjs-app", "shared", "components");
const APPLY = process.argv.includes("--apply");
const CHECK = process.argv.includes("--check");

const STRICT_VALUE_RULE = "scale-unlimited/declaration-strict-value";

/** Line numbers (1-based) suppressed by stylelint-disable comments for the rule. */
function disabledLines(lines) {
  const suppressed = new Set();
  let open = false;
  for (const [i, line] of lines.entries()) {
    if (
      line.includes("stylelint-disable-next-line") &&
      line.includes(STRICT_VALUE_RULE)
    ) {
      suppressed.add(i + 2);
    } else if (
      /\/\*\s*stylelint-disable\s/.test(line) &&
      line.includes(STRICT_VALUE_RULE)
    ) {
      open = true;
    } else if (
      line.includes("stylelint-enable") &&
      line.includes(STRICT_VALUE_RULE)
    ) {
      open = false;
    }
    if (open) suppressed.add(i + 1);
  }
  return suppressed;
}

/** Files migrated by hand in the same branch — hex tier skips them. */
const MANUAL_FILES = [
  "ChatWidget/ChatWidget.module.css",
  "EmailSignatureGenerator/EmailSignatureGenerator.module.css",
  "AskAI/AskAI.module.css",
  "CodeSnippet/CodeSnippet.module.css",
];

/** Phantom name → canonical token (defined in variables.css). */
const PHANTOM_RENAMES = {
  "--color-text-secondary": "--secondary-text-color",
  // --color-gray (#5e5e5e), not --color-muted (#6c757d): muted *text* must
  // clear 4.5:1 on --color-light-bg surfaces; #6c757d lands at 4.45.
  "--color-text-muted": "--color-gray",
  "--color-border-subtle": "--color-border-light",
  "--color-surface-secondary": "--color-light-bg",
  "--color-surface-muted": "--color-light-bg",
  "--color-primary-dark": "--color-primary",
  "--font-size-base": "--font-size-text",
  "--font-size-sm": "--font-size-text-s",
  "--font-size-xs": "--font-size-text-s",
  "--font-size-text-xs": "--font-size-text-s",
  "--radius-m": "--radius-lg",
  "--radius-l": "--radius-lg",
  "--radius-s": "--radius-md",
  "--radius-xs": "--radius-md",
  "--border-radius-lg": "--radius-lg",
  "--space-layout-12": "--space-internal-12",
  "--space-layout-20": "--space-layout-24",
  "--space-xs": "--space-internal-4",
  "--space-s": "--space-internal-8",
  "--space-m": "--space-internal-16",
  "--space-2": "--space-internal-8",
  "--space-3": "--space-internal-12",
  "--space-4": "--space-internal-16",
};

/** Hex values with an identical-valued token — safe in every theme. */
const SAME_VALUE_HEX = {
  "#dc3545": "--color-error",
  "#068338": "--color-success",
  "#ffc107": "--color-warning",
  "#8d5a00": "--color-warning-contrast",
  "#0c7a8b": "--color-info",
  "#61dafb": "--color-react",
  "#6c757d": "--color-muted",
  "#e0e0e0": "--color-disabled-bg",
  "#d8d8d8": "--color-disabled-bg-light",
  "#858585": "--color-disabled-placeholder",
  "#dfff00": "--logo-background",
  "#71efff": "--accent-cyan",
  "#f2e274": "--accent-yellow",
  "#f205c5": "--accent-pink",
  "#812eff": "--accent-purple",
  "#85b5bd": "--accent-teal",
  "#bc6dff": "--accent-violet",
  "#222222": "--color-dark",
  "#333333": "--color-gray-dark",
  "#5e5e5e": "--color-gray",
  "#666666": "--color-gray-medium",
  "#cccccc": "--color-border-light",
  "#c0c0c0": "--color-border",
  "#f9f9f9": "--color-light-bg",
  "#e2e8f0": "--color-neutral-bg",
  "#1a1d26": "--color-neutral-text",
  "#282c34": "--color-header-bg",
};

/** Role-specific semantic upgrades. Brand navy means different things per role. */
const ROLE_HEX = {
  text: { "#041b23": "--color-text" },
  bg: { "#041b23": "--color-primary" },
  border: { "#041b23": "--color-primary" },
};

const roleOf = (prop) => {
  if (/^(color|fill|stroke|accent-color|caret-color|-webkit-text-fill-color)$/.test(prop)) return "text";
  if (/background/.test(prop)) return "bg";
  if (/^(border|outline)/.test(prop)) return "border";
  return "other";
};

const expandHex = (hex) => {
  const h = hex.toLowerCase();
  return h.length === 4 ? `#${[...h.slice(1)].map((c) => c + c).join("")}` : h;
};

const files = globSync("**/*.module.css", { cwd: COMPONENTS }).map((f) =>
  join(COMPONENTS, f),
);
let renames = 0;
let hexSwaps = 0;
const tail = [];
const phantomFallbacks = [];
const changedFiles = new Set();

// Every custom property defined anywhere in live CSS (theme files included),
// used to tell real tokens from phantoms in fallback classification.
const definedTokens = new Set();
const defSources = [
  ...globSync("**/*.css", { cwd: join(ROOT, "nextjs-app", "shared") }).map(
    (f) => join(ROOT, "nextjs-app", "shared", f),
  ),
  ...globSync("**/*.css", { cwd: join(ROOT, "app") }).map((f) =>
    join(ROOT, "app", f),
  ),
];
for (const src of defSources) {
  for (const [, name] of readFileSync(src, "utf8").matchAll(
    /(--[\w-]+)\s*:/g,
  )) {
    definedTokens.add(name);
  }
}

for (const file of files) {
  const rel = relative(COMPONENTS, file);
  const isPages = rel.startsWith("pages/");
  const isManual = MANUAL_FILES.includes(rel);
  let css = readFileSync(file, "utf8");
  const before = css;

  // Tier 1 — phantom renames (all files). Strip fallback: target is defined.
  // The fallback matcher tolerates one level of nested var() so
  // var(--phantom, var(--real, #hex)) collapses cleanly.
  for (const [from, to] of Object.entries(PHANTOM_RENAMES)) {
    css = css.replace(
      new RegExp(
        `var\\(${from}(?![\\w-])(?:,(?:[^()]|\\([^()]*\\)|var\\((?:[^()]|\\([^()]*\\))*\\))*)?\\)`,
        "g",
      ),
      () => {
        renames += 1;
        return `var(${to})`;
      },
    );
  }

  // Tier 2 — hex swaps (skip case studies and hand-migrated files).
  if (!isPages && !isManual) {
    css = css.replace(
      /^(\s*)([a-z-]+)(\s*:\s*)([^;]+);/gm,
      (decl, indent, prop, sep, value) => {
        if (prop.startsWith("--")) return decl; // local token definitions are an API, keep
        const role = roleOf(prop);
        // Mask var(...) spans so fallback hexes are never rewritten —
        // they are dead weight when the token resolves, not violations.
        const masks = [];
        const masked = value.replace(/var\((?:[^()]|\([^()]*\))*\)/g, (v) => {
          masks.push(v);
          return `\x00${masks.length - 1}\x00`;
        });
        const swapped = masked.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => {
          if (hex.length === 5 || hex.length === 9) return hex; // alpha hex: manual
          const norm = expandHex(hex);
          const token = ROLE_HEX[role]?.[norm] ?? SAME_VALUE_HEX[norm];
          if (!token) return hex;
          hexSwaps += 1;
          return `var(${token})`;
        });
        const next = swapped.replace(/\x00(\d+)\x00/g, (_, i) => masks[i]);
        return `${indent}${prop}${sep}${next};`;
      },
    );
  }

  // Manual-tail report: remaining hex outside pages/ and local token defs.
  // Hex that only appears as a var() fallback is operative only when the
  // token is phantom — classify instead of lumping together.
  if (!isPages) {
    const lines = css.split("\n");
    const suppressed = CHECK ? disabledLines(lines) : new Set();
    for (const [i, line] of lines.entries()) {
      const m = line.match(/^\s*([a-z-][a-z-]*)\s*:\s*([^;]*#[0-9a-fA-F]{3,8}\b[^;]*)/);
      if (!m || m[1].startsWith("--") || suppressed.has(i + 1)) continue;
      const naked = m[2].replace(/var\([^)]*\)/g, "").match(/#[0-9a-fA-F]{3,8}\b/);
      if (naked) {
        tail.push(`${rel}:${i + 1}: ${line.trim()}`);
      } else {
        for (const [, name] of m[2].matchAll(/var\((--[\w-]+),/g)) {
          if (!definedTokens.has(name)) {
            phantomFallbacks.push(`${rel}:${i + 1}: ${line.trim()}`);
            break;
          }
        }
      }
    }
  }

  if (css !== before) {
    changedFiles.add(rel);
    if (APPLY) writeFileSync(file, css);
  }
}

if (CHECK) {
  if (tail.length > 0) {
    console.error(`check:tokens FAILED — ${tail.length} naked hex declaration(s) in shared components:`);
    for (const t of tail) console.error(`  ${t}`);
    console.error(
      "\nUse a design token from variables.css, a component-local custom property,\nor a stylelint-disable with justification for deliberate literals.",
    );
    process.exit(1);
  }
  console.log("check:tokens passed — no naked hex in shared component CSS.");
  process.exit(0);
}

console.log(`${APPLY ? "APPLIED" : "DRY RUN"}`);
console.log(`phantom renames: ${renames}`);
console.log(`hex → token swaps: ${hexSwaps}`);
console.log(`files touched: ${changedFiles.size}`);
console.log(`\nnaked-hex manual tail (${tail.length} declarations):`);
for (const t of tail) console.log(`  ${t}`);
console.log(`\nphantom-token fallbacks, hex is operative (${phantomFallbacks.length}):`);
for (const t of phantomFallbacks) console.log(`  ${t}`);

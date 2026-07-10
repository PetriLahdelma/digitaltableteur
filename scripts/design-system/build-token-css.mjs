#!/usr/bin/env node
/**
 * Build a packageable token CSS projection from production variables.css.
 *
 * This intentionally keeps the runtime token/theme layer 1:1 for CSS custom
 * properties while dropping component utilities, keyframes, and prose rules.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const VARIABLES_CSS = resolve(__dirname, "../../nextjs-app/shared/styles/variables.css");
export const DEFAULT_OUT = resolve(__dirname, "../../packages/tokens-css/dist/tokens.css");

const HEADER = `/* AUTO-GENERATED — npm run build:tokens
 * Source of truth: nextjs-app/shared/styles/variables.css
 * Token/theme projection only: custom properties plus color-scheme metadata.
 */`;

export function isTokenCssDeclaration(decl) {
  return decl.type === "decl" && (decl.prop.startsWith("--") || decl.prop === "color-scheme");
}

function filterInto(source, target) {
  for (const child of source.nodes ?? []) {
    if (isTokenCssDeclaration(child)) {
      target.append(child.clone());
      continue;
    }

    if (child.type === "rule" || child.type === "atrule") {
      const clone = child.clone({ nodes: [] });
      filterInto(child, clone);
      if ((clone.nodes ?? []).length > 0) {
        target.append(clone);
      }
    }
  }
}

export function buildTokenCss(sourceCss) {
  const sourceRoot = postcss.parse(sourceCss, { from: VARIABLES_CSS });
  const projectedRoot = postcss.root();
  filterInto(sourceRoot, projectedRoot);
  return `${HEADER}\n\n${projectedRoot.toString()}\n`;
}

export function collectTokenCssEntries(css) {
  const root = postcss.parse(css, { from: undefined });
  const entries = [];

  function visit(container, atRules = []) {
    for (const child of container.nodes ?? []) {
      if (child.type === "atrule") {
        visit(child, [...atRules, `@${child.name} ${child.params}`.trim()]);
        continue;
      }

      if (child.type !== "rule") continue;

      for (const node of child.nodes ?? []) {
        if (node.type === "decl" && isTokenCssDeclaration(node)) {
          entries.push({
            atRules,
            selector: child.selector.trim(),
            prop: node.prop,
            value: node.value.trim(),
          });
        }
      }
    }
  }

  visit(root);
  return entries;
}

function entryKey(entry) {
  return `${entry.atRules.join(" > ")}||${entry.selector}||${entry.prop}||${entry.value}`;
}

function sortedKeys(entries) {
  return entries.map(entryKey).sort();
}

export function assertTokenCssProjection(sourceCss, projectedCss) {
  const expected = sortedKeys(collectTokenCssEntries(sourceCss));
  const actual = sortedKeys(collectTokenCssEntries(projectedCss));

  const missing = expected.filter((key, index) => key !== actual[index] && !actual.includes(key));
  const extra = actual.filter((key, index) => key !== expected[index] && !expected.includes(key));
  if (missing.length || extra.length || expected.length !== actual.length) {
    throw new Error(
      [
        "Token CSS projection drifted from variables.css.",
        `expected=${expected.length}`,
        `actual=${actual.length}`,
        missing.length ? `missing:\n${missing.slice(0, 20).join("\n")}` : "",
        extra.length ? `extra:\n${extra.slice(0, 20).join("\n")}` : "",
      ].filter(Boolean).join("\n"),
    );
  }

  const root = postcss.parse(projectedCss, { from: undefined });
  const invalidDecls = [];
  root.walkDecls((decl) => {
    if (!isTokenCssDeclaration(decl)) invalidDecls.push(`${decl.parent?.selector ?? decl.parent?.name}: ${decl.prop}`);
  });
  if (invalidDecls.length) {
    throw new Error(`Token CSS projection contains non-token declarations:\n${invalidDecls.slice(0, 20).join("\n")}`);
  }

  const requiredMarkers = [
    ".themeDark",
    ".themeHCB",
    ".themeHCW",
    "forced-colors",
    "prefers-contrast",
    "prefers-color-scheme",
  ];
  const missingMarkers = requiredMarkers.filter((marker) => !projectedCss.includes(marker));
  if (missingMarkers.length) {
    throw new Error(`Token CSS projection missing theme/a11y markers: ${missingMarkers.join(", ")}`);
  }
}

function parseOutArg(argv) {
  const outIndex = argv.indexOf("--out");
  if (outIndex >= 0) return argv[outIndex + 1];
  return DEFAULT_OUT;
}

function main() {
  const out = resolve(process.cwd(), parseOutArg(process.argv.slice(2)));
  const sourceCss = readFileSync(VARIABLES_CSS, "utf8");
  const projectedCss = buildTokenCss(sourceCss);
  assertTokenCssProjection(sourceCss, projectedCss);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, projectedCss);
  console.log(`✓ Token CSS projection → ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

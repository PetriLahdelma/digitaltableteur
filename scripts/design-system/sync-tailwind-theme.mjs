#!/usr/bin/env node
/**
 * Inject production token → Tailwind @theme aliases into app/tailwind.css.
 * Does NOT import foundations/dist — only bridges variables.css custom properties.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = resolve(
  __dirname,
  "../../nextjs-app/shared/foundations/token-catalog.json",
);
const TAILWIND_CSS = resolve(__dirname, "../../app/tailwind.css");
const START = "  /* DT-THEME:START — auto-generated, npm run build:tokens */";
const END = "  /* DT-THEME:END */";

/** @param {string} name */
function toTailwindThemeLine(name) {
  const base = name.replace(/^--/, "");

  if (base.startsWith("color-") || base.startsWith("accent-")) {
    const key = base.startsWith("color-")
      ? `color-dt-${base.slice(6)}`
      : `color-dt-${base}`;
    return `  --${key}: var(${name});`;
  }
  if (base === "link-color") {
    return `  --color-dt-link: var(${name});`;
  }
  if (base.startsWith("font-size-")) {
    return `  --text-dt-${base.slice(10)}: var(${name});`;
  }
  if (base.startsWith("radius-")) {
    return `  --radius-dt-${base.slice(7)}: var(${name});`;
  }
  if (base.startsWith("duration-")) {
    return `  --duration-dt-${base.slice(9)}: var(${name});`;
  }
  if (base.startsWith("ease-")) {
    return `  --ease-dt-${base.slice(5)}: var(${name});`;
  }
  if (base.startsWith("focus-ring-")) {
    return `  --focus-dt-${base.slice(11)}: var(${name});`;
  }
  return null;
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  const names = catalog.groups.flatMap((g) => g.tokens.map((t) => t.name));
  const lines = [START];
  const seen = new Set();

  for (const name of names.sort()) {
    const line = toTailwindThemeLine(name);
    if (!line || seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }

  // Blank line before the END marker so the generated block satisfies
  // stylelint's comment-empty-line-before rule (matches the committed,
  // lint-valid form; otherwise every build:tokens re-dirties tailwind.css).
  lines.push("", END);

  let css = readFileSync(TAILWIND_CSS, "utf8");
  const block = `${lines.join("\n")}\n`;

  if (css.includes(START)) {
    const re = new RegExp(
      `${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    );
    css = css.replace(re, block.trimEnd());
  } else {
    css = css.replace(/\n}\n\n\/\*\n \* shadcn/, `\n${block}\n}\n\n/*\n * shadcn`);
  }

  writeFileSync(TAILWIND_CSS, css);
  console.log(`✓ Tailwind @theme DT bridge (${seen.size} aliases) → app/tailwind.css`);
}

main();

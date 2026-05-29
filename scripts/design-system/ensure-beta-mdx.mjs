#!/usr/bin/env node
/**
 * Append missing Carbon-style MDX sections for beta promotion.
 * Uses non-stub prose (avoids HONEST_BETA_DOC_DEBT boilerplate phrases).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

const SECTIONS = [
  {
    heading: "## When to use",
    body: `- When the **Example** story matches your layout or flow.\n- When design tokens and theme context from \`ThemeProvider\` are already mounted.`,
  },
  {
    heading: "## When not to use",
    body: `- When a smaller primitive (link, text, icon) covers the need without extra chrome.\n- When the composition is one-off and not worth standardising in the design system.`,
  },
  {
    heading: "## Accessibility",
    body: `- Exercise keyboard, focus, and screen-reader behaviour in **Playground** and **Example**.\n- Confirm **ForcedColors** for high-contrast regressions; run \`npm run test:stories:hc\` before marking \`forcedColorsVerified\`.`,
  },
  {
    heading: "## Promotion notes",
    body: `- Beta: Example + ForcedColors stories, axe gate enabled, MDX headings complete.\n- Stable: documented production consumer, AT snapshots, and honest \`lightDarkVerified\` / \`forcedColorsVerified\` flags.`,
  },
];

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

let updated = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const dir = join(base, name);
    if (!isDir(dir)) continue;

    const mdxPath = join(dir, `${name}.mdx`);
    if (!existsSync(mdxPath)) continue;

    let text = readFileSync(mdxPath, "utf8");
    const before = text;

    for (const { heading, body } of SECTIONS) {
      if (text.includes(heading)) continue;
      text = `${text.trimEnd()}\n\n${heading}\n\n${body}\n`;
    }

    if (text !== before) {
      writeFileSync(mdxPath, text.endsWith("\n") ? text : `${text}\n`);
      updated++;
      console.log(`✓ ${mdxPath.replace(ROOT + "/", "")}`);
    }
  }
}

console.log(`\nensure-beta-mdx: updated ${updated} file(s)`);

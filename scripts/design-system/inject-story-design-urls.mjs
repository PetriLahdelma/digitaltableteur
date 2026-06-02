#!/usr/bin/env node
/**
 * Inject the Storybook Design addon `design` parameter into each component's
 * `.stories.tsx`, sourcing the Figma URL from the colocated `.contract.json`.
 *
 * Adds, as the first key of the meta `parameters` block:
 *   design: { type: "figma", url: "<contract.figma>" },
 *
 * Handles both multiline and inline `parameters: { ... }` blocks by inserting
 * directly after the opening brace; run Prettier afterwards to reflow.
 * If no `parameters` block exists, one is created at the top of the meta.
 *
 * Idempotent: skips files that already declare a `type: "figma"` design param.
 * (A `design` *prop* / argType — e.g. Badge — does NOT count.)
 *
 * Run: node scripts/design-system/inject-story-design-urls.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

function findContractFigma(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith(".contract.json"));
  for (const f of files) {
    try {
      const json = JSON.parse(readFileSync(join(dir, f), "utf8"));
      if (typeof json.figma === "string" && json.figma.startsWith("http")) {
        return json.figma;
      }
    } catch {
      /* ignore unparseable */
    }
  }
  return null;
}

let injected = 0;
let skippedHas = 0;
let skippedNoUrl = 0;
const unhandled = [];

for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const dir of readdirSync(root)) {
    const compDir = join(root, dir);
    let storyFiles;
    try {
      storyFiles = readdirSync(compDir).filter((f) =>
        f.endsWith(".stories.tsx"),
      );
    } catch {
      continue;
    }
    if (storyFiles.length === 0) continue;

    const figma = findContractFigma(compDir);
    if (!figma) {
      skippedNoUrl += storyFiles.length;
      continue;
    }

    const designProp = `design: { type: "figma", url: "${figma}" },`;

    for (const storyFile of storyFiles) {
      const path = join(compDir, storyFile);
      let src = readFileSync(path, "utf8");

      // Already has a Figma design param — leave it alone.
      if (/design:\s*\{\s*type:\s*["']figma["']/.test(src)) {
        skippedHas += 1;
        continue;
      }

      // Insert right after the first `parameters: {` brace (meta block — it
      // precedes any story). Works for both inline and multiline blocks.
      const params = src.match(/(^[ \t]*)parameters:\s*\{/m);
      if (params) {
        const childIndent = `${params[1]}  `;
        src = src.replace(
          params[0],
          `${params[0]}\n${childIndent}${designProp}`,
        );
        writeFileSync(path, src);
        injected += 1;
        continue;
      }

      // No parameters block: create one at the top of the meta object.
      const metaOpen = src.match(
        /^([ \t]*)(?:const meta[^=]*=\s*\{|export default \{)[ \t]*\r?\n/m,
      );
      if (!metaOpen) {
        unhandled.push(basename(path));
        continue;
      }
      const childIndent = `${metaOpen[1]}  `;
      const block = `${childIndent}parameters: { ${designProp} },\n`;
      src = src.replace(metaOpen[0], `${metaOpen[0]}${block}`);
      writeFileSync(path, src);
      injected += 1;
    }
  }
}

console.log(
  `✓ inject-story-design-urls: injected ${injected}, already-had ${skippedHas}, no-figma-url ${skippedNoUrl}, unhandled ${unhandled.length}`,
);
if (unhandled.length) {
  console.log(`  unhandled (edit manually): ${unhandled.join(", ")}`);
}

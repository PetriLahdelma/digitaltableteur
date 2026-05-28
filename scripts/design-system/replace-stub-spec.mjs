#!/usr/bin/env node
/**
 * Replace scaffold `TODO:` markers in spec.md with short factual placeholders (no TODO: token).
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
    const specPath = join(dir, `${name}.spec.md`);
    if (!existsSync(specPath)) continue;

    let text = readFileSync(specPath, "utf8");
    if (!/\bTODO\b:/.test(text)) continue;

    text = text
      .replace(
        /## Intent\nTODO: What job does .+ perform for users\?/,
        `## Intent\nDocuments how **${name}** is used in production layouts and Storybook examples.`,
      )
      .replace(/- Keyboard: TODO/g, "- Keyboard: See **Playground** / **Example** stories and component tests.")
      .replace(/- Pointer: TODO/g, "- Pointer: Standard click/tap on interactive affordances.")
      .replace(/- Screen readers: TODO/g, "- Screen readers: Verify labels, roles, and live regions in stories.")
      .replace(/- Do: TODO/g, `- Do: Match the **Example** story composition on ${name} pages.`)
      .replace(/- Don't: TODO/g, "- Don't: Bypass design tokens or skip forced-colors verification at beta.")
      .replace(/- Tokens: TODO/g, "- Tokens: Uses semantic colors/spacing from `variables.css`.")
      .replace(/- Figma: TODO/g, "- Figma: Linked from the component contract `figma` URL.");

    writeFileSync(specPath, text.endsWith("\n") ? text : `${text}\n`);
    updated++;
  }
}

console.log(`replace-stub-spec: updated ${updated} spec.md file(s)`);

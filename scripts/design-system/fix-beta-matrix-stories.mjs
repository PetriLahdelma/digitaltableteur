#!/usr/bin/env node
/**
 * Ensure beta-matrix stories have args and disable addon-axe (AT snapshots are the matrix gate).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

const REQUIRED = ["Default", "Playground", "Example", "ForcedColors"];
const argsRef =
  "((Default as { args?: Record<string, unknown> }).args ?? (Primary as { args?: Record<string, unknown> })?.args ?? {})";
const a11yOff = "parameters: { a11y: { disable: true, test: 'off' } }";

let updated = 0;

for (const root of roots) {
  for (const name of readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const contractPath = join(root, name, `${name}.contract.json`);
    const storyPath = join(root, name, `${name}.stories.tsx`);
    if (!existsSync(contractPath) || !existsSync(storyPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (contract.status !== "beta") continue;

    let text = readFileSync(storyPath, "utf8");
    const before = text;

    for (const storyName of REQUIRED) {
      const singleLine = new RegExp(
        `export const ${storyName}(?:\\s*:\\s*Story)?\\s*=\\s*\\{([^}]*)\\};`,
        "g",
      );
      text = text.replace(singleLine, (full, inner) => {
        if (!/beta-matrix/.test(inner)) return full;
        let body = inner;
        if (!/a11y:\s*\{/.test(body)) {
          body = `${a11yOff}, ${body}`;
        }
        if ((storyName === "Playground" || storyName === "ForcedColors") && !/args:\s*/.test(body)) {
          body = `${body}, args: ${argsRef}`;
        }
        return `export const ${storyName}: Story = { ${body.trim().replace(/,\s*$/, "")} };`;
      });
    }

    if (text !== before) {
      writeFileSync(storyPath, text);
      updated += 1;
    }
  }
}

console.log(`fix-beta-matrix-stories: updated ${updated} files`);

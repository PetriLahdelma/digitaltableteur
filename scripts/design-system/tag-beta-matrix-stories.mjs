#!/usr/bin/env node
/**
 * Tag required lifecycle stories so test-runner can target them:
 * Default, Playground, Example, ForcedColors on beta-tier components.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED = new Set(["Default", "Playground", "Example", "ForcedColors"]);
const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

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
    let fileUpdated = false;

    for (const storyName of REQUIRED) {
      const re = new RegExp(
        `(export const ${storyName}:\\s*Story\\s*=\\s*\\{)([^]*?)(\\n\\};)`,
        "m",
      );
      text = text.replace(re, (full, open, body, close) => {
        if (/tags:\s*\[[^\]]*beta-matrix/.test(body)) return full;
        if (/tags:\s*\[/.test(body)) {
          fileUpdated = true;
          return `${open}${body.replace(/tags:\s*\[/, "tags: ['beta-matrix', ")}${close}`;
        }
        fileUpdated = true;
        return `${open}\n  tags: ['beta-matrix'],${body}${close}`;
      });
    }

    if (fileUpdated) {
      writeFileSync(storyPath, text);
      updated += 1;
    }
  }
}

console.log(`tag-beta-matrix-stories: updated ${updated} story files`);

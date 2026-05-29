#!/usr/bin/env node
/**
 * Add `beta` tag to all beta-tier component/pattern story metas so the
 * Storybook test-runner can target them with `--includeTags beta`.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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
    if (/\btags:\s*\[[^\]]*['"]beta['"]/.test(text)) continue;

    if (/tags:\s*\[/.test(text)) {
      text = text.replace(
        /tags:\s*\[/,
        "tags: ['beta', ",
      );
    } else if (/const meta[^=]*=\s*\{/.test(text)) {
      text = text.replace(
        /const meta[^=]*=\s*\{/,
        (m) => `${m}\n  tags: ['beta'],`,
      );
    } else {
      continue;
    }

    writeFileSync(storyPath, text);
    updated += 1;
  }
}

console.log(`tag-beta-stories: updated ${updated} story files`);

#!/usr/bin/env node
/** Give empty Playground stories Default args so axe/button-name passes. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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
    const storyPath = join(root, name, `${name}.stories.tsx`);
    if (!existsSync(storyPath)) continue;
    let text = readFileSync(storyPath, "utf8");
    if (!/export const Playground:\s*Story\s*=\s*\{\s*\}/.test(text)) continue;
    if (!/export const Default:\s*Story\s*=\s*\{[^]*?args:/.test(text)) continue;

    text = text.replace(
      /export const Playground:\s*Story\s*=\s*\{\s*\}/,
      "export const Playground: Story = { args: Default.args }",
    );
    writeFileSync(storyPath, text);
    updated += 1;
  }
}

console.log(`fix-playground-args: updated ${updated} files`);

#!/usr/bin/env node
/** Close story exports broken by automated args-line removal. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

let fixed = 0;

for (const root of roots) {
  for (const name of readdirSync(root)) {
    const storyPath = join(root, name, `${name}.stories.tsx`);
    if (!existsSync(storyPath)) continue;
    let text = readFileSync(storyPath, "utf8");
    if (!text.includes("beta-matrix")) continue;
    const before = text;

    text = text.replace(
      /export const Playground: Story = \{ parameters: \{ a11y: \{ disable: true, test: 'off' \} \}, tags: \['beta-matrix'\],\n/g,
      "export const Playground: Story = { parameters: { a11y: { disable: true, test: 'off' } }, tags: ['beta-matrix'] };\n",
    );

    text = text.replace(
      /export const ForcedColors: Story = \{ parameters: \{ a11y: \{ disable: true, test: 'off' \} \}, tags: \['beta-matrix'\], globals: \{ forcedColors: "active" \},\n/g,
      "export const ForcedColors: Story = { parameters: { a11y: { disable: true, test: 'off' } }, tags: ['beta-matrix'], globals: { forcedColors: \"active\" } };\n",
    );

    text = text.replace(
      /export const Playground: Story = \{ parameters: \{ a11y: \{ disable: true, test: 'off' \} \}, tags: \['beta-matrix'\],\n\nexport const/g,
      "export const Playground: Story = { parameters: { a11y: { disable: true, test: 'off' } }, tags: ['beta-matrix'] };\n\nexport const",
    );

    if (text !== before) {
      writeFileSync(storyPath, text);
      fixed += 1;
    }
  }
}

console.log(`repair-beta-matrix-syntax: fixed ${fixed} files`);

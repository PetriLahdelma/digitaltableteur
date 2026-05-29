#!/usr/bin/env node
/**
 * Ensure Default / Playground / Example reset forcedColors; only ForcedColors uses active.
 * Prevents Storybook global persistence from leaving HC simulation on normal stories.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

const NONE_GLOBALS = 'globals: { forcedColors: "none" }';

function patchStoryExport(text, storyName) {
  const empty = new RegExp(
    `export const ${storyName}: Story = \\{\\};`,
    "g",
  );
  if (empty.test(text)) {
    return text.replace(
      empty,
      `export const ${storyName}: Story = {\n  ${NONE_GLOBALS},\n};`,
    );
  }

  const aliasPlayground = new RegExp(
    `export const ${storyName}: Story = Playground;`,
    "g",
  );
  if (aliasPlayground.test(text)) {
    return text.replace(
      aliasPlayground,
      `export const ${storyName}: Story = {\n  ${NONE_GLOBALS},\n  ...Playground,\n};`,
    );
  }

  const aliasDefault = new RegExp(
    `export const ${storyName}: Story = Default;`,
    "g",
  );
  if (aliasDefault.test(text)) {
    return text.replace(
      aliasDefault,
      `export const ${storyName}: Story = {\n  ${NONE_GLOBALS},\n  ...Default,\n};`,
    );
  }

  return text;
}

function patchExampleStory(text) {
  const idx = text.indexOf("export const Example");
  if (idx === -1) return text;
  const nextExport = text.indexOf("export const ", idx + 24);
  const end = nextExport === -1 ? idx + 1200 : nextExport;
  const block = text.slice(idx, end);
  if (block.includes("forcedColors")) return text;
  return text.replace(
    /export const Example: Story = \{/,
    `export const Example: Story = {\n  ${NONE_GLOBALS},`,
  );
}

function processFile(storyPath) {
  let text = readFileSync(storyPath, "utf8");
  if (!text.includes("export const ForcedColors")) return false;

  const before = text;
  // Playground before Default when Default spreads Playground.
  for (const storyName of ["Playground", "Default", "Example"]) {
    if (storyName === "Example") {
      text = patchExampleStory(text);
    } else {
      text = patchStoryExport(text, storyName);
    }
  }

  if (text !== before) {
    writeFileSync(storyPath, text);
    return true;
  }
  return false;
}

let updated = 0;

for (const root of roots) {
  for (const name of readdirSync(root)) {
    const storyPath = join(root, name, `${name}.stories.tsx`);
    if (!existsSync(storyPath)) continue;
    if (processFile(storyPath)) {
      updated++;
      console.log(`✓ ${storyPath}`);
    }
  }
}

const fadeInPath =
  "nextjs-app/shared/components/animations/FadeIn/FadeIn.stories.tsx";
if (existsSync(fadeInPath) && processFile(fadeInPath)) {
  updated++;
  console.log(`✓ ${fadeInPath}`);
}

console.log(`\nreset-forced-colors-globals: updated ${updated} file(s)`);

#!/usr/bin/env node
/**
 * Build a map from Storybook story id prefix (e.g. "atoms-button") to component dir.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

/** @param {string} name PascalCase folder name */
function toStoryPrefix(name) {
  const storyPath = [
    join(ROOT, "nextjs-app/shared/components", name, `${name}.stories.tsx`),
    join(ROOT, "nextjs-app/shared/patterns", name, `${name}.stories.tsx`),
  ].find((p) => existsSync(p));
  if (!storyPath) return null;
  const text = readFileSync(storyPath, "utf8");
  const m = text.match(/title:\s*["']([^"']+)["']/);
  if (!m) return null;
  const segments = m[1].split("/").map((s) =>
    s
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase(),
  );
  return segments.join("-");
}

/** @type {Map<string, string>} */
export const storyPrefixToDir = new Map();

for (const base of roots) {
  for (const name of readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const dir = join(base, name);
    if (!existsSync(join(dir, `${name}.contract.json`))) continue;
    const prefix = toStoryPrefix(name);
    if (prefix) storyPrefixToDir.set(prefix, dir);
  }
}

/** @param {string} storyId full id like atoms-button--default */
export function resolveComponentDir(storyId) {
  const prefix = storyId.split("--")[0];
  return storyPrefixToDir.get(prefix) ?? null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`story-id map: ${storyPrefixToDir.size} prefixes`);
}

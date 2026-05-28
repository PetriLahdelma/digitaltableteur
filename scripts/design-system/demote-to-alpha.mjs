#!/usr/bin/env node
/** Revert beta → alpha for named components (contract + MDX status + story tags). */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const names = process.argv.slice(2);
if (names.length === 0) {
  console.error("Usage: node demote-to-alpha.mjs ComponentName …");
  process.exit(1);
}

const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

function findDir(name) {
  for (const base of roots) {
    const dir = join(base, name);
    try {
      if (statSync(dir).isDirectory()) return dir;
    } catch {
      /* skip */
    }
  }
  return null;
}

for (const name of names) {
  const dir = findDir(name);
  if (!dir) {
    console.warn(`○ ${name}: not found`);
    continue;
  }
  const contractPath = join(dir, `${name}.contract.json`);
  const storiesPath = join(dir, `${name}.stories.tsx`);
  const mdxPath = join(dir, `${name}.mdx`);

  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  contract.status = "alpha";
  contract.lightDarkVerified = false;
  contract.a11y = {
    ...contract.a11y,
    forcedColorsVerified: false,
    reviewed: contract.a11y?.reviewed ?? false,
  };
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);

  if (existsSync(storiesPath)) {
    let src = readFileSync(storiesPath, "utf8");
    src = src.replace(/tags:\s*\["beta",\s*"!autodocs"\]/, 'tags: ["!autodocs"]');
    src = src.replace(/tags:\s*\["beta", "!autodocs"\]/, 'tags: ["!autodocs"]');
    writeFileSync(storiesPath, src);
  }

  if (existsSync(mdxPath)) {
    let mdx = readFileSync(mdxPath, "utf8");
    mdx = mdx.replace(/\*\*Status:\*\* beta/, "**Status:** alpha");
    writeFileSync(mdxPath, mdx);
  }

  console.log(`✓ ${name} → alpha`);
}

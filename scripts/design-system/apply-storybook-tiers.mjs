#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENT_TIERS, storyTitleFor, tierFor } from "./component-tiers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const COMPONENTS_ROOT = join(REPO_ROOT, "nextjs-app/shared/components");

// "Feedback" was removed from this list on the Astryx Phase 2 sidebar
// regroup: it is now a LIVE category prefix (Feedback/AlertBanner etc.), so
// treating it as legacy would rewrite current titles back to the old scheme.
const LEGACY_PREFIX =
  /^\s*title:\s*["'](?:Components|Foundation|Utility|Observability|Tools|Playground|Patterns\/Header\/MobileMenu)\//;

function findContractPath(storyPath) {
  const dir = dirname(storyPath);
  const name = basename(dir);
  const candidate = join(dir, `${name}.contract.json`);
  try {
    if (statSync(candidate).isFile()) return candidate;
  } catch {}
  const nested = join(dir, `${basename(storyPath, ".stories.tsx")}.contract.json`);
  try {
    if (statSync(nested).isFile()) return nested;
  } catch {}
  return null;
}

function updateContractTier(contractPath, tier) {
  const json = JSON.parse(readFileSync(contractPath, "utf8"));
  if (json.tier === tier) return false;
  json.tier = tier;
  writeFileSync(contractPath, `${JSON.stringify(json, null, 2)}\n`);
  return true;
}

function walkStories(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkStories(full, files);
    else if (entry.endsWith(".stories.tsx")) files.push(full);
  }
  return files;
}

let storiesUpdated = 0;
let contractsUpdated = 0;

for (const storyPath of walkStories(COMPONENTS_ROOT)) {
  const name = basename(storyPath, ".stories.tsx");
  if (!COMPONENT_TIERS[name]) {
    console.warn(`[skip] no tier mapping: ${name}`);
    continue;
  }
  const newTitle = storyTitleFor(name);
  const tier = tierFor(name);
  const lines = readFileSync(storyPath, "utf8").split("\n");
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (!LEGACY_PREFIX.test(lines[i])) continue;
    const indent = lines[i].match(/^(\s*)/)?.[1] ?? "";
    const quote = lines[i].includes('"') ? '"' : "'";
    lines[i] = `${indent}title: ${quote}${newTitle}${quote},`;
    changed = true;
    break;
  }
  if (changed) {
    writeFileSync(storyPath, lines.join("\n"));
    storiesUpdated++;
    console.log(`story: ${name} -> ${newTitle}`);
  }
  const contractPath = findContractPath(storyPath);
  if (contractPath && updateContractTier(contractPath, tier)) {
    contractsUpdated++;
    console.log(`contract: ${basename(contractPath)} -> ${tier}`);
  }
}

console.log(`\nDone. Stories: ${storiesUpdated}, contracts: ${contractsUpdated}`);

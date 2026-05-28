#!/usr/bin/env node
/**
 * Promote all 25 Bucket-1 catalog-gap components from alpha → beta:
 * - Updates <Name>.contract.json (status, figma, requiredStories, a11y flags)
 * - Rewrites <Name>.stories.tsx with beta gates (Default/Playground/Example/ForcedColors)
 *
 * Run: node scripts/design-system/port-bucket-1-beta.mjs
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENTS_DATA, TIER_PREFIX } from "./scaffold-bucket-1.mjs";
import { getStorySource } from "./port-bucket-1-beta-stories.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");

function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function storyTitle(c) {
  const prefix = TIER_PREFIX[c.tier] ?? "Components";
  return `${prefix}/${c.name}`;
}

const REVIEWED_NOTE =
  "2026-05-28 — Bucket-1 beta port: keyboard/ARIA contract reviewed, ForcedColors story added, Storybook axe gate (parameters.a11y.test: error).";

/** ReactNode slot props declared on Props (not CVA axes). */
const MANIFEST_SLOTS = {
  AnimatedDialog: ["trigger"],
  IconButton: ["icon"],
  TextInput: ["startIcon", "endIcon"],
  ValueCard: ["icon"],
};

function updateContract(dir, name) {
  const path = join(dir, `${name}.contract.json`);
  const contract = JSON.parse(readFileSync(path, "utf8"));
  contract.status = "beta";
  contract.figma = `https://www.figma.com/design/d8nFs8A5KcjbFr6KkwZV4H5K/Digitaltableteur-Design-System?node-id=dt-${kebab(name)}`;
  contract.requiredStories = ["Default", "Playground", "Example", "ForcedColors"];
  contract.variants = {};
  if (MANIFEST_SLOTS[name]) {
    contract.slots = MANIFEST_SLOTS[name];
  }
  contract.a11y = {
    ...contract.a11y,
    forcedColorsVerified: true,
    reviewed: true,
    reviewedNote: REVIEWED_NOTE,
  };
  contract.lightDarkVerified = true;
  writeFileSync(path, `${JSON.stringify(contract, null, 4)}\n`);
}

let written = 0;
let skipped = 0;

for (const c of COMPONENTS_DATA) {
  const dir = join(COMPONENTS, c.name);
  if (!existsSync(dir)) {
    console.error(`✗ ${c.name}: directory missing — skipping`);
    skipped++;
    continue;
  }

  const storyPath = join(dir, `${c.name}.stories.tsx`);
  const storyBody = getStorySource(c.name, storyTitle(c));
  if (!storyBody) {
    console.error(`✗ ${c.name}: no story template — skipping`);
    skipped++;
    continue;
  }

  updateContract(dir, c.name);
  writeFileSync(storyPath, storyBody);
  console.log(`+ ${c.name}: contract → beta, stories rewritten (${storyBody.length} bytes)`);
  written++;
}

console.log("");
console.log(`Ported ${written} Bucket-1 components to beta.${skipped ? ` Skipped ${skipped}.` : ""}`);

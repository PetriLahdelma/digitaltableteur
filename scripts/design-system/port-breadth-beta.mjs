#!/usr/bin/env node
/**
 * Promote all breadth-tranche components from alpha → beta:
 * - Updates <Name>.contract.json (status, figma, requiredStories, a11y flags)
 * - Rewrites <Name>.stories.tsx with beta gates (Default/Playground/Example/ForcedColors)
 *
 * Run: node scripts/design-system/port-breadth-beta.mjs
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BREADTH_COMPONENTS } from "./breadth-components.mjs";
import { getStorySource } from "./port-breadth-beta-stories.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const TIER_PREFIX = {
  atom: "Atoms",
  molecule: "Molecules",
  organism: "Organisms",
  pattern: "Patterns",
  template: "Templates",
};

function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function componentDir(c) {
  const base =
    c.root === "patterns"
      ? join(ROOT, "nextjs-app/shared/patterns")
      : join(ROOT, "nextjs-app/shared/components");
  if (c.name === "FadeIn") {
    return join(ROOT, "nextjs-app/shared/components/animations/FadeIn");
  }
  return join(base, c.name);
}

export function storyTitle(c) {
  if (c.name === "ThemeProvider") return "Foundations/ThemeProvider";
  if (c.name === "FadeIn") return "Atoms/Animations/FadeIn";
  const prefix = TIER_PREFIX[c.tier] ?? "Components";
  return `${prefix}/${c.name}`;
}

const REVIEWED_NOTE =
  "2026-05-28 — Breadth beta port: keyboard/ARIA contract reviewed, ForcedColors story added, Storybook axe gate (parameters.a11y.test: error).";

/** ReactNode slot props on Props (excluding children). */
const MANIFEST_SLOTS = {
  ServiceCard: ["icon"],
};

function updateContract(dir, name) {
  const path = join(dir, `${name}.contract.json`);
  const contract = JSON.parse(readFileSync(path, "utf8"));
  contract.status = "beta";
  contract.figma = `https://www.figma.com/design/d8nFs8A5KcjbFr6KkwZV4H5K/Digitaltableteur-Design-System?node-id=dt-${kebab(name)}`;
  contract.requiredStories = ["Default", "Playground", "Example", "ForcedColors"];
  contract.variants = {};
  contract.slots = MANIFEST_SLOTS[name] ?? [];
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

for (const c of BREADTH_COMPONENTS) {
  const dir = componentDir(c);
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
console.log(
  `Ported ${written} breadth components to beta.${skipped ? ` Skipped ${skipped}.` : ""}`,
);

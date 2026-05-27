#!/usr/bin/env node
/**
 * Replace scaffold Figma URLs (fake file key "digitaltableteur") with the real DS file key.
 * Run: node scripts/design-system/sync-figma-contract-urls.mjs
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FILE_KEY = process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";
const FILE_SLUG = process.env.FIGMA_FILE_SLUG || "Digitaltableteur-Design-System";

const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

let updated = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const raw = readFileSync(contractPath, "utf8");
    const contract = JSON.parse(raw);
    const figma = contract.figma;
    if (typeof figma !== "string") continue;

    if (!figma.includes("/design/digitaltableteur/")) continue;

    const nodeSlug = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    contract.figma = `https://www.figma.com/design/${FILE_KEY}/${FILE_SLUG}?node-id=dt-${nodeSlug}`;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
    updated += 1;
  }
}

console.log(`✓ sync-figma-contract-urls: updated ${updated} contract(s) to file key ${FILE_KEY}`);

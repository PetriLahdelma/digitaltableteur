#!/usr/bin/env node
/**
 * Sync TypeScript-derived variants into contract.json files.
 * Only fills empty variant axes from CVA-derived `cvaVariants` in component-agent-blocks.json.
 * Does not overwrite hand-tuned contracts. Run story argTypes updates before --write.
 *
 *   npm run sync:contract-api          # dry-run summary
 *   npm run sync:contract-api -- --write
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const writeMode = process.argv.includes("--write");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

const agentBlocks = existsSync(
  join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json"),
)
  ? JSON.parse(
      readFileSync(
        join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json"),
        "utf8",
      ),
    ).components ?? {}
  : {};

let wouldUpdate = 0;
let updated = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const generated = agentBlocks[name]?.cvaVariants ?? {};
    if (!Object.keys(generated).length) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const existing = contract.variants ?? {};
    const merged = { ...existing };
    let changed = false;

    for (const [axis, def] of Object.entries(generated)) {
      if (!merged[axis] || !merged[axis].values?.length) {
        merged[axis] = def;
        changed = true;
      }
    }

    if (!changed) continue;
    wouldUpdate += 1;

    if (writeMode) {
      contract.variants = merged;
      writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
      updated += 1;
    }
  }
}

if (writeMode) {
  console.log(`sync-contract-api: updated ${updated} contracts`);
} else {
  console.log(`sync-contract-api: ${wouldUpdate} contracts would update (run with --write)`);
}

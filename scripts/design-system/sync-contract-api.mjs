#!/usr/bin/env node
/**
 * Sync eligible variant axes into contract.json from component-agent-blocks.json.
 * CVA axes require invocation in source + prop alignment; prop-only axes use propSourced.
 *
 *   npm run sync:contract-api
 *   npm run sync:contract-api -- --write
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSyncableVariants } from "./cva-sync-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const writeMode = process.argv.includes("--write");
const AGENT_BLOCKS_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

if (!existsSync(AGENT_BLOCKS_PATH)) {
  console.error("Run npm run build:agent-blocks first");
  process.exit(1);
}

const agentBlocks = JSON.parse(readFileSync(AGENT_BLOCKS_PATH, "utf8")).components ?? {};

let wouldUpdate = 0;
let updated = 0;
const planned = [];

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const agent = agentBlocks[name];
    if (!agent) continue;

    const tsxPath = join(base, name, `${name}.tsx`);
    const syncable = getSyncableVariants(name, agent, tsxPath, agent.variantsFnName ?? null);
    if (!Object.keys(syncable).length) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const existing = contract.variants ?? {};
    const merged = { ...existing };
    let changed = false;

    for (const [axis, def] of Object.entries(syncable)) {
      if (!merged[axis] || !merged[axis].values?.length) {
        merged[axis] = def;
        changed = true;
      }
    }

    if (!changed) continue;
    wouldUpdate += 1;
    planned.push({ name, axes: Object.keys(syncable) });

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
for (const row of planned) {
  console.log(`  ${row.name}: ${row.axes.join(", ")}`);
}

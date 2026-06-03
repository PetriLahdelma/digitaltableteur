#!/usr/bin/env node
/**
 * Compare contract.json variants vs generated agent blocks.
 *
 *   npm run check:contract-drift
 *   npm run check:contract-drift -- --strict   # exit 1 on any drift
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSyncableVariants } from "./cva-sync-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const strict = process.argv.includes("--strict");
const AGENT_BLOCKS = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

if (!existsSync(AGENT_BLOCKS)) {
  console.error("FAIL: run npm run build:agent-blocks first");
  process.exit(1);
}

const agentBlocks = JSON.parse(readFileSync(AGENT_BLOCKS, "utf8")).components ?? {};
const drifts = [];

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const agent = agentBlocks[name];
    if (!agent) continue;

    const tsxPath = join(base, name, `${name}.tsx`);
    const syncable = getSyncableVariants(name, agent, tsxPath, agent.variantsFnName ?? null);
    const contractVariants = contract.variants ?? {};

    for (const [axis, expected] of Object.entries(syncable)) {
      const current = contractVariants[axis];
      if (!current?.values?.length) {
        drifts.push({
          name,
          axis,
          kind: "missing-in-contract",
          expected: expected.values,
        });
        continue;
      }
      const same =
        current.values.length === expected.values.length &&
        expected.values.every((v) => current.values.includes(v));
      if (!same) {
        drifts.push({
          name,
          axis,
          kind: "value-mismatch",
          contract: current.values,
          expected: expected.values,
        });
      }
    }

    // Stale axes (contract has variants not present in generated agent blocks) are
    // reported only in non-strict mode — many legacy contracts predate agent blocks.
    if (!strict) {
      for (const axis of Object.keys(contractVariants)) {
        const agentAxis = agent.variants?.[axis] ?? agent.cvaVariants?.[axis];
        if (!agentAxis?.values?.length && contractVariants[axis]?.values?.length) {
          drifts.push({
            name,
            axis,
            kind: "stale-contract-axis (informational)",
            contract: contractVariants[axis].values,
          });
        }
      }
    }
  }
}

if (!drifts.length) {
  console.log("✓ No contract variant drift detected");
  process.exit(0);
}

console.log(`Contract drift: ${drifts.length} issue(s)`);
for (const d of drifts.slice(0, 30)) {
  console.log(`  ${d.name}.${d.axis} — ${d.kind}${d.expected ? ` → [${d.expected.join(", ")}]` : ""}`);
}
if (drifts.length > 30) console.log(`  … and ${drifts.length - 30} more`);

if (strict) {
  console.error("\nRun npm run sync:contract-api -- --write after fixing stories/CVA alignment.");
  process.exit(1);
}

console.log("\n(dry-run mode — pass --strict to fail CI)");

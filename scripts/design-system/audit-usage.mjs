#!/usr/bin/env node
/**
 * Report @dt/* and relative component import usage for agent retrieval.
 * Usage evidence is emitted into agent-manifest.json (not written to contracts).
 *
 *   npm run audit:usage
 *   npm run audit:usage -- --json
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scanComponentUsage } from "./usage-scan-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const jsonMode = process.argv.includes("--json");

const { byComponent, summary } = scanComponentUsage({ root: ROOT });

const rows = [...byComponent.entries()]
  .filter(([, usage]) => usage.importCount > 0)
  .sort((a, b) => b[1].importCount - a[1].importCount || a[0].localeCompare(b[0]))
  .map(([name, usage]) => ({ name, ...usage }));

if (jsonMode) {
  process.stdout.write(`${JSON.stringify({ summary, components: rows }, null, 2)}\n`);
  process.exit(0);
}

console.log("Component usage audit");
console.log("=====================");
console.log(`Cataloged components:          ${summary.catalogedComponents}`);
console.log(`With any import evidence:      ${summary.withAnyUsage}`);
console.log(`With production-page usage:    ${summary.withProductionUsage}`);
console.log(`Unique imported components:    ${summary.uniqueImportedComponents}`);
console.log(`Total import sites:            ${summary.totalEvidenceRows}`);
console.log("");
console.log("Top production consumers:");
for (const row of rows.slice(0, 20)) {
  const top = row.evidence.find((e) => e.context === "production") ?? row.evidence[0];
  console.log(
    `  ${row.name.padEnd(28)} prod=${String(row.productionImportCount).padStart(3)} total=${String(row.importCount).padStart(3)}  ${top?.path ?? "—"}`,
  );
}
console.log("");
console.log("Run with --json for machine-readable output.");

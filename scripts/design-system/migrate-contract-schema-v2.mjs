#!/usr/bin/env node
/**
 * One-shot: set schemaVersion 2 + $schema pointer on all contracts.
 *
 *   node scripts/design-system/migrate-contract-schema-v2.mjs
 *   node scripts/design-system/migrate-contract-schema-v2.mjs --write
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTRACT_SCHEMA_V2_REL } from "./contract-schema-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const writeMode = process.argv.includes("--write");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

let wouldUpdate = 0;
let updated = 0;

for (const base of roots) {
  if (!existsSync(base)) continue;
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const needsVersion = contract.schemaVersion !== 2;
    const needsSchema = contract.$schema !== CONTRACT_SCHEMA_V2_REL;
    if (!needsVersion && !needsSchema) continue;

    wouldUpdate += 1;
    if (!writeMode) {
      console.log(`  would migrate ${name}`);
      continue;
    }

    contract.schemaVersion = 2;
    contract.$schema = CONTRACT_SCHEMA_V2_REL;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    updated += 1;
  }
}

if (writeMode) {
  console.log(`migrate-contract-schema-v2: updated ${updated} contracts`);
} else {
  console.log(`migrate-contract-schema-v2: ${wouldUpdate} contracts would update`);
}

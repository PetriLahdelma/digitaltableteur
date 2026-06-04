#!/usr/bin/env node
/**
 * Populate contract.consumers[] from @dt/<Component> imports in app/ and nextjs-app/.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  consumersEqual,
  expectedConsumers,
} from "./consumers-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

let updated = 0;
for (const base of roots) {
  for (const name of readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));

    if (contract.status !== "stable") {
      if (Array.isArray(contract.consumers) && contract.consumers.length > 0) {
        contract.consumers = [];
        writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
        updated += 1;
      }
      continue;
    }

    const expected = expectedConsumers(contract, name);
    if (!expected.length) {
      if (Array.isArray(contract.consumers) && contract.consumers.length > 0) {
        contract.consumers = [];
        writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
        updated += 1;
      }
      continue;
    }
    if (consumersEqual(contract.consumers, expected)) continue;
    contract.consumers = expected;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    updated += 1;
  }
}
console.log(`audit-consumers: updated ${updated} contracts`);

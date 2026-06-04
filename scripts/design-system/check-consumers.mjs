#!/usr/bin/env node
/**
 * CI gate: stable contract consumers[] must match @dt import scan in app/ + nextjs-app/.
 *
 *   npm run check:consumers
 *   npm run audit:consumers   # rewrite contracts to match scan
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const mismatches = [];

for (const base of roots) {
  for (const name of readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));

    if (contract.status !== "stable") {
      if (Array.isArray(contract.consumers) && contract.consumers.length > 0) {
        mismatches.push({
          name,
          kind: "non-stable-has-consumers",
          detail: "stable-only field must be empty",
        });
      }
      continue;
    }

    const expected = expectedConsumers(contract, name);
    if (!expected.length) {
      if (Array.isArray(contract.consumers) && contract.consumers.length > 0) {
        mismatches.push({
          name,
          kind: "stable-stale-manual-consumers",
          detail:
            "no production imports found — run audit:consumers after adding app/pattern usage, or demote status",
        });
      } else {
        mismatches.push({
          name,
          kind: "stable-missing-consumers",
          detail:
            "no @dt imports in app/, patterns/, or pages/ — add a production consumer or demote status",
        });
      }
      continue;
    }

    if (!consumersEqual(contract.consumers, expected)) {
      mismatches.push({
        name,
        kind: "consumers-drift",
        detail: `run npm run audit:consumers (expected ${expected.length} path(s))`,
      });
    }
  }
}

if (!mismatches.length) {
  console.log("✓ Stable component consumers[] match import scan");
  process.exit(0);
}

console.error(`Consumers check: ${mismatches.length} issue(s)\n`);
for (const m of mismatches) {
  console.error(`  ✗ ${m.name}: ${m.kind} — ${m.detail}`);
}
console.error("\nFix: npm run audit:consumers");
process.exit(1);

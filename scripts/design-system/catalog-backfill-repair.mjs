#!/usr/bin/env node
/** Repair alpha backfill contracts to match contract.schema.v2.json */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dirs = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

let fixed = 0;
for (const base of dirs) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (!contract.a11y?.catalogBackfill && contract.status !== "alpha") continue;
    if (!contract.a11y?.catalogBackfill && !contract.agentSurface) continue;

    delete contract.agentSurface;
    delete contract.a11y.catalogBackfill;
    delete contract.a11y.note;
    contract.requiredStories = contract.requiredStories?.length
      ? contract.requiredStories
      : ["Default"];
    contract.subParts = [];
    if (!contract.composesWith) contract.composesWith = [];
    if (!contract.schemaVersion) contract.schemaVersion = 2;

    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    fixed += 1;
  }
}

const REPO = "digitaltableteur/digitaltableteur";
for (const name of ["Link", "Label", "SiteHeader", "SiteFooter"]) {
  const paths = [
    join(ROOT, "nextjs-app/shared/components", name, `${name}.contract.json`),
    join(ROOT, "nextjs-app/shared/patterns", name, `${name}.contract.json`),
  ];
  for (const contractPath of paths) {
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (!Array.isArray(contract.consumers)) continue;
    let changed = false;
    contract.consumers = contract.consumers.map((c) => {
      if (c.repo) return c;
      changed = true;
      return { repo: REPO, ...c };
    });
    if (changed) {
      writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
      fixed += 1;
    }
  }
}

console.log(`Repaired ${fixed} contract(s).`);

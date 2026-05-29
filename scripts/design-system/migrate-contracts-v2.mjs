#!/usr/bin/env node
/**
 * Contract v2 migration (idempotent).
 *
 * Digitaltableteur contracts started as a DSharp-derived schema but were
 * introduced incrementally. This migrator normalizes older contracts to the
 * current shape so future gates can assume fields exist (even if empty).
 *
 * This script is intentionally conservative: it only adds missing fields with
 * safe defaults and never deletes or rewrites existing content.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SHARED = join(ROOT, "nextjs-app", "shared");
const TARGET_DIRS = [join(SHARED, "components"), join(SHARED, "patterns")];

function listContractFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const contractPath = join(dir, name, `${name}.contract.json`);
    if (existsSync(contractPath)) out.push(contractPath);
  }
  return out;
}

function stableJsonStringify(obj) {
  return JSON.stringify(obj, null, 4) + "\n";
}

function migrateContract(contract) {
  let changed = false;

  // Required-at-stable in validator; normalize presence so downstream tooling
  // can assume the field exists.
  if (!("consumers" in contract)) {
    contract.consumers = [];
    changed = true;
  }

  return changed;
}

function main() {
  const files = TARGET_DIRS.flatMap(listContractFiles);
  let changedCount = 0;

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const contract = JSON.parse(raw);
    const changed = migrateContract(contract);
    if (!changed) continue;
    writeFileSync(file, stableJsonStringify(contract));
    changedCount += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`migrate-contracts-v2: updated ${changedCount}/${files.length} contracts`);
}

main();


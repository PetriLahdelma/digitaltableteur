#!/usr/bin/env node
/** CI gate: catalog completeness must meet MIN_PERCENT (default 85). */
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MIN_PERCENT = Number(process.env.CATALOG_MIN_PERCENT ?? "85");
const MIN_GAP = Number(process.env.CATALOG_MAX_GAP ?? "0");

const json = execSync(
  `node ${joinPath("scripts/design-system/audit-catalog-coverage.mjs")} --json`,
  { cwd: ROOT, encoding: "utf8" },
);
const audit = JSON.parse(json);
const { catalogCompleteness, outOfCatalogByBucket } = audit.summary;
const gap = outOfCatalogByBucket?.["catalog-gap"] ?? 0;

let failed = 0;
if (catalogCompleteness < MIN_PERCENT) {
  console.error(
    `FAIL: catalog completeness ${catalogCompleteness}% < ${MIN_PERCENT}%`,
  );
  failed += 1;
} else {
  console.log(`✓ catalog completeness ${catalogCompleteness}% (≥${MIN_PERCENT}%)`);
}

if (gap > MIN_GAP) {
  console.error(`FAIL: ${gap} catalog-gap component(s) (max ${MIN_GAP})`);
  failed += 1;
} else {
  console.log(`✓ catalog-gap bucket: ${gap}`);
}

process.exit(failed ? 1 : 0);

function joinPath(rel) {
  return resolve(ROOT, rel);
}

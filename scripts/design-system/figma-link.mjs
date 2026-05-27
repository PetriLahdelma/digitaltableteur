#!/usr/bin/env node
/** Validate figma URLs on beta/stable contracts are present and non-placeholder. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
/** Real DS file — see scripts/fetch-figma.js */
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";
const VALID_FIGMA_FILE = new RegExp(
  `^https://www\\.figma\\.com/design/${FIGMA_FILE_KEY}/`,
);
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

let failed = 0;
for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (contract.status !== "beta" && contract.status !== "stable") continue;
    const figma = contract.figma;
    if (typeof figma !== "string" || !figma.startsWith("https://www.figma.com/")) {
      console.error(`FAIL ${name}: missing figma URL`);
      failed += 1;
      continue;
    }
    if (/placeholder|TODO/i.test(figma)) {
      console.error(`FAIL ${name}: figma URL contains placeholder marker (${figma})`);
      failed += 1;
      continue;
    }
    if (!VALID_FIGMA_FILE.test(figma)) {
      console.error(
        `FAIL ${name}: figma URL must use design file ${FIGMA_FILE_KEY} (run sync-figma-contract-urls.mjs)`,
      );
      console.error(`      got: ${figma}`);
      failed += 1;
    }
  }
}
if (failed) process.exit(1);
console.log("✓ figma-link: beta/stable contracts have figma URLs");

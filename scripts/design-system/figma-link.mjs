#!/usr/bin/env node
/**
 * Validate figma URLs on beta/stable contracts.
 *
 * Two-tier check:
 *   1. HARD FAIL: missing URL, wrong file key, or literal placeholder/TODO
 *      marker in the node-id (e.g. node-id=placeholder, node-id=TODO,
 *      node-id=fixme, empty node-id).
 *   2. HONEST_FIGMA_DEBT (warn only): real Figma node ids look like
 *      `1234-5678` or `1234:5678`. Slugs such as `dt-image-placeholder`
 *      were auto-seeded from component names and are not real node ids;
 *      they are counted, listed, and reported but do not block the gate.
 *      Closing this debt requires wiring real ids from the Figma library —
 *      see scripts/design-system/sync-figma-contract-urls.mjs.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";
const VALID_FIGMA_FILE = new RegExp(
  `^https://www\\.figma\\.com/design/${FIGMA_FILE_KEY}/`,
);
const PLACEHOLDER_NODE_ID =
  /[?&]node-id=(?:placeholder|todo|fixme)(?=$|&|["'\s])/i;
const EMPTY_NODE_ID = /[?&]node-id=(?=$|&|["'\s])/;
const REAL_NODE_ID = /[?&]node-id=\d+[:-]\d+/;
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

let failed = 0;
const stubCandidates = [];

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
    if (PLACEHOLDER_NODE_ID.test(figma) || EMPTY_NODE_ID.test(figma)) {
      console.error(
        `FAIL ${name}: figma URL has literal placeholder/TODO/empty node-id (${figma})`,
      );
      failed += 1;
      continue;
    }
    if (!VALID_FIGMA_FILE.test(figma)) {
      console.error(
        `FAIL ${name}: figma URL must use design file ${FIGMA_FILE_KEY} (run sync-figma-contract-urls.mjs)`,
      );
      console.error(`      got: ${figma}`);
      failed += 1;
      continue;
    }
    if (!REAL_NODE_ID.test(figma)) {
      stubCandidates.push({ name, figma });
    }
  }
}

if (failed) {
  console.error(`✗ figma-link: ${failed} hard failure(s)`);
  process.exit(1);
}

console.log("✓ figma-link: beta/stable contracts have figma URLs");
if (stubCandidates.length > 0) {
  console.warn(
    `\n⚠ HONEST_FIGMA_DEBT=${stubCandidates.length} contract(s) reference slug-style node-ids instead of real Figma node-ids.`,
  );
  console.warn(
    "  These were auto-seeded from component names. Resolve by syncing real ids:",
  );
  console.warn(
    "    node scripts/design-system/sync-figma-contract-urls.mjs --from <figma-export>",
  );
  console.warn("  Affected (first 5):");
  for (const item of stubCandidates.slice(0, 5)) {
    console.warn(`    - ${item.name}`);
  }
  if (stubCandidates.length > 5) {
    console.warn(`    ...and ${stubCandidates.length - 5} more.`);
  }
}

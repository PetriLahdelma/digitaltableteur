#!/usr/bin/env node
/**
 * Set honest Digitaltableteur scaffold `figma` URLs on beta/stable contracts.
 *
 * Uses `dt-<slug>` node-ids until the DT design-system file exists in Figma.
 * Run: npm run sync:figma
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { buildFigmaUrl, FIGMA_FILE_KEY } from "./figma-config.mjs";
import { iterBetaStableContracts } from "./figma-contract-utils.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

let updated = 0;
let skipped = 0;

for (const { name, contract, contractPath } of iterBetaStableContracts(roots)) {
  const nextUrl = buildFigmaUrl(name);
  if (contract.figma === nextUrl) {
    skipped += 1;
    continue;
  }
  contract.figma = nextUrl;
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  updated += 1;
}

console.log(
  `✓ sync-figma-contract-urls: updated ${updated}, unchanged ${skipped} (file ${FIGMA_FILE_KEY})`,
);

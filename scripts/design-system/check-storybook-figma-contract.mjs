#!/usr/bin/env node
/**
 * Ensures Storybook can resolve the same Figma URL as each beta/stable contract.
 * Run: npm run check:storybook-figma
 */
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FIGMA_FILE_KEY,
  isDtPlaceholderNodeId,
  isRealFigmaNodeId,
} from "./figma-config.mjs";
import { iterBetaStableContracts } from "./figma-contract-utils.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

let failed = 0;
let checked = 0;

for (const { name, contract } of iterBetaStableContracts(roots)) {
  checked += 1;
  const figma = contract.figma;
  if (typeof figma !== "string" || !figma.includes(FIGMA_FILE_KEY)) {
    console.error(`FAIL ${name}: contract figma must use DT file ${FIGMA_FILE_KEY}`);
    failed += 1;
    continue;
  }
  if (/VertaaUX/i.test(figma)) {
    console.error(`FAIL ${name}: contract figma must not reference VertaaUX`);
    failed += 1;
    continue;
  }
  const nodeMatch = figma.match(/[?&]node-id=([^&]+)/);
  const nodeId = nodeMatch?.[1] ?? "";
  if (isRealFigmaNodeId(nodeId)) {
    console.error(`FAIL ${name}: contract figma must not use foreign numeric node-id`);
    failed += 1;
    continue;
  }
  if (!isDtPlaceholderNodeId(nodeId)) {
    console.error(`FAIL ${name}: contract figma must use dt-<slug> node-id`);
    failed += 1;
  }
}

if (failed) {
  console.error(`✗ check-storybook-figma-contract: ${failed} failure(s)`);
  process.exit(1);
}

console.log(
  `✓ check-storybook-figma-contract: ${checked} beta/stable contracts use DT scaffold figma URLs`,
);

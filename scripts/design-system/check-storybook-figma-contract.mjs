#!/usr/bin/env node
/**
 * Ensures Storybook can resolve the same Figma URL as each beta/stable contract.
 * Run: npm run check:storybook-figma
 */
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FIGMA_FILE_KEY,
  FIGMA_LIBRARY_EXISTS,
  FIGMA_NODE_IDS,
  isDtPlaceholderNodeId,
  isRealFigmaNodeId,
} from "./figma-config.mjs";

/** Stable components without a single Figma component node (Phosphor library on canvas). */
const STABLE_FIGMA_PLACEHOLDER_OK = new Set(["Icon"]);
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
  // When the DT library exists, a real numeric node-id is valid (and deep-links
  // from Storybook's Design panel); foreign files are blocked by the file-key
  // guard above. Otherwise contracts must use the dt-<slug> placeholder.
  if (isRealFigmaNodeId(nodeId)) {
    if (!FIGMA_LIBRARY_EXISTS) {
      console.error(
        `FAIL ${name}: contract figma must not use a numeric node-id until the DT library exists`,
      );
      failed += 1;
    }
    continue;
  }
  const isStable = contract.status === "stable";
  const mappedNode = FIGMA_NODE_IDS[name];
  if (
    isStable &&
    FIGMA_LIBRARY_EXISTS &&
    mappedNode &&
    !STABLE_FIGMA_PLACEHOLDER_OK.has(name)
  ) {
    console.error(
      `FAIL ${name}: stable requires verified Figma node-id (${mappedNode}); got placeholder ${nodeId}`,
    );
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

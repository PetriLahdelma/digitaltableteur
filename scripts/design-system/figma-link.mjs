#!/usr/bin/env node
/**
 * Validate figma URLs on beta/stable contracts.
 *
 * Digitaltableteur does not have a live Figma library yet. Contracts must:
 *   - use the DT design file key
 *   - use honest `dt-<slug>` node-ids (not numeric ids from other projects)
 *   - avoid literal placeholder/TODO markers in the node-id
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
const VALID_FIGMA_FILE = new RegExp(
  `^https://www\\.figma\\.com/design/${FIGMA_FILE_KEY}/`,
);
const PLACEHOLDER_NODE_ID =
  /[?&]node-id=(?:placeholder|todo|fixme)(?=$|&|["'\s])/i;
const EMPTY_NODE_ID = /[?&]node-id=(?=$|&|["'\s])/;
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

let failed = 0;
let foreignRealIds = 0;
let missingDtSlug = 0;

for (const { name, contract } of iterBetaStableContracts(roots)) {
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
      `FAIL ${name}: figma URL must use DT design file ${FIGMA_FILE_KEY} (run npm run sync:figma)`,
    );
    console.error(`      got: ${figma}`);
    failed += 1;
    continue;
  }
  if (/VertaaUX/i.test(figma)) {
    console.error(
      `FAIL ${name}: figma URL must not reference VertaaUX (wrong project)`,
    );
    failed += 1;
    continue;
  }

  const nodeMatch = figma.match(/[?&]node-id=([^&]+)/);
  const nodeId = nodeMatch?.[1] ?? "";
  if (isRealFigmaNodeId(nodeId)) {
    console.error(
      `FAIL ${name}: numeric Figma node-id without DT library (${figma})`,
    );
    foreignRealIds += 1;
    failed += 1;
    continue;
  }
  if (!isDtPlaceholderNodeId(nodeId)) {
    console.error(
      `FAIL ${name}: node-id must be dt-<slug> until DT Figma exists (${figma})`,
    );
    missingDtSlug += 1;
    failed += 1;
  }
}

if (failed) {
  console.error(`✗ figma-link: ${failed} hard failure(s)`);
  process.exit(1);
}

console.log("✓ figma-link: beta/stable contracts have honest DT scaffold figma URLs");
console.log(
  "  (HONEST_FIGMA_DEBT: real Figma frames pending — dt-* slugs are expected until the DT file ships)",
);

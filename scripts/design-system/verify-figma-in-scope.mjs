#!/usr/bin/env node
/**
 * Verify in-scope DS components have Figma node ids (or documented exceptions).
 */
import { IN_SCOPE_COMPONENTS } from "./in-scope-components.mjs";
import { FIGMA_NODE_IDS, FIGMA_FILE_KEY } from "./figma-config.mjs";

/** Components intentionally without a single Figma node (library / composite). */
const FIGMA_EXCEPTIONS = {
  Icon: "Phosphor icon library on-page — not a single component node",
};

let failed = 0;

console.log(`# Figma in-scope coverage (${FIGMA_FILE_KEY})\n`);

for (const { name, tier } of IN_SCOPE_COMPONENTS) {
  const nodeId = FIGMA_NODE_IDS[name];
  const exception = FIGMA_EXCEPTIONS[name];
  if (nodeId) {
    console.log(`✓ ${name} (${tier}) → ${nodeId}`);
  } else if (exception) {
    console.log(`○ ${name} (${tier}) — ${exception}`);
  } else {
    console.error(`✗ ${name} (${tier}) — missing FIGMA_NODE_IDS entry`);
    failed += 1;
  }
}

const mapped = IN_SCOPE_COMPONENTS.filter((c) => FIGMA_NODE_IDS[c.name]).length;
const excepted = Object.keys(FIGMA_EXCEPTIONS).length;
console.log(
  `\n${mapped}/${IN_SCOPE_COMPONENTS.length} mapped, ${excepted} documented exception(s)`,
);

process.exit(failed ? 1 : 0);

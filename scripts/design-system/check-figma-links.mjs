#!/usr/bin/env node
/**
 * Figma-link ratchet: a beta or stable contract's `figma` must resolve to a
 * REAL Figma component, and the debt count can only go DOWN. (validate-
 * components.ts requires a figma URL for both tiers, so both are guarded.)
 *
 * "Resolves to a real component" means BOTH:
 *   1. the URL carries a numeric node id (`node-id=<digits>-<digits>`), not a
 *      `dt-<name>` placeholder; AND
 *   2. that node id is present in figma-component-index.json — the committed
 *      set of real COMPONENT / COMPONENT_SET node ids in the DT-Site-stuff file.
 *
 * Rule (2) is what catches links that point at a numeric node which is NOT a
 * component — e.g. a Section full of loose "Specimens" frames (Timestamp), a
 * deleted node, or a stray group. The plain URL-presence check in
 * validate-components.ts cannot see that; this can, because the index
 * (figma-component-index.json) is enumerated from the live Figma file via the
 * Figma MCP (findAllWithCriteria over COMPONENT/COMPONENT_SET on the Atoms /
 * Organisms / Patterns pages) and committed.
 *
 * Regenerate the index whenever DS components are added/moved (re-run the MCP
 * enumeration and rewrite the file), then this check (and the ratchet) reflects
 * the true state. Lower the ceiling in figma-links.baseline.json in the same PR
 * that wires a real component.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const BASELINE_PATH = join(HERE, "figma-links.baseline.json");
const INDEX_PATH = join(HERE, "figma-component-index.json");

const REAL_NODE = /node-id=(\d+)[-:](\d+)/;

const index = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
const knownComponentIds = new Set(Object.keys(index.components));

/** Extract the node id from a figma URL, normalised to dash form, or null. */
function nodeIdOf(figma) {
  if (typeof figma !== "string") return null;
  const m = figma.match(REAL_NODE);
  return m ? `${m[1]}-${m[2]}` : null;
}

const contractFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".contract.json")) contractFiles.push(p);
  }
};
walk(join(ROOT, "nextjs-app", "shared", "components"));
walk(join(ROOT, "nextjs-app", "shared", "patterns"));

// validate-components.ts requires a figma URL for BOTH beta and stable, so both
// tiers are guardrailed here — a beta placeholder (e.g. Tooltip -> dt-tooltip)
// is the same class of gap as a stable one.
const GUARDED = new Set(["beta", "stable"]);

/** "name (status): reason", for every guarded contract whose figma doesn't resolve. */
const unresolved = [];
for (const file of contractFiles) {
  const contract = JSON.parse(readFileSync(file, "utf8"));
  if (!GUARDED.has(contract.status)) continue;
  const nodeId = nodeIdOf(contract.figma);
  if (nodeId === null) {
    unresolved.push(`${contract.name} [${contract.status}] (placeholder link)`);
  } else if (!knownComponentIds.has(nodeId)) {
    unresolved.push(`${contract.name} [${contract.status}] (node ${nodeId} is not a known DS component)`);
  }
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const ceiling = baseline.stablePlaceholderCeiling;
const count = unresolved.length;

if (count > ceiling) {
  console.error(
    `✖ figma-links ratchet: ${count} beta/stable contracts do not resolve to a real Figma component (ceiling ${ceiling}).`,
  );
  console.error(
    `  A beta/stable contract needs a real COMPONENT/COMPONENT_SET node (build it, then add it to figma-component-index.json — see docs/design-system/figma-parity-audit.md).`,
  );
  console.error(`  Unresolved:\n    ${unresolved.sort().join("\n    ")}`);
  process.exit(1);
}

if (count < ceiling) {
  console.error(
    `✖ figma-links ratchet: count dropped to ${count} but the ceiling is still ${ceiling}.`,
  );
  console.error(
    `  Tighten scripts/design-system/figma-links.baseline.json to ${count} in this PR so progress cannot regress.`,
  );
  process.exit(1);
}

console.log(
  `✓ figma-links ratchet: ${count}/${ceiling} beta/stable contracts without a real Figma component (can only decrease)`,
);

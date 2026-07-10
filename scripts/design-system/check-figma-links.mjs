#!/usr/bin/env node
/**
 * Figma-link ratchet: stable contracts must not gain placeholder Figma links.
 *
 * A "placeholder" is any contract `figma` value without a real numeric node id
 * (node-id=<digits>-<digits>). The committed ceiling in figma-links.baseline.json
 * can only go DOWN — lower it in the same PR that wires real nodes. The backfill
 * plan lives in docs/design-system/figma-parity-audit.md.
 *
 * This is a static check: it cannot detect numeric links whose node was later
 * deleted in Figma (those are caught by the audit's live scan).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASELINE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "figma-links.baseline.json",
);

const REAL_NODE = /node-id=\d+[-:]\d+/;

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

const stablePlaceholders = [];
for (const file of contractFiles) {
  const contract = JSON.parse(readFileSync(file, "utf8"));
  if (contract.status !== "stable") continue;
  if (typeof contract.figma !== "string" || !REAL_NODE.test(contract.figma)) {
    stablePlaceholders.push(contract.name);
  }
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const ceiling = baseline.stablePlaceholderCeiling;
const count = stablePlaceholders.length;

if (count > ceiling) {
  console.error(
    `✖ figma-links ratchet: ${count} stable contracts have placeholder Figma links (ceiling ${ceiling}).`,
  );
  console.error(
    `  New stable contracts need a real numeric Figma node (build it first — see docs/design-system/figma-parity-audit.md).`,
  );
  console.error(`  Placeholders: ${stablePlaceholders.sort().join(", ")}`);
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
  `✓ figma-links ratchet: ${count}/${ceiling} stable contracts with placeholder Figma links (can only decrease)`,
);

#!/usr/bin/env node
/**
 * Report AT-snapshot backfill debt: beta/stable components that carry NO
 * accessibility-tree snapshots at all.
 *
 * Context: the test-runner enforces a component's snapshots only for modes it
 * already has coverage in (a missing story in an established mode hard-fails;
 * a never-bootstrapped mode is debt, not a break — see
 * `.storybook/test-runner.ts`). Before the resolver fix that logic was silently
 * skipped for every camelCase-titled component. This audit makes the remaining
 * gap visible so it can be burned down deliberately (bootstrap on the way to
 * stable, where validate-components hard-requires snapshots anyway).
 *
 * Informational by default (exit 0). Pass --strict to exit 1 when any STABLE
 * component is missing snapshots (defense in depth over validate-components).
 *
 * Run: node scripts/design-system/audit-snapshot-debt.mjs [--strict]
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const strict = process.argv.includes("--strict");
const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

function* walkContracts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkContracts(full);
    else if (entry.name.endsWith(".contract.json")) yield full;
  }
}

const debt = [];
let stableMissing = 0;

for (const rel of roots) {
  const base = join(ROOT, rel);
  if (!existsSync(base)) continue;
  for (const contractPath of walkContracts(base)) {
    let contract;
    try {
      contract = JSON.parse(readFileSync(contractPath, "utf8"));
    } catch {
      continue;
    }
    if (contract.status !== "beta" && contract.status !== "stable") continue;
    const dir = dirname(contractPath);
    const snapDir = join(dir, "__a11y-snapshots__");
    const count =
      existsSync(snapDir) && statSync(snapDir).isDirectory()
        ? readdirSync(snapDir).filter((f) => f.endsWith(".yaml")).length
        : 0;
    if (count === 0) {
      debt.push({ name: contract.name, status: contract.status });
      if (contract.status === "stable") stableMissing += 1;
    }
  }
}

debt.sort((a, b) =>
  a.status === b.status
    ? a.name.localeCompare(b.name)
    : a.status === "stable"
      ? -1
      : 1,
);

console.log("# AT-snapshot backfill debt\n");
if (debt.length === 0) {
  console.log("No beta/stable components are missing snapshots.");
} else {
  for (const d of debt) console.log(`  ${d.status.padEnd(6)}  ${d.name}`);
}
console.log(`\nSNAPSHOT_BACKFILL_DEBT=${debt.length}`);
console.log(`STABLE_MISSING_SNAPSHOTS=${stableMissing}`);

if (strict && stableMissing > 0) {
  console.error(
    `\n✗ ${stableMissing} stable component(s) have no AT snapshots — bootstrap them before release.`,
  );
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Health-artifact freshness gate.
 *
 * The agent-experience audit regenerates public/ds-health/agent-experience.json
 * from the current tree. This check runs AFTER that regeneration and fails when
 * the working-tree report differs from the committed (HEAD) report, which means
 * the committed health evidence no longer describes the current source: either
 * inputs changed after the artifact was generated, or the artifact was edited
 * without a regeneration. Both are the integrity failure this gate exists to
 * catch (the 2026-08-03 council follow-up found a committed ok:true report from
 * July 26 while the tree actually failed the ratchet).
 *
 * generatedAt/provenance are part of the comparison on purpose: the audit only
 * re-stamps them when substance changes (or when the previous stamp came from a
 * dirty tree), so a diff here always reflects a real divergence worth
 * committing.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ARTIFACTS = ["public/ds-health/agent-experience.json"];

let stale = [];
for (const artifact of ARTIFACTS) {
  if (!existsSync(resolve(ROOT, artifact))) {
    stale.push(`${artifact} (missing; run npm run audit:agent-experience)`);
    continue;
  }
  const diff = execFileSync("git", ["status", "--porcelain", "--", artifact], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  if (diff) stale.push(`${artifact} (regenerated report differs from HEAD)`);
}

if (stale.length) {
  console.error("FAIL: committed health artifacts are stale:");
  for (const s of stale) console.error(`  x ${s}`);
  console.error(
    "  The regenerated report no longer matches the committed one. Review and commit the regenerated artifact so committed evidence matches the source tree.",
  );
  process.exit(1);
}

console.log(
  `✓ health artifacts fresh (${ARTIFACTS.length} checked against HEAD)`,
);

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createStableRhythmguardIds } from "./rhythmguard-baseline.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = join(
  ROOT,
  "node_modules/stylelint-plugin-rhythmguard/src/cli/index.js",
);
const TOKEN_BASELINE = join(
  ROOT,
  "scripts/design-system/rhythmguard-token-contract-baseline.json",
);
const FINDINGS_BASELINE = join(ROOT, ".rhythmguard-baseline.json");
const update = process.argv.includes("--update");

function runAudit(arguments_, options = {}) {
  return spawnSync(process.execPath, [CLI, "audit", ".", ...arguments_], {
    cwd: ROOT,
    encoding: "utf8",
    ...options,
  });
}

const arguments_ = ["--format", "json"];
const result = runAudit(arguments_);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const report = JSON.parse(result.stdout);
const findingIds = createStableRhythmguardIds(report.findings);
const missingTokens = (report.contracts?.tokens?.missingTokens ?? [])
  .map(({ files, token }) => ({ files: [...files].sort(), token }))
  .sort((a, b) => a.token.localeCompare(b.token));

if (update) {
  writeFileSync(
    FINDINGS_BASELINE,
    `${JSON.stringify(
      {
        findings: findingIds,
        generatedBy: "npm run audit:rhythm:update",
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    TOKEN_BASELINE,
    `${JSON.stringify(
      {
        generatedBy: "npm run audit:rhythm:update",
        missingTokens,
      },
      null,
      2,
    )}\n`,
  );
} else {
  if (!existsSync(FINDINGS_BASELINE)) {
    console.error(
      "FAIL: missing Rhythmguard findings baseline. Run npm run audit:rhythm:update.",
    );
    process.exit(1);
  }

  const baselineFindingIds = new Set(
    JSON.parse(readFileSync(FINDINGS_BASELINE, "utf8")).findings,
  );
  const newFindingIds = findingIds.filter((id) => !baselineFindingIds.has(id));
  if (newFindingIds.length > 0) {
    console.error(`FAIL: ${newFindingIds.length} new Rhythmguard finding(s).`);
    for (const id of newFindingIds.slice(0, 20)) console.error(`- ${id}`);
    process.exit(1);
  }

  if (!existsSync(TOKEN_BASELINE)) {
    console.error(
      "FAIL: missing Rhythmguard token-contract baseline. Run npm run audit:rhythm:update.",
    );
    process.exit(1);
  }

  const baseline = JSON.parse(
    readFileSync(TOKEN_BASELINE, "utf8"),
  ).missingTokens;
  if (JSON.stringify(missingTokens) !== JSON.stringify(baseline)) {
    console.error("FAIL: Rhythmguard missing-token contract changed.");
    console.error(`Expected: ${JSON.stringify(baseline, null, 2)}`);
    console.error(`Received: ${JSON.stringify(missingTokens, null, 2)}`);
    process.exit(1);
  }
}

console.log(
  `✓ Rhythmguard verified (${report.summary.totalFindings} findings, ${report.summary.scaleCleanliness}% cleanliness, ${missingTokens.length} allowed custom spacing hooks)`,
);

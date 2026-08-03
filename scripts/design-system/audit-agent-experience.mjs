#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAgentExperienceReport,
  compareAgentExperienceToBaseline,
  createAgentExperienceBaseline,
} from "./agent-experience-lib.mjs";
import { runIntentRetrievalEval } from "./agent-eval/intent-retrieval-eval.mjs";
import { runPatternCompositionEval } from "./agent-eval/pattern-composition-eval.mjs";
import { loadPatternRecipes } from "./pattern-composition-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/agent-manifest.json",
);
const BASELINE = join(
  ROOT,
  "scripts/design-system/agent-experience-baseline.json",
);
const OUT = join(ROOT, "public/ds-health/agent-experience.json");
const INTENTS = join(
  ROOT,
  "scripts/design-system/agent-eval/golden-intents.json",
);
const PATTERNS = join(
  ROOT,
  "scripts/design-system/agent-eval/golden-patterns.json",
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function withoutRuntimeFields(report) {
  const {
    generatedAt: _generatedAt,
    ok: _ok,
    violations: _violations,
    provenance: _provenance,
    ...rest
  } = report;
  return rest;
}

/**
 * Bump when the generator's behavior (not just its inputs) changes in a way
 * that alters what the report means.
 */
const GENERATOR_VERSION = 2;

function currentProvenance() {
  const git = (args) =>
    execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  let sourceCommit = null;
  let dirtyPaths = null;
  try {
    sourceCommit = git(["rev-parse", "HEAD"]);
    dirtyPaths = git(["status", "--porcelain", "--untracked-files=no"])
      .split("\n")
      .filter(Boolean).length;
  } catch {
    // Outside a git checkout the stamp degrades gracefully.
  }
  return {
    sourceCommit,
    workingTreeClean: dirtyPaths === 0,
    dirtyPathCount: dirtyPaths,
    generator: {
      name: "audit-agent-experience",
      version: GENERATOR_VERSION,
      node: process.version,
    },
  };
}

/**
 * generatedAt and provenance describe the generation that last CHANGED the
 * report's substance. When a rerun produces identical substance, both are
 * preserved so the committed artifact stays byte-stable and its stamp remains
 * truthful about when the content was actually produced.
 */
function runtimeStampFor(nextReport) {
  if (existsSync(OUT)) {
    try {
      const previous = readJson(OUT);
      if (
        previous.generatedAt &&
        // A dirty-tree stamp is provisional: keep re-stamping until a run at a
        // clean tree records durable provenance.
        previous.provenance?.workingTreeClean === true &&
        JSON.stringify(withoutRuntimeFields(previous)) ===
          JSON.stringify(withoutRuntimeFields(nextReport))
      ) {
        return {
          generatedAt: previous.generatedAt,
          provenance: previous.provenance,
        };
      }
    } catch {
      // A malformed prior report should be replaced, not preserved.
    }
  }
  return { generatedAt: new Date().toISOString(), provenance: currentProvenance() };
}

if (!existsSync(MANIFEST)) {
  console.error("FAIL: agent-manifest.json missing; run npm run build:tokens");
  process.exit(1);
}

const manifest = readJson(MANIFEST);
const intentResult = runIntentRetrievalEval(readJson(INTENTS), manifest.components ?? []);
const { patterns } = loadPatternRecipes(ROOT);
const patternResult = runPatternCompositionEval(readJson(PATTERNS), patterns);
const report = buildAgentExperienceReport({
  manifest,
  intentResult,
  patternResult,
});

if (process.argv.includes("--update-baseline")) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify(createAgentExperienceBaseline(report), null, 2)}\n`,
  );
  console.log(`Updated ${BASELINE}`);
}

if (!existsSync(BASELINE)) {
  console.error(
    "FAIL: agent-experience baseline missing; run npm run audit:agent-experience -- --update-baseline",
  );
  process.exit(1);
}

const baseline = readJson(BASELINE);
const violations = compareAgentExperienceToBaseline(report, baseline);
const output = {
  ...report,
  ok: violations.length === 0,
  violations,
};
Object.assign(output, runtimeStampFor(output));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);

const clarity = output.dimensions.contractClarity;
const recoverability = output.dimensions.recoverability;
console.log(`Agent Experience audit: ${output.ok ? "PASS" : "FAIL"}`);
console.log(
  `  prop docs: ${clarity.propDocumentation.numerator}/${clarity.propDocumentation.denominator} (${(clarity.propDocumentation.rate * 100).toFixed(1)}%)`,
);
console.log(
  `  complete contracts: ${clarity.completeContractEvidence.numerator}/${clarity.completeContractEvidence.denominator}`,
);
console.log(
  `  machine relationships: ${recoverability.machineRelationshipComponents} component(s)`,
);
console.log(
  `  intent retrieval: ${output.dimensions.promptability.passed}/${output.dimensions.promptability.total}`,
);
console.log(`  report: ${OUT}`);

for (const violation of violations) {
  console.error(`  x ${JSON.stringify(violation)}`);
}

process.exit(output.ok ? 0 : 1);

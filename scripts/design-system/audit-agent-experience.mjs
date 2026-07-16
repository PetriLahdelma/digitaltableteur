#!/usr/bin/env node
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
  const { generatedAt: _generatedAt, ok: _ok, violations: _violations, ...rest } =
    report;
  return rest;
}

function generatedAtFor(nextReport) {
  if (!existsSync(OUT)) return new Date().toISOString();
  try {
    const previous = readJson(OUT);
    if (
      previous.generatedAt &&
      JSON.stringify(withoutRuntimeFields(previous)) ===
        JSON.stringify(withoutRuntimeFields(nextReport))
    ) {
      return previous.generatedAt;
    }
  } catch {
    // A malformed prior report should be replaced, not preserved.
  }
  return new Date().toISOString();
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
output.generatedAt = generatedAtFor(output);

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

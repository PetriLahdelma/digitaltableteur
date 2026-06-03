#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadPatternRecipes,
  rankPatternsForIntent,
} from "../pattern-composition-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const GOLDEN = join(dirname(fileURLToPath(import.meta.url)), "golden-patterns.json");
const MIN_PASS_RATE = 1;

export function runPatternCompositionEval(spec, patterns) {
  const results = [];
  let passed = 0;

  for (const testCase of spec.cases) {
    const ranked = rankPatternsForIntent(testCase.query, patterns, 5);
    const topNames = ranked.map((r) => r.name);
    const ok = topNames[0] === testCase.expectedTop1;
    if (ok) passed += 1;
    results.push({
      id: testCase.id,
      query: testCase.query,
      ok,
      top3: topNames.slice(0, 3),
      expectedTop1: testCase.expectedTop1,
    });
  }

  const total = spec.cases.length;
  return {
    passed,
    total,
    rate: total ? passed / total : 0,
    results,
    minPassRate: MIN_PASS_RATE,
  };
}

export function main() {
  const spec = JSON.parse(readFileSync(GOLDEN, "utf8"));
  const { patterns } = loadPatternRecipes(ROOT);
  if (!patterns.length) {
    console.error("FAIL: pattern-composition.recipes.json missing or empty");
    process.exit(1);
  }

  const { passed, total, rate, results, minPassRate } = runPatternCompositionEval(
    spec,
    patterns,
  );

  for (const row of results) {
    const mark = row.ok ? "✓" : "✗";
    console.log(
      `${mark} [${row.id}] "${row.query}" → ${row.top3.join(", ") || "(none)"} (want top1=${row.expectedTop1})`,
    );
  }

  console.log(
    `\nPattern composition: ${passed}/${total} (${(rate * 100).toFixed(1)}%)`,
  );

  if (rate < minPassRate) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

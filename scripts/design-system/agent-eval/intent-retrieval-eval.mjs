#!/usr/bin/env node
/**
 * Golden intent retrieval eval — ranks @dt components for fixed queries.
 * Uses the same rankComponentsForIntent() as find-component and MCP.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rankComponentsForIntent } from "../usage-scan-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MANIFEST = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");
const GOLDEN = join(dirname(fileURLToPath(import.meta.url)), "golden-intents.json");

const MIN_PASS_RATE = 0.9;

/**
 * @param {import('./golden-intents.json')} spec
 * @param {Array<{ name: string }>} components
 */
export function runIntentRetrievalEval(spec, components) {
  const results = [];
  let passed = 0;

  for (const testCase of spec.cases) {
    const ranked = rankComponentsForIntent(testCase.query, components, 8);
    const topNames = ranked.map((r) => r.name);
    const top3 = topNames.slice(0, 3);

    let ok = false;
    if (testCase.expectedTop1) {
      ok = topNames[0] === testCase.expectedTop1;
    } else if (testCase.expectedInTop3?.length) {
      ok = testCase.expectedInTop3.some((name) => top3.includes(name));
    } else {
      ok = false;
    }

    if (ok) passed += 1;
    results.push({
      id: testCase.id,
      query: testCase.query,
      ok,
      top3,
      expectedTop1: testCase.expectedTop1 ?? null,
      expectedInTop3: testCase.expectedInTop3 ?? null,
    });
  }

  const total = spec.cases.length;
  const rate = total ? passed / total : 0;

  return { passed, total, rate, results, minPassRate: MIN_PASS_RATE };
}

/** CLI entry when run directly */
export function main() {
  if (!existsSync(MANIFEST)) {
    console.error("FAIL: agent-manifest.json missing — run npm run build:tokens");
    process.exit(1);
  }

  const spec = JSON.parse(readFileSync(GOLDEN, "utf8"));
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const components = manifest.components ?? [];
  const { passed, total, rate, results, minPassRate } = runIntentRetrievalEval(
    spec,
    components,
  );

  for (const row of results) {
    const mark = row.ok ? "✓" : "✗";
    const expect = row.expectedTop1
      ? `top1=${row.expectedTop1}`
      : `top3∋${row.expectedInTop3?.join("|")}`;
    console.log(
      `${mark} [${row.id}] "${row.query}" → ${row.top3.join(", ") || "(none)"} (want ${expect})`,
    );
  }

  console.log(
    `\nIntent retrieval: ${passed}/${total} (${(rate * 100).toFixed(1)}%, min ${(minPassRate * 100).toFixed(0)}%)`,
  );

  if (rate < minPassRate) {
    console.error(
      `FAIL: pass rate ${(rate * 100).toFixed(1)}% below threshold ${(minPassRate * 100).toFixed(0)}%`,
    );
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

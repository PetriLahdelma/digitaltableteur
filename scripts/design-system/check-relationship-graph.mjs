#!/usr/bin/env node
/**
 * Validate the component relationship graph.
 *
 * Found by projecting the system into DSDS, whose conformance model requires that a
 * consumer treat unresolvable references as defects. We had no equivalent check, so
 * three different problems had been accumulating in one undifferentiated pile:
 *
 *   1. ARTIFACTS   - graph nodes that are not components at all. The co-import scanner
 *                    captured any path segment after `components/`, so grouping
 *                    directories ("animations", "ui") became targets. Always a defect.
 *   2. UNDOCUMENTED - edges pointing at real components that have no contract and no
 *                    spec.md. The edge is true; the target is invisible to every gate.
 *                    Ratcheted, because closing it means writing documentation.
 *   3. ANTI-PATTERNS - `replacementFor` / `prefersOver` entries like "raw <button>".
 *                    Never entities, correct as written, and not graph edges at all.
 *
 * Usage:
 *   node scripts/design-system/check-relationship-graph.mjs
 *   node scripts/design-system/check-relationship-graph.mjs --json
 *   node scripts/design-system/check-relationship-graph.mjs --update-ratchet
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { partitionRelationEntries } from "./relation-entry-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BLOCKS = join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json");
const RATCHET = join(ROOT, "scripts/design-system/relationship-graph-ratchet.json");
const BASES = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

const JSON_OUT = process.argv.includes("--json");
const UPDATE = process.argv.includes("--update-ratchet");

/** Real component directories, with and without contracts. */
function componentDirs() {
  const all = new Map();
  for (const sub of BASES) {
    const base = join(ROOT, sub);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(base, entry.name);
      if (!existsSync(join(dir, `${entry.name}.tsx`))) continue;
      all.set(entry.name, {
        hasContract: existsSync(join(dir, `${entry.name}.contract.json`)),
        hasSpec: existsSync(join(dir, `${entry.name}.spec.md`)),
        path: `${sub}/${entry.name}`,
      });
    }
  }
  return all;
}

function main() {
  if (!existsSync(BLOCKS)) {
    console.error("FAIL: run `npm run build:agent-blocks` first.");
    process.exit(1);
  }
  const { components } = JSON.parse(readFileSync(BLOCKS, "utf8"));
  const dirs = componentDirs();
  const real = new Set(dirs.keys());
  const documented = new Set(Object.keys(components));

  const artifacts = new Map();
  const undocumentedTargets = new Map();
  let edges = 0;
  let antiPatternCount = 0;
  let entityRefCount = 0;

  for (const [name, block] of Object.entries(components)) {
    // composesWith is a pure entity graph: every target must be a real component.
    for (const t of block.composesWith ?? []) {
      edges += 1;
      if (!real.has(t)) {
        artifacts.set(t, (artifacts.get(t) ?? 0) + 1);
      } else if (!documented.has(t)) {
        undocumentedTargets.set(t, (undocumentedTargets.get(t) ?? 0) + 1);
      }
    }
    // replacementFor / prefersOver are mixed by design.
    for (const field of ["replacementFor", "prefersOver"]) {
      const { entities, antiPatterns } = partitionRelationEntries(block[field] ?? [], real);
      antiPatternCount += antiPatterns.length;
      for (const e of entities) {
        entityRefCount += 1;
        if (!real.has(e.target)) artifacts.set(e.target, (artifacts.get(e.target) ?? 0) + 1);
      }
    }
  }

  const undocumented = [...dirs.entries()]
    .filter(([n, m]) => !m.hasContract && !m.hasSpec)
    .map(([n, m]) => ({ name: n, path: m.path }));

  const report = {
    componentsOnDisk: dirs.size,
    documented: documented.size,
    undocumented: undocumented.length,
    undocumentedComponents: undocumented.map((u) => u.name).sort(),
    composesWithEdges: edges,
    entityReferences: entityRefCount,
    antiPatternEntries: antiPatternCount,
    artifacts: Object.fromEntries(artifacts),
    edgesToUndocumented: Object.fromEntries(undocumentedTargets),
  };

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\nRelationship graph\n`);
    console.log(`  components on disk       ${report.componentsOnDisk}`);
    console.log(`  documented (contract)    ${report.documented}`);
    console.log(`  undocumented             ${report.undocumented}`);
    console.log(`  composesWith edges       ${report.composesWithEdges}`);
    console.log(`  entity references        ${report.entityReferences}  (replacementFor/prefersOver)`);
    console.log(`  anti-pattern entries     ${report.antiPatternEntries}  (not graph edges, correct as written)`);
    console.log(`  artifacts                ${artifacts.size}`);
    if (artifacts.size) {
      for (const [t, n] of artifacts) console.log(`      ${t} (x${n})`);
    }
    console.log(`  edges to undocumented    ${[...undocumentedTargets.values()].reduce((a, b) => a + b, 0)} across ${undocumentedTargets.size}`);
    for (const [t, n] of [...undocumentedTargets.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`      ${t} (x${n})`);
    }
    if (undocumented.length) {
      console.log(`\n  undocumented components (no contract, no spec.md):`);
      for (const u of undocumented) console.log(`      ${u.name}`);
    }
    console.log("");
  }

  if (UPDATE) {
    writeFileSync(
      RATCHET,
      `${JSON.stringify({ maxUndocumentedComponents: report.undocumented }, null, 2)}\n`,
    );
    console.log(`✓ ratchet updated: maxUndocumentedComponents = ${report.undocumented}`);
    return;
  }

  let failed = false;

  // Artifacts are always a defect: a graph node that is not a component.
  if (artifacts.size > 0) {
    console.error(
      `FAIL: ${artifacts.size} graph target(s) are not components. ` +
        `These are scanner artifacts, not relationships.`,
    );
    failed = true;
  }

  if (existsSync(RATCHET)) {
    const { maxUndocumentedComponents: ceiling } = JSON.parse(readFileSync(RATCHET, "utf8"));
    if (report.undocumented > ceiling) {
      console.error(
        `FAIL: ${report.undocumented} undocumented components > ceiling ${ceiling}. ` +
          `A new component landed without a contract or spec.md.`,
      );
      failed = true;
    } else if (!JSON_OUT) {
      console.log(`✓ undocumented components ${report.undocumented} <= ceiling ${ceiling}`);
    }
  }

  if (failed) process.exit(1);
  // Keep --json output parseable: status lines would be trailing garbage after the object.
  if (!JSON_OUT) console.log("✓ relationship graph clean (no artifacts)");
}

main();

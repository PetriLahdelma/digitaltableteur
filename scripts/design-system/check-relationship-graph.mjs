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
 *   2. OUT-OF-CATALOG - edges pointing at real components that carry no contract. Most
 *                    are deliberately exempt under docs/CATALOG-POLICY.md (app
 *                    infrastructure, embeds, editorial forks). This gate does NOT
 *                    re-litigate that: it reads the buckets from
 *                    dist/non-agent-surfaces.json and only treats `catalog-gap`, the
 *                    bucket the policy itself defines as debt, as a failure.
 *   3. ANTI-PATTERNS - `replacementFor` / `prefersOver` entries like "raw <button>".
 *                    Never entities, correct as written, and not graph edges at all.
 *
 * Usage:
 *   node scripts/design-system/check-relationship-graph.mjs
 *   node scripts/design-system/check-relationship-graph.mjs --json
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { partitionRelationEntries } from "./relation-entry-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BLOCKS = join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json");
const SURFACES = join(ROOT, "nextjs-app/shared/foundations/dist/non-agent-surfaces.json");
const BASES = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

const JSON_OUT = process.argv.includes("--json");

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

  // Buckets come from the catalog policy, not from a definition invented here. An
  // earlier version of this gate counted every contract-less folder as debt, which
  // double-counted 22 deliberately exempt surfaces as if they were oversights.
  let buckets = new Map();
  let catalogGap = [];
  if (existsSync(SURFACES)) {
    const { surfaces } = JSON.parse(readFileSync(SURFACES, "utf8"));
    for (const s of surfaces) buckets.set(s.name, s.bucket);
    catalogGap = surfaces.filter((s) => s.bucket === "catalog-gap").map((s) => s.name);
  }
  const outOfCatalog = [...dirs.entries()]
    .filter(([n, m]) => !m.hasContract)
    .map(([n, m]) => ({ name: n, path: m.path, bucket: buckets.get(n) ?? "unclassified" }));

  const report = {
    componentsOnDisk: dirs.size,
    documented: documented.size,
    outOfCatalog: outOfCatalog.length,
    catalogGap: catalogGap.length,
    catalogGapComponents: catalogGap.sort(),
    byBucket: outOfCatalog.reduce((a, s) => ({ ...a, [s.bucket]: (a[s.bucket] ?? 0) + 1 }), {}),
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
    console.log(`  in catalog (contract)    ${report.documented}`);
    console.log(`  out of catalog           ${report.outOfCatalog}`);
    for (const [b, n] of Object.entries(report.byBucket).sort((a, b2) => b2[1] - a[1])) {
      console.log(`      ${b.padEnd(18)} ${n}${b === "catalog-gap" ? "  <- real debt" : ""}`);
    }
    console.log(`  composesWith edges       ${report.composesWithEdges}`);
    console.log(`  entity references        ${report.entityReferences}  (replacementFor/prefersOver)`);
    console.log(`  anti-pattern entries     ${report.antiPatternEntries}  (not graph edges, correct as written)`);
    console.log(`  artifacts                ${artifacts.size}`);
    if (artifacts.size) {
      for (const [t, n] of artifacts) console.log(`      ${t} (x${n})`);
    }
    console.log(`  edges to out-of-catalog  ${[...undocumentedTargets.values()].reduce((a, b) => a + b, 0)} across ${undocumentedTargets.size}`);
    for (const [t, n] of [...undocumentedTargets.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`      ${t} (x${n}) [${buckets.get(t) ?? "unclassified"}]`);
    }
    if (catalogGap.length) {
      console.log(`\n  catalog-gap (should be cataloged, per docs/CATALOG-POLICY.md):`);
      for (const u of catalogGap) console.log(`      ${u}`);
    }
    const unclassified = outOfCatalog.filter((s) => s.bucket === "unclassified");
    if (unclassified.length) {
      console.log(`\n  unclassified (not in non-agent-surfaces.json):`);
      for (const u of unclassified) console.log(`      ${u.name}`);
    }
    console.log("");
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

  // catalog-gap is the policy's own debt bucket and check:catalog-coverage already
  // holds it at zero. Repeating the assertion here keeps the graph honest without
  // inventing a second, competing definition of "documented".
  if (report.catalogGap > 0) {
    console.error(
      `FAIL: ${report.catalogGap} component(s) in the catalog-gap bucket: ` +
        `${report.catalogGapComponents.join(", ")}. File a contract (docs/CATALOG-POLICY.md).`,
    );
    failed = true;
  } else if (!JSON_OUT) {
    console.log(`✓ catalog-gap 0 (${report.outOfCatalog} out-of-catalog surfaces, all classified)`);
  }

  if (failed) process.exit(1);
  // Keep --json output parseable: status lines would be trailing garbage after the object.
  if (!JSON_OUT) console.log("✓ relationship graph clean (no artifacts)");
}

main();

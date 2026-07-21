#!/usr/bin/env node
// Walks nextjs-app/shared/{components,patterns} and reports how many of the
// component-shaped folders are in the design-system catalog (contract.json +
// stories.tsx + MDX + spec.md) versus how many sit outside it.
//
// Run directly for a human-readable report:
//   node scripts/design-system/audit-catalog-coverage.mjs
//
// Run with `--json` for machine-readable output (agent manifest).
// Run with `--emit` to write foundations/dist/non-agent-surfaces.json:
//   node scripts/design-system/audit-catalog-coverage.mjs --emit
//
// The audit treats a folder as "component-shaped" if it owns a `<Name>.tsx`
// file matching the folder name. Page-level subdirectories (`components/pages`),
// the animation/icon/marketing sub-trees, and the interactive primitives folder
// are skipped because they're collections, not single components.

import {
  readdirSync,
  readFileSync,
  existsSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const ROOTS = [
  { path: "nextjs-app/shared/components", label: "components" },
  { path: "nextjs-app/shared/patterns", label: "patterns" },
];

// Skipped because they aggregate sibling components rather than being a
// single catalog entry themselves.
const SKIP_FOLDERS = new Set([
  "pages",
  "interactive",
  "animations",
  "icons",
  "marketing",
]);

// Heuristics. Pure name/role classification; the source of truth is whatever
// the catalog policy says (see docs/CATALOG-POLICY.md when authored).
const BESPOKE_OR_INFRA = new Set([
  "AppLoading",
  "AskAI",
  "ChunkErrorBoundary",
  // App features / providers / third-party embeds — not reusable DS primitives,
  // so they are not held to the contract+stories catalog bar.
  "DashLeadList",
  "DonnyActionProvider",
  "DonnyBookingEmbed",
  "HelsinkiClock",
  "HeroBackground",
  "LogoConstruction",
  "LogoReveal",
  "MdxImage",
  "Mermaid",
  "Prose",
  "StudioMap",
  "TableOfContents",
]);

const PAGE_LEVEL_PREFIX =
  /^(About|Article|Blog|Contact|Project|Related|Stats|Values|Work|CV|Map|Content|Manifesto)/;

const ENHANCED_OR_EDITORIAL = /^(Enhanced|.*Editorial$|.*Success$)/;

function isComponentDir(dir, name) {
  return existsSync(join(dir, `${name}.tsx`));
}

function gatherComponents() {
  const out = [];
  for (const { path: rootRel, label } of ROOTS) {
    const root = join(ROOT, rootRel);
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || SKIP_FOLDERS.has(entry.name)) continue;
      const dir = join(root, entry.name);
      if (isComponentDir(dir, entry.name)) {
        out.push({ root: label, parent: null, name: entry.name, dir });
        continue;
      }
      // Walk one nesting level for parents that own sub-components
      // (ChatWidget owns AIProcessingState, ChatComposer, …).
      for (const sub of readdirSync(dir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        const subDir = join(dir, sub.name);
        if (isComponentDir(subDir, sub.name)) {
          out.push({
            root: label,
            parent: entry.name,
            name: sub.name,
            dir: subDir,
          });
        }
      }
    }
  }
  return out;
}

function readContract(dir, name) {
  const p = join(dir, `${name}.contract.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function classifyMissing(component) {
  if (BESPOKE_OR_INFRA.has(component.name)) return "exempt";
  if (ENHANCED_OR_EDITORIAL.test(component.name)) return "enhanced-fork";
  if (
    component.root === "patterns" ||
    PAGE_LEVEL_PREFIX.test(component.name)
  )
    return "page-pattern";
  return "catalog-gap";
}

const components = gatherComponents();
const report = components.map((c) => {
  const contract = readContract(c.dir, c.name);
  const hasContract = contract !== null;
  return {
    name: c.name,
    root: c.root,
    parent: c.parent,
    dir: c.dir.replace(`${ROOT}/`, ""),
    hasContract,
    hasStories: existsSync(join(c.dir, `${c.name}.stories.tsx`)),
    hasTest: existsSync(join(c.dir, `${c.name}.test.tsx`)),
    hasMdx: existsSync(join(c.dir, `${c.name}.mdx`)),
    hasSpec: existsSync(join(c.dir, `${c.name}.spec.md`)),
    status: contract?.status ?? null,
    classification: hasContract ? "in-catalog" : classifyMissing(c),
  };
});

const summary = {
  totalComponentsInCodebase: report.length,
  inCatalog: report.filter((c) => c.hasContract).length,
  outOfCatalog: report.filter((c) => !c.hasContract).length,
  catalogCompleteness:
    report.length === 0
      ? 0
      : Math.round((report.filter((c) => c.hasContract).length / report.length) * 1000) / 10,
  storyCoverage: report.filter((c) => c.hasStories).length,
  testCoverage: report.filter((c) => c.hasTest).length,
  mdxCoverage: report.filter((c) => c.hasMdx).length,
  specCoverage: report.filter((c) => c.hasSpec).length,
  outOfCatalogByBucket: {
    "catalog-gap": report.filter((c) => c.classification === "catalog-gap").length,
    "page-pattern": report.filter((c) => c.classification === "page-pattern").length,
    "enhanced-fork": report.filter((c) => c.classification === "enhanced-fork").length,
    exempt: report.filter((c) => c.classification === "exempt").length,
  },
};

const EMIT_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/non-agent-surfaces.json",
);

function buildNonAgentSurfaces(report) {
  const outOfCatalog = report.filter((c) => !c.hasContract);
  return {
    generatedAt: new Date().toISOString(),
    description:
      "Component-shaped folders outside the agent catalog. Agents should not invent replacements; use find-component for cataloged primitives or respect bucket policy.",
    policyDoc: "docs/CATALOG-POLICY.md",
    summary: {
      totalOutOfCatalog: outOfCatalog.length,
      byBucket: summary.outOfCatalogByBucket,
      catalogCompletenessPercent: summary.catalogCompleteness,
    },
    surfaces: outOfCatalog.map((c) => ({
      name: c.name,
      path: c.dir,
      root: c.root,
      parent: c.parent,
      bucket: c.classification,
      agentGuidance:
        c.classification === "exempt"
          ? "Do not catalog; app-specific or infrastructure."
          : c.classification === "page-pattern"
            ? "Page assembly; compose from @dt/* catalog, do not promote to stable atom."
            : c.classification === "enhanced-fork"
              ? "Editorial fork; prefer base catalog component unless explicitly requested."
              : "Catalog gap — file a contract before agent use.",
    })),
  };
}

const asJson = process.argv.includes("--json");
const shouldEmit = process.argv.includes("--emit");

if (shouldEmit) {
  const payload = buildNonAgentSurfaces(report);
  mkdirSync(dirname(EMIT_PATH), { recursive: true });
  writeFileSync(EMIT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`✓ Wrote ${EMIT_PATH.replace(`${ROOT}/`, "")}`);
}

if (asJson) {
  process.stdout.write(JSON.stringify({ summary, components: report }, null, 2));
} else if (!shouldEmit) {
  console.log("Catalog coverage audit");
  console.log("=======================");
  console.log(`Codebase components:       ${summary.totalComponentsInCodebase}`);
  console.log(`In catalog (contract.json):${String(summary.inCatalog).padStart(4)}  (${summary.catalogCompleteness}%)`);
  console.log(`Out of catalog:            ${String(summary.outOfCatalog).padStart(4)}`);
  console.log(`  catalog gap (atoms/molecules that should be cataloged): ${summary.outOfCatalogByBucket["catalog-gap"]}`);
  console.log(`  page pattern (page-level assembly, judgement call):     ${summary.outOfCatalogByBucket["page-pattern"]}`);
  console.log(`  enhanced/editorial fork (uncataloged variant):          ${summary.outOfCatalogByBucket["enhanced-fork"]}`);
  console.log(`  bespoke / infrastructure (likely exempt):               ${summary.outOfCatalogByBucket.exempt}`);
  console.log("");
  console.log("Artifact coverage (over all codebase components):");
  console.log(`  stories.tsx : ${summary.storyCoverage} / ${summary.totalComponentsInCodebase}`);
  console.log(`  test.tsx    : ${summary.testCoverage} / ${summary.totalComponentsInCodebase}`);
  console.log(`  mdx         : ${summary.mdxCoverage} / ${summary.totalComponentsInCodebase}`);
  console.log(`  spec.md     : ${summary.specCoverage} / ${summary.totalComponentsInCodebase}`);
  console.log("");
  console.log("Run with --json for machine-readable output.");
}

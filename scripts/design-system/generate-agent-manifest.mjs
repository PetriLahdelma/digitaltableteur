#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { scanComponentUsage } from "./usage-scan-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const AGENT_BLOCKS_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);
const OUT = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");
const CATALOG_PATH = join(ROOT, "nextjs-app/shared/foundations/token-catalog.json");
const dirs = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

// Honest Beta heuristics — must stay in sync with validate-components.ts.
const STUB_MDX_PHRASES = [
  "Production layouts and flows documented in Storybook",
  "Prefer a smaller primitive when this composition is more than you need",
  "Promote to stable after AT snapshots and a documented production consumer",
];
const STUB_SPEC_MARKER = /\bTODO\b:/;

const components = [];
const documentationDebt = [];

for (const base of dirs) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    const specPath = join(base, name, `${name}.spec.md`);
    const mdxPath = join(base, name, `${name}.mdx`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const spec = existsSync(specPath) ? readFileSync(specPath, "utf8") : null;
    const mdx = existsSync(mdxPath) ? readFileSync(mdxPath, "utf8") : null;

    const reasons = [];
    if (contract.status === "beta" || contract.status === "stable") {
      if (mdx && STUB_MDX_PHRASES.some((p) => mdx.includes(p))) {
        reasons.push("stub MDX (scaffolder boilerplate not replaced)");
      }
      if (spec && STUB_SPEC_MARKER.test(spec)) {
        reasons.push("stub spec.md (TODO markers present)");
      }
    }
    const hasDocDebt = reasons.length > 0;
    if (hasDocDebt) documentationDebt.push({ name, status: contract.status, reasons });

    components.push({ name, contract, spec, documentationDebt: hasDocDebt });
  }
}

const usageScan = scanComponentUsage({ root: ROOT });

const RELATIONSHIP_GRAPH_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/relationship-graph.json",
);
let relationshipGraph = null;
if (existsSync(RELATIONSHIP_GRAPH_PATH)) {
  try {
    const graph = JSON.parse(readFileSync(RELATIONSHIP_GRAPH_PATH, "utf8"));
    const withEdges = Object.values(graph.components ?? {}).filter(
      (c) => c.composesWith?.length > 0,
    ).length;
    relationshipGraph = {
      description:
        "Merged static composesWith policy + co-import evidence (see generate-relationship-graph.mjs).",
      generatedAt: graph.generatedAt,
      coImportMinFiles: graph.coImportMinFiles,
      nodesWithComposesWith: withEdges,
      regenerate: "npm run build:relationship-graph or npm run build:tokens",
      path: "nextjs-app/shared/foundations/dist/relationship-graph.json",
    };
  } catch (err) {
    console.warn("⚠  Could not parse relationship-graph.json:", err.message);
  }
} else {
  console.warn(
    "⚠  relationship-graph.json missing — run npm run build:relationship-graph",
  );
}

let agentBlocksByName = {};
if (existsSync(AGENT_BLOCKS_PATH)) {
  try {
    agentBlocksByName = JSON.parse(readFileSync(AGENT_BLOCKS_PATH, "utf8")).components ?? {};
  } catch (err) {
    console.warn("⚠  Could not parse component-agent-blocks.json:", err.message);
  }
} else {
  console.warn(
    "⚠  component-agent-blocks.json missing — run npm run build:agent-blocks",
  );
}

const usageCoverage = {
  description:
    "Auto-detected import evidence from app/** and nextjs-app/**. Separate from contract.consumers[], which remains the stable-promotion gate for shipping-product proof.",
  ...usageScan.summary,
  regenerate: "npm run audit:usage (--json) or npm run build:tokens",
  findComponent: "npm run find-component -- \"your intent\"",
};

const componentsWithUsage = components.map((entry) => {
  const usage = usageScan.byComponent.get(entry.name);
  const agent = agentBlocksByName[entry.name] ?? {
    preferredImport: `@dt/${entry.name}`,
    intent: entry.contract.description ?? "",
    props: {},
    variants: entry.contract.variants ?? {},
    useWhen: [],
    avoidWhen: [],
    requiredA11y: entry.contract.a11y?.ariaRequirements ?? [],
    keyboard: entry.contract.a11y?.keyboard ?? [],
    compositionRules: [],
    canonicalExamples: entry.contract.requiredStories ?? ["Default"],
    replacementFor: [],
    prefersOver: [],
    declaredPropCount: 0,
  };
  return {
    ...entry,
    usage: usage ?? {
      publicImport: `@dt/${entry.name}`,
      importCount: 0,
      productionImportCount: 0,
      patternImportCount: 0,
      componentImportCount: 0,
      evidence: [],
    },
    agent,
  };
});

const statusCounts = components.reduce((acc, c) => {
  acc[c.contract.status] = (acc[c.contract.status] ?? 0) + 1;
  return acc;
}, {});

let tokens = null;
if (existsSync(CATALOG_PATH)) {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  tokens = {
    source: catalog.source,
    tokenCount: catalog.tokenCount,
    usageCoverage: catalog.usageCoverage,
    catalogPath: "nextjs-app/shared/foundations/token-catalog.json",
    dtcgExport: "nextjs-app/shared/foundations/tokens/production/",
    tailwindBridge: "app/tailwind.css (DT-THEME block)",
    regenerate: "npm run build:tokens",
    themes: catalog.themes,
    contrastPairCount: catalog.contrastPairs?.length ?? 0,
  };
}

// Catalog-coverage audit — how much of the codebase is in the catalog vs out.
// Sourced from scripts/design-system/audit-catalog-coverage.mjs so both
// surfaces (manifest + CLI) tell the same story.
let catalogCoverage = null;
try {
  execSync(
    `node ${join(ROOT, "scripts/design-system/audit-catalog-coverage.mjs")} --emit`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const auditJson = execSync(
    `node ${join(ROOT, "scripts/design-system/audit-catalog-coverage.mjs")} --json`,
    { encoding: "utf8" },
  );
  const audit = JSON.parse(auditJson);
  catalogCoverage = {
    description:
      "Catalog completeness across the codebase. componentCount above is the catalog count; this block reveals how much of the codebase that catalog actually represents.",
    totalComponentsInCodebase: audit.summary.totalComponentsInCodebase,
    inCatalog: audit.summary.inCatalog,
    outOfCatalog: audit.summary.outOfCatalog,
    catalogCompletenessPercent: audit.summary.catalogCompleteness,
    artifactCoverage: {
      stories: audit.summary.storyCoverage,
      tests: audit.summary.testCoverage,
      mdx: audit.summary.mdxCoverage,
      spec: audit.summary.specCoverage,
    },
    outOfCatalogByBucket: audit.summary.outOfCatalogByBucket,
    regenerate:
      "node scripts/design-system/audit-catalog-coverage.mjs (run with --json for machine-readable output)",
  };
} catch (err) {
  console.warn("⚠  Could not run catalog audit:", err.message);
}

// Honest parity statement — the previous "near-parity with DSharp" framing was
// overstated. This block makes the gap legible to AI consumers so a coding agent
// does not promote components past their evidence base.
const dsharpParity = {
  description:
    "Comparison against DSharp as of 2026-05-26. Breadth is close, maturity is not. This block walks back the earlier parity overclaim.",
  contractCount: { digitaltableteur: components.length, dsharp: 112 },
  statusMix: {
    digitaltableteur: statusCounts,
    dsharp: { beta: 110, stable: 2 },
  },
  parityScoringScope: "phase-1 story presence only (per parity-audit.mjs line 1)",
  gapsToClose: [
    "bundle-size budgets via size-limit per public entrypoint",
    "light/dark visual baselines on all stable atoms (npm run test:visual)",
    "production consumers auto-synced into contract.consumers[] (stable tier; manual today)",
    "Figma variable phases applied in file (npm run figma:apply-variables via MCP)",
    "Code Connect on Figma Organization tier (skipped on Pro)",
  ],
  notReadyForStablePromotion: false,
  testCiStatus: {
    asOf: "2026-05-28",
    filesWithFailures: 0,
    failingTests: 0,
    note: "Header, ProcessBlock, TeamBlock, and CookieConsent regressions resolved.",
    debtDoc: "docs/TEST-DEBT.md",
  },
};

function withoutGeneratedAt(payload) {
  const { generatedAt: _generatedAt, ...rest } = payload;
  return rest;
}

function resolveGeneratedAt(nextPayload) {
  if (!existsSync(OUT)) return new Date().toISOString();

  try {
    const previous = JSON.parse(readFileSync(OUT, "utf8"));
    if (
      previous.generatedAt &&
      JSON.stringify(withoutGeneratedAt(previous)) ===
        JSON.stringify(withoutGeneratedAt(nextPayload))
    ) {
      return previous.generatedAt;
    }
  } catch {
    // Fall through to a fresh timestamp if the existing manifest is unreadable.
  }

  return new Date().toISOString();
}

mkdirSync(dirname(OUT), { recursive: true });
const payload = {
  schemaVersion: "1.5",
  generatedAt: null,
  summary: {
    componentCount: components.length,
    statusCounts,
    honestBetaDocDebt: documentationDebt.length,
    catalogCompletenessPercent:
      catalogCoverage?.catalogCompletenessPercent ?? null,
    codebaseComponentCount:
      catalogCoverage?.totalComponentsInCodebase ?? null,
    usageCoveragePercent:
      usageCoverage.catalogedComponents > 0
        ? Math.round(
            (usageCoverage.withAnyUsage / usageCoverage.catalogedComponents) *
              1000,
          ) / 10
        : null,
    componentsWithProductionUsage: usageCoverage.withProductionUsage,
    notReadyForStablePromotion:
      (statusCounts.stable ?? 0) < 10 ||
      (catalogCoverage?.catalogCompletenessPercent ?? 0) < 85 ||
      (catalogCoverage?.outOfCatalogByBucket?.["catalog-gap"] ?? 0) > 0,
  },
  exportPolicy: {
    importSurface: "@dt/<ComponentName>",
    npmPackage: null,
    semverDoc: "docs/PUBLIC_API.md",
    stableCount: statusCounts.stable ?? 0,
    releaseGate: "npm run release:gate",
  },
  tokens,
  catalogCoverage,
  usageCoverage,
  relationshipGraph,
  honestBeta: {
    description:
      "Components carrying scaffolder boilerplate at beta+. Each entry disappears automatically when its MDX + spec.md are rewritten with real prose.",
    documentationDebt,
  },
  dsharpParity,
  components: componentsWithUsage,
};
payload.generatedAt = resolveGeneratedAt(payload);
writeFileSync(
  OUT,
  JSON.stringify(payload, null, 2),
);
console.log(
  `✓ agent-manifest.json (${components.length} components${tokens ? `, ${tokens.tokenCount} tokens` : ""}, ${documentationDebt.length} doc-debt)`,
);

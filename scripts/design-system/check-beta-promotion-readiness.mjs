#!/usr/bin/env node
/**
 * Guard beta-to-stable promotions for the Astryx breadth candidates.
 *
 * This check is intentionally not a publish blocker for beta exports in the
 * 0.1.x package. It blocks the dangerous case: marking a candidate stable
 * before it has the evidence that the roadmap requires.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");
const OUT_DIR = join(ROOT, ".omx/state/design-system/beta-promotion-readiness");
const OUT_JSON = join(OUT_DIR, "latest.json");
const REPORT = process.argv.includes("--report");

const CANDIDATES = [
  "Breadcrumb",
  "Tabs",
  "Progress",
  "AlertBanner",
  "EmptyState",
  "CodeSnippet",
];

const REQUIRED_STORIES = ["Default", "Example", "ForcedColors"];
const PRODUCTION_ROOTS = ["app", "nextjs-app/shared/components", "nextjs-app/shared/patterns"];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "storybook-static" ||
        entry.name === "__a11y-snapshots__"
      ) {
        continue;
      }
      walkFiles(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.(test|stories)\.tsx?$/.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

function storySlug(storyName) {
  return storyName.replace(/[A-Z]/g, (c, i) =>
    i ? `-${c.toLowerCase()}` : c.toLowerCase(),
  );
}

function hasA11ySnapshot(componentName, storyName) {
  const dir = join(COMPONENTS, componentName, "__a11y-snapshots__");
  if (!existsSync(dir)) return false;
  const componentSlug = componentName.toLowerCase();
  const story = storySlug(storyName);
  return readdirSync(dir).some(
    (file) =>
      file.includes(componentSlug) &&
      (file.endsWith(`--${story}.yaml`) || file.includes(`--${story}.`)),
  );
}

function hasRealFigmaNode(figma) {
  return typeof figma === "string" && /node-id=\d+[-:]\d+/.test(figma);
}

function productionConsumers(componentName) {
  const ownDir = `nextjs-app/shared/components/${componentName}/`;
  const importRe = new RegExp(`(?:@dt/${componentName}\\b|@digitaltableteur/react["'][^;\\n]*\\b${componentName}\\b|components/${componentName}\\b|<${componentName}\\b)`);
  const rows = [];

  for (const root of PRODUCTION_ROOTS) {
    for (const file of walkFiles(join(ROOT, root))) {
      const rel = relative(ROOT, file);
      if (rel.startsWith("app/dev/")) continue;
      if (rel.startsWith(ownDir)) continue;
      if (rel.endsWith("/TailwindTest.tsx")) continue;
      const source = readFileSync(file, "utf8");
      if (importRe.test(source)) rows.push(rel);
    }
  }

  return [...new Set(rows)].sort();
}

function candidateRow(name) {
  const contractPath = join(COMPONENTS, name, `${name}.contract.json`);
  if (!existsSync(contractPath)) {
    return {
      name,
      status: "missing",
      blockers: ["missingContract"],
      evidence: {},
    };
  }

  const contract = readJson(contractPath);
  const snapshots = Object.fromEntries(
    REQUIRED_STORIES.map((story) => [story, hasA11ySnapshot(name, story)]),
  );
  const consumers = productionConsumers(name);
  const evidence = {
    status: contract.status,
    contract: relative(ROOT, contractPath),
    realFigmaNode: hasRealFigmaNode(contract.figma),
    forcedColorsVerified: contract.a11y?.forcedColorsVerified === true,
    reviewed: contract.a11y?.reviewed === true,
    requiredStoriesPresent: REQUIRED_STORIES.every((story) =>
      contract.requiredStories?.includes(story),
    ),
    a11ySnapshots: snapshots,
    productionConsumers: consumers,
  };
  const blockers = [];

  if (!evidence.realFigmaNode) blockers.push("realFigmaNode");
  if (!evidence.forcedColorsVerified) blockers.push("forcedColorsVerified");
  if (!evidence.reviewed) blockers.push("a11yReviewed");
  if (!evidence.requiredStoriesPresent) blockers.push("requiredStories");
  for (const [story, present] of Object.entries(snapshots)) {
    if (!present) blockers.push(`a11ySnapshot:${story}`);
  }
  if (consumers.length === 0) blockers.push("productionConsumer");

  return {
    name,
    status: contract.status,
    blockers,
    evidence,
  };
}

const candidates = CANDIDATES.map(candidateRow);
const prematureStable = candidates.filter(
  (row) => row.status === "stable" && row.blockers.length > 0,
);

const report = {
  generatedAt: new Date().toISOString(),
  candidates,
  prematureStable: prematureStable.map((row) => ({
    name: row.name,
    blockers: row.blockers,
  })),
  note:
    "Beta exports may ship in the 0.1.x package. This guard fails only when a named candidate is marked stable before production, a11y, forced-colors, and real Figma evidence are present.",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (REPORT) {
  console.log(JSON.stringify(report, null, 2));
}

if (prematureStable.length) {
  console.error("Beta promotion readiness guard failed:");
  for (const row of prematureStable) {
    console.error(`  - ${row.name} is stable but still blocked by: ${row.blockers.join(", ")}`);
  }
  console.error(`Report: ${relative(ROOT, OUT_JSON)}`);
  process.exit(1);
}

console.log(
  `✓ beta promotion readiness verified (${candidates.length} candidates, ${prematureStable.length} premature stable promotions)`,
);
console.log(`  Report: ${relative(ROOT, OUT_JSON)}`);

#!/usr/bin/env node
/**
 * Export every Digitaltableteur component contract as an open Design System
 * Contract 1.0 document (packages/contract-spec) under public/contracts/v1/,
 * so the site's own design system is checked by the same public tool anyone
 * else can run.
 *
 *   node scripts/design-system/export-contract-spec.mjs          # write
 *   node scripts/design-system/export-contract-spec.mjs --check  # fail on drift
 *
 * Honesty rules (docs/AGENTIC_DS_FRONTIER_ROADMAP.md guardrail):
 * - accessibility criteria come from deriveA11yCriteria, so `automated`
 *   means fresh browser evidence exists, and each automated criterion lists
 *   the evidence records that prove it;
 * - a manual criterion needs a review date; without one it is exported as
 *   `unverified` rather than given an invented date;
 * - governance is exported only where a human recorded it. Nothing here
 *   fabricates an owner or a review.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceDir, isEvidenceFresh } from "./a11y-evidence-lib.mjs";
import { deriveA11yCriteria } from "./derive-a11y-criteria.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "public/contracts/v1");
const SCHEMA_SOURCE = join(ROOT, "packages/contract-spec/schema/contract.schema.json");
const SCHEMA_OUT = join(ROOT, "public/schemas/contract-spec/1.0/contract.schema.json");
const SCHEMA_URL =
  "https://www.digitaltableteur.com/schemas/contract-spec/1.0/contract.schema.json";
const CONTRACT_ROOTS = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];
const check = process.argv.includes("--check");

function findContracts(directory, out = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith("__") && entry.name !== "node_modules") {
        findContracts(full, out);
      }
    } else if (entry.name.endsWith(".contract.json")) {
      out.push(full);
    }
  }
  return out;
}

const reactExports = new Set(
  Object.keys(
    JSON.parse(readFileSync(join(ROOT, "packages/react/contract-surface.json"), "utf8"))
      .components,
  ),
);

/** `warnPropRename("TextInput", "onChange", "onValueChange")` in source. */
function renameTargets(componentDir, name) {
  const targets = {};
  for (const file of readdirSync(componentDir)) {
    if (!/\.tsx?$/.test(file) || file.includes(".test.") || file.includes(".stories.")) continue;
    const source = readFileSync(join(componentDir, file), "utf8");
    for (const match of source.matchAll(
      /warnPropRename\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"/g,
    )) {
      if (match[1] === name) targets[match[2]] = match[3];
    }
  }
  return targets;
}

function exportProps(contract, componentDir) {
  const renames = renameTargets(componentDir, contract.name);
  const props = {};
  for (const [name, prop] of Object.entries(contract.props ?? {})) {
    const out = { type: prop.type };
    if (Array.isArray(prop.values) && prop.values.length > 0) out.values = prop.values;
    if (prop.optional !== undefined) out.optional = prop.optional;
    if (prop.description) out.description = prop.description;
    if (prop.deprecated) {
      out.deprecated = renames[name]
        ? {
            reason: `Renamed to ${renames[name]}; a development warning fires on use.`,
            replacement: renames[name],
          }
        : { reason: "Marked @deprecated in the TypeScript source." };
    }
    // A union whose values TypeScript could not enumerate is exported as a
    // plain type rather than an unverifiable union.
    if (out.type === "union" && !out.values) out.type = "string";
    props[name] = out;
  }
  return props;
}

/** The date a human recorded for a review, never an inferred one. */
function reviewDate(contract) {
  if (contract.governance?.lastReviewed) return contract.governance.lastReviewed;
  const noted = /^(\d{4}-\d{2}-\d{2})/.exec(contract.a11y?.reviewedNote ?? "");
  return noted ? noted[1] : null;
}

function exportCriteria(contract, componentDir, outDir) {
  // Fresh records, with the file each came from (the artifact path).
  const dir = evidenceDir(componentDir);
  const fresh = existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith(".json"))
        .flatMap((name) => {
          try {
            const record = JSON.parse(readFileSync(join(dir, name), "utf8"));
            return isEvidenceFresh(componentDir, record)
              ? [{ record, file: join(dir, name) }]
              : [];
          } catch {
            return []; // a corrupt record is not evidence
          }
        })
    : [];
  const review = reviewDate(contract);
  return deriveA11yCriteria(contract, { componentDir }).map((criterion) => {
    const out = {
      id: criterion.id,
      statement: criterion.statement,
      verification: criterion.verificationMode,
    };
    const sc = (criterion.wcag ?? []).map((entry) => entry.sc).filter(Boolean);
    if (sc.length > 0) out.wcag = sc;
    if (criterion.note) out.note = criterion.note;
    if (out.verification === "automated") {
      out.check = criterion.check;
      out.evidence = fresh
        .filter(({ record }) => record.checks?.[criterion.id]?.passed === true)
        .map(({ record, file }) => {
          return {
            artifact: relative(outDir, file),
            sourceCommit: record.sourceSHA,
            capturedAt: record.capturedAt,
            passed: true,
            ...(record.runner ? { runner: record.runner } : {}),
          };
        })
        .filter((ref) => ref.artifact && /^[0-9a-f]{7,64}$/.test(ref.sourceCommit ?? ""))
        .sort((a, b) => a.artifact.localeCompare(b.artifact));
      if (out.evidence.length === 0) {
        // Automated per the boolean fallback, but no exportable record.
        out.verification = "unverified";
        out.note = "No exportable evidence record for this check; re-run the check to capture one.";
        delete out.check;
        delete out.evidence;
      }
    } else if (out.verification === "manual") {
      if (review) out.reviewedAt = review;
      else {
        out.verification = "unverified";
        out.note = "Marked reviewed, but no review date was recorded.";
      }
    }
    return out;
  });
}

function exportContract(file) {
  const contract = JSON.parse(readFileSync(file, "utf8"));
  const componentDir = dirname(file);
  const out = {
    $schema: SCHEMA_URL,
    specVersion: "1.0",
    name: contract.name,
    status: contract.status,
    description: contract.description,
  };
  if (reactExports.has(contract.name)) {
    out.package = {
      name: "@digitaltableteur/react",
      import: `import { ${contract.name} } from "@digitaltableteur/react";`,
    };
  }
  out.props = exportProps(contract, componentDir);
  if (Array.isArray(contract.forbiddenCombos) && contract.forbiddenCombos.length > 0) {
    out.rules = contract.forbiddenCombos;
  }
  out.accessibility = { criteria: exportCriteria(contract, componentDir, OUT) };
  if (contract.governance?.owner && contract.governance?.lastReviewed) {
    out.governance = {
      owner: contract.governance.owner,
      lastReviewed: contract.governance.lastReviewed,
      ...(contract.governance.note ? { note: contract.governance.note } : {}),
    };
  }
  if (contract.status === "deprecated") {
    out.deprecation = { reason: contract.deprecatedReason ?? "Deprecated." };
  }
  out.source = readdirSync(componentDir)
    .filter((name) => /\.(tsx|module\.css)$/.test(name) && !/\.(test|stories)\./.test(name))
    .map((name) => relative(OUT, join(componentDir, name)))
    .sort();
  return out;
}

const contractFiles = CONTRACT_ROOTS.flatMap((root) => findContracts(join(ROOT, root))).sort();
const outputs = new Map();
for (const file of contractFiles) {
  const exported = exportContract(file);
  outputs.set(`${exported.name}.contract.json`, `${JSON.stringify(exported, null, 2)}\n`);
}
const index = {
  specVersion: "1.0",
  generator: "scripts/design-system/export-contract-spec.mjs",
  schema: SCHEMA_URL,
  check: "npx @digitaltableteur/contract-spec public/contracts/v1",
  contracts: [...outputs.keys()],
};
outputs.set("index.json", `${JSON.stringify(index, null, 2)}\n`);
const schemaText = readFileSync(SCHEMA_SOURCE, "utf8");

if (check) {
  const drift = [];
  for (const [name, text] of outputs) {
    const path = join(OUT, name);
    if (!existsSync(path) || readFileSync(path, "utf8") !== text) drift.push(name);
  }
  if (existsSync(OUT)) {
    for (const name of readdirSync(OUT)) {
      if (!outputs.has(name)) drift.push(`${name} (stale)`);
    }
  }
  if (!existsSync(SCHEMA_OUT) || readFileSync(SCHEMA_OUT, "utf8") !== schemaText) {
    drift.push("public schema copy");
  }
  if (drift.length > 0) {
    console.error(
      `FAIL: ${drift.length} exported contract file(s) out of date: ${drift.slice(0, 8).join(", ")}` +
        "\nFix: node scripts/design-system/export-contract-spec.mjs",
    );
    process.exit(1);
  }
  console.log(`✓ ${outputs.size - 1} open contracts match their sources`);
} else {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  for (const [name, text] of outputs) writeFileSync(join(OUT, name), text);
  mkdirSync(dirname(SCHEMA_OUT), { recursive: true });
  writeFileSync(SCHEMA_OUT, schemaText);
  const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT })
    .toString()
    .trim();
  console.log(`Wrote ${outputs.size - 1} open contracts to public/contracts/v1 (source ${head})`);
}

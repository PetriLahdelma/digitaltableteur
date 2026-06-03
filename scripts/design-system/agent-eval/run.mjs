#!/usr/bin/env node
/** Golden checks for agent-facing DS artifacts. */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const manifestPath = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");
const schemaPath = join(ROOT, "scripts/design-system/agent-manifest.schema.json");
const zodPath = join(ROOT, "nextjs-app/shared/foundations/dist/component-catalog.zod.ts");

let failed = 0;

if (!existsSync(manifestPath)) {
  console.error("FAIL: agent-manifest.json missing — run npm run build:tokens");
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf8")));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!validate(manifest)) {
  console.error("FAIL: agent-manifest schema", validate.errors);
  failed += 1;
} else {
  console.log("✓ agent-manifest validates against schema");
}

if (!existsSync(zodPath)) {
  console.error("FAIL: component-catalog.zod.ts missing — run npm run build:zod-catalog");
  failed += 1;
} else {
  console.log("✓ component-catalog.zod.ts present");
}

const betaPlus = manifest.components?.filter(
  (c) => c.contract?.status === "beta" || c.contract?.status === "stable",
).length ?? 0;
if (betaPlus < 25) {
  console.error(`FAIL: expected >=25 beta/stable components, got ${betaPlus}`);
  failed += 1;
} else {
  console.log(`✓ ${betaPlus} beta/stable components in manifest`);
}

const usage = manifest.usageCoverage;
if (!usage || typeof usage.withAnyUsage !== "number") {
  console.error("FAIL: usageCoverage block missing — regenerate manifest");
  failed += 1;
} else if (usage.withAnyUsage < 40) {
  console.error(
    `FAIL: expected >=40 cataloged components with import evidence, got ${usage.withAnyUsage}`,
  );
  failed += 1;
} else {
  console.log(
    `✓ usage evidence: ${usage.withAnyUsage}/${usage.catalogedComponents} cataloged, ${usage.withProductionUsage} with production usage`,
  );
}

if (!manifest.components?.every((c) => c.usage?.publicImport)) {
  console.error("FAIL: every manifest component must include usage.publicImport");
  failed += 1;
} else {
  console.log("✓ per-component usage blocks present");
}

const withAgentBlocks =
  manifest.components?.filter((c) => c.agent?.preferredImport).length ?? 0;
if (withAgentBlocks < 100) {
  console.error(
    `FAIL: expected >=100 components with agent blocks, got ${withAgentBlocks}`,
  );
  failed += 1;
} else {
  console.log(`✓ ${withAgentBlocks} components with agent blocks`);
}

const buttonEntry = manifest.components?.find((c) => c.name === "Button");
if (!buttonEntry?.agent?.variants?.variant?.values?.length) {
  console.error("FAIL: Button agent block must include variant axis from TypeScript");
  failed += 1;
} else {
  console.log("✓ Button agent variants extracted from source");
}

process.exit(failed ? 1 : 0);

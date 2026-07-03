#!/usr/bin/env node
/**
 * CI gate: beta/stable contracts must carry props + v2 semantic fields synced from agent blocks.
 *
 *   npm run check:contract-props
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  diffSemanticFields,
  expectedSemanticFields,
} from "./contract-semantics-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const AGENT_BLOCKS_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

if (!existsSync(AGENT_BLOCKS_PATH)) {
  console.error("FAIL: run npm run build:agent-blocks first");
  process.exit(1);
}

const agentBlocks =
  JSON.parse(readFileSync(AGENT_BLOCKS_PATH, "utf8")).components ?? {};

const failures = [];

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (contract.status !== "beta" && contract.status !== "stable") continue;

    if ((contract.schemaVersion ?? 1) < 2) {
      failures.push({
        name,
        kind: "schema-version",
        detail: "beta/stable requires schemaVersion: 2",
      });
      continue;
    }

    const agent = agentBlocks[name];
    const expectedProps = agent?.props ?? {};
    const expectedKeys = Object.keys(expectedProps);
    const actualProps = contract.props ?? {};

    if (expectedKeys.length === 0) {
      if (!("props" in contract)) {
        failures.push({
          name,
          kind: "missing-props-key",
          detail: "beta/stable requires props object (may be {})",
        });
      }
    } else {
      const missing = expectedKeys.filter((k) => !(k in actualProps));
      const stale = Object.keys(actualProps).filter((k) => !(k in expectedProps));

      if (missing.length) {
        failures.push({
          name,
          kind: "props-drift",
          detail: `missing keys: ${missing.join(", ")} — run npm run sync:contract-props -- --write`,
        });
      }
      if (stale.length) {
        failures.push({
          name,
          kind: "props-stale",
          detail: `stale keys: ${stale.join(", ")} — run npm run sync:contract-props -- --write`,
        });
      }
    }

    // Doc-adopted contracts (the Astryx ratchet predicate: usage authored) own
    // their semantic fields: composesWith / prefersOver / forbiddenUse are
    // curated content rendered by the docs frame, not derived co-usage data.
    // Derivation drift only gates contracts that never adopted doc fields.
    if (!contract.usage?.description) {
      for (const issue of diffSemanticFields(
        contract,
        expectedSemanticFields(agent),
      )) {
        failures.push({ name, ...issue });
      }
    }
  }
}

if (!failures.length) {
  console.log(
    "✓ Beta/stable contract props and semantic fields match agent blocks",
  );
  process.exit(0);
}

console.error(`check-contract-props: ${failures.length} issue(s)\n`);
for (const f of failures) {
  console.error(`  ✗ ${f.name}: ${f.kind} — ${f.detail}`);
}
process.exit(1);

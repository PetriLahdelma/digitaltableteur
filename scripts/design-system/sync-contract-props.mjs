#!/usr/bin/env node
/**
 * Sync contract.props (+ optional graph fields) from component-agent-blocks.json.
 *
 *   npm run sync:contract-props
 *   npm run sync:contract-props -- --write
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;

function sanitizeComponentNames(names) {
  return [...new Set((names ?? []).filter((n) => COMPONENT_NAME.test(n)))];
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const writeMode = process.argv.includes("--write");
const AGENT_BLOCKS_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

if (!existsSync(AGENT_BLOCKS_PATH)) {
  console.error("Run npm run build:agent-blocks first");
  process.exit(1);
}

const agentBlocks =
  JSON.parse(readFileSync(AGENT_BLOCKS_PATH, "utf8")).components ?? {};

let wouldUpdate = 0;
let updated = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;

    const agent = agentBlocks[name];
    if (!agent) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    const nextProps = agent.props ?? {};
    const nextComposes = sanitizeComponentNames(agent.composesWith);
    const nextPrefers = sanitizeComponentNames(agent.prefersOver);

    const shouldSyncProps =
      contract.status === "beta" ||
      contract.status === "stable" ||
      Object.keys(nextProps).length > 0;

    if (!shouldSyncProps) continue;

    const hasPropsKey = Object.prototype.hasOwnProperty.call(contract, "props");
    const sameProps =
      hasPropsKey &&
      JSON.stringify(contract.props ?? {}) === JSON.stringify(nextProps);
    const sameComposes =
      JSON.stringify(contract.composesWith ?? []) ===
      JSON.stringify(nextComposes);
    const samePrefers =
      JSON.stringify(contract.prefersOver ?? []) === JSON.stringify(nextPrefers);

    if (sameProps && sameComposes && samePrefers) continue;

    wouldUpdate += 1;
    if (!writeMode) {
      console.log(`  would sync ${name}`);
      continue;
    }

    contract.props = nextProps;
    if (nextComposes.length) contract.composesWith = nextComposes;
    else delete contract.composesWith;
    if (nextPrefers.length) contract.prefersOver = nextPrefers;
    else delete contract.prefersOver;

    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    updated += 1;
  }
}

if (writeMode) {
  console.log(`sync-contract-props: updated ${updated} contracts`);
} else {
  console.log(`sync-contract-props: ${wouldUpdate} contracts would update`);
}

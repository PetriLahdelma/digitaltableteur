#!/usr/bin/env node
/**
 * Local agentic design system audit — no GitHub CI required.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const steps = [
  { name: "build:tokens", cmd: "npm", args: ["run", "build:tokens"] },
  { name: "agent:eval", cmd: "npm", args: ["run", "agent:eval"] },
  { name: "lint:dt-usage", cmd: "npm", args: ["run", "lint:dt-usage"] },
  {
    name: "contract-drift",
    cmd: "npm",
    args: ["run", "check:contract-drift", "--", "--strict"],
  },
];

const manifestPath = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/agent-manifest.json",
);
const figmaPhasesDir = join(
  ROOT,
  "nextjs-app/shared/foundations/figma/phases",
);

console.log("# Agentic DS audit (local)\n");

let failed = 0;

for (const step of steps) {
  process.stdout.write(`→ ${step.name}… `);
  const result = spawnSync(step.cmd, step.args, {
    cwd: ROOT,
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.log("FAIL");
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    failed += 1;
  } else {
    console.log("OK");
  }
}

console.log("\n## Snapshot\n");

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const usage = manifest.usageCoverage ?? {};
  console.log(
    `- Manifest: ${manifest.components?.length ?? 0} components, usage ${usage.withAnyUsage ?? "?"}/${usage.catalogedComponents ?? "?"} with import evidence`,
  );
  console.log(
    `- Relationship graph: ${manifest.relationshipGraph?.nodesWithComposesWith ?? 0} nodes with composesWith`,
  );
} else {
  console.log("- Manifest: missing (build:tokens failed?)");
  failed += 1;
}

const figmaPhaseCount = existsSync(figmaPhasesDir)
  ? readdirSync(figmaPhasesDir).filter((f) => f.endsWith(".js")).length
  : 0;
console.log(
  `- Figma variable phases (local payloads): ${figmaPhaseCount} script(s) — apply via MCP per docs/FIGMA_DESIGN_SYSTEM_SYNC.md`,
);
console.log("\nPlaybook: docs/AGENTIC_DS_AUDIT_PLAYBOOK.md\n");

process.exit(failed ? 1 : 0);

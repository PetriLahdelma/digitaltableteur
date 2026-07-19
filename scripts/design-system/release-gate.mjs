#!/usr/bin/env node
/**
 * Unified design-system release gate — contract, MCP evals, bundle budgets,
 * and optional visual/a11y suites.
 *
 * Fast (CI default): typecheck, lint, generated artifacts, agent:eval,
 * contract drift, bundle budgets, validate:components, catalog ≥85%, build.
 *
 * Full (--full): adds test:ci, test:visual:ci (Storybook), test:a11y:pages (Playwright).
 *
 * Usage:
 *   npm run release:gate
 *   npm run release:gate -- --full
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const full = process.argv.includes("--full");

const steps = [
  { name: "typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { name: "lint", cmd: "npm", args: ["run", "lint"] },
  { name: "lint:css", cmd: "npm", args: ["run", "lint:css"] },
  {
    name: "audit:rhythm:check",
    cmd: "npm",
    args: ["run", "audit:rhythm:check"],
  },
  { name: "validate:translations", cmd: "npm", args: ["run", "validate:translations"] },
  { name: "check:generated", cmd: "npm", args: ["run", "check:generated"] },
  { name: "agent:eval (MCP + golden sets)", cmd: "npm", args: ["run", "agent:eval"] },
  {
    name: "contract-drift",
    cmd: "npm",
    args: ["run", "check:contract-drift", "--", "--strict"],
  },
  { name: "bundle-budgets", cmd: "npm", args: ["run", "check:bundle-budgets"] },
  { name: "validate:components", cmd: "npm", args: ["run", "validate:components"] },
  { name: "check:consumers", cmd: "npm", args: ["run", "check:consumers"] },
  { name: "check:tokens", cmd: "npm", args: ["run", "check:tokens"] },
  {
    name: "catalog-coverage",
    cmd: "node",
    args: ["scripts/design-system/check-catalog-coverage-gate.mjs"],
  },
  { name: "build", cmd: "npm", args: ["run", "build"] },
];

if (full) {
  steps.push(
    { name: "test:ci", cmd: "npm", args: ["run", "test:ci"] },
    { name: "test:visual:ci", cmd: "npm", args: ["run", "test:visual:ci"] },
    { name: "test:a11y:pages", cmd: "npm", args: ["run", "test:a11y:pages"] },
  );
}

console.log(`# Release gate (${full ? "full" : "fast"})\n`);

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

console.log(
  full
    ? "\nFull gate complete (visual + a11y pages included)."
    : "\nFast gate complete. Run with --full for visual + Playwright a11y pages.",
);
process.exit(failed ? 1 : 0);

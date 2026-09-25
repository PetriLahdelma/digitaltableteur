#!/usr/bin/env tsx
/**
 * validate:agent-usage — check design-system JSX usage against contract rules.
 *
 * Extracts every @dt component usage from TSX files and checks its props
 * against the machine-checkable rules in the agent manifest
 * (propRelationships, forbiddenCombos, deprecated props). The same engine
 * backs the validate_component_usage MCP tool, so agents and CI agree.
 *
 *   npm run validate:agent-usage                 # files changed vs origin/main
 *   npm run validate:agent-usage -- --all        # every app + shared TSX file
 *   npm run validate:agent-usage -- --files a.tsx b.tsx
 *   npm run validate:agent-usage -- --strict     # warnings fail too
 *   npm run validate:agent-usage -- --update-ratchet
 *
 * Always also runs two integrity checks:
 * - every prop a forbiddenCombos rule names exists on the component, so a
 *   typo cannot silently disable a rule;
 * - rule coverage (components with at least one checkable rule) may only go
 *   up, tracked in agent-usage-rules.ratchet.json.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import {
  checkUsage,
  hasCheckableRules,
  type ContractFinding,
  type ForbiddenCombo,
} from "../../nextjs-app/shared/lib/design-system-mcp/contract-rules";
import { extractJsxUsages } from "../../nextjs-app/shared/lib/design-system-mcp/jsx-usage";
import type { AgentManifest } from "../../nextjs-app/shared/lib/design-system-mcp/types";

const ROOT = process.cwd();
const MANIFEST = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");
const RATCHET = join(ROOT, "scripts/design-system/agent-usage-rules.ratchet.json");
const SCAN_ROOTS = ["app/", "nextjs-app/"];
const EXCLUDE = /\.(stories|test|spec)\.tsx$|\/__[a-z-]+__\//;

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const updateRatchet = args.includes("--update-ratchet");

function git(...gitArgs: string[]): string {
  return execFileSync("git", gitArgs, { cwd: ROOT, encoding: "utf8" }).trim();
}

function isScannable(file: string): boolean {
  return (
    file.endsWith(".tsx") &&
    SCAN_ROOTS.some((root) => file.startsWith(root)) &&
    !EXCLUDE.test(file) &&
    existsSync(join(ROOT, file))
  );
}

function selectFiles(): string[] {
  const filesFlag = args.indexOf("--files");
  if (filesFlag !== -1) {
    return args
      .slice(filesFlag + 1)
      .filter((arg) => !arg.startsWith("--"))
      .map((file) => relative(ROOT, join(ROOT, file)));
  }
  if (args.includes("--all")) {
    return git("ls-files", "*.tsx").split("\n").filter(isScannable);
  }
  let base = "";
  try {
    base = git("merge-base", "HEAD", "origin/main");
  } catch {
    base = "HEAD";
  }
  const changed = new Set([
    ...git("diff", "--name-only", base).split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").split("\n"),
  ]);
  return [...changed].filter(Boolean).filter(isScannable);
}

/** Props a rule may name that are not declared on the component's own props. */
function isPassthroughProp(name: string): boolean {
  return name === "children" || /^(aria|data)-/.test(name) || name === "className";
}

function ruleIntegrityErrors(manifest: AgentManifest): string[] {
  const errors: string[] = [];
  for (const entry of manifest.components ?? []) {
    const declared = new Set(Object.keys(entry.agent?.props ?? {}));
    for (const combo of (entry.agent?.forbiddenCombos ?? []) as ForbiddenCombo[]) {
      const named = [
        ...Object.keys(combo.when),
        ...(combo.forbid ?? []),
        ...(combo.requireAnyOf ?? []),
        ...(combo.requireAllOf ?? []),
      ];
      for (const prop of named) {
        if (!declared.has(prop) && !isPassthroughProp(prop)) {
          errors.push(`${entry.name}: forbiddenCombos "${combo.id}" names unknown prop "${prop}"`);
        }
      }
    }
  }
  return errors;
}

function main() {
  if (!existsSync(MANIFEST)) {
    console.error("agent-manifest.json missing. Run npm run build:tokens.");
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as AgentManifest;
  const byName = new Map((manifest.components ?? []).map((entry) => [entry.name, entry]));
  const known = new Set(byName.keys());
  let failed = false;

  const integrity = ruleIntegrityErrors(manifest);
  if (integrity.length) {
    failed = true;
    console.error(`✗ ${integrity.length} contract rule(s) reference unknown props:`);
    for (const error of integrity) console.error(`  - ${error}`);
  }

  // Coverage ratchet: components with at least one machine-checkable rule.
  const covered = [...byName.values()].filter((entry) => hasCheckableRules(entry.agent)).length;
  const ratchet = existsSync(RATCHET)
    ? (JSON.parse(readFileSync(RATCHET, "utf8")) as { minComponentsWithRules: number })
    : { minComponentsWithRules: 0 };
  console.log(
    `Rule coverage: ${covered}/${byName.size} components have machine-checkable rules (ratchet floor ${ratchet.minComponentsWithRules}).`,
  );
  if (covered < ratchet.minComponentsWithRules) {
    failed = true;
    console.error(
      `✗ Rule coverage dropped below the ratchet floor (${covered} < ${ratchet.minComponentsWithRules}).`,
    );
  } else if (updateRatchet && covered > ratchet.minComponentsWithRules) {
    writeFileSync(RATCHET, `${JSON.stringify({ minComponentsWithRules: covered }, null, 2)}\n`);
    console.log(`✓ Ratchet raised to ${covered}.`);
  }

  const files = selectFiles();
  const findings: Array<ContractFinding & { file: string }> = [];
  let usageCount = 0;
  for (const file of files) {
    const source = readFileSync(join(ROOT, file), "utf8");
    for (const usage of extractJsxUsages(source, known, file)) {
      usageCount += 1;
      for (const finding of checkUsage(usage, byName.get(usage.component)?.agent ?? {})) {
        findings.push({ ...finding, file });
      }
    }
  }

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");
  for (const finding of [...errors, ...warnings]) {
    const mark = finding.severity === "error" ? "✗" : "!";
    console.log(
      `${mark} ${finding.file}:${finding.line ?? "?"} <${finding.component}> [${finding.rule}] ${finding.message}`,
    );
  }
  console.log(
    `Checked ${usageCount} component usage(s) in ${files.length} file(s): ${errors.length} error(s), ${warnings.length} warning(s).`,
  );

  if (errors.length || (strict && warnings.length)) failed = true;
  process.exit(failed ? 1 : 0);
}

main();

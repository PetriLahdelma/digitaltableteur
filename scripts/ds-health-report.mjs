#!/usr/bin/env node
/**
 * Aggregate design-system governance signals into one report (CI-safe, no servers).
 *
 *   npm run ds:health
 *
 * Outputs:
 *   public/ds-health/report.json
 *   public/ds-health/summary.md
 */
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "ds-health");
const MIGRATION_REPORT = join(ROOT, "public", "visual-diff", "migration-matrix-report.json");
const AGENT_EXPERIENCE_REPORT = join(OUT_DIR, "agent-experience.json");

const SHADCN_IMPORT = /from\s+["']@\/components\/ui\//;

const SCAN_FOR_SHADCN = [
  "app",
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

const SKIP = [".test.", ".stories.", "/components/ui/", "/ui/index.ts"];

function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full, out);
      continue;
    }
    if (!/\.(tsx|jsx)$/.test(entry.name)) continue;
    const rel = relative(ROOT, full).replace(/\\/g, "/");
    if (SKIP.some((s) => rel.includes(s))) continue;
    out.push(rel);
  }
}

function countShadcnImports() {
  const byArea = {};
  for (const area of SCAN_FOR_SHADCN) {
    const files = [];
    walk(join(ROOT, area), files);
    const hits = [];
    for (const rel of files) {
      const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (SHADCN_IMPORT.test(lines[i])) {
          hits.push({ file: rel, line: i + 1 });
        }
      }
    }
    byArea[area] = hits;
  }
  return byArea;
}

function runScript(name, args = []) {
  const result = spawnSync("npm", ["run", name, "--", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  return {
    name,
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: (result.stdout || "").trim().slice(-2000),
    stderr: (result.stderr || "").trim().slice(-2000),
  };
}

function loadMigrationMatrix() {
  if (!existsSync(MIGRATION_REPORT)) {
    return {
      present: false,
      hint: "Run: npm run test:migration:visual (Storybook :6010 + dev :3001)",
    };
  }
  try {
    const data = JSON.parse(readFileSync(MIGRATION_REPORT, "utf8"));
    return {
      present: true,
      generatedAt: data.generatedAt,
      passed: data.passed,
      total: data.total,
      failed: data.failed,
      failures: data.failures ?? [],
    };
  } catch (error) {
    return { present: false, error: String(error) };
  }
}

function loadAgentExperience() {
  if (!existsSync(AGENT_EXPERIENCE_REPORT)) return { present: false };
  try {
    const report = JSON.parse(readFileSync(AGENT_EXPERIENCE_REPORT, "utf8"));
    return {
      present: true,
      ok: report.ok,
      generatedAt: report.generatedAt,
      propDocumentation: report.dimensions?.contractClarity?.propDocumentation,
      completeContractEvidence:
        report.dimensions?.contractClarity?.completeContractEvidence,
      machineRelationshipComponents:
        report.dimensions?.recoverability?.machineRelationshipComponents,
      promptability: report.dimensions?.promptability,
      violations: report.violations ?? [],
    };
  } catch (error) {
    return { present: false, error: String(error) };
  }
}

function migrationBoardStatus() {
  return {
    buttonSurfaces: "approved",
    buttonContexts: "migrated",
    contactFlow: "migrated",
    formPrimitives: "migrated",
    dialogs: "blocked — @dt/Modal needs board sign-off",
  };
}

function buildSummary(report) {
  const lines = [
    "# Design system health",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Governance checks",
    "",
  ];

  for (const check of report.checks) {
    lines.push(`- **${check.name}**: ${check.ok ? "pass" : "fail"} (exit ${check.status})`);
  }

  lines.push("", "## shadcn import inventory (informational)", "");
  let total = 0;
  for (const [area, hits] of Object.entries(report.shadcnByArea)) {
    total += hits.length;
    lines.push(`- \`${area}\`: ${hits.length} import line(s)`);
  }
  lines.push(`- **Total:** ${total} (see report.json for paths)`);

  lines.push("", "## Migration boards", "");
  for (const [board, status] of Object.entries(report.migrationBoards)) {
    lines.push(`- **${board}**: ${status}`);
  }

  if (report.migrationMatrix.present) {
    lines.push(
      "",
      "## Last visual matrix",
      "",
      `- ${report.migrationMatrix.passed}/${report.migrationMatrix.total} passed`,
      `- Report time: ${report.migrationMatrix.generatedAt}`,
    );
    if (report.migrationMatrix.failed > 0) {
      lines.push(`- **Failures:** ${report.migrationMatrix.failed}`);
    }
  } else {
    lines.push("", "## Last visual matrix", "", `- ${report.migrationMatrix.hint ?? "Not run yet"}`);
  }

  if (report.agentExperience.present) {
    const ax = report.agentExperience;
    lines.push(
      "",
      "## Agent Experience",
      "",
      `- **Ratchet:** ${ax.ok ? "pass" : "fail"}`,
      `- **Prop documentation:** ${ax.propDocumentation.numerator}/${ax.propDocumentation.denominator} (${(ax.propDocumentation.rate * 100).toFixed(1)}%)`,
      `- **Complete contract evidence:** ${ax.completeContractEvidence.numerator}/${ax.completeContractEvidence.denominator}`,
      `- **Machine-readable prop relationships:** ${ax.machineRelationshipComponents} component(s)`,
      `- **Golden intent retrieval:** ${ax.promptability.passed}/${ax.promptability.total}`,
    );
  }

  lines.push(
    "",
    "## Before merging DS changes",
    "",
    "1. Approve green **Proposed** row on the relevant Storybook board",
    "2. `npm run test:migration:visual` when touching migrated surfaces",
    "3. `npm run lint:dt-responsive-visibility`",
    "",
    "Full strategy: [docs/DS_AUTOMATION_STRATEGY.md](../docs/DS_AUTOMATION_STRATEGY.md)",
  );

  return lines.join("\n");
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const checks = [
    runScript("audit:agent-experience"),
    runScript("lint:dt-usage", ["--strict"]),
    runScript("lint:dt-responsive-visibility", ["--strict"]),
  ];

  const shadcnByArea = countShadcnImports();
  const migrationMatrix = loadMigrationMatrix();
  const agentExperience = loadAgentExperience();

  const report = {
    generatedAt: new Date().toISOString(),
    checks,
    shadcnByArea,
    shadcnTotal: Object.values(shadcnByArea).reduce((n, h) => n + h.length, 0),
    migrationBoards: migrationBoardStatus(),
    migrationMatrix,
    agentExperience,
    docs: {
      strategy: "docs/DS_AUTOMATION_STRATEGY.md",
      migration: "docs/SHADCN_TO_DT_MIGRATION.md",
      storybookHub: "Design system / Migration boards / Review hub",
    },
  };

  const allOk =
    checks.every((c) => c.ok) &&
    (!migrationMatrix.present || migrationMatrix.failed === 0);

  report.ok = allOk;

  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(OUT_DIR, "summary.md"), buildSummary(report));

  console.log(`ds:health — ${allOk ? "PASS" : "FAIL"}`);
  console.log(`  report: public/ds-health/report.json`);
  console.log(`  summary: public/ds-health/summary.md`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} ${c.name}`);
  }
  if (migrationMatrix.present) {
    console.log(
      `  migration matrix: ${migrationMatrix.passed}/${migrationMatrix.total}`,
    );
  }

  process.exit(allOk ? 0 : 1);
}

main();

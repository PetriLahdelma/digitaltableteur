#!/usr/bin/env node
/* eslint-disable no-console */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const WORKSPACES = [
  { name: "root", cwd: ROOT },
  { name: "sanity-studio", cwd: join(ROOT, "digitaltableteur-blog") },
];

const runAudit = (cwd) => {
  const result = spawnSync("npm", ["audit", "--json"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (!result.stdout.trim()) {
    return { vulnerabilities: {}, metadata: { vulnerabilities: {} } };
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse npm audit JSON in ${relative(ROOT, cwd) || "."}: ${error.message}`,
    );
  }
};

const readPackage = (cwd) => JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));

const fixLabel = (fixAvailable) => {
  if (fixAvailable === true) return "safe fix available";
  if (fixAvailable && typeof fixAvailable === "object") {
    return fixAvailable.isSemVerMajor ? "major fix available" : "fix available";
  }
  return "no automatic fix";
};

const bucketFor = (name, vulnerability, pkg) => {
  if (pkg.dependencies?.[name]) return "production-direct";
  if (pkg.devDependencies?.[name]) return "development-direct";
  return vulnerability.isDirect ? "direct-unknown" : "transitive";
};

const renderRows = (rows) => {
  if (rows.length === 0) return "- None";

  return rows
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
      return (
        (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) ||
        a.name.localeCompare(b.name)
      );
    })
    .map(
      (row) =>
        `- ${row.name} (${row.severity}): ${row.range}; ${row.fix}; via ${row.via}`,
    )
    .join("\n");
};

console.log("# Dependency Audit Triage\n");
console.log(
  "Production-direct issues block merge when high/critical and reachable. Development-direct and transitive issues need owner review before force fixes.\n",
);

for (const workspace of WORKSPACES) {
  const pkg = readPackage(workspace.cwd);
  const audit = runAudit(workspace.cwd);
  const rows = Object.entries(audit.vulnerabilities ?? {}).map(([name, vulnerability]) => ({
    name,
    severity: vulnerability.severity,
    range: vulnerability.range ?? "n/a",
    via: (vulnerability.via ?? [])
      .map((entry) => (typeof entry === "string" ? entry : entry.name))
      .filter(Boolean)
      .join(", "),
    fix: fixLabel(vulnerability.fixAvailable),
    bucket: bucketFor(name, vulnerability, pkg),
  }));

  const location = relative(ROOT, workspace.cwd) || ".";
  console.log(`## ${workspace.name} (${location})\n`);
  for (const bucket of [
    "production-direct",
    "development-direct",
    "direct-unknown",
    "transitive",
  ]) {
    console.log(`### ${bucket}\n`);
    console.log(renderRows(rows.filter((row) => row.bucket === bucket)));
    console.log("");
  }
}

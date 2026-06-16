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

const majorOf = (version) => {
  const match = String(version ?? "").match(/\d+/);
  return match ? Number(match[0]) : Number.NaN;
};

const runNpmJson = (cwd, args) => {
  const result = spawnSync("npm", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (!result.stdout.trim()) return {};

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse npm ${args.join(" ")} JSON in ${relative(ROOT, cwd) || "."}: ${error.message}`,
    );
  }
};

const readPackage = (cwd) => JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));

const classifyPackage = (name, row, pkg) => {
  const currentMajor = majorOf(row.current);
  const wantedMajor = majorOf(row.wanted);
  const latestMajor = majorOf(row.latest);
  const dependencyType = pkg.dependencies?.[name]
    ? "production"
    : pkg.devDependencies?.[name]
      ? "development"
      : "unknown";

  if (Number.isFinite(latestMajor) && latestMajor > currentMajor) {
    return { bucket: "manual", dependencyType };
  }

  if (Number.isFinite(wantedMajor) && wantedMajor > currentMajor) {
    return { bucket: "manual", dependencyType };
  }

  return { bucket: "safe", dependencyType };
};

const renderRows = (rows) => {
  if (rows.length === 0) return "- None";

  return rows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (row) =>
        `- ${row.name} (${row.dependencyType}): ${row.current} -> wanted ${row.wanted}, latest ${row.latest}`,
    )
    .join("\n");
};

const reports = WORKSPACES.map((workspace) => {
  const pkg = readPackage(workspace.cwd);
  const outdated = runNpmJson(workspace.cwd, ["outdated", "--json", "--long"]);
  const rows = Object.entries(outdated).map(([name, row]) => ({
    name,
    current: row.current,
    wanted: row.wanted,
    latest: row.latest,
    ...classifyPackage(name, row, pkg),
  }));

  return {
    workspace,
    safe: rows.filter((row) => row.bucket === "safe"),
    manual: rows.filter((row) => row.bucket === "manual"),
  };
});

console.log("# Dependency Risk Report\n");
console.log("Safe means minor/patch within the current major. Manual means a major/version-floor review is required.\n");

for (const report of reports) {
  const location = relative(ROOT, report.workspace.cwd) || ".";
  console.log(`## ${report.workspace.name} (${location})\n`);
  console.log("### Safe Minor/Patch\n");
  console.log(renderRows(report.safe));
  console.log("\n### Manual Review\n");
  console.log(renderRows(report.manual));
  console.log("");
}

#!/usr/bin/env node
/**
 * Compare current Stylelint warnings against a fingerprinted baseline.
 *
 * This deliberately tracks warning identity instead of only a warning count:
 * a new warning fails even if an old warning was fixed elsewhere.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE_PATH = join(
  ROOT,
  "scripts/design-system/stylelint-baseline.json",
);
const update = process.argv.includes("--update");
const stylelintBin = join(ROOT, "node_modules/.bin/stylelint");
const stylelintArgs = [
  "**/*.css",
  "**/*.module.css",
  "--formatter",
  "json",
  "--allow-empty-input",
];

function normalizePath(source) {
  return relative(ROOT, source).replaceAll("\\", "/");
}

function warningId(warning) {
  return [
    warning.file,
    warning.line,
    warning.column,
    warning.rule,
    warning.text,
  ].join("::");
}

function flattenWarnings(results) {
  return results
    .flatMap((result) => {
      const file = normalizePath(result.source);
      return result.warnings.map((warning) => ({
        id: warningId({
          file,
          line: warning.line ?? 0,
          column: warning.column ?? 0,
          rule: warning.rule ?? "unknown",
          text: warning.text ?? "",
        }),
        file,
        line: warning.line ?? 0,
        column: warning.column ?? 0,
        rule: warning.rule ?? "unknown",
        severity: warning.severity ?? "warning",
        text: warning.text ?? "",
      }));
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function runStylelint() {
  if (!existsSync(stylelintBin)) {
    console.error("FAIL: stylelint binary not found. Run npm install first.");
    process.exit(1);
  }

  const result = spawnSync(stylelintBin, stylelintArgs, {
    cwd: ROOT,
    encoding: "utf8",
  });

  const stdout = result.stdout.trim();
  const stderr = result.stderr.trim();
  const output = stdout.startsWith("[")
    ? result.stdout
    : stderr.startsWith("[")
      ? result.stderr
      : result.stdout;

  if (!output) {
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    process.stdout.write(output);
    if (result.stderr) process.stderr.write(result.stderr);
    console.error("FAIL: could not parse Stylelint JSON output.");
    process.exit(1);
  }

  const fatalResults = parsed.filter(
    (item) =>
      (item.parseErrors?.length ?? 0) > 0 ||
      (item.invalidOptionWarnings?.length ?? 0) > 0 ||
      item.warnings.some((warning) => warning.severity === "error"),
  );

  if (fatalResults.length > 0) {
    console.error("FAIL: Stylelint reported errors.");
    for (const item of fatalResults.slice(0, 25)) {
      console.error(`  - ${normalizePath(item.source)}`);
      for (const error of item.parseErrors ?? []) {
        console.error(`    parse: ${error.text ?? JSON.stringify(error)}`);
      }
      for (const warning of item.invalidOptionWarnings ?? []) {
        console.error(`    config: ${warning.text ?? JSON.stringify(warning)}`);
      }
      for (const warning of item.warnings.filter(
        (warning) => warning.severity === "error",
      )) {
        console.error(
          `    ${warning.line ?? 0}:${warning.column ?? 0} ${warning.rule ?? "unknown"} ${warning.text ?? ""}`,
        );
      }
    }
    if (fatalResults.length > 25) {
      console.error(`  ... and ${fatalResults.length - 25} more`);
    }
    process.exit(result.status || 1);
  }

  return flattenWarnings(parsed);
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    console.error(
      "FAIL: missing Stylelint baseline. Run npm run lint:css:update.",
    );
    process.exit(1);
  }

  return JSON.parse(readFileSync(BASELINE_PATH, "utf8")).warnings ?? [];
}

function printWarnings(title, warnings) {
  if (warnings.length === 0) return;

  console.error(`\n${title} (${warnings.length}):`);
  for (const warning of warnings.slice(0, 25)) {
    console.error(
      `  - ${warning.file}:${warning.line}:${warning.column} ${warning.rule} ${warning.text}`,
    );
  }
  if (warnings.length > 25) {
    console.error(`  ... and ${warnings.length - 25} more`);
  }
}

const currentWarnings = runStylelint();

if (update) {
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        generatedBy: "npm run lint:css:update",
        warningCount: currentWarnings.length,
        warnings: currentWarnings,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `✓ Stylelint baseline updated (${currentWarnings.length} warnings)`,
  );
  process.exit(0);
}

const baselineWarnings = readBaseline();
const baselineById = new Map(
  baselineWarnings.map((warning) => [warning.id, warning]),
);
const currentById = new Map(currentWarnings.map((warning) => [warning.id, warning]));

const newWarnings = currentWarnings.filter(
  (warning) => !baselineById.has(warning.id),
);
const resolvedWarnings = baselineWarnings.filter(
  (warning) => !currentById.has(warning.id),
);

if (newWarnings.length > 0 || resolvedWarnings.length > 0) {
  printWarnings("New Stylelint warnings", newWarnings);
  printWarnings("Resolved baseline warnings", resolvedWarnings);
  console.error(
    "\nFAIL: Stylelint warning baseline changed. Fix new warnings or run npm run lint:css:update after intentional cleanup.",
  );
  process.exit(1);
}

console.log(
  `✓ Stylelint warnings match baseline (${currentWarnings.length} warnings)`,
);

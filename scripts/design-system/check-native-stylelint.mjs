#!/usr/bin/env node
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractNativeStyleTemplates,
  findLogicalCssContractErrors,
  lintLogicalCss,
  lintNativeCss,
  replaceNativeStyleTemplates,
} from "./logical-css-native-styles.mjs";
import { assignStylelintWarningIds } from "./stylelint-warning-baseline.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const NATIVE_ROOT = join(ROOT, "packages/web-components/src/native");
const BASELINE_PATH = join(
  ROOT,
  "scripts/design-system/native-stylelint-baseline.json",
);
const fix = process.argv.includes("--fix");
const update = process.argv.includes("--update");

function findTypeScriptFiles(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory()
        ? findTypeScriptFiles(path)
        : path.endsWith(".ts")
          ? [path]
          : [];
    })
    .sort();
}

function printWarnings(title, warnings) {
  if (warnings.length === 0) return;
  console.error(`\n${title} (${warnings.length}):`);
  for (const warning of warnings.slice(0, 50)) {
    console.error(
      `  - ${warning.file}:${warning.line}:${warning.column} ${warning.rule} ${warning.text}`,
    );
  }
  if (warnings.length > 50) {
    console.error(`  ... and ${warnings.length - 50} more`);
  }
}

const errors = [];
let warnings = [];
let templateCount = 0;
let fixedFileCount = 0;

for (const absoluteFile of findTypeScriptFiles(NATIVE_ROOT)) {
  const file = relative(ROOT, absoluteFile).replaceAll("\\", "/");
  const source = readFileSync(absoluteFile, "utf8");
  let sourceToLint = source;

  if (fix) {
    let templates;
    try {
      templates = extractNativeStyleTemplates(source, file);
    } catch (error) {
      errors.push({
        column: 0,
        file,
        line: 0,
        rule: "digitaltableteur/static-native-styles",
        severity: "error",
        text: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
    const replacements = [];
    for (const template of templates) {
      const result = await lintLogicalCss(template, { fix: true });
      replacements.push({ ...template, css: result.css });
    }
    sourceToLint = replaceNativeStyleTemplates(source, replacements);
    if (sourceToLint !== source) {
      writeFileSync(absoluteFile, sourceToLint);
      fixedFileCount += 1;
    }
  }

  let templates;
  try {
    templates = extractNativeStyleTemplates(sourceToLint, file);
  } catch (error) {
    errors.push({
      column: 0,
      file,
      line: 0,
      rule: "digitaltableteur/static-native-styles",
      severity: "error",
      text: error instanceof Error ? error.message : String(error),
    });
    continue;
  }
  templateCount += templates.length;
  for (const template of templates) {
    const result = await lintNativeCss(template);
    for (const warning of result.warnings) {
      const normalized = {
        column: warning.column ?? 0,
        file,
        line: template.lineOffset + (warning.line ?? 1),
        rule: warning.rule ?? "stylelint/unknown",
        severity: warning.severity ?? "warning",
        text: warning.text ?? "Stylelint violation",
      };
      (normalized.severity === "error" ? errors : warnings).push(normalized);
    }
    for (const error of findLogicalCssContractErrors(template.css, file)) {
      errors.push({
        ...error,
        file,
        line: template.lineOffset + error.line,
        severity: "error",
      });
    }
  }
}

warnings = assignStylelintWarningIds(warnings);

if (errors.length > 0) {
  printWarnings("Native logical CSS errors", errors);
  console.error("\nFAIL: native web-component styles must use logical CSS.");
  process.exit(1);
}

if (update) {
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        generatedBy: "npm run lint:css:update",
        templateCount,
        warningCount: warnings.length,
        warnings,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `✓ Native Stylelint baseline updated (${warnings.length} Rhythmguard warnings)`,
  );
} else {
  if (!existsSync(BASELINE_PATH)) {
    console.error(
      "FAIL: missing native Stylelint baseline. Run npm run lint:css:update.",
    );
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  if (baseline.templateCount !== templateCount) {
    console.error(
      `FAIL: native style template count changed (${baseline.templateCount} -> ${templateCount}). Inspect the new or missing style source, then update intentionally.`,
    );
    process.exit(1);
  }
  const baselineWarnings = baseline.warnings ?? [];
  const baselineIds = new Set(baselineWarnings.map((warning) => warning.id));
  const warningIds = new Set(warnings.map((warning) => warning.id));
  const newWarnings = warnings.filter(
    (warning) => !baselineIds.has(warning.id),
  );
  const resolvedWarnings = baselineWarnings.filter(
    (warning) => !warningIds.has(warning.id),
  );

  if (newWarnings.length > 0 || resolvedWarnings.length > 0) {
    printWarnings("New native Rhythmguard warnings", newWarnings);
    printWarnings("Resolved native Rhythmguard warnings", resolvedWarnings);
    console.error(
      "\nFAIL: native Stylelint baseline changed. Fix new warnings or update the baseline after intentional cleanup.",
    );
    process.exit(1);
  }
  console.log(
    `✓ Native styles verified (${templateCount} templates, ${warnings.length} baseline Rhythmguard warnings)`,
  );
}

if (fix) {
  console.log(
    `✓ Native logical CSS autofixed (${fixedFileCount} files changed)`,
  );
}

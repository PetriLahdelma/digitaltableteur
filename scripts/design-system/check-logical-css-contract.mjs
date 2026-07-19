#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import stylelint from "stylelint";
import {
  findLogicalCssContractErrors,
  logicalCssRules,
} from "./logical-css-native-styles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const projectConfig = JSON.parse(
  readFileSync(resolve(ROOT, ".stylelintrc.json"), "utf8"),
);
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", "*.css"],
  { cwd: ROOT, encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
const audit = await stylelint.lint({
  cwd: ROOT,
  files,
  config: {
    ignoreFiles: projectConfig.ignoreFiles,
    plugins: ["stylelint-plugin-logical-css"],
    rules: logicalCssRules,
  },
  fix: false,
});
const errors = audit.results.flatMap((entry) => {
  const file = relative(ROOT, entry.source).replaceAll("\\", "/");
  return findLogicalCssContractErrors(
    readFileSync(entry.source, "utf8"),
    file,
  ).map((error) => ({ ...error, file }));
});

if (errors.length > 0) {
  console.error(`FAIL: logical CSS compatibility contract (${errors.length})`);
  for (const error of errors.slice(0, 50)) {
    console.error(
      `  - ${error.file}:${error.line}:${error.column} ${error.rule} ${error.text}`,
    );
  }
  process.exit(1);
}

console.log(
  `✓ Logical CSS compatibility verified (${audit.results.length} files)`,
);

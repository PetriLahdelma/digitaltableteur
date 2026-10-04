#!/usr/bin/env node
/**
 * contract-check: conformance checker for Design System Contract 1.0.
 *
 *   contract-check [paths...] [--level 1|2|3] [--max-age-days N]
 *                  [--root dir] [--git-freshness] [--strict-extensions]
 *                  [--test-root dir] [--json] [--quiet]
 *   contract-check rules <contract.json> '<props as JSON>'
 *
 * Exit codes: 0 the system meets --level (default 1); 1 it does not;
 * 2 usage error.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEFAULT_MAX_AGE_DAYS,
  LEVELS,
  SPEC_VERSION,
  checkSystem,
  evaluateRules,
  findContractFiles,
} from "./index.mjs";

const HELP = `contract-check (Design System Contract ${SPEC_VERSION})

Usage:
  contract-check [paths...] [options]     check *.contract.json files
  contract-check rules <contract> <props> evaluate usage rules for one usage

Options:
  --level <1|2|3>       required system level (default 1)
  --max-age-days <n>    evidence and review freshness window (default ${DEFAULT_MAX_AGE_DAYS})
  --root <dir>          base for relative evidence paths (default: each contract's directory)
  --git-freshness       also fail evidence older than a change to the contract's source paths
  --suffix <s>          contract file suffix (default .contract.json)
  --test-root <dir>     base for test paths in x-temporal / x-consequence claims (default: cwd)
  --strict-extensions   also fail when a known extension (x-temporal, x-consequence) has findings
  --json                machine-readable report on stdout
  --quiet               only print the summary

Levels:
  1 Described   the contract validates against the schema
  2 Checkable   governance and accessibility criteria are structured data
  3 Evidenced   every automated claim has a fresh, passing, resolvable record

Spec: https://www.npmjs.com/package/@digitaltableteur/contract-spec`;

function fail(message) {
  process.stderr.write(`contract-check: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const options = {
    paths: [],
    level: 1,
    json: false,
    quiet: false,
    gitFreshness: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = () => {
      const item = argv[++index];
      if (item === undefined) fail(`${value} needs a value`);
      return item;
    };
    if (value === "--help" || value === "-h") {
      process.stdout.write(`${HELP}\n`);
      process.exit(0);
    } else if (value === "--version") {
      const { version } = JSON.parse(
        readFileSync(new URL("../package.json", import.meta.url), "utf8"),
      );
      process.stdout.write(
        `contract-check ${version} (Design System Contract ${SPEC_VERSION})\n`,
      );
      process.exit(0);
    } else if (value === "--level") options.level = Number(next());
    else if (value === "--max-age-days") options.maxAgeDays = Number(next());
    else if (value === "--root") options.root = resolve(next());
    else if (value === "--suffix") options.suffix = next();
    else if (value === "--git-freshness") options.gitFreshness = true;
    else if (value === "--strict-extensions") options.strictExtensions = true;
    else if (value === "--test-root") options.testRoot = resolve(next());
    else if (value === "--json") options.json = true;
    else if (value === "--quiet") options.quiet = true;
    else if (value.startsWith("--")) fail(`unknown option ${value}`);
    else options.paths.push(value);
  }
  if (![1, 2, 3].includes(options.level)) fail("--level must be 1, 2 or 3");
  if (options.maxAgeDays !== undefined && !(options.maxAgeDays > 0)) {
    fail("--max-age-days must be a positive number");
  }
  return options;
}

function runRules(argv) {
  const [contractPath, propsJson] = argv;
  if (!contractPath || !propsJson)
    fail("usage: contract-check rules <contract.json> '<props JSON>'");
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  const violations = evaluateRules(contract, JSON.parse(propsJson));
  process.stdout.write(
    `${JSON.stringify({ component: contract.name, violations }, null, 2)}\n`,
  );
  process.exit(violations.some(({ severity }) => severity === "error") ? 1 : 0);
}

function levelName(level) {
  return LEVELS.find((entry) => entry.level === level)?.name ?? "None";
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === "rules") return runRules(argv.slice(1));
  const options = parseArgs(argv);
  const paths = options.paths.length > 0 ? options.paths : ["."];
  let files;
  try {
    files = findContractFiles(
      paths.map((path) => resolve(path)),
      { suffix: options.suffix },
    );
  } catch (error) {
    fail(error.message);
  }
  if (files.length === 0)
    fail(
      `no *${options.suffix ?? ".contract.json"} files under ${paths.join(", ")}`,
    );
  const report = checkSystem(files, {
    root: options.root,
    maxAgeDays: options.maxAgeDays,
    gitFreshness: options.gitFreshness,
    testRoot: options.testRoot,
  });
  const extensionFailure =
    options.strictExtensions && report.summary.extensions.findings > 0;
  const meets = report.systemLevel >= options.level && !extensionFailure;

  if (options.json) {
    process.stdout.write(
      `${JSON.stringify({ ...report, requiredLevel: options.level, meets }, null, 2)}\n`,
    );
  } else {
    if (!options.quiet) {
      for (const entry of report.contracts) {
        const next = entry.level + 1;
        const blockers = next <= 3 ? entry.findings[next] : [];
        const tag = `L${entry.level}`;
        const label = `${entry.name ?? entry.file} (${entry.status ?? "?"})`;
        if (blockers.length === 0) {
          process.stdout.write(`  ${tag}  ${label}\n`);
        } else {
          process.stdout.write(
            `  ${tag}  ${label}: ${blockers.length} finding(s) block L${next}\n`,
          );
          for (const finding of blockers.slice(0, 3))
            process.stdout.write(`        - ${finding}\n`);
          if (blockers.length > 3)
            process.stdout.write(`        - ... ${blockers.length - 3} more\n`);
        }
        for (const finding of entry.extensions?.findings ?? [])
          process.stdout.write(`        x ${finding}\n`);
        for (const warning of entry.extensions?.warnings ?? [])
          process.stdout.write(`        ! ${warning}\n`);
      }
      process.stdout.write("\n");
    }
    const { distribution, verification, total, stable, extensions } =
      report.summary;
    const extensionLine =
      extensions.contracts > 0
        ? `  ext      ${extensions.contracts} contract(s) with x-temporal/x-consequence: ` +
          `${extensions.claims.automated} automated, ${extensions.claims.manual} manual, ` +
          `${extensions.claims.unverified} unverified claim(s), ${extensions.findings} finding(s)\n`
        : "";
    process.stdout.write(
      `Design System Contract ${SPEC_VERSION}: ${total} contract(s), ${stable} stable\n` +
        `  levels   L3 ${distribution[3]}  L2 ${distribution[2]}  L1 ${distribution[1]}  none ${distribution[0]}\n` +
        `  a11y     ${verification.automated} automated, ${verification.manual} manual, ${verification.unverified} unverified (declared gaps)\n` +
        extensionLine +
        `  system   L${report.systemLevel} ${levelName(report.systemLevel)} (lowest ${report.levelScope} contract)\n` +
        `  result   ${meets ? "PASS" : "FAIL"}: required L${options.level} ${levelName(options.level)}` +
        `${extensionFailure ? ", extension findings (--strict-extensions)" : ""}\n`,
    );
  }
  process.exit(meets ? 0 : 1);
}

main();

#!/usr/bin/env node
import {
  affected,
  component,
  compose,
  diff,
  doctor,
  example,
  manifest,
  search,
  upgrade,
  validate,
} from "./api.mjs";
import { DtCliError, ERROR_CODES, errorEnvelope } from "./errors.mjs";
import { formatHuman } from "./format.mjs";

function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--json") options.json = true;
    else if (value === "--dense") options.dense = true;
    else if (value === "--limit") options.limit = Number(argv[++index]);
    else if (value === "--section") options.section = argv[++index];
    else if (value === "--story") options.story = argv[++index];
    else if (value === "--from") options.from = argv[++index];
    else if (value === "--to") options.to = argv[++index];
    else if (value === "--path") options.path = argv[++index];
    else if (value === "--write") options.write = true;
    else if (value === "--dry-run") options.write = false;
    else if (value.startsWith("--")) {
      throw new DtCliError(
        `Unknown option "${value}".`,
        ERROR_CODES.INVALID_ARGUMENT,
      );
    } else positional.push(value);
  }
  return { positional, options };
}

async function run(argv) {
  const [commandName, ...rest] = argv;
  if (
    commandName === "--help" ||
    commandName === "-h" ||
    commandName === "help"
  ) {
    const result = await manifest();
    return { type: "help", data: result.data };
  }
  const { positional, options } = parseArgs(rest);
  switch (commandName) {
    case "search":
      return search(positional.join(" "), options);
    case "component":
      return component(positional[0], options);
    case "example":
      return example(positional[0], options);
    case "compose":
      return compose(positional.join(" "), options);
    case "manifest":
      return manifest();
    case "doctor":
      return doctor(options);
    case "diff":
      return diff(positional[0], options);
    case "affected":
      return affected(positional, options);
    case "validate":
      return validate(positional, options);
    case "upgrade":
      return upgrade(positional, options);
    case undefined:
      return manifest();
    default:
      throw new DtCliError(
        `Unknown command "${commandName}".`,
        ERROR_CODES.UNKNOWN_COMMAND,
      );
  }
}

try {
  const parsed = parseArgs(process.argv.slice(3));
  const result = await run(process.argv.slice(2));
  process.stdout.write(
    `${parsed.options.json ? JSON.stringify(result) : formatHuman(result, parsed.options)}\n`,
  );
  // validate is a gate: contract violations exit non-zero even though the
  // report itself renders normally.
  if (result.type === "validate.report" && !result.data.clean) {
    process.exitCode = 2;
  }
} catch (error) {
  const jsonRequested = process.argv.includes("--json");
  const payload = errorEnvelope(error);
  process.stderr.write(
    `${jsonRequested ? JSON.stringify(payload) : `${payload.code}: ${payload.error}`}\n`,
  );
  process.exitCode = 1;
}

export { parseArgs, run };

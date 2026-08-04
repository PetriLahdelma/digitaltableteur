import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DtCliError, ERROR_CODES } from "./errors.mjs";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readable(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function candidateDataDirectories(cwd = process.cwd()) {
  // Inside the repository the freshly generated dist wins over the snapshot
  // packaged at publish time — otherwise stale packaged data shadows a
  // just-rebuilt registry. Published consumers have no repo dist, so they
  // still resolve the packaged data.
  return [
    join(cwd, "nextjs-app", "shared", "foundations", "dist"),
    join(PACKAGE_ROOT, "data"),
  ];
}

export async function resolveDataDirectory(cwd = process.cwd()) {
  for (const directory of candidateDataDirectories(cwd)) {
    if (
      (await readable(join(directory, "docs-registry.json"))) &&
      (await readable(join(directory, "agent-manifest.json")))
    ) {
      return directory;
    }
  }
  throw new DtCliError(
    "Design-system registry data is unavailable. Run `npm run build:tokens` in the repository or reinstall a built @digitaltableteur/cli package.",
    ERROR_CODES.DATA_UNAVAILABLE,
  );
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadRegistry(options = {}) {
  const directory =
    options.dataDirectory ??
    (await resolveDataDirectory(options.cwd ?? process.cwd()));
  const [docsRegistry, agentManifest] = await Promise.all([
    readJson(join(directory, "docs-registry.json")),
    readJson(join(directory, "agent-manifest.json")),
  ]);
  return {
    directory,
    docsRegistry,
    agentManifest,
  };
}

export async function loadUsage(options = {}) {
  const directory =
    options.dataDirectory ??
    (await resolveDataDirectory(options.cwd ?? process.cwd()));
  const report = await readJson(join(directory, "component-usage.json"));
  const rows = Array.isArray(report) ? report : (report.components ?? []);
  return new Map(rows.map((row) => [row.name, row]));
}

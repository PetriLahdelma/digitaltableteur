#!/usr/bin/env node
/**
 * Alpha is a short stay, not a parking lot. A contract may sit at
 * `status: "alpha"` for at most ALPHA_MAX_DAYS, counted from the commit that
 * made it alpha (git, not a hand-set date, so the clock cannot be reset by
 * editing a field). Past that it must be promoted to beta (through the
 * evidence-backed promote command) or removed.
 *
 *   npm run check:alpha-age            # fail on any overdue alpha
 *   npm run check:alpha-age -- --report
 *
 * Legacy debt: alphas already overdue when the gate landed (2026-10-30) are
 * named in alpha-age.baseline.json. That list can only shrink: a name must be
 * removed once its component leaves alpha, and no name may be added. Anything
 * not on the list fails as soon as it is overdue.
 *
 * Entry date: `git log -1 -S'"status": "alpha"'` on the contract, which is
 * the last commit that added or removed that line. An uncommitted alpha
 * counts from today. In a shallow clone without the history the date falls
 * back to today, so the gate is authoritative locally (pre-push), where the
 * full history exists.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const BASELINE_PATH = join(HERE, "alpha-age.baseline.json");
export const ALPHA_MAX_DAYS = 14;
const REPORT = process.argv.includes("--report");
const DAY = 24 * 60 * 60 * 1000;

const ROOTS = ["components", "patterns", "templates"].map((d) =>
  join(ROOT, "nextjs-app", "shared", d),
);

function contracts() {
  const out = [];
  for (const root of ROOTS) {
    if (!existsSync(root)) continue;
    for (const name of readdirSync(root)) {
      const path = join(root, name, `${name}.contract.json`);
      if (existsSync(path)) out.push(path);
    }
  }
  return out;
}

function today() {
  return new Date(new Date().toISOString().slice(0, 10));
}

function alphaSince(path) {
  try {
    const date = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", '-S"status": "alpha"', "--", relative(ROOT, path)],
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    return date ? new Date(date) : today();
  } catch {
    return today();
  }
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const legacy = new Set(baseline.legacyOverdue);

const rows = [];
for (const path of contracts()) {
  const contract = JSON.parse(readFileSync(path, "utf8"));
  if (contract.status !== "alpha") continue;
  const since = alphaSince(path);
  const age = Math.round((today() - since) / DAY);
  const due = new Date(since.getTime() + ALPHA_MAX_DAYS * DAY);
  rows.push({
    name: contract.name,
    since: since.toISOString().slice(0, 10),
    due: due.toISOString().slice(0, 10),
    age,
    overdue: age > ALPHA_MAX_DAYS,
  });
}
rows.sort((a, b) => a.due.localeCompare(b.due));

const alphaNames = new Set(rows.map((r) => r.name));
const failures = [];
for (const row of rows) {
  if (row.overdue && !legacy.has(row.name)) {
    failures.push(
      `${row.name}: alpha since ${row.since} (${row.age} days, limit ${ALPHA_MAX_DAYS}). Promote it to beta (npm run promote -- ${row.name}) or remove it.`,
    );
  }
}
for (const name of legacy) {
  if (!alphaNames.has(name)) {
    failures.push(
      `${name} is no longer alpha: remove it from scripts/design-system/alpha-age.baseline.json (the legacy list only shrinks).`,
    );
  }
}

const inWindow = rows.filter((r) => !r.overdue);
const legacyRows = rows.filter((r) => r.overdue && legacy.has(r.name));

if (REPORT || failures.length) {
  if (inWindow.length) {
    console.log(`Alpha within the ${ALPHA_MAX_DAYS}-day window (${inWindow.length}):`);
    for (const r of inWindow) console.log(`  ${r.name.padEnd(28)} since ${r.since}, promote by ${r.due}`);
  }
  if (legacyRows.length) {
    console.log(`Legacy overdue alpha, named debt (${legacyRows.length}):`);
    for (const r of legacyRows) console.log(`  ${r.name.padEnd(28)} since ${r.since}, ${r.age} days`);
  }
}

if (failures.length) {
  console.error(`\n✗ alpha-age gate failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `✓ alpha-age gate holds: ${inWindow.length} alpha within ${ALPHA_MAX_DAYS} days, ${legacyRows.length} legacy overdue (named debt, can only shrink)`,
);

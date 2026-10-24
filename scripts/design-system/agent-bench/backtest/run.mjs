#!/usr/bin/env node
/**
 * Backtest the graders against shipped bugs (see cases.mjs).
 *
 *   node run.mjs static                 parent vs fix, no build needed
 *   node run.mjs storybook              needs Storybook on DT_STORYBOOK_URL (6010)
 *   node run.mjs prod-mutate            reverse-apply the prod cases' fixes
 *   node run.mjs prod --state mutated   grade a production build of the mutated tree
 *   node run.mjs prod-restore           restore the prod cases' files
 *   node run.mjs prod --state head      grade a production build of HEAD
 *   node run.mjs report                 summarise everything recorded so far
 *
 * Results are written outside the product repo (DT_EVALS_DIR, default
 * ~/SAPDevelop/dt-evals-private/backtest) so bench agents never see them.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import { CASES } from "./cases.mjs";
import * as graders from "./graders.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const OUT_DIR = process.env.DT_EVALS_DIR ?? join(homedir(), "SAPDevelop/dt-evals-private/backtest");
const OUT = join(OUT_DIR, "results.json");
const PROD = process.env.DT_PROD_URL ?? "http://localhost:3003";

const git = (args, input) => execFileSync("git", args, { cwd: REPO_ROOT, input, maxBuffer: 1 << 28 }).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function load() {
  return existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { cases: {} };
}
function save(results) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(results, null, 2)}\n`);
}
function record(results, id, state, outcome) {
  const entry = (results.cases[id] ??= {});
  entry[state] = { ...outcome, at: new Date().toISOString(), head: git(["rev-parse", "--short", "HEAD"]).trim() };
  save(results);
  console.log(`${id.padEnd(26)} ${state.padEnd(8)} ${outcome.pass ? "PASS" : "FAIL"}  ${outcome.detail}`);
}

function reverseApply(c) {
  if (c.mutate) {
    const file = join(REPO_ROOT, c.files[0]);
    const source = readFileSync(file, "utf8");
    if (!source.includes(c.mutate.find)) throw new Error(`mutation anchor not found in ${c.files[0]}`);
    writeFileSync(file, source.replace(c.mutate.find, c.mutate.replace));
    return;
  }
  const patch = git(["show", "--format=", c.fix, "--", ...c.files]);
  execFileSync("git", ["apply", "-R", "--whitespace=nowarn"], { cwd: REPO_ROOT, input: patch });
}
function restore(c) {
  git(["checkout", "HEAD", "--", ...c.files]);
}
function assertClean(files) {
  const dirty = git(["status", "--porcelain", "--", ...files]).trim();
  if (dirty) throw new Error(`refusing to mutate files with local changes:\n${dirty}`);
}

async function runStatic(results) {
  for (const c of CASES.filter((x) => x.mode === "static")) {
    for (const [state, rev] of [["buggy", `${c.fix}^`], ["fixed", c.fix]]) {
      let args = { ...c.args, rev };
      if (c.argsFromCommit === "cssFiles") {
        args.files = git(["show", "--name-only", "--format=", c.fix]).split("\n").filter((f) => f.endsWith(".css"));
      }
      try {
        record(results, c.id, state, graders[c.grader](args));
      } catch (error) {
        record(results, c.id, state, { pass: false, error: true, detail: `grader error: ${String(error.message).slice(0, 140)}` });
      }
    }
  }
}

async function runStorybook(results) {
  const browser = await chromium.launch();
  try {
    for (const c of CASES.filter((x) => x.mode === "storybook")) {
      assertClean(c.files);
      record(results, c.id, "fixed", await graders[c.grader](browser, c.args));
      try {
        reverseApply(c);
      } catch (error) {
        record(results, c.id, "buggy", { pass: false, error: true, detail: `reverse-apply failed: ${String(error.message).split("\n")[0]}` });
        continue;
      }
      try {
        await sleep(5000); // Storybook HMR picks up the re-introduced bug
        record(results, c.id, "buggy", await graders[c.grader](browser, c.args));
      } finally {
        restore(c);
        await sleep(4000);
      }
    }
  } finally {
    await browser.close();
  }
}

async function runProd(results, state) {
  const browser = await chromium.launch();
  try {
    for (const c of CASES.filter((x) => x.mode === "prod")) {
      const args = { ...c.args, url: `${PROD}${c.args.path}` };
      const outcome = c.grader === "iconsMatchAcrossEngines"
        ? await graders.iconsMatchAcrossEngines({ webkit, chromium }, args)
        : await graders[c.grader](browser, args);
      record(results, c.id, state === "mutated" ? "buggy" : "fixed", outcome);
    }
  } finally {
    await browser.close();
  }
}

function report(results) {
  const rows = CASES.map((c) => {
    const r = results.cases[c.id] ?? {};
    // Caught: the buggy state fails and the fix clears it. When the fixed
    // state still fails for unrelated reasons, "cleared" means the fix removed
    // findings the buggy state had (and introduced none).
    let caught = null;
    if (r.buggy && r.fixed && !r.buggy.error && !r.fixed.error) {
      if (r.fixed.pass) caught = !r.buggy.pass;
      else if (r.buggy.findings && r.fixed.findings) {
        const before = new Set(r.buggy.findings);
        const removed = r.buggy.findings.filter((f) => !r.fixed.findings.includes(f));
        caught = !r.buggy.pass && removed.length > 0 && r.fixed.findings.every((f) => before.has(f));
      } else caught = false;
    }
    return { id: c.id, fix: c.fix, mode: c.mode, buggy: r.buggy?.pass, fixed: r.fixed?.pass, caught, buggyDetail: r.buggy?.detail, fixedDetail: r.fixed?.detail };
  });
  const decided = rows.filter((r) => r.caught !== null);
  console.log(`\ncaught ${decided.filter((r) => r.caught).length}/${decided.length} decided (${rows.length} cases)\n`);
  for (const r of rows) console.log(`${String(r.caught === null ? "-" : r.caught ? "CAUGHT" : "MISSED").padEnd(7)} ${r.id.padEnd(26)} ${r.mode.padEnd(10)} buggy=${r.buggy} fixed=${r.fixed}`);
  return rows;
}

const [phase, , state] = process.argv.slice(2);
const results = load();
if (phase === "static") await runStatic(results);
else if (phase === "storybook") await runStorybook(results);
else if (phase === "prod-mutate") {
  for (const c of CASES.filter((x) => x.mode === "prod")) assertClean(c.files);
  for (const c of CASES.filter((x) => x.mode === "prod")) reverseApply(c);
  console.log("prod cases reverse-applied; build, serve and run: prod --state mutated");
} else if (phase === "prod-restore") {
  for (const c of CASES.filter((x) => x.mode === "prod")) restore(c);
  console.log("prod case files restored to HEAD");
} else if (phase === "prod") await runProd(results, state);
else if (phase === "report") report(results);
else {
  console.error("usage: run.mjs static|storybook|prod-mutate|prod --state mutated|head|prod-restore|report");
  process.exitCode = 2;
}

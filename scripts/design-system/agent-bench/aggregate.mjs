#!/usr/bin/env node
/**
 * Aggregate benchmark result files into the published artifact.
 *
 *   node scripts/design-system/agent-bench/aggregate.mjs \
 *     --out public/ds-health/agent-bench.json \
 *     results/2026-08-04T15-05-04-claude.json [...]
 *
 * The artifact is the ONLY thing the agent page renders — numbers stay
 * generated from named raw result files (recorded in provenance), never
 * hand-written. Notes passed via repeated --note flags are carried
 * verbatim so methodology caveats live next to the numbers.
 */
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const files = [];
  const notes = [];
  // --superseded <result-file-basename>:<task,task> drops those tasks' runs
  // from that file (for example after a grader fix and re-run). Every drop
  // is recorded in the artifact, so exclusions are visible, not silent.
  const superseded = [];
  let out = null;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--out") out = argv[++index];
    else if (value === "--note") notes.push(argv[++index]);
    else if (value === "--superseded") {
      const [file, tasks] = argv[++index].split(":");
      superseded.push({ file, tasks: tasks.split(",") });
    } else files.push(value);
  }
  if (!out || files.length === 0) {
    console.error(
      "Usage: aggregate.mjs --out <artifact.json> [--note <text>]... <result.json>...",
    );
    process.exit(1);
  }
  return { out, notes, files, superseded };
}

function stats(values) {
  const clean = values.filter((value) => value != null);
  if (clean.length === 0) return null;
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  // Sample standard deviation (n-1): the variance readers need to judge
  // whether an arm delta is signal or run-to-run noise. null below n=2.
  const sd =
    clean.length > 1
      ? Math.sqrt(
          clean.reduce((total, value) => total + (value - mean) ** 2, 0) /
            (clean.length - 1),
        )
      : null;
  return {
    mean: Number(mean.toFixed(4)),
    sd: sd == null ? null : Number(sd.toFixed(4)),
    n: clean.length,
    min: Number(Math.min(...clean).toFixed(4)),
    max: Number(Math.max(...clean).toFixed(4)),
  };
}

function runCost(run) {
  const base = run.metering.costUsd ?? 0;
  return (
    base +
    run.repairRounds.reduce(
      (total, round) => total + (round.metering.costUsd ?? 0),
      0,
    )
  );
}

const ARM_ORDER = ["with", "mcp", "mcp-pointer", "without"];
const ARM_LABELS = {
  with: "WITH (dt CLI documented in workspace)",
  mcp: "MCP (design-system MCP attached, generic workspace)",
  "mcp-pointer": "MCP + POINTER (same server, plus one line in the workspace naming it)",
  without: "WITHOUT (generic workspace)",
};

function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function armSummary(runs) {
  const toolCalls = runs.map((run) => run.metering.toolCalls ?? null);
  const telemetered = toolCalls.filter(Boolean);
  const mcpCalls = telemetered.map((calls) =>
    Object.entries(calls)
      .filter(([name]) => name.startsWith("mcp__"))
      .reduce((total, [, count]) => total + count, 0),
  );
  const cliCalls = telemetered.map((calls) => calls["Bash(dt-cli)"] ?? 0);
  // Which acceptance checks failed on the first attempt: repair rounds
  // overwrite the final acceptance, so this is read from runs that needed
  // repair (their pre-repair state failed) and runs that never passed.
  const failedChecks = {};
  for (const run of runs) {
    if (run.pass && run.repairRounds.length === 0) continue;
    for (const check of run.firstAcceptance ?? run.acceptance) {
      if (!check.pass) failedChecks[check.id] = (failedChecks[check.id] ?? 0) + 1;
    }
  }
  const phantom = runs
    .map((run) =>
      (run.firstAcceptance ?? run.acceptance).find(
        (check) => check.kind === "token-discipline",
      )?.phantomCount,
    )
    .filter((value) => typeof value === "number");
  return {
    runs: runs.length,
    firstTryPass: runs.filter((run) => run.pass && run.repairRounds.length === 0)
      .length,
    finalPass: runs.filter((run) => run.pass).length,
    passViaRepairLoop: runs.filter(
      (run) => run.pass && run.repairRounds.length > 0,
    ).length,
    costUsdPerRun: stats(runs.map(runCost)),
    initialTurns: stats(runs.map((run) => run.metering.turns)),
    dsReuse: {
      hits: runs.filter((run) =>
        run.metrics.some((metric) => metric.id === "ds-reuse" && metric.value),
      ).length,
      eligible: runs.filter((run) =>
        run.metrics.some((metric) => metric.id === "ds-reuse"),
      ).length,
    },
    ...(telemetered.length > 0
      ? {
          affordanceUse: {
            telemeteredRuns: telemetered.length,
            runsCallingMcp: mcpCalls.filter((count) => count > 0).length,
            meanMcpCalls: Number(mean(mcpCalls).toFixed(2)),
            runsCallingDtCli: cliCalls.filter((count) => count > 0).length,
          },
        }
      : {}),
    ...(Object.keys(failedChecks).length > 0 ? { failedChecks } : {}),
    ...(phantom.length > 0
      ? { phantomTokenRefs: stats(phantom) }
      : {}),
  };
}

function byArm(runs) {
  const arms = {};
  for (const arm of ARM_ORDER) {
    const scoped = runs.filter((run) => run.arm === arm);
    if (scoped.length > 0) arms[arm] = armSummary(scoped);
  }
  return arms;
}

const { out, notes, files, superseded } = parseArgs(process.argv.slice(2));

const runs = [];
const runtimes = new Set();
for (const file of files) {
  const data = JSON.parse(await readFile(file, "utf8"));
  const isolation = data.runs[0]?.metering?.isolation;
  runtimes.add(
    `${data.options.model} maxTurns=${data.options.maxTurns} repairLoop=${data.options.repairLoop}${
      isolation ? ` isolation=${isolation}` : ""
    }`,
  );
  const dropped = new Set(
    superseded
      .filter((entry) => entry.file === basename(file))
      .flatMap((entry) => entry.tasks),
  );
  runs.push(...data.runs.filter((run) => !dropped.has(run.task)));
}

const taskIds = [...new Set(runs.map((run) => run.task))].sort();
const tasks = taskIds.map((task) => {
  const scoped = runs.filter((run) => run.task === task);
  return { id: task, category: scoped[0].category, arms: byArm(scoped) };
});

const sourceCommit = (
  await execFileAsync("git", ["rev-parse", "HEAD"]).then(
    ({ stdout }) => stdout,
    () => "unknown",
  )
).trim();

const artifact = {
  generatedAt: new Date().toISOString(),
  generator: { name: "agent-bench/aggregate.mjs", sourceCommit },
  methodology: "docs/AGENT_BENCH_METHODOLOGY.md",
  runtime: [...runtimes],
  resultFiles: files.map((file) => basename(file)),
  ...(superseded.length > 0 ? { supersededRuns: superseded } : {}),
  totalRuns: runs.length,
  totalCostUsd: Number(
    runs.reduce((total, run) => total + runCost(run), 0).toFixed(2),
  ),
  notes,
  armLabels: Object.fromEntries(
    ARM_ORDER.filter((arm) => runs.some((run) => run.arm === arm)).map((arm) => [
      arm,
      ARM_LABELS[arm],
    ]),
  ),
  arms: byArm(runs),
  tasks,
};

await writeFile(out, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(
  `Wrote ${out}: ${artifact.totalRuns} runs, $${artifact.totalCostUsd}, ` +
    Object.entries(artifact.arms)
      .map(([arm, summary]) => `${arm} ${summary.firstTryPass}/${summary.runs} first-try`)
      .join(", "),
);

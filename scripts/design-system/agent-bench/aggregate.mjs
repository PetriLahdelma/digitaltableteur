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
  let out = null;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--out") out = argv[++index];
    else if (value === "--note") notes.push(argv[++index]);
    else files.push(value);
  }
  if (!out || files.length === 0) {
    console.error(
      "Usage: aggregate.mjs --out <artifact.json> [--note <text>]... <result.json>...",
    );
    process.exit(1);
  }
  return { out, notes, files };
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

function armSummary(runs) {
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
  };
}

const { out, notes, files } = parseArgs(process.argv.slice(2));

const runs = [];
const runtimes = new Set();
for (const file of files) {
  const data = JSON.parse(await readFile(file, "utf8"));
  runtimes.add(
    `${data.options.model} maxTurns=${data.options.maxTurns} repairLoop=${data.options.repairLoop}`,
  );
  runs.push(...data.runs);
}

const taskIds = [...new Set(runs.map((run) => run.task))].sort();
const tasks = taskIds.map((task) => {
  const scoped = runs.filter((run) => run.task === task);
  return {
    id: task,
    category: scoped[0].category,
    with: armSummary(scoped.filter((run) => run.arm === "with")),
    without: armSummary(scoped.filter((run) => run.arm === "without")),
  };
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
  totalRuns: runs.length,
  totalCostUsd: Number(
    runs.reduce((total, run) => total + runCost(run), 0).toFixed(2),
  ),
  notes,
  arms: {
    with: armSummary(runs.filter((run) => run.arm === "with")),
    without: armSummary(runs.filter((run) => run.arm === "without")),
  },
  tasks,
};

await writeFile(out, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(
  `Wrote ${out}: ${artifact.totalRuns} runs, $${artifact.totalCostUsd}, ` +
    `WITH ${artifact.arms.with.finalPass}/${artifact.arms.with.runs} vs ` +
    `WITHOUT ${artifact.arms.without.finalPass}/${artifact.arms.without.runs}`,
);

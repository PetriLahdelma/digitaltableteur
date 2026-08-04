#!/usr/bin/env node
/**
 * Agent benchmark runner (Astryx-gap Phase 3).
 *
 *   node scripts/design-system/agent-bench/run.mjs \
 *     --task all --arm both --agent claude --reps 3 \
 *     --model claude-sonnet-5 --max-turns 30 --repair-loop
 *
 * Stub agents for harness integrity (no model spend):
 *   --agent null    every task must FAIL acceptance
 *   --agent oracle  every task must PASS acceptance
 *
 * Results land in scripts/design-system/agent-bench/results/<stamp>.json.
 * Publishing to public/ds-health is deliberately manual until real
 * multi-rep numbers exist (honesty guardrail).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TASKS, taskById } from "./tasks.mjs";
import { createWorktree, prepareWorkspace, runAgent } from "./harness.mjs";
import { gradeTask } from "./grade.mjs";
import { repairLoop } from "./repair-loop.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../../..");

function parseArgs(argv) {
  const options = {
    task: "all",
    arm: "both",
    agent: "claude",
    reps: 1,
    model: "claude-sonnet-5",
    maxTurns: 30,
    repairLoop: false,
    keep: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--task") options.task = argv[++index];
    else if (value === "--arm") options.arm = argv[++index];
    else if (value === "--agent") options.agent = argv[++index];
    else if (value === "--reps") options.reps = Number(argv[++index]);
    else if (value === "--model") options.model = argv[++index];
    else if (value === "--max-turns") options.maxTurns = Number(argv[++index]);
    else if (value === "--repair-loop") options.repairLoop = true;
    else if (value === "--keep") options.keep = true;
    else throw new Error(`Unknown option ${value}`);
  }
  return options;
}

export async function runOnce({ task, arm, agent, options }) {
  const { worktree, destroy } = await createWorktree(REPO_ROOT);
  try {
    await prepareWorkspace(worktree, task, arm);
    const metering = await runAgent(worktree, task, agent, options);
    let grade = await gradeTask(worktree, task);
    let repair = null;
    if (options.repairLoop && agent === "claude" && !grade.pass) {
      repair = await repairLoop(worktree, task, grade, options);
      grade = repair.grade;
    }
    return {
      task: task.id,
      category: task.category,
      arm,
      agent,
      pass: grade.pass,
      acceptance: grade.acceptance,
      metrics: grade.metrics,
      metering,
      repairRounds: repair?.rounds ?? [],
    };
  } finally {
    if (!options.keep) await destroy();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tasks =
    options.task === "all"
      ? TASKS
      : [taskById(options.task)].filter(Boolean);
  if (tasks.length === 0) {
    console.error(
      `Unknown task "${options.task}". Known: ${TASKS.map(({ id }) => id).join(", ")}`,
    );
    process.exit(1);
  }
  const arms =
    options.agent === "claude"
      ? options.arm === "both"
        ? ["with", "without"]
        : [options.arm]
      : ["with"]; // stub agents ignore affordances; one arm is enough

  const runs = [];
  for (const task of tasks) {
    for (const arm of arms) {
      for (let rep = 1; rep <= options.reps; rep += 1) {
        const label = `${task.id} ${arm} ${options.agent} rep${rep}`;
        process.stdout.write(`▶ ${label}\n`);
        const run = await runOnce({ task, arm, agent: options.agent, options });
        runs.push({ ...run, rep });
        process.stdout.write(
          `  ${run.pass ? "PASS" : "FAIL"}${
            run.metering.costUsd != null
              ? ` ($${run.metering.costUsd.toFixed(4)}, ${run.metering.turns} turns)`
              : ""
          }\n`,
        );
        for (const check of run.acceptance.filter(({ pass }) => !pass)) {
          process.stdout.write(`    ✗ ${check.id}: ${check.detail.split("\n")[0]}\n`);
        }
      }
    }
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const resultsDir = join(HERE, "results");
  await mkdir(resultsDir, { recursive: true });
  const outPath = join(resultsDir, `${stamp}-${options.agent}.json`);
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        options,
        runs,
        summary: {
          total: runs.length,
          passed: runs.filter(({ pass }) => pass).length,
        },
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    `\n${runs.filter(({ pass }) => pass).length}/${runs.length} runs passed → ${outPath}\n`,
  );
  process.exitCode = runs.every(({ pass }) => pass) ? 0 : 1;
}

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

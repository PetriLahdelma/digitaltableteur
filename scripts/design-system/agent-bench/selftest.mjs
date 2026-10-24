/**
 * Harness integrity proof (no model spend): for every task the null agent
 * must FAIL acceptance and the oracle agent must PASS it. Tasks that ship a
 * plausible-but-wrong "naive" solution must also FAIL it. A grader that
 * cannot discriminate between "did nothing" and "reference solution" would
 * make any benchmark number meaningless, so this runs before any paid run.
 *
 *   npm run agent:bench:selftest
 *
 * Heavy (worktrees, scoped vitest, one build:tokens per migration run);
 * deliberately not part of `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TASKS } from "./tasks.mjs";
import { runOnce } from "./run.mjs";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BENCH_PRIVATE_PATHS,
  BENCH_RESULT_ARTIFACTS,
  createWorktree,
  prepareWorkspace,
} from "./harness.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

test("the agent's workspace carries no bench internals", async () => {
  const { worktree, destroy } = await createWorktree(REPO_ROOT);
  try {
    await prepareWorkspace(worktree, TASKS[0], "with", "claude");
    for (const path of BENCH_PRIVATE_PATHS) {
      assert.equal(existsSync(join(worktree, path)), false, `${path} still readable`);
    }
    for (const path of BENCH_RESULT_ARTIFACTS) {
      const file = join(worktree, path);
      if (!existsSync(file)) continue;
      const json = JSON.parse(readFileSync(file, "utf8"));
      assert.deepEqual(json.tasks ?? [], [], `${path} still carries task results`);
      assert.deepEqual(json.notes ?? [], [], `${path} still carries findings`);
    }
  } finally {
    await destroy();
  }
});

const options = { repairLoop: false, keep: false };

for (const task of TASKS) {
  test(`${task.id}: null agent fails acceptance`, async () => {
    const run = await runOnce({ task, arm: "with", agent: "null", options });
    assert.equal(
      run.pass,
      false,
      `null agent unexpectedly passed: ${JSON.stringify(run.acceptance)}`,
    );
  });

  if (task.naive) {
    test(`${task.id}: naive (plausible-but-wrong) agent fails acceptance`, async () => {
      const run = await runOnce({ task, arm: "with", agent: "naive", options });
      assert.equal(
        run.pass,
        false,
        `naive solution unexpectedly passed: ${JSON.stringify(run.acceptance)}`,
      );
    });
  }

  test(`${task.id}: oracle agent passes acceptance`, async () => {
    const run = await runOnce({ task, arm: "with", agent: "oracle", options });
    assert.equal(
      run.pass,
      true,
      `oracle failed: ${JSON.stringify(
        run.acceptance.filter(({ pass }) => !pass),
      )}`,
    );
  });
}

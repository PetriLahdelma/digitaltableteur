/**
 * Harness integrity proof (no model spend): for every task the null agent
 * must FAIL acceptance and the oracle agent must PASS it. A grader that
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
